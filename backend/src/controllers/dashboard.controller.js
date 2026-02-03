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

            // ORDERS
            totalOrders,
            orderStatusAgg,
            revenueAgg,
            todayOrderAgg,
            recentOrders,
        ] = await Promise.all([
            /* ================= USERS ================= */
            User.countDocuments({}),
            User.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select("full_name email createdAt"),

            /* ================= PRODUCTS ================= */
            Product.countDocuments({}),
            Product.countDocuments({ isFeatured: true }),

            /* ================= REVIEWS ================= */
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

            /* ================= WISHLIST ================= */
            Wishlist.aggregate([
                { $project: { count: { $size: "$products" } } },
                { $group: { _id: null, total: { $sum: "$count" } } },
            ]),

            /* ================= CONTACT ================= */
            Contact.countDocuments({}),
            Contact.countDocuments({ isRead: false }),
            Contact.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select("fullName email isRead createdAt"),

            /* ================= BLOGS ================= */
            Blog.countDocuments({}),
            Blog.countDocuments({ isPublished: true }),

            /* ================= ORDERS ================= */
            Order.countDocuments({}),
            Order.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                    },
                },
            ]),
            Order.aggregate([
                { $match: { status: { $in: ["PAID", "DELIVERED"] } } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$totalAmount" },
                    },
                },
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
        ]);

        // Format order status counts
        const orderStatusMap = {
            PAID: 0,
            PROCESSING: 0,
            SHIPPED: 0,
            DELIVERED: 0,
            CANCELLED: 0,
        };

        orderStatusAgg.forEach((item) => {
            orderStatusMap[item._id] = item.count;
        });

        res.status(200).json({
            success: true,
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
            },
        });
    } catch (error) {
        console.error("getAdminDashboardMetrics", error);
        res.status(500).json({
            message: "Error while fetching dashboard metrics",
        });
    }
};
