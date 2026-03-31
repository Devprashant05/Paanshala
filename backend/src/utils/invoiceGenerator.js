import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ─── Brand colours ─── */
const BRAND_GREEN  = "#2d5016";
const BRAND_GOLD   = "#d4af37";
const DARK         = "#1a1a1a";
const MID          = "#555555";
const LIGHT        = "#888888";
const RULE         = "#e5e5e5";
const STRIPE_ODD   = "#f8faf6";   // very light green tint
const STRIPE_EVEN  = "#ffffff";

/* ─── Page constants ─── */
const PAGE_W  = 595.28;   // A4 width  (pts)
const PAGE_H  = 841.89;   // A4 height (pts)
const MARGIN  = 48;
const CONTENT = PAGE_W - MARGIN * 2;   // 499.28

/* ─── Helpers ─── */
const money = (n) => `\u20B9${Number(n || 0).toFixed(2)}`;   // ₹

function hline(doc, y, { x = MARGIN, width = CONTENT, color = RULE, thickness = 0.5 } = {}) {
    doc.save()
        .strokeColor(color)
        .lineWidth(thickness)
        .moveTo(x, y)
        .lineTo(x + width, y)
        .stroke()
        .restore();
}

function badge(
    doc,
    text,
    x,
    y,
    { bg = BRAND_GREEN, fg = "#ffffff", fontSize = 8, px = 8, py = 4 } = {}
) {
    const w = doc.widthOfString(text, { size: fontSize }) + px * 2;
    const h = fontSize + py * 2;
    doc.save()
        .roundedRect(x, y, w, h, 3)
        .fill(bg)
        .fillColor(fg)
        .fontSize(fontSize)
        .text(text, x + px, y + py + 0.5)
        .restore();
    return w;
}

