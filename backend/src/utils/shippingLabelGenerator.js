import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { fileURLToPath } from "url";
import bwipjs from "bwip-js";
import QRCode from "qrcode";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ─── Palette ─── */
const DARK_GREEN = "#1a3509";
const MID_GREEN = "#2d5016";
const GOLD = "#c9a227";
const WHITE = "#ffffff";
const INK = "#1c1c1e";
const SUB = "#6b7280";
const RULE = "#e5e7eb";
const LIGHT_BG = "#f9fafb";

/* ─── Dimensions ─── */
const PW = 595; // page width  (A5 landscape-ish)
const PH = 380; // page height
const LP = 190; // left brand panel width
const RX = LP; // right panel start X
const RW = PW - LP; // right panel width = 405

/* ─── Section Y boundaries (right panel) ─── */
const T1 = 135; // end of FROM / ORDER ID section
const T2 = 258; // end of SHIP TO / DELIVERY TYPE section
const BBH = 30; // bottom bar height
const BB = PH - BBH; // bottom bar Y

/* ─── Helpers ─── */
const fetchBuf = (url) =>
    new Promise((res, rej) => {
        const mod = url.startsWith("https") ? https : http;
        mod.get(url, (r) => {
            const c = [];
            r.on("data", (d) => c.push(d));
            r.on("end", () => res(Buffer.concat(c)));
            r.on("error", rej);
        }).on("error", rej);
    });

const hline = (doc, y, x1, x2, color = RULE, lw = 0.5) =>
    doc
        .save()
        .strokeColor(color)
        .lineWidth(lw)
        .moveTo(x1, y)
        .lineTo(x2, y)
        .stroke()
        .restore();

const vline = (doc, x, y1, y2, color = RULE, lw = 0.5) =>
    doc
        .save()
        .strokeColor(color)
        .lineWidth(lw)
        .moveTo(x, y1)
        .lineTo(x, y2)
        .stroke()
        .restore();

