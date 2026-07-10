import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { Reward } from "../models/reward.model.js";
import { sendMail } from "../utils/sendMail.js";
import { baseEmailTemplate } from "../utils/emailTemplate.js";

/* ======================================================
   SHIPROCKET STATUS MAP
   Confirmed from live payload: current_status_id 7 = Delivered
====================================================== */
const SHIPPED_STATUS_IDS = new Set([
    6, // Shipped / In Transit
    8, // Out for Delivery
    38, // Pickup Scheduled
    42, // Picked Up
]);

// 7 = Delivered — confirmed from Shiprocket test payload
const DELIVERED_STATUS_IDS = new Set([7]);
const DELIVERED_STATUS_STRINGS = new Set([
    "delivered",
    "delivered to customer",
]);

/* ======================================================
   SHIPROCKET WEBHOOK HANDLER
   POST /api/orders/tracking/status  (avoid "shiprocket" in URL per their note)
   No auth — Shiprocket calls this publicly, secured via x-api-key header.
====================================================== */
// export const handleShiprocketWebhook = async (req, res) => {
//     try {
//         /* ── Token validation via x-api-key header ── */
//         const webhookToken = process.env.SHIPROCKET_WEBHOOK_TOKEN;
//         if (webhookToken) {
//             const incomingToken = req.headers["x-api-key"];
//             console.log("Expected:", JSON.stringify(webhookToken));
//             console.log("Received:", JSON.stringify(incomingToken));
//             console.log("Headers:", req.headers);

//             if (incomingToken !== webhookToken) {
//                 console.warn("⚠️ Shiprocket webhook: invalid token");
//                 return res.status(401).json({ message: "Unauthorized" });
//             }
//         }

//         const payload = req.body;

//         console.log(
//             "📦 Shiprocket webhook received:",
//             JSON.stringify(payload, null, 2)
//         );

//         /* ── Extract fields (confirmed from live payload) ── */
//         const {
//             awb,
//             courier_name,
//             order_id, // our orderNumber e.g. "PAAN-26-01"
//             sr_order_id, // Shiprocket's internal ID
//             shipment_status,
//             shipment_status_id,
//             current_status,
//             current_status_id,
//             etd,
//         } = payload;

//         if (!order_id) {
//             console.warn("⚠️ Shiprocket webhook: no order_id in payload");
//             return res.status(200).json({ message: "No order_id, skipped" });
//         }

//         /* ── Find order by our orderNumber ── */
//         const order = await Order.findOne({ orderNumber: order_id });

//         if (!order) {
//             console.warn(
//                 `⚠️ Shiprocket webhook: order not found for order_id=${order_id}`
//             );
//             return res
//                 .status(200)
//                 .json({ message: "Order not found, skipped" });
//         }

//         /* ── Always update tracking fields ── */
//         const trackingUrl = awb
//             ? `https://shiprocket.co/tracking/${awb}`
//             : order.shiprocket?.trackingUrl;

//         order.shiprocket = {
//             ...(order.shiprocket?.toObject?.() ?? order.shiprocket ?? {}),
//             orderId:
//                 order.shiprocket?.orderId || String(sr_order_id || order_id),
//             awbCode: awb || order.shiprocket?.awbCode,
//             courierName: courier_name || order.shiprocket?.courierName,
//             trackingNumber: awb || order.shiprocket?.trackingNumber,
//             trackingUrl,
//             status:
//                 current_status || shipment_status || order.shiprocket?.status,
//             raw: payload,
//         };

//         const statusId = Number(current_status_id ?? shipment_status_id);
//         const statusString = (current_status || shipment_status || "")
//             .toLowerCase()
//             .trim();

//         const isShipped =
//             SHIPPED_STATUS_IDS.has(statusId) ||
//             statusString === "shipped" ||
//             statusString === "in transit" ||
//             statusString === "picked up" ||
//             statusString === "out for delivery";

//         const isDelivered =
//             DELIVERED_STATUS_IDS.has(statusId) ||
//             DELIVERED_STATUS_STRINGS.has(statusString);

