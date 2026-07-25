import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";
import { Wishlist } from "../models/wishlist.model.js";
import { Contact } from "../models/contact.model.js";
import { Blog } from "../models/blog.model.js";
import { Order } from "../models/order.model.js";

// =============================
// ADMIN DASHBOARD METRICS
// =============================
export const getAdminDashboardMetrics = async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        // ── Time range helpers ──────────────────────────────────
        const now = new Date();
        const year = parseInt(req.query.year) || now.getFullYear();

        // Full year window
        const yearStart = new Date(year, 0, 1); // Jan 1
        const yearEnd = new Date(year + 1, 0, 1); // Jan 1 next year

        // Last 7 days for daily chart
        const last7Start = new Date(now);
        last7Start.setDate(now.getDate() - 6);
        last7Start.setHours(0, 0, 0, 0);

        // Last 30 days
        const last30Start = new Date(now);
        last30Start.setDate(now.getDate() - 29);
        last30Start.setHours(0, 0, 0, 0);

        const [
            // USERS
            totalUsers,
            recentUsers,

            // PRODUCTS
            totalProducts,
            featuredProducts,

            // REVIEWS
            totalReviews,
            avgRatingAgg,
            recentReviews,

            // WISHLIST
            wishlistAgg,

            // CONTACTS
            totalContacts,
            unreadContacts,
            recentContacts,

            // BLOGS
            totalBlogs,
            publishedBlogs,

            // ORDERS — existing
            totalOrders,
            orderStatusAgg,
            revenueAgg,
            todayOrderAgg,
            recentOrders,

            // ── NEW: chart data ──────────────────────────────────

            // Monthly revenue + orders for selected year
            monthlyRevenueAgg,

            // Monthly new users for selected year
            monthlyUsersAgg,

            // Monthly new orders count (all statuses) for selected year
            monthlyOrdersAgg,

            // Daily orders + revenue — last 7 days
            dailyAgg,

            // Top 5 products by order frequency
            topProductsAgg,

            // Revenue by payment method
            paymentMethodAgg,

            // Order fulfillment type breakdown
            fulfillmentAgg,

            // Monthly cancelled orders
            monthlyCancelledAgg,
        ] = await Promise.all([
            /* ── USERS ── */
            User.countDocuments({ isFakeReviewer: { $ne: true } }),
            User.find({ isFakeReviewer: { $ne: true } })
                .sort({ createdAt: -1 })
                .limit(5)
                .select("full_name email createdAt"),

            /* ── PRODUCTS ── */
            Product.countDocuments({}),
            Product.countDocuments({ isFeatured: true }),

            /* ── REVIEWS ── */
            Review.countDocuments({ isApproved: true }),
            Review.aggregate([
                { $match: { isApproved: true } },
                { $group: { _id: null, avg: { $avg: "$rating" } } },
            ]),
            Review.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate("product", "name")
                .populate("user", "full_name")
                .select("rating createdAt"),

            /* ── WISHLIST ── */
            Wishlist.aggregate([
                { $project: { count: { $size: "$products" } } },
                { $group: { _id: null, total: { $sum: "$count" } } },
            ]),

            /* ── CONTACTS ── */
            Contact.countDocuments({}),
            Contact.countDocuments({ isRead: false }),
            Contact.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select("fullName email isRead createdAt"),

            /* ── BLOGS ── */
            Blog.countDocuments({}),
            Blog.countDocuments({ isPublished: true }),

            /* ── ORDERS (existing) ── */
            Order.countDocuments({}),
            Order.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
            Order.aggregate([
                { $match: { status: { $in: ["PAID", "DELIVERED"] } } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } },
            ]),
            Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: todayStart },
                        status: { $in: ["PAID", "DELIVERED"] },
                    },
                },
                {
                    $group: {
                        _id: null,
                        orders: { $sum: 1 },
                        revenue: { $sum: "$totalAmount" },
                    },
                },
            ]),
            Order.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate("user", "full_name email")
                .select("totalAmount status createdAt"),

            /* ── MONTHLY REVENUE + ORDER COUNT (paid/delivered) ── */
            Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: yearStart, $lt: yearEnd },
                        status: {
                            $in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"],
                        },
                    },
                },
                {
                    $group: {
                        _id: { month: { $month: "$createdAt" } },
                        revenue: { $sum: "$totalAmount" },
                        orders: { $sum: 1 },
                    },
                },
                { $sort: { "_id.month": 1 } },
            ]),

            /* ── MONTHLY NEW USERS ── */
            User.aggregate([
                {
                    $match: {
                        createdAt: { $gte: yearStart, $lt: yearEnd },
                        isFakeReviewer: { $ne: true },
                    },
                },
                {
                    $group: {
                        _id: { month: { $month: "$createdAt" } },
                        newUsers: { $sum: 1 },
                    },
                },
                { $sort: { "_id.month": 1 } },
            ]),

            /* ── MONTHLY TOTAL ORDER COUNT (all statuses) ── */
            Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: yearStart, $lt: yearEnd },
                    },
                },
                {
                    $group: {
                        _id: { month: { $month: "$createdAt" } },
                        total: { $sum: 1 },
                    },
                },
                { $sort: { "_id.month": 1 } },
            ]),

            /* ── DAILY ORDERS + REVENUE (last 7 days) ── */
            Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: last7Start },
                        status: {
                            $in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"],
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                            day: { $dayOfMonth: "$createdAt" },
                        },
                        revenue: { $sum: "$totalAmount" },
                        orders: { $sum: 1 },
                    },
                },
                { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
            ]),

            /* ── TOP 5 PRODUCTS BY ORDER FREQUENCY ── */
            Order.aggregate([
                {
                    $match: {
                        status: {
                            $in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"],
                        },
                    },
                },
                { $unwind: "$items" },
                {
                    $group: {
                        _id: "$items.productId",
                        name: { $first: "$items.name" },
                        quantity: { $sum: "$items.quantity" },
                        revenue: { $sum: "$items.totalPrice" },
                        orders: { $sum: 1 },
                    },
                },
                { $sort: { orders: -1 } },
                { $limit: 5 },
            ]),

            /* ── REVENUE BY PAYMENT METHOD ── */
            Order.aggregate([
                {
                    $match: {
                        status: {
                            $in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"],
                        },
                    },
                },
                {
                    $group: {
                        _id: "$paymentMethod",
                        revenue: { $sum: "$totalAmount" },
                        orders: { $sum: 1 },
                    },
                },
            ]),

            /* ── ORDER FULFILLMENT TYPE BREAKDOWN ── */
            Order.aggregate([
                {
                    $group: {
                        _id: "$fulfillmentType",
                        count: { $sum: 1 },
                        revenue: { $sum: "$totalAmount" },
                    },
                },
            ]),

            /* ── MONTHLY CANCELLED ORDERS ── */
            Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: yearStart, $lt: yearEnd },
                        status: "CANCELLED",
                    },
                },
                {
                    $group: {
                        _id: { month: { $month: "$createdAt" } },
                        cancelled: { $sum: 1 },
                    },
                },
                { $sort: { "_id.month": 1 } },
            ]),
        ]);

        // ── Format order status map ──────────────────────────────
        const orderStatusMap = {
            PAID: 0,
            PROCESSING: 0,
            SHIPPED: 0,
            DELIVERED: 0,
            CANCELLED: 0,
        };
        orderStatusAgg.forEach((item) => {
            if (orderStatusMap.hasOwnProperty(item._id))
                orderStatusMap[item._id] = item.count;
        });

        // ── Build full 12-month arrays (fill gaps with 0) ────────
        const MONTHS = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];

        // Indexed lookup helpers
        const revenueByMonth = Object.fromEntries(
            monthlyRevenueAgg.map((d) => [d._id.month, d])
        );
        const usersByMonth = Object.fromEntries(
            monthlyUsersAgg.map((d) => [d._id.month, d])
        );
        const ordersByMonth = Object.fromEntries(
            monthlyOrdersAgg.map((d) => [d._id.month, d])
        );
        const cancelledByMonth = Object.fromEntries(
            monthlyCancelledAgg.map((d) => [d._id.month, d])
        );

        const monthlyChart = MONTHS.map((label, i) => {
            const m = i + 1; // 1-indexed month
            return {
                month: label,
                revenue: revenueByMonth[m]?.revenue || 0,
                orders: revenueByMonth[m]?.orders || 0, // paid/delivered
                allOrders: ordersByMonth[m]?.total || 0, // all statuses
                newUsers: usersByMonth[m]?.newUsers || 0,
                cancelled: cancelledByMonth[m]?.cancelled || 0,
            };
        });

        // ── Build last-7-days daily array ────────────────────────
        const dailyMap = Object.fromEntries(
            dailyAgg.map((d) => [
                `${d._id.year}-${String(d._id.month).padStart(2, "0")}-${String(d._id.day).padStart(2, "0")}`,
                d,
            ])
        );

        const dailyChart = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(last7Start);
            date.setDate(last7Start.getDate() + i);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            return {
                date: key,
                label: date.toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                }),
                revenue: dailyMap[key]?.revenue || 0,
                orders: dailyMap[key]?.orders || 0,
            };
        });

        res.status(200).json({
            success: true,
            year, // echoed back so UI knows which year the data is for
            metrics: {
                users: {
                    total: totalUsers,
                },
                products: {
                    total: totalProducts,
                    featured: featuredProducts,
                },
                reviews: {
                    total: totalReviews,
                    averageRating: avgRatingAgg[0]?.avg || 0,
                },
                wishlist: {
                    totalSavedItems: wishlistAgg[0]?.total || 0,
                },
                contacts: {
                    total: totalContacts,
                    unread: unreadContacts,
                },
                blogs: {
                    total: totalBlogs,
                    published: publishedBlogs,
                },
                orders: {
                    total: totalOrders,
                    statusBreakdown: orderStatusMap,
                    revenue: revenueAgg[0]?.total || 0,
                    today: {
                        orders: todayOrderAgg[0]?.orders || 0,
                        revenue: todayOrderAgg[0]?.revenue || 0,
                    },
                },
                recent: {
                    users: recentUsers,
                    contacts: recentContacts,
                    reviews: recentReviews,
                    orders: recentOrders,
                },

                // ── Chart-ready data ──────────────────────────────
                charts: {
                    // 12-month breakdown for the selected year
                    // shape: [{ month, revenue, orders, allOrders, newUsers, cancelled }]
                    monthly: monthlyChart,

                    // Last 7 days day-by-day
                    // shape: [{ date, label, revenue, orders }]
                    daily: dailyChart,

                    // Top 5 products
                    // shape: [{ _id, name, quantity, revenue, orders }]
                    topProducts: topProductsAgg,

                    // Revenue split by payment method (ONLINE / COD)
                    // shape: [{ _id, revenue, orders }]
                    paymentMethods: paymentMethodAgg,

                    // Order count + revenue by fulfillment type (SHIPPED / LOCAL / MIXED)
                    // shape: [{ _id, count, revenue }]
                    fulfillmentTypes: fulfillmentAgg,
                },
            },
        });
    } catch (error) {
        console.error("getAdminDashboardMetrics", error);
        res.status(500).json({
            message: "Error while fetching dashboard metrics",
        });
    }
};
