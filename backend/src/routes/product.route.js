import express from "express";
import {
    // Admin controllers
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductFlags,
    listAllProductsAdmin,

    // User controllers
    getAllProducts,
    getFeaturedProducts,
    getProductById,
    filterProducts,
    searchProducts,
    searchProductsAdmin,
    getRelatedProducts,
    getProductsBySubcategories,
    reorderProductImages,
    generateGoogleMerchantFeed,
    bulkSyncMerchantCenter,
} from "../controllers/product.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

/* ======================================================
   USER SIDE ROUTES (Public)
   Accessible from: paanshala.com
====================================================== */

// Google Merchant Center product feed — kept above /:slug on purpose,
// same convention as the rest of this file (specific routes before
// wildcard params), even though the two-segment path wouldn't
// technically collide with the single-segment /:slug route
router.get("/feed/google-merchant.xml", generateGoogleMerchantFeed);

// All active products
router.get("/", getAllProducts);

// Featured products (homepage)
router.get("/featured", getFeaturedProducts);

// Filter by category / subcategory
router.get("/filter", filterProducts);

// Product Search
router.get("/search", searchProducts);

// Get products by subcategories
router.get("/subcategories/:parentCategoryId", getProductsBySubcategories);

// Product details
router.get("/:slug", getProductById);

router.get("/related/:productId", getRelatedProducts);


/* ======================================================
   ADMIN SIDE ROUTES (Protected)
   Accessible from: admin.paanshala.com
====================================================== */

router.use(authMiddleware, adminMiddleware);

// List all products (admin)
router.get("/admin/all", listAllProductsAdmin);

// Create product
router.post(
    "/admin/create",
    upload.array("images", 8), // max 8 images
    createProduct
);

// Update product
router.put(
    "/admin/update/:productId",
    upload.array("images", 8),
    updateProduct
);

// Toggle isActive / isFeatured
router.patch("/admin/toggle/:productId", toggleProductFlags);

// Delete product
router.delete("/admin/delete/:productId", deleteProduct);

// inside admin routes
router.patch(
    "/admin/:productId/images/reorder",
    authMiddleware,
    adminMiddleware,
    reorderProductImages
);

// Product Search (admin)
router.get(
    "/admin/search",
    authMiddleware,
    adminMiddleware,
    searchProductsAdmin
);

// One-time bulk sync of entire catalog to Google Merchant Center —
// run manually after the API integration first goes live
router.post(
    "/admin/merchant-center/bulk-sync",
    authMiddleware,
    adminMiddleware,
    bulkSyncMerchantCenter
);

export default router;