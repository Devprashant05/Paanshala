import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";
import { Wishlist } from "../models/wishlist.model.js";
import { Contact } from "../models/contact.model.js";
import { Blog } from "../models/blog.model.js";

// =============================
// ADMIN DASHBOARD METRICS
// =============================
export const getAdminDashboardMetrics = async (req, res) => {
    try {
        // Parallel queries for speed
        const [
            totalUsers,
            totalProducts,
            featuredProducts,
            totalReviews,
            avgRatingAgg,
            wishlistAgg,
            totalContacts,
            unreadContacts,
            totalBlogs,
            publishedBlogs,
            recentUsers,
            recentContacts,
            recentReviews,
        ] = await Promise.all([
            User.countDocuments({}),
            Product.countDocuments({}),
            Product.countDocuments({ isFeatured: true }),
            Review.countDocuments({ isApproved: true }),
            Review.aggregate([
                { $match: { isApproved: true } },
                { $group: { _id: null, avg: { $avg: "$rating" } } },
            ]),
            Wishlist.aggregate([
                { $project: { count: { $size: "$products" } } },
                { $group: { _id: null, total: { $sum: "$count" } } },
            ]),
            Contact.countDocuments({}),
            Contact.countDocuments({ isRead: false }),
            Blog.countDocuments({}),
            Blog.countDocuments({ isPublished: true }),
            User.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select("full_name email createdAt"),
            Contact.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select("fullName email isRead createdAt"),
            Review.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate("product", "name")
                .populate("user", "full_name")
                .select("rating createdAt"),
        ]);

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
                recent: {
                    users: recentUsers,
                    contacts: recentContacts,
                    reviews: recentReviews,
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