/* ======================================================
   MAIN EXPORT
====================================================== */
export const generateInvoice = (order) => {
    return new Promise((resolve, reject) => {
        try {
            const orderNumber = order.orderNumber;
            const invoicesDir = path.join(__dirname, "../../invoices");
            if (!fs.existsSync(invoicesDir))
                fs.mkdirSync(invoicesDir, { recursive: true });

            const filePath = path.join(
                invoicesDir,
                `invoice-${orderNumber}.pdf`
            );
            const doc = new PDFDocument({
                size: "A4",
                margin: 0,
                info: {
                    Title: `Invoice – ${orderNumber}`,
                    Author: "Paanshala",
                    Subject: "Order Invoice",
                },
            });
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            /* ================================================
               SECTION 1 — HEADER BAND
            ================================================ */
            // Full-width green header
            doc.save().rect(0, 0, PAGE_W, 110).fill(BRAND_GREEN).restore();

            // Gold accent strip at bottom of header
            doc.save().rect(0, 106, PAGE_W, 4).fill(BRAND_GOLD).restore();

            // Brand name
            doc.fillColor("#ffffff")
                .fontSize(26)
                .font("Helvetica-Bold")
                .text("PAANSHALA", MARGIN, 28);

            // Tagline
            doc.fillColor(BRAND_GOLD)
                .fontSize(9)
                .font("Helvetica")
                .text("Premium Paan & Delicacies", MARGIN, 58);

            // INVOICE label (right-aligned)
            doc.fillColor("#ffffff")
                .fontSize(30)
                .font("Helvetica-Bold")
                .text("INVOICE", 0, 28, {
                    align: "right",
                    width: PAGE_W - MARGIN,
                });

            // Order number & date (right side, below INVOICE)
            doc.fillColor(BRAND_GOLD)
                .fontSize(9)
                .font("Helvetica-Bold")
                .text(orderNumber, 0, 64, {
                    align: "right",
                    width: PAGE_W - MARGIN,
                });

            doc.fillColor("rgba(255,255,255,0.7)")
                .fontSize(8)
                .font("Helvetica")
                .text(
                    new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                    }),
                    0,
                    78,
                    { align: "right", width: PAGE_W - MARGIN }
                );

            /* ================================================
               SECTION 2 — STATUS + ORDER META ROW
            ================================================ */
            const metaY = 128;

            // Status badge
            const statusLabel = order.status || "PAID";
            badge(doc, statusLabel, MARGIN, metaY, {
                bg: BRAND_GOLD,
                fg: DARK,
                fontSize: 9,
                px: 10,
                py: 5,
            });

            // Payment ID (right)
            doc.fillColor(LIGHT)
                .fontSize(8)
                .font("Helvetica")
                .text(
                    `Payment ID: ${order.payment?.razorpayPaymentId || "—"}`,
                    0,
                    metaY + 4,
                    { align: "right", width: PAGE_W - MARGIN }
                );

            /* ================================================
               SECTION 3 — ADDRESS BLOCK
            ================================================ */
            const addrY = metaY + 36;
            const colW = (CONTENT - 20) / 2;

            // Billed To card
            drawAddressCard(
                doc,
                "BILLED TO",
                order.billingAddress,
                MARGIN,
                addrY,
                colW
            );
            // Shipped To card
            drawAddressCard(
                doc,
                "SHIPPED TO",
                order.shippingAddress,
                MARGIN + colW + 20,
                addrY,
                colW
            );

            /* ================================================
               SECTION 4 — ITEMS TABLE
            ================================================ */
            const tblHeaderY = addrY + 140;
            const ROW_H = 28;
            const COL = {
                item: { x: MARGIN, w: 240 },
                qty: { x: MARGIN + 240, w: 60 },
                price: { x: MARGIN + 300, w: 90 },
                total: { x: MARGIN + 390, w: CONTENT - 390 },
            };

            // Table header background
            doc.save()
                .rect(MARGIN, tblHeaderY, CONTENT, ROW_H)
                .fill(BRAND_GREEN)
                .restore();

            // Table header text
            const thY = tblHeaderY + 9;
            doc.fillColor("#ffffff").fontSize(9).font("Helvetica-Bold");
            doc.text("ITEM DESCRIPTION", COL.item.x + 8, thY);
            doc.text("QTY", COL.qty.x + 8, thY);
            doc.text("UNIT PRICE", COL.price.x + 4, thY);
            doc.text("AMOUNT", COL.total.x + 4, thY);

            // Table rows
            let rowY = tblHeaderY + ROW_H;
            order.items.forEach((item, idx) => {
                const bg = idx % 2 === 0 ? STRIPE_ODD : STRIPE_EVEN;

                doc.save()
                    .rect(MARGIN, rowY, CONTENT, ROW_H)
                    .fill(bg)
                    .restore();

                // Left border accent on alt rows
                if (idx % 2 === 0) {
                    doc.save()
                        .rect(MARGIN, rowY, 3, ROW_H)
                        .fill(BRAND_GOLD)
                        .restore();
                }

                const name =
                    item.name +
                    (item.variantSetSize
                        ? ` (Set of ${item.variantSetSize})`
                        : "");
                const cellY = rowY + 9;

                doc.fillColor(DARK)
                    .fontSize(9)
                    .font("Helvetica")
                    .text(name, COL.item.x + 10, cellY, {
                        width: COL.item.w - 14,
                        ellipsis: true,
                    })
                    .text(String(item.quantity), COL.qty.x + 8, cellY)
                    .text(money(item.price), COL.price.x + 4, cellY)
                    .fillColor(BRAND_GREEN)
                    .font("Helvetica-Bold")
                    .text(money(item.totalPrice), COL.total.x + 4, cellY);

                rowY += ROW_H;
            });

            // Bottom border of table
            hline(doc, rowY, { color: BRAND_GREEN, thickness: 1.5 });

            /* ================================================
               SECTION 5 — TOTALS
            ================================================ */
            const totX = MARGIN + 295;
            const totValX = PAGE_W - MARGIN;
            let totY = rowY + 20;
            const totW = CONTENT - 295;

            const totLine = (
                label,
                value,
                { bold = false, color = MID, valColor = DARK, size = 9.5 } = {}
            ) => {
                doc.fillColor(color)
                    .fontSize(size)
                    .font(bold ? "Helvetica-Bold" : "Helvetica")
                    .text(label, totX, totY, { width: 100 });

                doc.fillColor(valColor)
                    .font(bold ? "Helvetica-Bold" : "Helvetica")
                    .text(value, 0, totY, { align: "right", width: totValX });

                totY += size + 10;
            };

            totLine("Subtotal", money(order.subtotal));

            if (order.coupon?.code) {
                totLine(
                    `Coupon  (${order.coupon.code})`,
                    `-${money(order.coupon.discountAmount || order.discount)}`,
                    { color: "#16a34a", valColor: "#16a34a" }
                );
            } else if (order.discount > 0) {
                totLine("Discount", `-${money(order.discount)}`, {
                    color: "#16a34a",
                    valColor: "#16a34a",
                });
            }

            totLine("Shipping", "FREE", {
                color: "#16a34a",
                valColor: "#16a34a",
            });

            // Total divider
            hline(doc, totY + 2, {
                x: totX,
                width: totW,
                color: BRAND_GREEN,
                thickness: 1,
            });
            totY += 14;

            // Grand total band
            doc.save().rect(totX, totY, totW, 32).fill(BRAND_GREEN).restore();

            doc.fillColor("#ffffff")
                .fontSize(11)
                .font("Helvetica-Bold")
                .text("TOTAL AMOUNT", totX + 10, totY + 10);

            doc.fillColor(BRAND_GOLD)
                .fontSize(13)
                .font("Helvetica-Bold")
                .text(money(order.totalAmount), 0, totY + 9, {
                    align: "right",
                    width: totValX - 6,
                });

            totY += 32;

            /* ================================================
               SECTION 6 — PAYMENT INFO ROW
            ================================================ */
            const piY = totY + 24;

            doc.save()
                .rect(MARGIN, piY, CONTENT, 52)
                .fill(STRIPE_ODD)
                .strokeColor(RULE)
                .lineWidth(0.5)
                .stroke()
                .restore();

            doc.fillColor(BRAND_GREEN)
                .fontSize(8)
                .font("Helvetica-Bold")
                .text("PAYMENT DETAILS", MARGIN + 10, piY + 10);

            doc.fillColor(MID)
                .fontSize(8)
                .font("Helvetica")
                .text(`Method: Online (Razorpay)`, MARGIN + 10, piY + 24)
                .text(
                    `Status: ${order.payment?.status || "PAID"}`,
                    MARGIN + 10,
                    piY + 36
                );

            doc.fillColor(MID)
                .text(
                    `Transaction ID: ${order.payment?.razorpayPaymentId || "—"}`,
                    MARGIN + 200,
                    piY + 24
                )
                .text(
                    `Razorpay Order: ${order.payment?.razorpayOrderId || "—"}`,
                    MARGIN + 200,
                    piY + 36
                );

            /* ================================================
               SECTION 7 — FOOTER
            ================================================ */
            const footerY = PAGE_H - 72;

            // Gold footer strip
            doc.save().rect(0, footerY, PAGE_W, 2).fill(BRAND_GOLD).restore();

            // Footer background
            doc.save()
                .rect(0, footerY + 2, PAGE_W, 70)
                .fill(BRAND_GREEN)
                .restore();

            doc.fillColor("rgba(255,255,255,0.85)")
                .fontSize(8)
                .font("Helvetica")
                .text(
                    "Thank you for choosing Paanshala! For queries: support@paanshala.com",
                    0,
                    footerY + 16,
                    { align: "center", width: PAGE_W }
                )
                .fillColor("rgba(255,255,255,0.45)")
                .fontSize(7)
                .text(
                    "This is a computer-generated invoice and does not require a physical signature.",
                    0,
                    footerY + 32,
                    { align: "center", width: PAGE_W }
                )
                .fillColor("rgba(255,255,255,0.3)")
                .text(
                    `© ${new Date().getFullYear()} Paanshala. All rights reserved.`,
                    0,
                    footerY + 46,
                    { align: "center", width: PAGE_W }
                );

            doc.end();

            stream.on("finish", () => {
                console.log("✓ Invoice generated:", filePath);
                resolve(filePath);
            });

            stream.on("error", (err) => {
                console.error("✗ Invoice stream error:", err);
                reject(err);
            });
        } catch (err) {
            console.error("✗ Invoice generation error:", err);
            reject(err);
        }
    });
};