//         /* ══════════════════════════════════════
//            CASE 1 — SHIPPED
//            Transitions PROCESSING → SHIPPED, fires tracking email
//         ══════════════════════════════════════ */
//         if (isShipped && order.status === "PROCESSING") {
//             order.status = "SHIPPED";
//             order.shiprocket.shippedAt = new Date();

//             await order.save();
//             console.log(
//                 `✓ Order ${order.orderNumber} marked SHIPPED via webhook`
//             );

//             try {
//                 await sendMail(
//                     order.shippingAddress.email,
//                     "Your Paanshala Order Has Been Shipped 🚚",
//                     baseEmailTemplate({
//                         title: "Your Order is on Its Way!",
//                         subtitle: `Order #${order.orderNumber}`,
//                         body: `
//                             <p style="font-size:16px;color:#333;">
//                                 Great news! Your Paanshala order has been picked up and is on its way to you.
//                             </p>
//                             <div style="background:#f5f5f5;padding:20px;border-radius:8px;margin:20px 0;">
//                                 ${courier_name ? `<p style="margin:8px 0;"><strong>Courier Partner:</strong> ${courier_name}</p>` : ""}
//                                 ${awb ? `<p style="margin:8px 0;"><strong>AWB / Tracking Number:</strong> ${awb}</p>` : ""}
//                                 ${etd ? `<p style="margin:8px 0;"><strong>Estimated Delivery:</strong> ${etd}</p>` : ""}
//                                 ${
//                                     trackingUrl
//                                         ? `
//                                 <p style="margin-top:20px;">
//                                     <a href="${trackingUrl}"
//                                        style="background:#000;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600;">
//                                         Track Your Order
//                                     </a>
//                                 </p>`
//                                         : ""
//                                 }
//                             </div>
//                             <p style="font-size:14px;color:#666;">
//                                 Thank you for choosing Paanshala ❤️
//                             </p>
//                         `,
//                     })
//                 );
//                 console.log(
//                     `✓ Shipping email sent for order ${order.orderNumber}`
//                 );
//             } catch (emailError) {
//                 console.error("⚠️ Shipping email failed:", emailError);
//             }
//         } else if (

//         /* ══════════════════════════════════════
//            CASE 2 — DELIVERED
//            Transitions → DELIVERED, gives reward points
//         ══════════════════════════════════════ */
//             isDelivered &&
//             !["DELIVERED", "CANCELLED"].includes(order.status)
//         ) {
//             order.status = "DELIVERED";

//             if (!order.rewardGiven) {
//                 const rewardBaseAmount = order.subtotal - (order.discount || 0);
//                 const rewardPoints = Math.floor(rewardBaseAmount * 0.04);

//                 if (rewardPoints > 0) {
//                     await User.findByIdAndUpdate(order.user, {
//                         $inc: { rewardPoints, totalRewardEarned: rewardPoints },
//                     });

//                     await Reward.create({
//                         userId: order.user,
//                         orderId: order._id,
//                         type: "earned",
//                         points: rewardPoints,
//                         description: `Reward earned from order ${order.orderNumber}`,
//                     });

//                     order.rewardGiven = true;
//                     console.log(
//                         `✓ ${rewardPoints} reward pts given for order ${order.orderNumber}`
//                     );
//                 }
//             }

//             await order.save();
//             console.log(
//                 `✓ Order ${order.orderNumber} marked DELIVERED via webhook`
//             );
//         } else {

//         /* ══════════════════════════════════════
//            CASE 3 — TRACKING UPDATE ONLY
//            AWB assigned, scan events, etc.
//         ══════════════════════════════════════ */
//             await order.save();
//             console.log(
//                 `✓ Tracking updated for ${order.orderNumber} — status: ${current_status || shipment_status}`
//             );
//         }

//         return res
//             .status(200)
//             .json({ success: true, message: "Webhook processed" });
//     } catch (error) {
//         console.error("handleShiprocketWebhook error:", error);
//         // Always 200 — prevent Shiprocket retry storms
//         return res
//             .status(200)
//             .json({ success: true, message: "Webhook received" });
//     }
// };

export const handleShiprocketWebhook = async (req, res) => {
    console.log("========== WEBHOOK ==========");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);

    return res.status(200).json({
        success: true,
    });
};