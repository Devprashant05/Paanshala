import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ─── Palette ─── */
const INK       = "#1c1c1e";   // near-black text
const SUB       = "#6b7280";   // secondary text
const ACCENT    = "#2d5016";   // dark green
const GOLD      = "#c9a227";   // warm gold
const GOLD_LITE = "#fdf6e3";   // gold tint bg
const RULE      = "#e5e7eb";   // divider
const CELL_ALT  = "#f9fafb";   // alternate row

/* ─── Layout ─── */
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const M      = 50;
const CW     = PAGE_W - M * 2;  // 495.28

const Rs = (n) =>
    `Rs. ${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

const hline = (doc, y, { x = M, w = CW, color = RULE, lw = 0.5 } = {}) =>
    doc
        .save()
        .strokeColor(color)
        .lineWidth(lw)
        .moveTo(x, y)
        .lineTo(x + w, y)
        .stroke()
        .restore();

const vline = (doc, x, y1, y2, { color = RULE, lw = 0.5 } = {}) =>
    doc
        .save()
        .strokeColor(color)
        .lineWidth(lw)
        .moveTo(x, y1)
        .lineTo(x, y2)
        .stroke()
        .restore();

/* ══════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════ */
export const generateInvoice = async (order) => {
  const LOGO_URL =
    "https://res.cloudinary.com/dj4snfkzf/image/upload/v1770011267/paan-500_wrptiy.png";

  let logoBuf = null;
  try { logoBuf = await fetchBuf(LOGO_URL); } catch { /* use text fallback */ }

  return new Promise((resolve, reject) => {
      try {
          const num = order.orderNumber;
          const outDir = path.join(__dirname, "../../invoices");
          if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
          const outPath = path.join(outDir, `invoice-${num}.pdf`);

          const doc = new PDFDocument({
              size: "A4",
              margin: 0,
              info: { Title: `Invoice ${num}`, Author: "Paanshala" },
          });
          const stream = fs.createWriteStream(outPath);
          doc.pipe(stream);

          /* ─────────────────────────────────────────
         1.  HEADER  — white background, logo + title
      ───────────────────────────────────────── */
          // Thin gold top bar
          doc.save().rect(0, 0, PAGE_W, 5).fill(GOLD).restore();

          // White header area
          doc.save().rect(0, 5, PAGE_W, 110).fill("#ffffff").restore();

          // Logo — left side, vertically centred
          if (logoBuf) {
              try {
                  // Draw on a white rectangle first so transparency renders cleanly
                  doc.save().rect(M, 16, 110, 88).fill("#ffffff").restore();
                  doc.image(logoBuf, M, 18, {
                      width: 108,
                      height: 84,
                      fit: [108, 84],
                      align: "left",
                      valign: "center",
                  });
              } catch {
                  doc.fillColor(ACCENT)
                      .fontSize(20)
                      .font("Helvetica-Bold")
                      .text("PAANSHALA", M, 46);
              }
          } else {
              doc.fillColor(ACCENT)
                  .fontSize(20)
                  .font("Helvetica-Bold")
                  .text("PAANSHALA", M, 46);
          }

          // Right side — INVOICE title + meta
          doc.fillColor(ACCENT)
              .fontSize(32)
              .font("Helvetica-Bold")
              .text("INVOICE", 0, 22, { align: "right", width: PAGE_W - M });

          doc.fillColor(GOLD)
              .fontSize(11)
              .font("Helvetica-Bold")
              .text(`# ${num}`, 0, 64, { align: "right", width: PAGE_W - M });

          doc.fillColor(SUB)
              .fontSize(9)
              .font("Helvetica")
              .text(
                  new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                  }),
                  0,
                  82,
                  { align: "right", width: PAGE_W - M }
              );

          // Gold bottom border of header
          doc.save().rect(0, 115, PAGE_W, 2).fill(GOLD).restore();

          /* ─────────────────────────────────────────
         2.  STATUS ROW
      ───────────────────────────────────────── */
          let Y = 132;

          const statusMap = {
              PAID: { bg: "#d1fae5", fg: "#065f46", label: "PAID" },
              DELIVERED: { bg: "#d1fae5", fg: "#065f46", label: "DELIVERED" },
              PROCESSING: { bg: "#fef3c7", fg: "#92400e", label: "PROCESSING" },
              SHIPPED: { bg: "#dbeafe", fg: "#1e3a8a", label: "SHIPPED" },
              CANCELLED: { bg: "#fee2e2", fg: "#991b1b", label: "CANCELLED" },
              PENDING: { bg: "#f3f4f6", fg: "#374151", label: "PENDING" },
          };
          const st = statusMap[(order.status || "").toUpperCase()] || {
              bg: "#f3f4f6",
              fg: "#374151",
              label: order.status || "—",
          };
          const stW = doc.widthOfString(st.label, { size: 8 }) + 20;
          doc.save().roundedRect(M, Y, stW, 20, 4).fill(st.bg).restore();
          doc.fillColor(st.fg)
              .fontSize(8)
              .font("Helvetica-Bold")
              .text(st.label, M + 10, Y + 6);

          // Payment method badge
          const isCOD = order.paymentMethod === "COD";
          const pmLabel = isCOD ? "Cash on Delivery" : "Online Payment";
          const pmW = doc.widthOfString(pmLabel, { size: 8 }) + 20;
          const pmBg = isCOD ? "#fef9e7" : "#eff6ff";
          const pmFg = isCOD ? "#92400e" : "#1e40af";
          doc.save()
              .roundedRect(M + stW + 8, Y, pmW, 20, 4)
              .fill(pmBg)
              .restore();
          doc.fillColor(pmFg)
              .fontSize(8)
              .font("Helvetica")
              .text(pmLabel, M + stW + 18, Y + 6);

          Y += 36;

          /* ─────────────────────────────────────────
         3.  ADDRESS CARDS — side by side
      ───────────────────────────────────────── */
          const CARD_W = (CW - 12) / 2;
          const CARD_H = 118;

          drawAddressCard(
              doc,
              "Bill To",
              order.billingAddress,
              M,
              Y,
              CARD_W,
              CARD_H
          );
          drawAddressCard(
              doc,
              "Ship To",
              order.shippingAddress,
              M + CARD_W + 12,
              Y,
              CARD_W,
              CARD_H
          );

          Y += CARD_H + 24;

          /* ─────────────────────────────────────────
         4.  ITEMS TABLE
      ───────────────────────────────────────── */
          const ROW_H = 28;
          const COL = {
              no: { x: M, w: 28 },
              desc: { x: M + 28, w: 224 },
              qty: { x: M + 252, w: 56 },
              price: { x: M + 308, w: 90 },
              amt: { x: M + 398, w: CW - 398 },
          };

          // Header
          doc.save().rect(M, Y, CW, ROW_H).fill(ACCENT).restore();
          const TH_Y = Y + 9;
          doc.fillColor("#ffffff").fontSize(8).font("Helvetica-Bold");
          doc.text("#", COL.no.x + 8, TH_Y);
          doc.text("DESCRIPTION", COL.desc.x + 6, TH_Y);
          doc.text("QTY", COL.qty.x + 6, TH_Y);
          doc.text("UNIT PRICE", COL.price.x + 6, TH_Y);
          doc.text("AMOUNT", COL.amt.x + 6, TH_Y);

          Y += ROW_H;

          // Rows
          (order.items || []).forEach((item, i) => {
              const bg = i % 2 === 0 ? CELL_ALT : "#ffffff";
              doc.save().rect(M, Y, CW, ROW_H).fill(bg).restore();

              // Subtle vertical column dividers
              [COL.qty.x, COL.price.x, COL.amt.x].forEach((cx) =>
                  vline(doc, cx, Y, Y + ROW_H, { color: "#e5e7eb", lw: 0.4 })
              );

              const label =
                  (item.name || "Item") +
                  (item.variantSetSize ? ` (${item.variantSetSize} pcs)` : "");
              const cy = Y + 9;

              doc.fillColor(SUB)
                  .fontSize(8)
                  .font("Helvetica")
                  .text(String(i + 1), COL.no.x + 10, cy);

              doc.fillColor(INK)
                  .fontSize(8.5)
                  .font("Helvetica")
                  .text(label, COL.desc.x + 6, cy, {
                      width: COL.desc.w - 10,
                      ellipsis: true,
                  })
                  .text(String(item.quantity), COL.qty.x + 6, cy)
                  .text(Rs(item.price), COL.price.x + 6, cy);

              doc.fillColor(ACCENT)
                  .font("Helvetica-Bold")
                  .text(Rs(item.totalPrice), COL.amt.x + 6, cy);

              Y += ROW_H;
          });

          // Table bottom border
          doc.save().rect(M, Y, CW, 1.5).fill(ACCENT).restore();
          Y += 1.5;

          /* ─────────────────────────────────────────
         5.  TOTALS
      ───────────────────────────────────────── */
          const TOT_X = M + 290;
          const TOT_W = CW - 290;

          Y += 16;

          const totRow = (label, value, opts = {}) => {
              const { lc = SUB, vc = INK, bold = false, sz = 9 } = opts;
              doc.fillColor(lc)
                  .fontSize(sz)
                  .font("Helvetica")
                  .text(label, TOT_X, Y, { width: 130 });
              doc.fillColor(vc)
                  .font(bold ? "Helvetica-Bold" : "Helvetica")
                  .text(value, 0, Y, { align: "right", width: PAGE_W - M });
              Y += sz + 10;
          };

          totRow("Subtotal", Rs(order.subtotal));

          if (order.coupon?.code && order.discount > 0) {
              totRow(
                  `Coupon (${order.coupon.code})`,
                  `- ${Rs(order.discount)}`,
                  { lc: "#16a34a", vc: "#16a34a" }
              );
          } else if (order.discount > 0) {
              totRow("Discount", `- ${Rs(order.discount)}`, {
                  lc: "#16a34a",
                  vc: "#16a34a",
              });
          }

          if (order.rewardPointsUsed > 0) {
              totRow("Reward Points", `- ${Rs(order.rewardPointsUsed)}`, {
                  lc: "#16a34a",
                  vc: "#16a34a",
              });
          }

          const ship = order.shippingCharges || 0;
          totRow(
              "Shipping",
              ship > 0 ? Rs(ship) : "FREE",
              ship === 0 ? { lc: "#16a34a", vc: "#16a34a" } : {}
          );

          if (order.codCharges > 0) {
              totRow(`COD Fee`, `+ ${Rs(order.codCharges)}`);
          }

          // Divider
          hline(doc, Y, { x: TOT_X, w: TOT_W, color: ACCENT, lw: 1 });
          Y += 12;

          // Grand total band
          const GT_H = 36;
          doc.save().rect(TOT_X, Y, TOT_W, GT_H).fill(ACCENT).restore();
          // left gold accent
          doc.save().rect(TOT_X, Y, 4, GT_H).fill(GOLD).restore();

          doc.fillColor("#ffffff")
              .fontSize(10)
              .font("Helvetica-Bold")
              .text("TOTAL AMOUNT", TOT_X + 12, Y + 12);

          doc.fillColor(GOLD)
              .fontSize(12)
              .font("Helvetica-Bold")
              .text(Rs(order.totalAmount), 0, Y + 11, {
                  align: "right",
                  width: PAGE_W - M - 6,
              });

          Y += GT_H + 24;

          /* ─────────────────────────────────────────
         6.  PAYMENT + NOTE ROW
      ───────────────────────────────────────── */
          const PI_H = 64;

          // Payment details box
          const PI_W = (CW - 12) / 2;
          doc.save().roundedRect(M, Y, PI_W, PI_H, 6).fill(CELL_ALT).restore();
          doc.save()
              .roundedRect(M, Y, PI_W, PI_H, 6)
              .strokeColor(RULE)
              .lineWidth(0.5)
              .stroke()
              .restore();

          // Left accent
          doc.save()
              .rect(M, Y + 6, 3, PI_H - 12)
              .fill(GOLD)
              .restore();

          doc.fillColor(ACCENT)
              .fontSize(8)
              .font("Helvetica-Bold")
              .text("PAYMENT DETAILS", M + 10, Y + 12);

          const piMethod = isCOD ? "Cash on Delivery" : "Online (Razorpay)";
          const piStatus =
              order.payment?.status || (isCOD ? "Pending" : "Paid");
          doc.fillColor(SUB)
              .fontSize(8)
              .font("Helvetica")
              .text(`Method : ${piMethod}`, M + 10, Y + 26)
              .text(`Status : ${piStatus}`, M + 10, Y + 38);

          if (!isCOD && order.payment?.razorpayPaymentId) {
              doc.text(
                  `Txn ID : ${order.payment.razorpayPaymentId}`,
                  M + 10,
                  Y + 50,
                  { width: PI_W - 20, ellipsis: true }
              );
          }

          // Thank you note box
          const NOTE_X = M + PI_W + 12;
          doc.save()
              .roundedRect(NOTE_X, Y, PI_W, PI_H, 6)
              .fill(GOLD_LITE)
              .restore();
          doc.save()
              .roundedRect(NOTE_X, Y, PI_W, PI_H, 6)
              .strokeColor("#e9d170")
              .lineWidth(0.5)
              .stroke()
              .restore();

          doc.fillColor(GOLD)
              .fontSize(13)
              .font("Helvetica-Bold")
              .text("Thank You!", NOTE_X + 12, Y + 12);
          doc.fillColor("#7c5a00")
              .fontSize(8)
              .font("Helvetica")
              .text("We appreciate your order.", NOTE_X + 12, Y + 30, {
                  width: PI_W - 20,
              })
              .text("For support: support@paanshala.com", NOTE_X + 12, Y + 42, {
                  width: PI_W - 20,
              });

          Y += PI_H;

          /* ─────────────────────────────────────────
         7.  FOOTER
      ───────────────────────────────────────── */
          const FOOT_Y = PAGE_H - 48;

          doc.save().rect(0, FOOT_Y, PAGE_W, 2).fill(GOLD).restore();
          doc.save()
              .rect(0, FOOT_Y + 2, PAGE_W, 46)
              .fill(ACCENT)
              .restore();

          doc.fillColor("#ffffff")
              .fontSize(8)
              .font("Helvetica")
              .text(
                  "This is a system-generated invoice and does not require a signature.",
                  0,
                  FOOT_Y + 12,
                  { align: "center", width: PAGE_W }
              );

          doc.fillColor("#d1d5db")
              .fontSize(7)
              .text(
                  `© ${new Date().getFullYear()} Paanshala. All rights reserved.  |  www.paanshala.com`,
                  0,
                  FOOT_Y + 27,
                  { align: "center", width: PAGE_W }
              );

          doc.end();
          stream.on("finish", () => resolve(outPath));
          stream.on("error", reject);
      } catch (err) {
          reject(err);
      }
  });
};