/* ======================================================
   ADDRESS CARD HELPER
====================================================== */
function drawAddressCard(doc, heading, addr, x, y, width) {
    const H = 124;

    // Card background
    doc.save()
        .rect(x, y, width, H)
        .fill("#f9fdf6")
        .restore();

    // Left accent bar
    doc.save()
        .rect(x, y, 3, H)
        .fill(BRAND_GREEN)
        .restore();

    // Heading
    doc.fillColor(BRAND_GREEN)
        .fontSize(8)
        .font("Helvetica-Bold")
        .text(heading, x + 10, y + 12);

    hline(doc, y + 24, { x: x + 10, width: width - 20, color: BRAND_GOLD, thickness: 0.5 });

    // Content
    let cy = y + 32;
    const tx = x + 10;
    const tw = width - 14;

    doc.fillColor(DARK)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(addr?.fullName || "—", tx, cy, { width: tw });

    cy += 14;

    if (addr?.companyName) {
        doc.fillColor(MID).fontSize(8).font("Helvetica")
            .text(addr.companyName, tx, cy, { width: tw });
        cy += 12;
    }

    doc.fillColor(MID).fontSize(8).font("Helvetica")
        .text(addr?.streetAddress || "", tx, cy, { width: tw });
    cy += 11;

    if (addr?.landmark) {
        doc.text(`Near: ${addr.landmark}`, tx, cy, { width: tw });
        cy += 11;
    }

    doc.text(`${addr?.city || ""}, ${addr?.state || ""} – ${addr?.pincode || ""}`, tx, cy, { width: tw });
    cy += 11;

    doc.fillColor(LIGHT)
        .text(`📞 ${addr?.phone || "—"}   ✉ ${addr?.email || "—"}`, tx, cy, { width: tw });
}