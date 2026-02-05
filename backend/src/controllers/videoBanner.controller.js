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
        const { title, description, order } = req.body;

        if (!req.file) {
            return res.status(400).json({
                message: "Video file is required",
            });
        }

        const videoUrl = await uploadVideoToCloudinary(req.file.path);
        if (!videoUrl) {
            return res.status(500).json({
                message: "Video upload failed",
            });
        }

        const banner = await VideoBanner.create({
            title,
            description,
            videoUrl,
            order: order || 0,
        });

        res.status(201).json({
            success: true,
            message: "Video banner uploaded successfully",
            banner,
        });
    } catch (error) {
        console.error("createVideoBanner", error);
        res.status(500).json({
            message: "Error while uploading video banner",
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
        const { title, description, isActive, order } = req.body;

        const banner = await VideoBanner.findById(id);
        if (!banner) {
            return res.status(404).json({
                message: "Video banner not found",
            });
        }

        banner.title = title ?? banner.title;
        banner.description = description ?? banner.description;
        banner.isActive = isActive ?? banner.isActive;
        banner.order = order ?? banner.order;

        await banner.save();

        res.status(200).json({
            success: true,
            message: "Video banner updated",
            banner,
        });
    } catch (error) {
        console.error("updateVideoBanner", error);
        res.status(500).json({
            message: "Error while updating video banner",
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

        // delete cloudinary video
        await deleteFromCloudinary(banner.videoUrl);

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
