import { Wishlist } from "../models/wishlist.model.js";
import { Product } from "../models/product.model.js";

// =============================
// GET WISHLIST
// =============================
export const getWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({
            user: req.user._id,
        }).populate("products");

        if (!wishlist) {
            return res.status(200).json({
                success: true,
                wishlist: [],
            });
        }

        res.status(200).json({
            success: true,
            wishlist: wishlist.products,
        });
    } catch (error) {
        console.error("getWishlist", error);
        res.status(500).json({
            message: "Error while fetching wishlist",
        });
    }
};

// =============================
// ADD TO WISHLIST
// =============================
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        const product = await Product.findOne({
            _id: productId,
            isActive: true,
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        let wishlist = await Wishlist.findOne({
            user: req.user._id,
        });

        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: req.user._id,
                products: [productId],
            });
        } else {
            if (wishlist.products.includes(productId)) {
                return res.status(400).json({
                    message: "Product already in wishlist",
                });
            }

            wishlist.products.push(productId);
            await wishlist.save();
        }

        res.status(200).json({
            success: true,
            message: "Product added to wishlist",
        });
    } catch (error) {
        console.error("addToWishlist", error);
        res.status(500).json({
            message: "Error while adding to wishlist",
        });
    }
};

// =============================
// REMOVE FROM WISHLIST
// =============================
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        const wishlist = await Wishlist.findOne({
            user: req.user._id,
        });

        if (!wishlist) {
            return res.status(404).json({
                message: "Wishlist not found",
            });
        }

        wishlist.products = wishlist.products.filter(
            (id) => id.toString() !== productId
        );

        await wishlist.save();

        res.status(200).json({
            success: true,
            message: "Product removed from wishlist",
        });
    } catch (error) {
        console.error("removeFromWishlist", error);
        res.status(500).json({
            message: "Error while removing from wishlist",
        });
    }
};

// =============================
// CHECK WISHLIST STATUS
// =============================
export const checkWishlistStatus = async (req, res) => {
    try {
        const { productId } = req.params;

        const wishlist = await Wishlist.findOne({
            user: req.user._id,
        });

        const isWishlisted = wishlist
            ? wishlist.products.includes(productId)
            : false;

        res.status(200).json({
            success: true,
            isWishlisted,
        });
    } catch (error) {
        console.error("checkWishlistStatus", error);
        res.status(500).json({
            message: "Error while checking wishlist",
        });
    }
};
