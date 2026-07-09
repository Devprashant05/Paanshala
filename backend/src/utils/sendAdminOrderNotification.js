import { User } from "../models/user.model.js";
import { sendMail } from "./sendMail.js";
import { baseEmailTemplate } from "./emailTemplate.js";

export const notifyAdminsNewOrder = async (order) => {
    try {
        const admins = await User.find({
            role: "admin",
            isVerified: true,
        }).select("email full_name");

        if (!admins.length) return;

        const emails = admins.map((admin) => admin.email);

        await sendMail(
            emails,
            `🛒 New Order Received - ${order.orderNumber}`,
            baseEmailTemplate({
                title: "New Order Received",
                subtitle: order.orderNumber,
                body: `
                    <p style="font-size:16px;">
                        A new order has been placed on <strong>Paanshala</strong>.
                    </p>

                    <div style="background:#f5f5f5;padding:20px;border-radius:8px;margin:20px 0;">

                        <p><strong>Order Number:</strong> ${order.orderNumber}</p>

                        <p><strong>Total:</strong> ₹${order.totalAmount}</p>

                        <p><strong>Customer:</strong> ${order.shippingAddress.fullName}</p>

                        <p><strong>Phone:</strong> ${order.shippingAddress.phone}</p>

                        <p><strong>Payment:</strong> ${order.paymentMethod}</p>

                        <p><strong>Status:</strong> ${order.status}</p>

                        <p><strong>Items:</strong></p>

                        <ul>
                            ${order.items
                                .map(
                                    (item) => `
                                    <li>
                                        ${item.name}
                                        × ${item.quantity}
                                    </li>
                                `
                                )
                                .join("")}
                        </ul>

                    </div>

                    <p>
                        Please login to the admin dashboard to process this order.
                    </p>
                `,
            })
        );

        console.log("✓ Admin notification sent");
    } catch (error) {
        console.error("Admin notification failed:", error);
    }
};
