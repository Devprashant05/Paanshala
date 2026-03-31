import mongoose from "mongoose";

/* =========================
   PAAN VARIANTS
========================= */
const paanVariantSchema = new mongoose.Schema(
    {
        setSize: {
            type: Number,
            required: true,
        },
        originalPrice: {
            type: Number,
            required: true,
        },
        discountedPrice: {
            type: Number,
            required: true,
        },
        stock: {
            type: Number,
            default: 0,
        },
    },
    { _id: false }
);

/* =========================
   SEO SCHEMA
========================= */
const seoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
            maxlength: 70, // SEO best practice
        },
        description: {
            type: String,
            trim: true,
            maxlength: 160,
        },
        keywords: [
            {
                type: String,
                trim: true,
                lowercase: true,
            },
        ],
    },
    { _id: false }
);

/* =========================
   PRODUCT SCHEMA
========================= */
const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        /* 🔥 CATEGORY RELATION */
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
            index: true,
        },

        /* OPTIONAL: store parent for fast filtering */
        parentCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },

        description: {
            type: String,
            required: true,
        },

        additionalInfo: {
            type: String,
        },

        images: [
            {
                type: String,
                required: true,
            },
        ],

        /* =========================
       PRICING (NON-PAAN)
    ========================== */
        originalPrice: {
            type: Number,
            required: function () {
                return !this.isPaan;
            },
        },

        discountedPrice: {
            type: Number,
            required: function () {
                return !this.isPaan;
            },
        },

        stock: {
            type: Number,
            default: 0,
        },

        /* =========================
       PAAN FLAG (IMPORTANT)
    ========================== */
        isPaan: {
            type: Boolean,
            default: false,
        },

        /* =========================
       PAAN VARIANTS
    ========================== */
        variants: {
            type: [paanVariantSchema],
            validate: {
                validator: function (value) {
                    if (this.isPaan) {
                        return value && value.length > 0;
                    }
                    return true;
                },
                message: "Paan products must have at least one variant",
            },
        },

        /* =========================
       STATUS
    ========================== */
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },

        isFeatured: {
            type: Boolean,
            default: false,
        },

        seo: seoSchema,

        /* =========================
       REVIEWS
    ========================== */
        averageRating: {
            type: Number,
            default: 0,
        },

        totalReviews: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

/* =========================
   INDEXES
========================= */
productSchema.index({
    name: "text",
    description: "text",
});

/* =========================
   PRE-SAVE HOOK
   Auto-detect parent category
========================= */
productSchema.pre("save", async function () {
    if (this.category) {
        const Category = mongoose.model("Category");

        const cat = await Category.findById(this.category);

        if (cat?.parent) {
            this.parentCategory = cat.parent;
        } else {
            this.parentCategory = this.category;
        }
    }
});

export const Product = mongoose.model("Product", productSchema);