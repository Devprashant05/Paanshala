import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
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

        /* =========================
           VALIDATION
        ========================== */
        if (!data.category) {
            return res.status(400).json({
                message: "Category is required",
            });
        }

        /* =========================
           PARSE VARIANTS
        ========================== */
        if (data.variants && typeof data.variants === "string") {
            data.variants = JSON.parse(data.variants);

            data.variants = data.variants.map((v) => ({
                setSize: Number(v.setSize),
                originalPrice: Number(v.originalPrice),
                discountedPrice: Number(v.discountedPrice),
                stock: Number(v.stock || 0),
            }));
        }

        /* =========================
           HANDLE IMAGES
        ========================== */
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                message: "Product images are required",
            });
        }

        const imageUrls = [];
        for (const file of req.files) {
            const url = await uploadOnCloudinary(file.path, "products");
            if (url) imageUrls.push(url);
        }

        if (data.seo && typeof data.seo === "string") {
            data.seo = JSON.parse(data.seo);

            // normalize keywords
            if (data.seo.keywords && typeof data.seo.keywords === "string") {
                data.seo.keywords = data.seo.keywords
                    .split(",")
                    .map((k) => k.trim().toLowerCase())
                    .filter(Boolean);
            }
        }

        /* =========================
   HANDLE NON-PAAN LOGIC
========================= */
        const isPaan = data.isPaan === "true" || data.isPaan === true;

        if (!isPaan) {
            // ensure baseWeight exists
            if (!data.baseWeight) {
                return res.status(400).json({
                    message: "Base weight is required for non-paan products",
                });
            }

            data.baseWeight = Number(data.baseWeight);
            data.originalPrice = Number(data.originalPrice);
            data.discountedPrice = Number(data.discountedPrice);

            // ❗ remove variants if mistakenly sent
            data.variants = [];
        }

        /* =========================
           CREATE PRODUCT
        ========================== */
        const product = await Product.create({
            ...data,
            images: imageUrls,
            isPaan: data.isPaan === "true" || data.isPaan === true,
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product,
        });
    } catch (error) {
        console.error("createProduct", error);
        return res.status(500).json({
            message: error.message || "Error while creating product",
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

        /* =========================
           PARSE VARIANTS
        ========================== */
        if (data.variants && typeof data.variants === "string") {
            data.variants = JSON.parse(data.variants);

            data.variants = data.variants.map((v) => ({
                setSize: Number(v.setSize),
                originalPrice: Number(v.originalPrice),
                discountedPrice: Number(v.discountedPrice),
                stock: Number(v.stock || 0),
            }));
        }

        const product = await Product.findById(productId);
        if (!product)
            return res.status(404).json({ message: "Product not found" });

        /* =========================
           IMAGE REPLACEMENT
        ========================== */
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

        /* =========================
           BOOLEAN FIX
        ========================== */
        if (data.isPaan !== undefined) {
            data.isPaan = data.isPaan === "true" || data.isPaan === true;
        }

        if (data.seo && typeof data.seo === "string") {
            data.seo = JSON.parse(data.seo);

            if (data.seo.keywords && typeof data.seo.keywords === "string") {
                data.seo.keywords = data.seo.keywords
                    .split(",")
                    .map((k) => k.trim().toLowerCase())
                    .filter(Boolean);
            }
        }

        /* =========================
   HANDLE NON-PAAN UPDATE
========================= */
        if (data.isPaan !== undefined) {
            data.isPaan = data.isPaan === "true" || data.isPaan === true;
        }

        if (data.isPaan === false) {
            if (data.baseWeight) data.baseWeight = Number(data.baseWeight);
            if (data.originalPrice)
                data.originalPrice = Number(data.originalPrice);
            if (data.discountedPrice)
                data.discountedPrice = Number(data.discountedPrice);

            // ❗ ensure variants removed
            data.variants = [];
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            data,
            { new: true, runValidators: true }
        )
            .populate("category", "name parent")
            .populate("parentCategory", "name");

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct,
        });
    } catch (error) {
        console.error("updateProduct", error);
        return res.status(500).json({
            message: error.message || "Error while updating product",
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
        const products = await Product.find()
            .populate("category", "name parent")
            .populate("parentCategory", "name")
            .sort({ createdAt: -1 });

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
            .populate("category", "name parent")
            .populate("parentCategory", "name")
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
        const products = await Product.find({ isActive: true })
            .populate("category", "name parent")
            .populate("parentCategory", "name")
            .sort({ createdAt: 1 });

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
        })
            .populate("category", "name parent")
            .populate("parentCategory", "name")
            .limit(8);

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
       })
           .populate("category", "name parent")
           .populate("parentCategory", "name");

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
        const { category, parentCategory } = req.query;

        const filter = { isActive: true };

        if (category) filter.category = category;
        if (parentCategory) filter.parentCategory = parentCategory;

        const products = await Product.find(filter)
            .populate("category", "name")
            .populate("parentCategory", "name");

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
      const { q, category } = req.query;

      if (!q) {
          return res.status(400).json({
              message: "Search query is required",
          });
      }

      const filter = {
          isActive: true,
          $or: [
              { $text: { $search: q } },
              { name: { $regex: q, $options: "i" } },
          ],
      };

      if (category) {
          filter.category = new mongoose.Types.ObjectId(category);
      }

      const products = await Product.find(filter, {
          score: { $meta: "textScore" },
      })
          .populate("category", "name parent")
          .populate("parentCategory", "name")
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

// =============================
// (User) RELATED PRODUCTS
// =============================
export const getRelatedProducts = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Get current product
    const currentProduct = await Product.findById(productId);

    if (!currentProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // 2. Build filter
    const filter = {
      _id: { $ne: productId }, // exclude current product
      isActive: true,
      $or: [
        { category: currentProduct.category },
        { parentCategory: currentProduct.parentCategory },
      ],
    };

    // 3. Fetch related products
    const relatedProducts = await Product.find(filter)
      .populate("category", "name parent")
      .populate("parentCategory", "name")
      .sort({ isFeatured: -1, createdAt: -1 }) // featured first
      .limit(8);

    return res.status(200).json({
      success: true,
      count: relatedProducts.length,
      products: relatedProducts,
    });
  } catch (error) {
    console.error("getRelatedProducts", error);
    return res.status(500).json({
      message: "Error while fetching related products",
    });
  }
};

// =============================
// (User) GET ONE PRODUCT PER SUBCATEGORY
// =============================
export const getProductsBySubcategories = async (req, res) => {
    try {
        const { parentCategoryId } = req.params;

        // 1. Find all subcategories under this parent
        const subcategories = await Category.find({
            parent: parentCategoryId,
            isActive: true,
        }).select('_id name slug');

        if (!subcategories || subcategories.length === 0) {
            return res.status(200).json({
                success: true,
                products: [],
            });
        }

        // 2. For each subcategory, get one featured/active product
        const productPromises = subcategories.map(async (subcat) => {
            const product = await Product.findOne({
                category: subcat._id,
                isActive: true,
            })
                .populate('category', 'name slug')
                .populate('parentCategory', 'name slug')
                .sort({ isFeatured: -1, createdAt: -1 }) // featured first
                .lean();

            return product ? { ...product, subcategory: subcat } : null;
        });

        const products = await Promise.all(productPromises);

        // 3. Filter out nulls (subcategories without products)
        const validProducts = products.filter(Boolean);

        return res.status(200).json({
            success: true,
            count: validProducts.length,
            products: validProducts,
        });
    } catch (error) {
        console.error('getProductsBySubcategories', error);
        return res.status(500).json({
            message: 'Error while fetching products by subcategories',
        });
    }
};