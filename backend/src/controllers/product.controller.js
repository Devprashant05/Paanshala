import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";
import {
    syncProductToMerchant,
    removeProductFromMerchant,
    bulkSyncAllProducts,
} from "../utils/merchantSync.js";

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

        // Merchant sync is best-effort — syncProductToMerchant() catches
        // its own errors internally and never throws, so awaiting it
        // here is safe and won't break product creation even if
        // Merchant Center/Google is down or misconfigured.
        await syncProductToMerchant(product);

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

        /* =========================
   CATEGORY FIX
========================= */

        if (data.category) {
            data.category = data.category.toString().trim();
        }

        if (data.parentCategory) {
            data.parentCategory = data.parentCategory.toString().trim();
        }

        const product = await Product.findById(productId);
        if (!product)
            return res.status(404).json({ message: "Product not found" });

        /* =========================
   IMAGE MANAGEMENT
========================= */

        // Images that user kept in admin panel
        let existingImages = product.images;

        if (data.existingImages) {
            existingImages =
                typeof data.existingImages === "string"
                    ? JSON.parse(data.existingImages)
                    : data.existingImages;
        }

        /* =========================
   DELETE REMOVED IMAGES
========================= */

        const removedImages = product.images.filter(
            (img) => !existingImages.includes(img)
        );

        for (const img of removedImages) {
            await deleteFromCloudinary(img);
        }

        /* =========================
   UPLOAD NEW IMAGES
========================= */

        const uploadedImages = [];

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const url = await uploadOnCloudinary(file.path, "products");

                if (url) {
                    uploadedImages.push(url);
                }
            }
        }

        /* =========================
   FINAL IMAGE ARRAY
========================= */

        data.images = [...existingImages, ...uploadedImages];

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

        Object.assign(product, data);

        await product.save();

        const updatedProduct = await Product.findById(productId)
            .populate("category", "name parent")
            .populate("parentCategory", "name");

        // Merchant sync is best-effort, same as createProduct
        await syncProductToMerchant(updatedProduct);

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

        // Remove from Merchant Center before deleting locally —
        // needs the full product doc (for variants/offerIds), so this
        // must happen before findByIdAndDelete wipes the record
        await removeProductFromMerchant(product);

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

        // isActive toggled off → remove from Merchant Center
        // isActive toggled on → (re)sync to Merchant Center
        // isFeatured has no effect on Merchant Center listing
        if (isActive === false) {
            await removeProductFromMerchant(product);
        } else if (isActive === true) {
            await syncProductToMerchant(product);
        }

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
            .populate("category", "name parent slug")
            .populate("parentCategory", "name slug")
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
            .populate("parentCategory", "name");

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
        const { slug } = req.params;

        const product = await Product.findOne({
            slug: slug,
            isActive: true,
        })
            .populate("category", "name parent slug")
            .populate("parentCategory", "name slug");

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
            .populate("category", "name slug")
            .populate("parentCategory", "name slug");

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
          .populate("category", "name parent slug")
          .populate("parentCategory", "name slug")
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

    // Get current product
    const currentProduct = await Product.findById(productId);

    if (!currentProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    // Find related products
    let relatedProducts = await Product.find({
      _id: { $ne: productId },
      isActive: true,
      $or: [
        { category: currentProduct.category },
        { parentCategory: currentProduct.parentCategory },
      ],
    })
      .populate("category", "name parent slug")
      .populate("parentCategory", "name slug")
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(8);

    // Fallback to random products
    if (relatedProducts.length === 0) {
      relatedProducts = await Product.aggregate([
        {
          $match: {
            _id: { $ne: currentProduct._id },
            isActive: true,
          },
        },
        {
          $sample: { size: 8 },
        },
      ]);

      relatedProducts = await Product.populate(relatedProducts, [
        {
          path: "category",
          select: "name parent",
        },
        {
          path: "parentCategory",
          select: "name",
        },
      ]);
    }

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

// =============================
// (Admin) REORDER PRODUCT IMAGES
// =============================
export const reorderProductImages = async (req, res) => {
    try {
        const { productId } = req.params;
        const { images } = req.body; // full ordered array of existing URLs

        if (!Array.isArray(images) || images.length === 0) {
            return res.status(400).json({ message: "Images array is required" });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // Validate — every URL in the request must already exist on the product
        // Prevents injection of foreign URLs
        const currentSet = new Set(product.images);
        const allValid = images.every((url) => currentSet.has(url));

        if (!allValid || images.length !== product.images.length) {
            return res.status(400).json({
                message: "Images array must contain exactly the same URLs as the current product images",
            });
        }

        product.images = images;
        await product.save();

        return res.status(200).json({
            success: true,
            message: "Image order updated",
            images: product.images,
        });
    } catch (error) {
        console.error("reorderProductImages", error);
        return res.status(500).json({ message: "Error while reordering images" });
    }
};

// =============================
// (Admin) BULK SYNC ALL PRODUCTS TO GOOGLE MERCHANT CENTER
// One-time (or occasional re-sync) push of the entire active catalog.
// Use this once when the API integration first goes live, since the
// per-action hooks in create/update/delete only cover changes going
// forward, not products that already existed before this integration.
// =============================
export const bulkSyncMerchantCenter = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true })
            .populate("category", "name")
            .lean();

        const results = await bulkSyncAllProducts(products);

        return res.status(200).json({
            success: true,
            message: "Bulk sync completed",
            ...results,
            total: products.length,
        });
    } catch (error) {
        console.error("bulkSyncMerchantCenter", error);
        return res.status(500).json({
            message: "Error while bulk syncing to Merchant Center",
        });
    }
};
// Generates an RSS 2.0 XML feed in Google Shopping format, consumed
// by Merchant Center via a scheduled fetch (Content API / fetch URL
// under Products > Feeds > Add feed > Google Sheets/Scheduled fetch).
// This powers Google Shopping free listings — products can appear
// with image + price directly in Google Search, separate from your
// normal organic rankings.
//
// Variant handling: Google Merchant requires ONE price per feed item.
// Paan products have multiple variants at different prices (setSize),
// so each variant becomes its own <item>, linked together via
// g:item_group_id so Google groups them as one product with options.
// =============================

