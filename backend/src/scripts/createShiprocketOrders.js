import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";

import { Order } from "../models/order.model.js";

dotenv.config();

const DRY_RUN = false;

// Leave empty to push all eligible orders
const ORDER_NUMBERS = [
    // "PS000123",
];

let token = null;

async function authenticateShiprocket() {
    if (token) return token;

    const response = await axios.post(
        "https://apiv2.shiprocket.in/v1/external/auth/login",
        {
            email: process.env.SHIPROCKET_EMAIL,
            password: process.env.SHIPROCKET_PASSWORD,
        }
    );

    token = response.data.token;

    return token;
}

async function createShiprocketOrder(order) {
    const token = await authenticateShiprocket();

    const payload = {
        order_id: order.orderNumber,

        order_date: new Date(order.createdAt)
            .toISOString()
            .slice(0, 19)
            .replace("T", " "),

        pickup_location: "Primary",

        billing_customer_name: order.shippingAddress.fullName,
        billing_last_name: "",

        billing_address: order.shippingAddress.streetAddress,
        billing_address_2: order.shippingAddress.landmark || "",

        billing_city: order.shippingAddress.city,
        billing_pincode: order.shippingAddress.pincode,
        billing_state: order.shippingAddress.state,
        billing_country: "India",

        billing_email: order.shippingAddress.email,
        billing_phone: order.shippingAddress.phone,

        shipping_is_billing: true,

        order_items: order.items.map((item) => ({
            name: item.name,
            sku:
                item.sku ||
                item.product?.toString() ||
                item.name.replace(/\s+/g, "-"),

            units: item.quantity,

            selling_price: Number(item.price),
        })),

        payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",

        sub_total: Number(order.totalAmount),

        length: 10,
        breadth: 10,
        height: 5,
        weight: 0.5,
    };

    if (DRY_RUN) {
        console.log("\n========== Payload ==========\n");
        console.dir(payload, { depth: null });
        return;
    }

    const response = await axios.post(
        "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
        payload,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    console.log(
        `✅ ${order.orderNumber} -> Shiprocket Order ID:`,
        response.data.order_id
    );

    console.dir(response.data, { depth: null });

    return response.data;
}

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("✓ Connected to MongoDB");

        const filter =
            ORDER_NUMBERS.length > 0
                ? {
                      orderNumber: {
                          $in: ORDER_NUMBERS,
                      },
                  }
                : {
                      orderStatus: "Confirmed",
                  };

        const orders = await Order.find(filter);

        console.log(`Found ${orders.length} order(s)\n`);

        for (const order of orders) {
            try {
                await createShiprocketOrder(order);
            } catch (err) {
                console.error(
                    `❌ ${order.orderNumber}`,
                    err.response?.data || err.message
                );
            }
        }

        await mongoose.disconnect();

        console.log("\nDone.");
    } catch (err) {
        console.error(err);

        await mongoose.disconnect();
    }
}

run();
