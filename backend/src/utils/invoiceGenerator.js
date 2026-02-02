import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

const logoUrl =
    "https://res.cloudinary.com/dj4snfkzf/image/upload/v1770011267/paan-500_wrptiy.png";

export const generateInvoice = async (order) => {
    const filePath = path.join("public/temp", `invoice-${order._id}.pdf`);
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    doc.pipe(fs.createWriteStream(filePath));

    /* =========================
       HEADER
    ========================= */
    doc.image(logoUrl, 50, 45, { width: 80 });
    doc.fontSize(20).font("Helvetica-Bold").text("Paanshala", 140, 50);
    doc.fontSize(10)
        .font("Helvetica")
        .text("Premium Paan & Mouth Fresheners", 140, 75)
        .text("support@paanshala.com", 140, 90);

    doc.moveDown(3);

    /* =========================
       INVOICE META
    ========================= */
    doc.fontSize(14).font("Helvetica-Bold").text("INVOICE", { align: "right" });

    doc.fontSize(10)
        .font("Helvetica")
        .text(`Invoice No: ${order._id}`, { align: "right" })
        .text(
            `Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`,
            { align: "right" }
        );

    doc.moveDown(2);

    /* =========================
       BILLING / SHIPPING
    ========================= */
    doc.fontSize(11).font("Helvetica-Bold").text("Billing Address");
    doc.fontSize(10).font("Helvetica");
    doc.text(order.billingAddress.fullName);
    if (order.billingAddress.companyName)
        doc.text(order.billingAddress.companyName);
    doc.text(order.billingAddress.streetAddress);
    doc.text(
        `${order.billingAddress.city}, ${order.billingAddress.state} - ${order.billingAddress.pincode}`
    );
    doc.text(`Phone: ${order.billingAddress.phone}`);
    doc.text(`Email: ${order.billingAddress.email}`);

    doc.moveDown();

    doc.fontSize(11).font("Helvetica-Bold").text("Shipping Address");
    doc.fontSize(10).font("Helvetica");
    doc.text(order.shippingAddress.fullName);
    doc.text(order.shippingAddress.streetAddress);
    doc.text(
        `${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`
    );
    doc.text(`Phone: ${order.shippingAddress.phone}`);

    doc.moveDown(2);

    /* =========================
       ITEMS TABLE HEADER
    ========================= */
    const tableTop = doc.y;
    doc.font("Helvetica-Bold").fontSize(10);

    doc.text("Product", 50, tableTop);
    doc.text("Qty", 300, tableTop);
    doc.text("Price", 350, tableTop);
    doc.text("Total", 450, tableTop);

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    /* =========================
       ITEMS
    ========================= */
    doc.font("Helvetica").fontSize(10);
    let position = doc.y + 5;

    order.items.forEach((item) => {
        doc.text(item.name, 50, position, { width: 230 });
        doc.text(item.quantity.toString(), 300, position);
        doc.text(`₹${item.price}`, 350, position);
        doc.text(`₹${item.totalPrice}`, 450, position);
        position += 20;
    });

    doc.moveDown(3);

    /* =========================
       TOTALS
    ========================= */
    doc.moveTo(350, doc.y).lineTo(550, doc.y).stroke();

    doc.font("Helvetica").fontSize(10);
    doc.text("Subtotal:", 350, doc.y + 5);
    doc.text(`₹${order.subtotal}`, 450, doc.y + 5);

    doc.text("Discount:", 350, doc.y + 20);
    doc.text(`- ₹${order.discount || 0}`, 450, doc.y + 20);

    doc.font("Helvetica-Bold");
    doc.text("Total Amount:", 350, doc.y + 40);
    doc.text(`₹${order.totalAmount}`, 450, doc.y + 40);

    doc.moveDown(4);

    /* =========================
       FOOTER
    ========================= */
    doc.fontSize(9)
        .font("Helvetica")
        .text(
            "Thank you for shopping with Paanshala. This is a system-generated invoice.",
            { align: "center" }
        );

    doc.fontSize(8)
        .fillColor("gray")
        .text("For any queries, contact support@paanshala.com", {
            align: "center",
        });

    doc.end();
    return filePath;
};
