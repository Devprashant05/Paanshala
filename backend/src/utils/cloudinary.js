import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image
export const uploadOnCloudinary = async (filePath, folder = "profile") => {
    try {
        if (!filePath || !fs.existsSync(filePath)) {
            console.error("File does not exist:", filePath);
            return null;
        }

        const result = await cloudinary.uploader.upload(filePath, {
            folder,
            resource_type: "image",
        });

        fs.unlinkSync(filePath);
        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return null;
    }
};

// Delete image

export const deleteFromCloudinary = async (fileUrl) => {
    try {
        if (!fileUrl) return;

        // Extract public_id from url
        const parts = fileUrl.split("/");
        const fileName = parts[parts.length - 1].split(".")[0];
        const folder = parts[parts.length - 2];
        const public_id = `${folder}/${fileName}`;

        await cloudinary.uploader.destroy(public_id);
    } catch (error) {
        console.error("Cloudinary delete error:", error);
    }
};

// Upload PDF
// Upload PDF (Fixed with proper error handling)
export const uploadPdfToCloudinary = async (filePath, publicId) => {
    if (!fs.existsSync(filePath)) {
        throw new Error(`PDF not found: ${filePath}`);
    }

    const result = await cloudinary.uploader.upload(filePath, {
        resource_type: "raw",
        folder: "invoices",
        public_id: publicId,
        overwrite: true,
        format: "pdf",
        type: "upload", // ✅ ADDED: Use "upload" delivery type (public)
        access_mode: "public", // ✅ ADDED: Ensure public access
    });

    console.log("✓ Invoice uploaded:", result.secure_url);
    return result;
};

// Upload Video
export const uploadVideoToCloudinary = async (filePath) => {
    try {
        if (!filePath || !fs.existsSync(filePath)) {
            console.error("File does not exist:", filePath);
            return null;
        }
        const res = await cloudinary.uploader.upload(filePath, {
            resource_type: "video",
            folder: "shop-by-feature",
        });
        fs.unlinkSync(filePath);
        return res.secure_url;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return null;
    }
};
