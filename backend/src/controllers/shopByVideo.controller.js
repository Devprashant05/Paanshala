import { ShopByVideo } from "../models/shopByVideo.model.js";
import { uploadVideoToCloudinary } from "../utils/cloudinary.js";
import { Product } from "../models/product.model.js";

// =============================
// (Admin) CREATE VIDEO
// =============================
export const createShopByVideo = async (req, res) => {
    try {
        const { title, description, products } = req.body;

        if (!req.file) {
            return res.status(400).json({
                message: "Video file is required",
            });
        }

        // Validate products
        if (products?.length) {
            const count = await Product.countDocuments({
                _id: { $in: products },
                isActive: true,
            });

            if (count !== products.length) {
                return res.status(400).json({
                    message: "One or more products are invalid",
                });
            }
        }

        const videoUrl = await uploadVideoToCloudinary(req.file.path);

        const video = await ShopByVideo.create({
            title,
            description,
            videoUrl,
            products,
        });

        res.status(201).json({
            success: true,
            message: "Video added successfully",
            video,
        });
    } catch (error) {
        console.error("createShopByVideo", error);
        res.status(500).json({
            message: "Error while creating video",
        });
    }
};

// =============================
// (Admin) UPDATE VIDEO
// =============================
export const updateShopByVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        const data = req.body;

        const video = await ShopByVideo.findById(videoId);
        if (!video) {
            return res.status(404).json({
                message: "Video not found",
            });
        }

        // Replace video if new uploaded
        if (req.file) {
            data.videoUrl = await uploadVideoToCloudinary(req.file.path);
        }

        const updatedVideo = await ShopByVideo.findByIdAndUpdate(
            videoId,
            data,
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Video updated successfully",
            video: updatedVideo,
        });
    } catch (error) {
        console.error("updateShopByVideo", error);
        res.status(500).json({
            message: "Error while updating video",
        });
    }
};

// =============================
// (Admin) TOGGLE VIDEO
// =============================
export const toggleShopByVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        const { isActive } = req.body;

        const video = await ShopByVideo.findByIdAndUpdate(
            videoId,
            { isActive },
            { new: true }
        );

        res.status(200).json({
            success: true,
            video,
        });
    } catch (error) {
        console.error("toggleShopByVideo", error);
        res.status(500).json({
            message: "Error while updating video status",
        });
    }
};

// =============================
// (Admin) LIST VIDEOS
// =============================
export const listShopByVideoAdmin = async (req, res) => {
    const videos = await ShopByVideo.find()
        .populate("products", "name images discountedPrice")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        videos,
    });
};

// =============================
// (User) GET VIDEOS
// =============================
export const getShopByVideos = async (req, res) => {
    const videos = await ShopByVideo.find({ isActive: true })
        .populate("products", "name images discountedPrice category")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        videos,
    });
};
