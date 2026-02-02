import { Product } from "../models/product.model.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";

// =============================
// (Admin) CREATE PRODUCT
// =============================
export const createProduct = async (req, res) => {
    try {
        const data = req.body;

        // Handle images
        if (!req.files || req.files.length === 0) {
            return res
                .status(400)
                .json({ message: "Product images are required" });
        }

        const imageUrls = [];
        for (const file of req.files) {
            const url = await uploadOnCloudinary(file.path, "products");
            if (url) imageUrls.push(url);
        }

        const product = await Product.create({
            ...data,
            images: imageUrls,
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product,
        });
    } catch (error) {
        console.error("createProduct", error);
        return res.status(500).json({
            message: "Error while creating product" || error.message,
        });
    }
};

// =============================
// (Admin) UPDATE PRODUCT
// =============================
export const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const data = req.body;

        const product = await Product.findById(productId);
        if (!product)
            return res.status(404).json({ message: "Product not found" });

        // Handle image replacement
        if (req.files && req.files.length > 0) {
            for (const img of product.images) {
                await deleteFromCloudinary(img);
            }

            const newImages = [];
            for (const file of req.files) {
                const url = await uploadOnCloudinary(file.path, "products");
                if (url) newImages.push(url);
            }

            data.images = newImages;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            data,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct,
        });
    } catch (error) {
        console.error("updateProduct", error);
        return res.status(500).json({
            message: "Error while updating product" || error.message,
        });
    }
};

// =============================
// (Admin) DELETE PRODUCT
// =============================
export const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId);
        if (!product)
            return res.status(404).json({ message: "Product not found" });

        // Delete images
        for (const img of product.images) {
            await deleteFromCloudinary(img);
        }

        await Product.findByIdAndDelete(productId);

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        console.error("deleteProduct", error);
        return res.status(500).json({
            message: "Error while deleting product" || error.message,
        });
    }
};

// =============================
// (Admin) TOGGLE PRODUCT FLAGS
// =============================
export const toggleProductFlags = async (req, res) => {
    try {
        const { productId } = req.params;
        const { isActive, isFeatured } = req.body;

        const product = await Product.findByIdAndUpdate(
            productId,
            { isActive, isFeatured },
            { new: true }
        );

        if (!product)
            return res.status(404).json({ message: "Product not found" });

        return res.status(200).json({
            success: true,
            message: "Product updated",
            product,
        });
    } catch (error) {
        console.error("toggleProductFlags", error);
        return res.status(500).json({
            message: "Error while updating product status",
        });
    }
};

// =============================
// (Admin) LIST PRODUCTS
// =============================
export const listAllProductsAdmin = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: products.length,
            products,
        });
    } catch (error) {
        console.error("listAllProductsAdmin", error);
        return res.status(500).json({
            message: "Error while fetching products",
        });
    }
};

// =============================
// (Admin) SEARCH PRODUCTS
// =============================
export const searchProductsAdmin = async (req, res) => {
    try {
        const { q, category, subcategory } = req.query;

        if (!q) {
            return res.status(400).json({
                message: "Search query is required",
            });
        }

        const filter = {
            $text: { $search: q },
        };

        if (category) filter.category = category;
        if (subcategory) filter.subcategory = subcategory;

        const products = await Product.find(filter, {
            score: { $meta: "textScore" },
        })
            .sort({ score: { $meta: "textScore" } })
            .limit(50);

        return res.status(200).json({
            success: true,
            count: products.length,
            products,
        });
    } catch (error) {
        console.error("searchProductsAdmin", error);
        return res.status(500).json({
            message: "Error while searching products",
        });
    }
};

// =============================
// (User) GET ALL PRODUCTS
// =============================
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true }).sort({
            createdAt: 1,
        });

        return res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        console.error("getAllProducts", error);
        return res.status(500).json({
            message: "Error while fetching products",
        });
    }
};

// =============================
// (User) FEATURED PRODUCTS
// =============================
export const getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({
            isActive: true,
            isFeatured: true,
        }).limit(8);

        return res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        console.error("getFeaturedProducts", error);
        return res.status(500).json({
            message: "Error while fetching featured products",
        });
    }
};

// =============================
// (User) PRODUCT DETAILS
// =============================
export const getProductById = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findOne({
            _id: productId,
            isActive: true,
        });

        if (!product)
            return res.status(404).json({ message: "Product not found" });

        return res.status(200).json({
            success: true,
            product,
        });
    } catch (error) {
        console.error("getProductById", error);
        return res.status(500).json({
            message: "Error while fetching product",
        });
    }
};

// =============================
// (User) FILTER PRODUCTS
// =============================
export const filterProducts = async (req, res) => {
    try {
        const { category, subcategory } = req.query;

        const filter = { isActive: true };
        if (category) filter.category = category;
        if (subcategory) filter.subcategory = subcategory;

        const products = await Product.find(filter);

        return res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        console.error("filterProducts", error);
        return res.status(500).json({
            message: "Error while filtering products",
        });
    }
};

// =============================
// (User) SEARCH PRODUCTS
// =============================
export const searchProducts = async (req, res) => {
    try {
        const { q, category, subcategory } = req.query;

        if (!q) {
            return res.status(400).json({
                message: "Search query is required",
            });
        }

        const filter = {
            isActive: true,
            $text: { $search: q },
        };

        if (category) filter.category = category;
        if (subcategory) filter.subcategory = subcategory;

        const products = await Product.find(filter, {
            score: { $meta: "textScore" },
        })
            .sort({ score: { $meta: "textScore" } })
            .limit(20);

        return res.status(200).json({
            success: true,
            count: products.length,
            products,
        });
    } catch (error) {
        console.error("searchProducts", error);
        return res.status(500).json({
            message: "Error while searching products",
        });
    }
};
