import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { Reward } from "../models/reward.model.js";
import { sendMail } from "../utils/sendMail.js";
import { baseEmailTemplate } from "../utils/emailTemplate.js";

/* ======================================================
   SHIPROCKET STATUS MAP
   Maps Shiprocket current_status_id → our Order.status
   Reference: https://apiv2.shiprocket.in/v1/external/courier/courierserviceability
====================================================== */
const SHIPPED_STATUS_IDS = new Set([
    6, // Shipped
    7, // In Transit
    8, // Out for Delivery
    38, // Pickup Scheduled
    42, // Picked Up
]);

const DELIVERED_STATUS_ID = 7; // "Delivered" in Shiprocket's final state
// Note: Shiprocket uses status string "Delivered" more reliably than ID
const DELIVERED_STATUS_STRINGS = new Set([
    "delivered",
    "delivered to customer",
]);

/* ======================================================
   SHIPROCKET WEBHOOK HANDLER
   POST /api/orders/shiprocket/webhook
   No auth — Shiprocket calls this publicly.
   Secure via SHIPROCKET_WEBHOOK_TOKEN in env (optional but recommended).
====================================================== */
export const handleShiprocketWebhook = async (req, res) => {
    try {
        /* ── Optional token validation ──
           In Shiprocket dashboard → Settings → API → Webhook,
           you can set a secret token. Shiprocket sends it as
           a query param: ?token=YOUR_TOKEN
        ── */
        const webhookToken = process.env.SHIPROCKET_WEBHOOK_TOKEN;
        if (webhookToken) {
            // Shiprocket sends token in the header matching the Auth Token Type
            // selected in dashboard (default: x-api-key)
            const incomingToken = req.headers["x-api-key"];
            if (incomingToken !== webhookToken) {
                console.warn("⚠️ Shiprocket webhook: invalid token");
                return res.status(401).json({ message: "Unauthorized" });
            }
        }

        const payload = req.body;

        console.log(
            "📦 Shiprocket webhook received:",
            JSON.stringify(payload, null, 2)
        );

        /* ── Extract core fields from payload ── */
        const {
            awb,
            courier_name,
            order_id, // this is our orderNumber e.g. "PAAN-26-01"
            shipment_id,
            current_status,
            current_status_id,
            etd, // estimated delivery date
        } = payload;

        if (!order_id) {
            console.warn("⚠️ Shiprocket webhook: no order_id in payload");
            // Always 200 to prevent Shiprocket retries on bad payloads
            return res.status(200).json({ message: "No order_id, skipped" });
        }

        /* ── Find order by our orderNumber ── */
        const order = await Order.findOne({ orderNumber: order_id });

        if (!order) {
            console.warn(
                `⚠️ Shiprocket webhook: order not found for order_id=${order_id}`
            );
            return res
                .status(200)
                .json({ message: "Order not found, skipped" });
        }

        /* ── Always update Shiprocket tracking fields ── */
        const trackingUrl = awb
            ? `https://shiprocket.co/tracking/${awb}`
            : order.shiprocket?.trackingUrl;

        order.shiprocket = {
            ...(order.shiprocket?.toObject?.() ?? order.shiprocket ?? {}),
            orderId: order.shiprocket?.orderId || String(order_id),
            shipmentId: String(
                shipment_id || order.shiprocket?.shipmentId || ""
            ),
            awbCode: awb || order.shiprocket?.awbCode,
            courierName: courier_name || order.shiprocket?.courierName,
            trackingNumber: awb || order.shiprocket?.trackingNumber,
            trackingUrl,
            status: current_status || order.shiprocket?.status,
            raw: payload,
        };

        const statusString = (current_status || "").toLowerCase().trim();
        const isShipped =
            SHIPPED_STATUS_IDS.has(Number(current_status_id)) ||
            statusString === "shipped" ||
            statusString === "in transit" ||
            statusString === "picked up" ||
            statusString === "out for delivery";

        const isDelivered = DELIVERED_STATUS_STRINGS.has(statusString);

        /* ══════════════════════════════════════
           CASE 1: SHIPPED
        ══════════════════════════════════════ */
        if (isShipped && order.status === "PROCESSING") {
            order.status = "SHIPPED";
            order.shiprocket.shippedAt = new Date();

            await order.save();
            console.log(
                `✓ Order ${order.orderNumber} marked SHIPPED via Shiprocket webhook`
            );

            /* ── Send shipping notification email ── */
            try {
                await sendMail(
                    order.shippingAddress.email,
                    "Your Paanshala Order Has Been Shipped 🚚",
                    baseEmailTemplate({
                        title: "Your Order is on Its Way!",
                        subtitle: `Order #${order.orderNumber}`,
                        body: `
                            <p style="font-size:16px;color:#333;">
                                Great news! Your Paanshala order has been picked up and is on its way to you.
                            </p>

                            <div style="background:#f5f5f5;padding:20px;border-radius:8px;margin:20px 0;">
                                ${
                                    courier_name
                                        ? `
                                <p style="margin:8px 0;">
                                    <strong>Courier Partner:</strong> ${courier_name}
                                </p>`
                                        : ""
                                }

                                ${
                                    awb
                                        ? `
                                <p style="margin:8px 0;">
                                    <strong>AWB / Tracking Number:</strong> ${awb}
                                </p>`
                                        : ""
                                }

                                ${
                                    etd
                                        ? `
                                <p style="margin:8px 0;">
                                    <strong>Estimated Delivery:</strong> ${etd}
                                </p>`
                                        : ""
                                }

                                ${
                                    trackingUrl
                                        ? `
                                <p style="margin-top:20px;">
                                    <a
                                        href="${trackingUrl}"
                                        style="
                                            background:#000;
                                            color:#fff;
                                            padding:12px 24px;
                                            border-radius:6px;
                                            text-decoration:none;
                                            display:inline-block;
                                            font-weight:600;
                                        "
                                    >
                                        Track Your Order
                                    </a>
                                </p>`
                                        : ""
                                }
                            </div>

                            <p style="font-size:14px;color:#666;">
                                Thank you for choosing Paanshala ❤️<br/>
                                If you have any questions, feel free to reach out to us.
                            </p>
                        `,
                    })
                );
                console.log(
                    `✓ Shipping email sent for order ${order.orderNumber}`
                );
            } catch (emailError) {
                console.error("⚠️ Shipping email failed:", emailError);
            }
        } else if (

        /* ══════════════════════════════════════
           CASE 2: DELIVERED
        ══════════════════════════════════════ */
            isDelivered &&
            order.status !== "DELIVERED" &&
            order.status !== "CANCELLED"
        ) {
            order.status = "DELIVERED";

            /* ── Give reward points if not already given ── */
            if (!order.rewardGiven) {
                const rewardBaseAmount = order.subtotal - (order.discount || 0);
                const rewardPoints = Math.floor(rewardBaseAmount * 0.04);

                if (rewardPoints > 0) {
                    await User.findByIdAndUpdate(order.user, {
                        $inc: {
                            rewardPoints,
                            totalRewardEarned: rewardPoints,
                        },
                    });

                    await Reward.create({
                        userId: order.user,
                        orderId: order._id,
                        type: "earned",
                        points: rewardPoints,
                        description: `Reward earned from order ${order.orderNumber}`,
                    });

                    order.rewardGiven = true;
                    console.log(
                        `✓ Reward points given for order ${order.orderNumber}: ${rewardPoints} pts`
                    );
                }
            }

            await order.save();
            console.log(
                `✓ Order ${order.orderNumber} marked DELIVERED via Shiprocket webhook`
            );
        } else {

        /* ══════════════════════════════════════
           CASE 3: JUST A TRACKING UPDATE
           (AWB assigned, scan update, etc.)
           Save the updated shiprocket fields only.
        ══════════════════════════════════════ */
            await order.save();
            console.log(
                `✓ Tracking updated for order ${order.orderNumber} — status: ${current_status}`
            );
        }

        // Always return 200 so Shiprocket doesn't retry
        return res
            .status(200)
            .json({ success: true, message: "Webhook processed" });
    } catch (error) {
        console.error("handleShiprocketWebhook error:", error);
        // Still return 200 to avoid Shiprocket retry storms
        return res
            .status(200)
            .json({ success: true, message: "Webhook received" });
    }
};
