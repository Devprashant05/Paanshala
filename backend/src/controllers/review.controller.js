import { Review } from "../models/review.model.js";
import { Product } from "../models/product.model.js";

// =============================
// ADD OR UPDATE REVIEW
// =============================
export const addOrUpdateReview = async (req, res) => {
    try {
        const { productId, rating, review } = req.body;

        if (!rating) {
            return res.status(400).json({
                message: "Rating is required",
            });
        }

        const product = await Product.findOne({
            _id: productId,
            isActive: true,
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        let userReview = await Review.findOne({
            product: productId,
            user: req.user._id,
        });

        if (userReview) {
            userReview.rating = rating;
            userReview.review = review;
            await userReview.save();
        } else {
            userReview = await Review.create({
                product: productId,
                user: req.user._id,
                rating,
                review,
            });

            product.totalReviews += 1;
        }

        // Recalculate average rating
        const stats = await Review.aggregate([
            {
                $match: {
                    product: product._id,
                    isApproved: true,
                },
            },
            {
                $group: {
                    _id: "$product",
                    avgRating: { $avg: "$rating" },
                },
            },
        ]);

        product.averageRating = stats[0]?.avgRating || 0;
        await product.save();

        return res.status(200).json({
            success: true,
            message: "Review submitted successfully",
            review: userReview,
        });
    } catch (error) {
        console.error("addOrUpdateReview", error);

        // Duplicate key (unique index)
        if (error.code === 11000) {
            return res.status(400).json({
                message: "You have already reviewed this product",
            });
        }

        res.status(500).json({
            message: "Error while submitting review",
        });
    }
};

// =============================
// GET PRODUCT REVIEWS
// =============================
export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const reviews = await Review.find({
            product: productId,
            isApproved: true,
        })
            .populate("user", "full_name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            reviews,
        });
    } catch (error) {
        console.error("getProductReviews", error);
        res.status(500).json({
            message: "Error while fetching reviews",
        });
    }
};

// =============================
// GET MY REVIEW
// =============================
export const getMyReview = async (req, res) => {
    const { productId } = req.params;

    const review = await Review.findOne({
        product: productId,
        user: req.user._id,
    });

    res.status(200).json({
        success: true,
        review,
    });
};

// =============================
// (Admin) TOGGLE REVIEW
// =============================
export const toggleReviewApproval = async (req, res) => {
    const { reviewId } = req.params;
    const { isApproved } = req.body;

    const review = await Review.findByIdAndUpdate(
        reviewId,
        { isApproved },
        { new: true }
    );

    res.status(200).json({
        success: true,
        review,
    });
};
