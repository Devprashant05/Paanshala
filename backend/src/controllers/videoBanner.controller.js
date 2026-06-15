// controllers/videoBanner.controller.js
import { VideoBanner } from "../models/videoBanner.model.js";
import {
    uploadVideoToCloudinary,
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";

/* helper ─ parse JSON style fields coming from multipart form */
const parseStyle = (raw, fallback) => {
    if (!raw) return fallback;
    try {
        return typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
        return fallback;
    }
};

/* =========================
   (Admin) CREATE VIDEO BANNER
   Expects multer fields:
     - bannerFile  (required)
     - mobileFile  (optional, portrait image for mobile)
========================= */
export const createVideoBanner = async (req, res) => {
    try {
        const {
            title,
            description,
            order,
            type = "video",
            titleStyle: rawTitleStyle,
            descriptionStyle: rawDescStyle,
        } = req.body;

        const bannerFile = req.files?.bannerFile?.[0];
        const mobileFile = req.files?.mobileFile?.[0];

        if (!bannerFile) {
            return res.status(400).json({ message: "Banner file is required" });
        }

        let videoUrl = "";
        let imageUrl = "";
        let mobileImageUrl = "";

        // ── Upload primary asset ──────────────────────────────────────
        if (type === "video") {
            videoUrl = await uploadVideoToCloudinary(bannerFile.path);
            if (!videoUrl)
                return res.status(500).json({ message: "Video upload failed" });
        } else {
            imageUrl = await uploadOnCloudinary(bannerFile.path, "banners");
            if (!imageUrl)
                return res.status(500).json({ message: "Image upload failed" });
        }

        // ── Upload optional mobile (portrait) image ───────────────────
        if (mobileFile) {
            mobileImageUrl = await uploadOnCloudinary(
                mobileFile.path,
                "banners/mobile"
            );
            if (!mobileImageUrl) {
                return res
                    .status(500)
                    .json({ message: "Mobile image upload failed" });
            }
        }

        const titleStyle = parseStyle(rawTitleStyle, {
            fontSize: "32px",
            color: "#ffffff",
        });
        const descriptionStyle = parseStyle(rawDescStyle, {
            fontSize: "16px",
            color: "#ffffff",
        });

        const banner = await VideoBanner.create({
            title,
            description,
            titleStyle,
            descriptionStyle,
            type,
            videoUrl,
            imageUrl,
            mobileImageUrl,
            order: order || 0,
        });

        res.status(201).json({
            success: true,
            message: "Banner created successfully",
            banner,
        });
    } catch (error) {
        console.error("createVideoBanner", error);
        res.status(500).json({ message: "Error while creating banner" });
    }
};

/* =========================
   (Admin) GET ALL BANNERS
========================= */
export const getAllVideoBannersAdmin = async (req, res) => {
    try {
        const banners = await VideoBanner.find().sort({ order: 1 });
        res.status(200).json({ success: true, banners });
    } catch (error) {
        console.error("getAllVideoBannersAdmin", error);
        res.status(500).json({ message: "Error while fetching video banners" });
    }
};

/* =========================
   (Admin) UPDATE BANNER
   Accepts same multer fields as create (both optional on update)
========================= */
export const updateVideoBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            type,
            isActive,
            order,
            titleStyle: rawTitleStyle,
            descriptionStyle: rawDescStyle,
        } = req.body;

        const banner = await VideoBanner.findById(id);
        if (!banner)
            return res.status(404).json({ message: "Banner not found" });

        banner.title = title ?? banner.title;
        banner.description = description ?? banner.description;
        banner.type = type ?? banner.type;
        banner.isActive = isActive ?? banner.isActive;
        banner.order = order ?? banner.order;

        if (rawTitleStyle)
            banner.titleStyle = parseStyle(rawTitleStyle, banner.titleStyle);
        if (rawDescStyle)
            banner.descriptionStyle = parseStyle(
                rawDescStyle,
                banner.descriptionStyle
            );

        const bannerFile = req.files?.bannerFile?.[0];
        const mobileFile = req.files?.mobileFile?.[0];

        // ── Replace primary asset ─────────────────────────────────────
        if (bannerFile) {
            // delete old asset
            if (banner.type === "video" && banner.videoUrl)
                await deleteFromCloudinary(banner.videoUrl);
            if (banner.type === "image" && banner.imageUrl)
                await deleteFromCloudinary(banner.imageUrl);

            const resolvedType = type ?? banner.type;

            if (resolvedType === "video") {
                banner.videoUrl = await uploadVideoToCloudinary(
                    bannerFile.path
                );
                banner.imageUrl = "";
            } else {
                banner.imageUrl = await uploadOnCloudinary(
                    bannerFile.path,
                    "banners"
                );
                banner.videoUrl = "";
            }
        }

        // ── Replace / add mobile image ────────────────────────────────
        if (mobileFile) {
            if (banner.mobileImageUrl)
                await deleteFromCloudinary(banner.mobileImageUrl);

            banner.mobileImageUrl = await uploadOnCloudinary(
                mobileFile.path,
                "banners/mobile"
            );
        }

        await banner.save();

        res.status(200).json({
            success: true,
            message: "Banner updated",
            banner,
        });
    } catch (error) {
        console.error("updateVideoBanner", error);
        res.status(500).json({ message: "Error while updating banner" });
    }
};

/* =========================
   (Admin) DELETE BANNER
========================= */
export const deleteVideoBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await VideoBanner.findById(id);
        if (!banner)
            return res.status(404).json({ message: "Video banner not found" });

        if (banner.type === "video" && banner.videoUrl)
            await deleteFromCloudinary(banner.videoUrl);
        if (banner.type === "image" && banner.imageUrl)
            await deleteFromCloudinary(banner.imageUrl);
        if (banner.mobileImageUrl)
            await deleteFromCloudinary(banner.mobileImageUrl);

        await banner.deleteOne();

        res.status(200).json({
            success: true,
            message: "Video banner deleted",
        });
    } catch (error) {
        console.error("deleteVideoBanner", error);
        res.status(500).json({ message: "Error while deleting video banner" });
    }
};

/* =========================
   (Public) GET ACTIVE BANNERS
========================= */
export const getActiveVideoBanners = async (req, res) => {
    try {
        const banners = await VideoBanner.find({ isActive: true }).sort({
            order: 1,
        });
        res.status(200).json({ success: true, banners });
    } catch (error) {
        console.error("getActiveVideoBanners", error);
        res.status(500).json({ message: "Error while fetching banners" });
    }
};
