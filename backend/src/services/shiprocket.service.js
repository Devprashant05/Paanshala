import axios from "axios";

let shiprocketToken = null;
let tokenExpiry = null;

/* ======================================================
   AUTHENTICATE
====================================================== */
export const authenticateShiprocket = async () => {
    try {
        if (shiprocketToken && tokenExpiry && new Date() < tokenExpiry) {
            return shiprocketToken;
        }

        const response = await axios.post(
            "https://apiv2.shiprocket.in/v1/external/auth/login",
            {
                email: process.env.SHIPROCKET_EMAIL,
                password: process.env.SHIPROCKET_PASSWORD,
            }
        );

        shiprocketToken = response.data.token;

        // valid ~9 days
        tokenExpiry = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000);

        return shiprocketToken;
    } catch (error) {
        console.error(
            "SHIPROCKET AUTH ERROR:",
            error.response?.data || error.message
        );

        throw new Error("Shiprocket authentication failed");
    }
};

/* ======================================================
   CREATE SHIPROCKET ORDER
====================================================== */
export const createShiprocketOrder = async (order) => {
    try {
        const token = await authenticateShiprocket();

        const payload = {
            order_id: order.orderNumber,

            order_date: new Date(order.createdAt).toISOString().split("T")[0],

            pickup_location: "home",

            billing_customer_name: order.shippingAddress.fullName,

            billing_last_name: "",

            billing_address: order.shippingAddress.streetAddress,

            billing_city: order.shippingAddress.city,

            billing_pincode: order.shippingAddress.pincode,

            billing_state: order.shippingAddress.state,

            billing_country: "India",

            billing_email: order.shippingAddress.email,

            billing_phone: order.shippingAddress.phone,

            shipping_is_billing: true,

            order_items: order.items.map((item) => ({
                name: item.name,
                sku: item.product?.toString() || item.name.replace(/\s+/g, "-"),

                units: item.quantity,

                selling_price: item.price,
            })),

            payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",

            sub_total: order.totalAmount,

            length: 10,
            breadth: 10,
            height: 5,
            weight: 0.5,
        };

        const response = await axios.post(
            "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            "SHIPROCKET ORDER ERROR:",
            error.response?.data || error.message
        );

        throw new Error("Failed to create Shiprocket order");
    }
};


/* ======================================================
   UPDATE SHIPROCKET ORDER ADDRESS
====================================================== */
export const updateShiprocketOrderAddress = async (shiprocketOrderId, shippingAddress) => {
    try {
        const token = await authenticateShiprocket();

        const payload = {
            billing_customer_name: shippingAddress.fullName,
            billing_last_name: "",
            billing_address: shippingAddress.streetAddress,
            billing_address_2: shippingAddress.landmark || "",
            billing_city: shippingAddress.city,
            billing_pincode: shippingAddress.pincode,
            billing_state: shippingAddress.state,
            billing_country: "India",
            billing_email: shippingAddress.email,
            billing_phone: shippingAddress.phone,
            shipping_is_billing: true,
        };

        const response = await axios.post(
            `https://apiv2.shiprocket.in/v1/external/orders/address/update`,
            {
                order_id: shiprocketOrderId,
                ...payload,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            "SHIPROCKET ADDRESS UPDATE ERROR:",
            error.response?.data || error.message
        );
        throw new Error("Failed to update Shiprocket order address");
    }
};