const escapeXml = (str = "") =>
    String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

const MERCHANT_BASE_URL = "https://paanshala.com";

export const generateGoogleMerchantFeed = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true })
            .populate("category", "name")
            .lean();

        const items = [];

        for (const product of products) {
            const categoryName = product.category?.name || "Paan";
            const productUrl = `${MERCHANT_BASE_URL}/shop/${product.slug}`;
            const imageLink = product.images?.[0];

            // Skip products with no image — Merchant Center rejects
            // items without image_link outright, so including them
            // just adds noise/errors to the feed diagnostics report
            if (!imageLink) continue;

            const additionalImages = (product.images || [])
                .slice(1, 10) // Merchant allows up to 10 additional_image_link entries
                .map(
                    (img) =>
                        `<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`
                )
                .join("\n            ");

            if (product.isPaan && product.variants?.length > 0) {
                // One feed item per variant, linked via item_group_id
                for (const variant of product.variants) {
                    const availability =
                        (variant.stock ?? 0) > 0 ? "in stock" : "out of stock";

                    items.push(`
        <item>
            <g:id>${escapeXml(product._id)}-${variant.setSize}</g:id>
            <g:item_group_id>${escapeXml(product._id)}</g:item_group_id>
            <title>${escapeXml(`${product.name} - ${variant.setSize} Pieces`)}</title>
            <description>${escapeXml(product.description?.slice(0, 5000) || product.name)}</description>
            <link>${productUrl}</link>
            <g:image_link>${escapeXml(imageLink)}</g:image_link>
            ${additionalImages}
            <g:availability>${availability}</g:availability>
            <g:price>${variant.discountedPrice}.00 INR</g:price>
            ${
                variant.originalPrice > variant.discountedPrice
                    ? `<g:sale_price>${variant.discountedPrice}.00 INR</g:sale_price>`
                    : ""
            }
            <g:condition>new</g:condition>
            <g:brand>Paanshala</g:brand>
            <g:product_type>${escapeXml(categoryName)}</g:product_type>
            <g:identifier_exists>no</g:identifier_exists>
        </item>`);
                }
            } else {
                // Single-price product
                const availability =
                    (product.stock ?? 0) > 0 ? "in stock" : "out of stock";

                items.push(`
        <item>
            <g:id>${escapeXml(product._id)}</g:id>
            <title>${escapeXml(product.name)}</title>
            <description>${escapeXml(product.description?.slice(0, 5000) || product.name)}</description>
            <link>${productUrl}</link>
            <g:image_link>${escapeXml(imageLink)}</g:image_link>
            ${additionalImages}
            <g:availability>${availability}</g:availability>
            <g:price>${product.discountedPrice}.00 INR</g:price>
            ${
                product.originalPrice > product.discountedPrice
                    ? `<g:sale_price>${product.discountedPrice}.00 INR</g:sale_price>`
                    : ""
            }
            <g:condition>new</g:condition>
            <g:brand>Paanshala</g:brand>
            <g:product_type>${escapeXml(categoryName)}</g:product_type>
            <g:identifier_exists>no</g:identifier_exists>
        </item>`);
            }
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
    <channel>
        <title>Paanshala Product Feed</title>
        <link>${MERCHANT_BASE_URL}</link>
        <description>Paanshala premium paan and gourmet mouth freshener products</description>
        ${items.join("\n")}
    </channel>
</rss>`;

        res.set("Content-Type", "application/xml; charset=utf-8");
        // Cache for an hour — Merchant Center typically re-fetches on a
        // schedule (daily by default), so this doesn't need to be
        // real-time, and caching avoids rebuilding the full feed on
        // every single crawl hit
        res.set("Cache-Control", "public, max-age=3600");
        return res.status(200).send(xml);
    } catch (error) {
        console.error("generateGoogleMerchantFeed", error);
        return res.status(500).json({
            message: "Error while generating merchant feed",
        });
    }
};