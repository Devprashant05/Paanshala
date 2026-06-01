import { VideoBanner } from "../models/videoBanner.model.js";
import {
    uploadVideoToCloudinary,
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";

/* =========================
   (Admin) CREATE VIDEO BANNER
========================= */
export const createVideoBanner = async (req, res) => {
    try {
        const { title, description, order, type = "video" } = req.body;

        if (!req.file) {
            return res.status(400).json({
                message: "Banner file is required",
            });
        }

        let videoUrl = "";
        let imageUrl = "";

        if (type === "video") {
            videoUrl = await uploadVideoToCloudinary(req.file.path);

            if (!videoUrl) {
                return res.status(500).json({
                    message: "Video upload failed",
                });
            }
        } else {
            imageUrl = await uploadOnCloudinary(req.file.path, "banners");

            if (!imageUrl) {
                return res.status(500).json({
                    message: "Image upload failed",
                });
            }
        }

        const banner = await VideoBanner.create({
            title,
            description,
            type,
            videoUrl,
            imageUrl,
            order: order || 0,
        });

        res.status(201).json({
            success: true,
            message: "Banner created successfully",
            banner,
        });
    } catch (error) {
        console.error("createVideoBanner", error);

        res.status(500).json({
            message: "Error while creating banner",
        });
    }
};

/* =========================
   (Admin) GET ALL BANNERS
========================= */
export const getAllVideoBannersAdmin = async (req, res) => {
    try {
        const banners = await VideoBanner.find().sort({ order: 1 });

        res.status(200).json({
            success: true,
            banners,
        });
    } catch (error) {
        console.error("getAllVideoBannersAdmin", error);
        res.status(500).json({
            message: "Error while fetching video banners",
        });
    }
};

/* =========================
   (Admin) UPDATE BANNER
========================= */
export const updateVideoBanner = async (req, res) => {
    try {
        const { id } = req.params;

        const { title, description, type, isActive, order } = req.body;

        const banner = await VideoBanner.findById(id);

        if (!banner) {
            return res.status(404).json({
                message: "Banner not found",
            });
        }

        banner.title = title ?? banner.title;
        banner.description = description ?? banner.description;
        banner.type = type ?? banner.type;
        banner.isActive = isActive ?? banner.isActive;
        banner.order = order ?? banner.order;

        if (req.file) {
            // remove old asset
            if (banner.type === "video" && banner.videoUrl) {
                await deleteFromCloudinary(banner.videoUrl);
            }

            if (banner.type === "image" && banner.imageUrl) {
                await deleteFromCloudinary(banner.imageUrl);
            }

            if (type === "video") {
                banner.videoUrl = await uploadVideoToCloudinary(req.file.path);

                banner.imageUrl = "";
            } else {
                banner.imageUrl = await uploadOnCloudinary(
                    req.file.path,
                    "banners"
                );

                banner.videoUrl = "";
            }
        }

        await banner.save();

        res.status(200).json({
            success: true,
            message: "Banner updated",
            banner,
        });
    } catch (error) {
        console.error("updateVideoBanner", error);

        res.status(500).json({
            message: "Error while updating banner",
        });
    }
};
/* =========================
   (Admin) DELETE BANNER
========================= */
export const deleteVideoBanner = async (req, res) => {
    try {
        const { id } = req.params;

        const banner = await VideoBanner.findById(id);
        if (!banner) {
            return res.status(404).json({
                message: "Video banner not found",
            });
        }

        if (banner.type === "video" && banner.videoUrl) {
            await deleteFromCloudinary(banner.videoUrl);
        }

        if (banner.type === "image" && banner.imageUrl) {
            await deleteFromCloudinary(banner.imageUrl);
        }

        await banner.deleteOne();

        res.status(200).json({
            success: true,
            message: "Video banner deleted",
        });
    } catch (error) {
        console.error("deleteVideoBanner", error);
        res.status(500).json({
            message: "Error while deleting video banner",
        });
    }
};

/* =========================
   (Public) GET ACTIVE BANNERS
========================= */
export const getActiveVideoBanners = async (req, res) => {
    try {
        const banners = await VideoBanner.find({
            isActive: true,
        }).sort({ order: 1 });

        res.status(200).json({
            success: true,
            banners,
        });
    } catch (error) {
        console.error("getActiveVideoBanners", error);
        res.status(500).json({
            message: "Error while fetching banners",
        });
    }
};
