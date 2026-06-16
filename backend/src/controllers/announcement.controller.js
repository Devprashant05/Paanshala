import { Announcement } from "../models/announcement.model.js";

/* ======================================================
   (PUBLIC) GET ACTIVE ANNOUNCEMENTS
====================================================== */
export const getActiveAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({ isActive: true }).sort({
            order: 1,
            createdAt: -1,
        });

        return res.status(200).json({
            success: true,
            announcements,
        });
    } catch (error) {
        console.error("getActiveAnnouncements", error);
        return res
            .status(500)
            .json({ message: "Error fetching announcements" });
    }
};

/* ======================================================
   (ADMIN) GET ALL ANNOUNCEMENTS
====================================================== */
export const getAllAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({
            order: 1,
            createdAt: -1,
        });

        return res.status(200).json({
            success: true,
            announcements,
        });
    } catch (error) {
        console.error("getAllAnnouncements", error);
        return res
            .status(500)
            .json({ message: "Error fetching announcements" });
    }
};

/* ======================================================
   (ADMIN) CREATE ANNOUNCEMENT
====================================================== */
export const createAnnouncement = async (req, res) => {
    try {
        const { text, link, linkLabel, bgColor, textColor, isActive, order } =
            req.body;

        if (!text?.trim()) {
            return res.status(400).json({ message: "Text is required" });
        }

        const announcement = await Announcement.create({
            text: text.trim(),
            link: link?.trim() || null,
            linkLabel: linkLabel?.trim() || null,
            bgColor: bgColor || "#12351a",
            textColor: textColor || "#ffffff",
            isActive: isActive ?? true,
            order: order ?? 0,
        });

        return res.status(201).json({
            success: true,
            message: "Announcement created",
            announcement,
        });
    } catch (error) {
        console.error("createAnnouncement", error);
        return res.status(500).json({ message: "Error creating announcement" });
    }
};

/* ======================================================
   (ADMIN) UPDATE ANNOUNCEMENT
====================================================== */
export const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, link, linkLabel, bgColor, textColor, isActive, order } =
            req.body;

        const announcement = await Announcement.findById(id);
        if (!announcement) {
            return res.status(404).json({ message: "Announcement not found" });
        }

        if (text !== undefined) announcement.text = text.trim();
        if (link !== undefined) announcement.link = link?.trim() || null;
        if (linkLabel !== undefined)
            announcement.linkLabel = linkLabel?.trim() || null;
        if (bgColor !== undefined) announcement.bgColor = bgColor;
        if (textColor !== undefined) announcement.textColor = textColor;
        if (typeof isActive === "boolean") announcement.isActive = isActive;
        if (order !== undefined) announcement.order = order;

        await announcement.save();

        return res.status(200).json({
            success: true,
            message: "Announcement updated",
            announcement,
        });
    } catch (error) {
        console.error("updateAnnouncement", error);
        return res.status(500).json({ message: "Error updating announcement" });
    }
};

/* ======================================================
   (ADMIN) TOGGLE ACTIVE
====================================================== */
export const toggleAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;

        const announcement = await Announcement.findById(id);
        if (!announcement) {
            return res.status(404).json({ message: "Announcement not found" });
        }

        announcement.isActive = !announcement.isActive;
        await announcement.save();

        return res.status(200).json({
            success: true,
            message: `Announcement ${announcement.isActive ? "activated" : "deactivated"}`,
            announcement,
        });
    } catch (error) {
        console.error("toggleAnnouncement", error);
        return res.status(500).json({ message: "Error toggling announcement" });
    }
};

/* ======================================================
   (ADMIN) REORDER ANNOUNCEMENTS
   Accepts: [{ id, order }, ...]
====================================================== */
export const reorderAnnouncements = async (req, res) => {
    try {
        const { items } = req.body; // [{ id: "...", order: 0 }, ...]

        if (!Array.isArray(items)) {
            return res.status(400).json({ message: "items must be an array" });
        }

        await Promise.all(
            items.map(({ id, order }) =>
                Announcement.findByIdAndUpdate(id, { order })
            )
        );

        const updated = await Announcement.find().sort({
            order: 1,
            createdAt: -1,
        });

        return res.status(200).json({
            success: true,
            message: "Announcements reordered",
            announcements: updated,
        });
    } catch (error) {
        console.error("reorderAnnouncements", error);
        return res
            .status(500)
            .json({ message: "Error reordering announcements" });
    }
};

/* ======================================================
   (ADMIN) DELETE ANNOUNCEMENT
====================================================== */
export const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;

        const announcement = await Announcement.findByIdAndDelete(id);
        if (!announcement) {
            return res.status(404).json({ message: "Announcement not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Announcement deleted",
        });
    } catch (error) {
        console.error("deleteAnnouncement", error);
        return res.status(500).json({ message: "Error deleting announcement" });
    }
};