/* ══════════════════════════════════════════════════
   ADDRESS CARD
══════════════════════════════════════════════════ */
function drawAddressCard(doc, heading, addr, x, y, w, h) {
    // Card shadow effect (slightly offset dark rect)
    doc.save()
        .roundedRect(x + 2, y + 2, w, h, 6)
        .fill("#e5e7eb")
        .restore();

    // Card body
    doc.save().roundedRect(x, y, w, h, 6).fill("#ffffff").restore();
    doc.save()
        .roundedRect(x, y, w, h, 6)
        .strokeColor(RULE)
        .lineWidth(0.5)
        .stroke()
        .restore();

    // Top gold bar
    doc.save().roundedRect(x, y, w, 5, 3).fill(GOLD).restore();
    // Clip so only top corners round
    doc.save()
        .rect(x, y + 3, w, 2)
        .fill(GOLD)
        .restore();

    // Heading
    doc.fillColor(ACCENT)
        .fontSize(7.5)
        .font("Helvetica-Bold")
        .text(heading.toUpperCase(), x + 12, y + 16);

    hline(doc, y + 27, { x: x + 12, w: w - 24, color: RULE });

    let cy = y + 34;
    const tx = x + 12;
    const tw = w - 24;

    // Name
    doc.fillColor(INK)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(addr?.fullName || "—", tx, cy, { width: tw });
    cy += 15;

    // Street
    doc.fillColor(SUB)
        .fontSize(8)
        .font("Helvetica")
        .text(addr?.streetAddress || "—", tx, cy, { width: tw });
    cy += 12;

    // Landmark
    if (addr?.landmark) {
        doc.text(`Near: ${addr.landmark}`, tx, cy, { width: tw });
        cy += 12;
    }

    // City, State – Pin
    doc.text(
        `${addr?.city || ""}, ${addr?.state || ""} – ${addr?.pincode || ""}`,
        tx,
        cy,
        { width: tw }
    );
    cy += 14;

    // Phone
    doc.fillColor("#9ca3af")
        .fontSize(7.5)
        .font("Helvetica")
        .text(`Ph: ${addr?.phone || "—"}`, tx, cy, { width: tw });
    cy += 11;
    doc.text(`Email: ${addr?.email || "—"}`, tx, cy, { width: tw });
}