/* ══════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════ */
export const generateShippingLabel = async (order) => {
    const LOGO_URL =
        "https://res.cloudinary.com/dj4snfkzf/image/upload/v1770011267/paan-500_wrptiy.png";

    /* ── Logo ── */
    let logoBuf = null;
    try {
        logoBuf = await fetchBuf(LOGO_URL);
    } catch {}

    /* ── Barcode ── */
    const barcodeText =
        order.shiprocket?.awbCode ||
        order.shiprocket?.trackingNumber ||
        order.orderNumber;

    let barcodeBuf = null;
    try {
        barcodeBuf = await bwipjs.toBuffer({
            bcid: "code128",
            text: barcodeText,
            scale: 2,
            height: 14,
            includetext: false,
        });
    } catch (e) {
        console.warn("Barcode generation failed:", e.message);
    }

    /* ── QR Code ── */
    const qrTarget =
        order.shiprocket?.trackingUrl || "https://www.paanshala.com";
    let qrBuf = null;
    try {
        qrBuf = await QRCode.toBuffer(qrTarget, {
            type: "png",
            width: 180,
            margin: 1,
            color: { dark: DARK_GREEN, light: WHITE },
        });
    } catch (e) {
        console.warn("QR code generation failed:", e.message);
    }

    return new Promise((resolve, reject) => {
        try {
            const outDir = path.join(__dirname, "../../labels");
            if (!fs.existsSync(outDir))
                fs.mkdirSync(outDir, { recursive: true });
            const outPath = path.join(outDir, `label-${order.orderNumber}.pdf`);

            const doc = new PDFDocument({
                size: [PW, PH],
                margin: 0,
                info: {
                    Title: `Shipping Label - ${order.orderNumber}`,
                    Author: "Paanshala",
                },
            });

            const stream = fs.createWriteStream(outPath);
            doc.pipe(stream);

            /* ════════════════════════════
               LEFT PANEL — brand
            ════════════════════════════ */
            doc.save().rect(0, 0, LP, PH).fill(DARK_GREEN).restore();

            /* Logo area (slightly darker bg) */
            doc.save().rect(0, 0, LP, 106).fill("#0f2506").restore();
            if (logoBuf) {
                try {
                    doc.image(logoBuf, (LP - 88) / 2, 8, {
                        width: 88,
                        height: 88,
                        fit: [88, 88],
                    });
                } catch {
                    doc.fillColor(GOLD)
                        .fontSize(15)
                        .font("Helvetica-Bold")
                        .text("PAANSHALA", 0, 36, {
                            width: LP,
                            align: "center",
                        });
                }
            } else {
                doc.fillColor(GOLD)
                    .fontSize(15)
                    .font("Helvetica-Bold")
                    .text("PAANSHALA", 0, 36, { width: LP, align: "center" });
            }

            /* Gold rule */
            doc.save()
                .rect(16, 108, LP - 32, 0.8)
                .fill(GOLD)
                .restore();

            /* Tagline */
            doc.fillColor(WHITE)
                .fontSize(7.5)
                .font("Helvetica-Oblique")
                .text("Crafted with Tradition, Delivered with Care.", 6, 116, {
                    width: LP - 12,
                    align: "center",
                });

            /* Feature badges (4 circles) */
            const features = [
                ["*", "PREMIUM\nPAAN"],
                ["+", "AUTHENTIC\nINGREDIENTS"],
                ["~", "HANDCRAFTED\nWITH CARE"],
                ["o", "HYGIENIC\n& SAFE"],
            ];
            const FW = (LP - 12) / 4;
            const CY = 165;
            features.forEach(([, label], i) => {
                const fx = 6 + i * FW;
                doc.save()
                    .circle(fx + FW / 2, CY, 15)
                    .fill(MID_GREEN)
                    .restore();
                doc.save()
                    .circle(fx + FW / 2, CY, 15)
                    .strokeColor(GOLD)
                    .lineWidth(0.8)
                    .stroke()
                    .restore();
                /* Small gold dot as icon */
                doc.save()
                    .circle(fx + FW / 2, CY, 4)
                    .fill(GOLD)
                    .restore();
                doc.fillColor(WHITE)
                    .fontSize(5.2)
                    .font("Helvetica-Bold")
                    .text(label, fx, CY + 19, { width: FW, align: "center" });
            });

            /* Gold rule */
            doc.save()
                .rect(16, 213, LP - 32, 0.8)
                .fill(GOLD)
                .restore();

            /* Thank you */
            doc.fillColor(GOLD)
                .fontSize(7)
                .font("Helvetica-Bold")
                .text("THANK YOU FOR SUPPORTING", 0, 220, {
                    width: LP,
                    align: "center",
                })
                .text("TRADITIONAL GOODNESS.", 0, 231, {
                    width: LP,
                    align: "center",
                });

            /* Gold heart (drawn with paths) */
            const HX = LP / 2,
                HY = 249,
                HS = 5;
            doc.save()
                .moveTo(HX, HY + HS)
                .bezierCurveTo(
                    HX - HS * 0.5,
                    HY + HS * 0.2,
                    HX - HS * 1.6,
                    HY - HS * 0.4,
                    HX - HS * 1.6,
                    HY - HS * 0.8
                )
                .bezierCurveTo(
                    HX - HS * 1.6,
                    HY - HS * 1.6,
                    HX,
                    HY - HS * 0.6,
                    HX,
                    HY
                )
                .bezierCurveTo(
                    HX,
                    HY - HS * 0.6,
                    HX + HS * 1.6,
                    HY - HS * 1.6,
                    HX + HS * 1.6,
                    HY - HS * 0.8
                )
                .bezierCurveTo(
                    HX + HS * 1.6,
                    HY - HS * 0.4,
                    HX + HS * 0.5,
                    HY + HS * 0.2,
                    HX,
                    HY + HS
                )
                .fill(GOLD)
                .restore();

            /* Social handles */
            doc.fillColor("#9db89a")
                .fontSize(6.2)
                .font("Helvetica")
                .text("@paanshala  |  www.paanshala.com", 0, 264, {
                    width: LP,
                    align: "center",
                });

            /* Left bottom bar */
            doc.save().rect(0, BB, LP, BBH).fill("#0a1503").restore();
            doc.fillColor(GOLD)
                .fontSize(6)
                .font("Helvetica-Bold")
                .text(
                    "FRESHNESS  \u00b7  QUALITY  \u00b7  TRADITION",
                    0,
                    BB + 11,
                    {
                        width: LP,
                        align: "center",
                    }
                );

            /* ════════════════════════════
               RIGHT PANEL — logistics
            ════════════════════════════ */
            doc.save().rect(RX, 0, RW, PH).fill(WHITE).restore();
            doc.save()
                .rect(RX, 0, RW, PH)
                .strokeColor("#9ca3af")
                .lineWidth(0.8)
                .stroke()
                .restore();

            const RM = RX + RW / 2; // midpoint of right panel

            /* ── SECTION 1: FROM  |  ORDER INFO  (0 → T1) ── */

            /* FROM */
            doc.fillColor(SUB)
                .fontSize(7)
                .font("Helvetica-Bold")
                .text("FROM:", RX + 10, 12);
            doc.fillColor(INK)
                .fontSize(11)
                .font("Helvetica-Bold")
                .text("PAANSHALA", RX + 10, 24);
            doc.fillColor(SUB)
                .fontSize(7.5)
                .font("Helvetica")
                .text("FB-130, 1st Floor, Mansarover Garden,", RX + 10, 42, {
                    width: RM - RX - 16,
                })
                .text("West Delhi, Delhi \u2013 110015, India", RX + 10, 54, {
                    width: RM - RX - 16,
                })
                .text("+91 85108 51039", RX + 10, 66, { width: RM - RX - 16 });

            vline(doc, RM, 0, T1);

            /* ORDER ID */
            doc.fillColor(SUB)
                .fontSize(7)
                .font("Helvetica-Bold")
                .text("ORDER ID:", RM + 10, 12);
            doc.fillColor(INK)
                .fontSize(13)
                .font("Helvetica-Bold")
                .text(order.orderNumber, RM + 10, 24);
            doc.fillColor(SUB)
                .fontSize(7)
                .font("Helvetica-Bold")
                .text("DATE:", RM + 10, 50);
            doc.fillColor(INK)
                .fontSize(8.5)
                .font("Helvetica-Bold")
                .text(
                    new Date(order.createdAt)
                        .toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        })
                        .toUpperCase(),
                    RM + 10,
                    62
                );

            /* THIS SIDE UP box */
            const TSU_X = RM + 10;
            const TSU_Y = 82;
            const TSU_W = RW / 2 - 22;
            const TSU_H = 44;
            doc.save()
                .rect(TSU_X, TSU_Y, TSU_W, TSU_H)
                .fill(LIGHT_BG)
                .restore();
            doc.save()
                .rect(TSU_X, TSU_Y, TSU_W, TSU_H)
                .strokeColor(INK)
                .lineWidth(1.2)
                .stroke()
                .restore();
            /* Double up-arrow drawn manually */
            const arrowCX = TSU_X + 22;
            const arrowY = TSU_Y + 8;
            [arrowCX - 6, arrowCX + 6].forEach((ax) => {
                doc.save()
                    .strokeColor(INK)
                    .lineWidth(2)
                    .moveTo(ax, arrowY + 14)
                    .lineTo(ax, arrowY + 2)
                    .stroke()
                    .restore();
                doc.save()
                    .strokeColor(INK)
                    .lineWidth(2)
                    .moveTo(ax - 5, arrowY + 8)
                    .lineTo(ax, arrowY + 2)
                    .lineTo(ax + 5, arrowY + 8)
                    .stroke()
                    .restore();
            });
            doc.fillColor(INK)
                .fontSize(7.5)
                .font("Helvetica-Bold")
                .text("THIS SIDE UP", TSU_X + 44, TSU_Y + 10)
                .fontSize(6)
                .font("Helvetica")
                .text("HANDLE WITH CARE", TSU_X + 44, TSU_Y + 24);

            /* Section 1 divider */
            doc.save().rect(RX, T1, RW, 2).fill(INK).restore();

            /* ── SECTION 2: SHIP TO  |  DELIVERY TYPE  (T1 → T2) ── */

            /* SHIP TO */
            doc.fillColor(INK)
                .fontSize(7)
                .font("Helvetica-Bold")
                .text("SHIP TO:", RX + 10, T1 + 10);
            const addr = order.shippingAddress;
            doc.fillColor(INK)
                .fontSize(10)
                .font("Helvetica-Bold")
                .text(addr?.fullName || "\u2014", RX + 10, T1 + 22, {
                    width: RM - RX - 16,
                });
            doc.fillColor(SUB).fontSize(7.5).font("Helvetica");
            let AY = T1 + 36;
            if (addr?.streetAddress) {
                doc.text(addr.streetAddress, RX + 10, AY, {
                    width: RM - RX - 16,
                });
                AY += 13;
            }
            if (addr?.landmark) {
                doc.text(addr.landmark, RX + 10, AY, { width: RM - RX - 16 });
                AY += 13;
            }
            const cityLine = [addr?.city, addr?.state, addr?.pincode]
                .filter(Boolean)
                .join(", ");
            if (cityLine) {
                doc.text(cityLine, RX + 10, AY, { width: RM - RX - 16 });
                AY += 13;
            }
            if (addr?.phone) {
                doc.fillColor(INK)
                    .fontSize(8)
                    .font("Helvetica-Bold")
                    .text(`Phone: +91 ${addr.phone}`, RX + 10, AY, {
                        width: RM - RX - 16,
                    });
            }

            vline(doc, RM, T1, T2);

            /* DELIVERY TYPE */
            doc.fillColor(SUB)
                .fontSize(7)
                .font("Helvetica-Bold")
                .text("DELIVERY TYPE:", RM + 10, T1 + 10);

            /* Simple truck graphic using basic shapes */
            const TX = RM + (RW / 2 - 56) / 2 + 10;
            const TY = T1 + 30;
            /* body */
            doc.save()
                .rect(TX, TY + 6, 36, 22)
                .fill(DARK_GREEN)
                .restore();
            /* cab */
            doc.save()
                .rect(TX + 36, TY, 22, 28)
                .fill(MID_GREEN)
                .restore();
            /* windshield */
            doc.save()
                .rect(TX + 38, TY + 3, 16, 12)
                .fill("#d1fae5")
                .restore();
            /* wheels */
            [
                [TX + 10, TY + 30],
                [TX + 28, TY + 30],
                [TX + 46, TY + 30],
            ].forEach(([wx, wy]) => {
                doc.save().circle(wx, wy, 6).fill(INK).restore();
                doc.save().circle(wx, wy, 3).fill(WHITE).restore();
            });

            doc.fillColor(DARK_GREEN)
                .fontSize(10)
                .font("Helvetica-Bold")
                .text("STANDARD", RM + 10, T1 + 78, {
                    width: RW / 2 - 18,
                    align: "center",
                })
                .text("DELIVERY", RM + 10, T1 + 92, {
                    width: RW / 2 - 18,
                    align: "center",
                });

            /* Section 2 divider */
            doc.save().rect(RX, T2, RW, 2).fill(INK).restore();

            /* ── SECTION 3: BARCODE  |  QR  (T2 → BB) ── */
            const BOT_AREA = BB - T2;
            const QR_W = 68;
            const QR_X = RX + RW - QR_W - 10;

            /* "SCAN TO TRACK" label */
            doc.fillColor(SUB)
                .fontSize(5.5)
                .font("Helvetica-Bold")
                .text("SCAN TO TRACK", QR_X, T2 + 5, {
                    width: QR_W,
                    align: "center",
                });

            /* QR */
            if (qrBuf) {
                try {
                    doc.image(qrBuf, QR_X, T2 + 16, {
                        width: QR_W,
                        height: QR_W,
                    });
                } catch {}
            }

            vline(doc, QR_X - 8, T2 + 4, BB - 4);

            /* Barcode */
            const BC_W = QR_X - RX - 28;
            if (barcodeBuf) {
                try {
                    doc.image(barcodeBuf, RX + 10, T2 + 8, {
                        width: BC_W,
                        height: BOT_AREA - 22,
                    });
                } catch {}
            } else {
                /* Fallback: just show order number text */
                doc.fillColor(INK)
                    .fontSize(10)
                    .font("Helvetica-Bold")
                    .text(barcodeText, RX + 10, T2 + BOT_AREA / 2 - 8, {
                        width: BC_W,
                        align: "center",
                    });
            }

            /* Tracking ID */
            doc.fillColor(INK)
                .fontSize(7)
                .font("Helvetica-Bold")
                .text(`TRACKING ID: ${barcodeText}`, RX + 10, BB - 14, {
                    width: BC_W,
                });

            /* ── BOTTOM BAR (right) ── */
            doc.save().rect(RX, BB, RW, BBH).fill(INK).restore();
            doc.fillColor(WHITE)
                .fontSize(7)
                .font("Helvetica-Bold")
                .text(
                    "\u00b7  FRESHNESS  \u00b7  QUALITY  \u00b7  TRADITION  \u00b7",
                    RX + 10,
                    BB + 11,
                    { width: RW - 20, align: "center" }
                );

            doc.end();
            stream.on("finish", () => resolve(outPath));
            stream.on("error", reject);
        } catch (err) {
            reject(err);
        }
    });
};
