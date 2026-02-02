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
} from "../controllers/product.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

/* ======================================================
   USER SIDE ROUTES (Public)
   Accessible from: paanshala.com
====================================================== */

// All active products
router.get("/", getAllProducts);

// Featured products (homepage)
router.get("/featured", getFeaturedProducts);

// Filter by category / subcategory
router.get("/filter", filterProducts);

// Product details
router.get("/:productId", getProductById);

// Product Search
router.get("/search", searchProducts);

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

// Product Search (admin)
router.get(
    "/admin/search",
    authMiddleware,
    adminMiddleware,
    searchProductsAdmin
);

export default router;
