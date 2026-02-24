import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateInvoice = (order) => {
    return new Promise((resolve, reject) => {
        try {
            // ✅ FIX: Convert MongoDB ObjectId to string
            const orderNumber = order.orderNumber;

            // Create invoices directory if it doesn't exist
            const invoicesDir = path.join(__dirname, "../../invoices");
            if (!fs.existsSync(invoicesDir)) {
                fs.mkdirSync(invoicesDir, { recursive: true });
            }

            const fileName = `invoice-${orderNumber}.pdf`;
            const filePath = path.join(invoicesDir, fileName);

            const doc = new PDFDocument({ margin: 50 });
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // =========================
            // HEADER
            // =========================
            doc.fontSize(20)
                .fillColor("#2d5016")
                .text("PAANSHALA", 50, 50, { align: "left" })
                .fontSize(10)
                .fillColor("#666666")
                .text("Premium Paan & Delicacies", 50, 75)
                .moveDown();

            // Invoice Title
            doc.fontSize(24)
                .fillColor("#000000")
                .text("INVOICE", 50, 120, { align: "right" })
                .fontSize(10)
                .fillColor("#666666")
                .text(
                    `Order ID: ${orderNumber.slice(-12).toUpperCase()}`,
                    50,
                    150,
                    {
                        align: "right",
                    }
                )
                .text(
                    `Date: ${new Date(order.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        }
                    )}`,
                    50,
                    165,
                    { align: "right" }
                )
                .moveDown(3);

            // =========================
            // ADDRESSES
            // =========================
            const addressY = 220;

            // Billing Address
            doc.fontSize(12)
                .fillColor("#2d5016")
                .text("BILLING ADDRESS", 50, addressY)
                .fontSize(10)
                .fillColor("#000000")
                .text(order.billingAddress.fullName, 50, addressY + 20)
                .fontSize(9)
                .fillColor("#666666");

            if (order.billingAddress.companyName) {
                doc.text(order.billingAddress.companyName, 50, addressY + 35);
            }

            doc.text(order.billingAddress.streetAddress, 50, addressY + 50)
                .text(
                    `${order.billingAddress.city}, ${order.billingAddress.state} - ${order.billingAddress.pincode}`,
                    50,
                    addressY + 65
                )
                .text(`Phone: ${order.billingAddress.phone}`, 50, addressY + 80)
                .text(
                    `Email: ${order.billingAddress.email}`,
                    50,
                    addressY + 95
                );

            // Shipping Address
            doc.fontSize(12)
                .fillColor("#2d5016")
                .text("SHIPPING ADDRESS", 320, addressY)
                .fontSize(10)
                .fillColor("#000000")
                .text(order.shippingAddress.fullName, 320, addressY + 20)
                .fontSize(9)
                .fillColor("#666666");

            if (order.shippingAddress.companyName) {
                doc.text(order.shippingAddress.companyName, 320, addressY + 35);
            }

            doc.text(order.shippingAddress.streetAddress, 320, addressY + 50)
                .text(
                    `${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`,
                    320,
                    addressY + 65
                )
                .text(
                    `Phone: ${order.shippingAddress.phone}`,
                    320,
                    addressY + 80
                )
                .text(
                    `Email: ${order.shippingAddress.email}`,
                    320,
                    addressY + 95
                );

            // =========================
            // ITEMS TABLE
            // =========================
            const tableTop = addressY + 130;

            // Table Header
            doc.fontSize(10)
                .fillColor("#ffffff")
                .rect(50, tableTop, 495, 25)
                .fill("#2d5016")
                .fillColor("#ffffff")
                .text("ITEM", 60, tableTop + 8)
                .text("QTY", 350, tableTop + 8)
                .text("PRICE", 410, tableTop + 8)
                .text("TOTAL", 480, tableTop + 8);

            // Table Rows
            let yPosition = tableTop + 35;
            doc.fillColor("#000000");

            order.items.forEach((item, index) => {
                const backgroundColor = index % 2 === 0 ? "#f9f9f9" : "#ffffff";

                doc.rect(50, yPosition - 5, 495, 25)
                    .fill(backgroundColor)
                    .fillColor("#000000")
                    .fontSize(9)
                    .text(
                        item.name +
                            (item.variantSetSize
                                ? ` (${item.variantSetSize} pcs)`
                                : ""),
                        60,
                        yPosition,
                        { width: 280 }
                    )
                    .text(item.quantity, 350, yPosition)
                    .text(`₹${item.price}`, 410, yPosition)
                    .text(`₹${item.totalPrice}`, 480, yPosition);

                yPosition += 25;
            });

            // =========================
            // TOTALS
            // =========================
            yPosition += 20;

            doc.fontSize(10)
                .fillColor("#666666")
                .text("Subtotal:", 400, yPosition)
                .fillColor("#000000")
                .text(`₹${order.subtotal}`, 480, yPosition);

            if (order.discount > 0) {
                yPosition += 20;
                doc.fillColor("#666666")
                    .text("Discount:", 400, yPosition)
                    .fillColor("#16a34a")
                    .text(`-₹${order.discount}`, 480, yPosition);
            }

            yPosition += 20;
            doc.strokeColor("#2d5016")
                .lineWidth(1)
                .moveTo(400, yPosition)
                .lineTo(545, yPosition)
                .stroke();

            yPosition += 15;
            doc.fontSize(12)
                .fillColor("#2d5016")
                .text("TOTAL:", 400, yPosition)
                .text(`₹${order.totalAmount}`, 480, yPosition);

            // =========================
            // PAYMENT INFO
            // =========================
            yPosition += 40;

            doc.fontSize(10)
                .fillColor("#2d5016")
                .text("PAYMENT INFORMATION", 50, yPosition)
                .fontSize(9)
                .fillColor("#666666")
                .text(
                    `Payment Method: Online Payment (Razorpay)`,
                    50,
                    yPosition + 20
                )
                .text(
                    `Payment ID: ${order.payment.razorpayPaymentId || "N/A"}`,
                    50,
                    yPosition + 35
                )
                .text(`Status: ${order.payment.status}`, 50, yPosition + 50);

            // =========================
            // FOOTER
            // =========================
            doc.fontSize(8)
                .fillColor("#999999")
                .text(
                    "Thank you for your order! For any queries, contact us at support@paanshala.com",
                    50,
                    doc.page.height - 100,
                    { align: "center", width: 495 }
                )
                .text(
                    "This is a computer-generated invoice and does not require a signature.",
                    50,
                    doc.page.height - 80,
                    { align: "center", width: 495 }
                );

            doc.end();

            stream.on("finish", () => {
                console.log("✓ Invoice generated:", filePath);
                resolve(filePath);
            });

            stream.on("error", (error) => {
                console.error("✗ Invoice stream error:", error);
                reject(error);
            });
        } catch (error) {
            console.error("✗ Invoice generation error:", error);
            reject(error);
        }
    });
};
