import { PageSettings } from "../models/pageSettings.model.js";

// =============================
// GET PAGE SETTINGS (PUBLIC)
// =============================
export const getPageSettings = async (req, res) => {
    try {
        const settings = await PageSettings.findOne();

        res.status(200).json({
            success: true,
            settings,
        });
    } catch (error) {
        console.error("getPageSettings", error);
        res.status(500).json({
            message: "Error while fetching page settings",
        });
    }
};

// =============================
// CREATE / UPDATE PAGE SETTINGS (ADMIN)
// =============================
export const upsertPageSettings = async (req, res) => {
    try {
        const data = req.body;

        const settings = await PageSettings.findOneAndUpdate({}, data, {
            new: true,
            upsert: true, // create if not exists
        });

        res.status(200).json({
            success: true,
            message: "Page settings updated successfully",
            settings,
        });
    } catch (error) {
        console.error("upsertPageSettings", error);
        res.status(500).json({
            message: "Error while updating page settings",
        });
    }
};
