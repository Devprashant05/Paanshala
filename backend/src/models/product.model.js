import mongoose from "mongoose";

const paanVariantSchema = new mongoose.Schema(
    {
        setSize: {
            type: Number, // 6, 12, 24, etc.
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

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        category: {
            type: String,
            enum: ["Digestive", "Candy & More", "Mouth Fresheners", "Paan"],
            required: true,
        },

        subcategory: {
            type: String,
            enum: [
                "Meetha & Sada Paan",
                "Chocolate Paan",
                "Dry Fruit Paan",
                "Chocolate Coated Paan",
                "Fruit Paan",
                "Paan Truffle",
            ],
            required: function () {
                return this.category === "Paan";
            },
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
                type: String, // Cloudinary URLs
                required: true,
            },
        ],

        // For NON-PAAN products
        originalPrice: {
            type: Number,
            required: function () {
                return this.category !== "Paan";
            },
        },

        discountedPrice: {
            type: Number,
            required: function () {
                return this.category !== "Paan";
            },
        },

        stock: {
            type: Number,
            default: 0, // for non-paan
        },

        // For PAAN products
        variants: {
            type: [paanVariantSchema],
            validate: {
                validator: function (value) {
                    if (this.category === "Paan") {
                        return value && value.length > 0;
                    }
                    return true;
                },
                message: "Paan products must have at least one variant",
            },
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        isFeatured: {
            type: Boolean,
            default: false,
        },

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

export const Product = mongoose.model("Product", productSchema);
