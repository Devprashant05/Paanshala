import mongoose from "mongoose";

/* ── Sub-schema: Who We Serve card ── */
const whoWeServeCardSchema = new mongoose.Schema(
    {
        image: {
            type: String, // Cloudinary URL
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { _id: true, timestamps: true }
);

const horecaPageSchema = new mongoose.Schema(
    {
        /* ── Hero Section ── */
        hero: {
            backgroundImage: {
                type: String, // Cloudinary URL
                default: "/horeca.png",
            },
            heading: {
                type: String,
                default: "HORECA",
                trim: true,
            },
            subheading: {
                type: String,
                default:
                    "Premium Paan Solutions For Hotels, Restaurants & Catering Services",
                trim: true,
            },
            ctaText: {
                type: String,
                default: "GET IN TOUCH",
                trim: true,
            },
        },

        /* ── Our Offerings Section — admin tags specific products ── */
        offerings: {
            heading: {
                type: String,
                default: "OUR OFFERINGS",
                trim: true,
            },
            subheading: {
                type: String,
                default: "Premium Fresh Paan Collection For Your Establishment",
                trim: true,
            },
            products: [
                {
                    product: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Product",
                        required: true,
                    },
                    order: {
                        type: Number,
                        default: 0,
                    },
                },
            ],
        },

        /* ── Who We Serve Section ── */
        whoWeServe: {
            heading: {
                type: String,
                default: "WHO WE SERVE",
                trim: true,
            },
            subheading: {
                type: String,
                default:
                    "Paanshala partners with premium hospitality businesses to deliver authentic paan experiences to their guests.",
                trim: true,
            },
            cards: [whoWeServeCardSchema],
        },

        /* ── Mobile App Section ── */
        mobileApp: {
            isVisible: {
                type: Boolean,
                default: true,
            },
            heading: {
                type: String,
                default: "MOBILE APP",
                trim: true,
            },
            subheading: {
                type: String,
                default: "Coming Soon For HORECA Partners",
                trim: true,
            },
            appTitle: {
                type: String,
                default: "HORECA APP",
                trim: true,
            },
            appDescription: {
                type: String,
                default:
                    "Streamline your paan orders with our dedicated HORECA mobile application",
                trim: true,
            },
            badgeText: {
                type: String,
                default: "Coming Soon",
                trim: true,
            },
            playStoreUrl: {
                type: String,
                default: null,
            },
            appStoreUrl: {
                type: String,
                default: null,
            },
        },

        /* ── Inquiry Modal ── */
        inquiryModal: {
            title: {
                type: String,
                default: "Get In Touch",
                trim: true,
            },
            description: {
                type: String,
                default:
                    "Tell us about your business and our HORECA team will reach out shortly.",
                trim: true,
            },
        },
    },
    { timestamps: true }
);

// Enforce single document (singleton pattern, like PageSettings)
horecaPageSchema.statics.getSingleton = async function () {
    let doc = await this.findOne();
    if (!doc) {
        doc = await this.create({});
    }
    return doc;
};

export const HorecaPage = mongoose.model("HorecaPage", horecaPageSchema);
