import express from "express";
import {
    getHorecaPageContent,
    getHorecaPageAdmin,
    updateHeroSection,
    updateOfferingsMeta,
    addOfferingProduct,
    updateOfferingProduct,
    deleteOfferingProduct,
    reorderOfferingProducts,
    updateWhoWeServeMeta,
    addWhoWeServeCard,
    updateWhoWeServeCard,
    deleteWhoWeServeCard,
    reorderWhoWeServeCards,
    updateMobileAppSection,
    updateInquiryModalSection,
} from "../controllers/horecaPage.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = express.Router();

/* ── PUBLIC ── */
router.get("/", getHorecaPageContent);

/* ── ADMIN ── */
router.get("/admin", authMiddleware, adminMiddleware, getHorecaPageAdmin);

// Hero
router.patch(
    "/admin/hero",
    authMiddleware,
    adminMiddleware,
    upload.single("backgroundImage"),
    updateHeroSection
);

// Offerings — meta + admin-entered products (name + multiple images)
router.patch(
    "/admin/offerings",
    authMiddleware,
    adminMiddleware,
    updateOfferingsMeta
);
router.post(
    "/admin/offerings/products",
    authMiddleware,
    adminMiddleware,
    upload.array("images", 10),
    addOfferingProduct
);
router.patch(
    "/admin/offerings/products/reorder",
    authMiddleware,
    adminMiddleware,
    reorderOfferingProducts
);
router.patch(
    "/admin/offerings/products/:productId",
    authMiddleware,
    adminMiddleware,
    upload.array("images", 10),
    updateOfferingProduct
);
router.delete(
    "/admin/offerings/products/:productId",
    authMiddleware,
    adminMiddleware,
    deleteOfferingProduct
);

// Who We Serve
router.patch(
    "/admin/who-we-serve",
    authMiddleware,
    adminMiddleware,
    updateWhoWeServeMeta
);
router.post(
    "/admin/who-we-serve/cards",
    authMiddleware,
    adminMiddleware,
    upload.single("image"),
    addWhoWeServeCard
);
router.patch(
    "/admin/who-we-serve/cards/reorder",
    authMiddleware,
    adminMiddleware,
    reorderWhoWeServeCards
);
router.patch(
    "/admin/who-we-serve/cards/:cardId",
    authMiddleware,
    adminMiddleware,
    upload.single("image"),
    updateWhoWeServeCard
);
router.delete(
    "/admin/who-we-serve/cards/:cardId",
    authMiddleware,
    adminMiddleware,
    deleteWhoWeServeCard
);

// Mobile App
router.patch(
    "/admin/mobile-app",
    authMiddleware,
    adminMiddleware,
    updateMobileAppSection
);

// Inquiry Modal
router.patch(
    "/admin/inquiry-modal",
    authMiddleware,
    adminMiddleware,
    updateInquiryModalSection
);

export default router;