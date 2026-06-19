import { HorecaPage } from "../models/horecaPage.model.js";
import { Product } from "../models/product.model.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";

/* ======================================================
   (PUBLIC) GET HORECA PAGE CONTENT
====================================================== */
export const getHorecaPageContent = async (req, res) => {
    try {
        const page = await HorecaPage.getSingleton();
        await page.populate(
            "offerings.products.product",
            "name images discountedPrice originalPrice isPaan variants slug isActive"
        );

        /* ── Resolve tagged products, sorted by admin-set order, skip inactive/deleted ── */
        const products = (page.offerings.products || [])
            .filter((p) => p.product && p.product.isActive)
            .sort((a, b) => a.order - b.order)
            .map((p) => p.product);

        /* ── Filter active who-we-serve cards, sorted ── */
        const whoWeServeCards = (page.whoWeServe?.cards || [])
            .filter((c) => c.isActive)
            .sort((a, b) => a.order - b.order);

        return res.status(200).json({
            success: true,
            page: {
                hero: page.hero,
                offerings: {
                    heading: page.offerings.heading,
                    subheading: page.offerings.subheading,
                },
                whoWeServe: {
                    heading: page.whoWeServe.heading,
                    subheading: page.whoWeServe.subheading,
                    cards: whoWeServeCards,
                },
                mobileApp: page.mobileApp,
                inquiryModal: page.inquiryModal,
            },
            products,
        });
    } catch (error) {
        console.error("getHorecaPageContent", error);
        return res
            .status(500)
            .json({ message: "Error fetching HORECA page content" });
    }
};

/* ======================================================
   (ADMIN) GET RAW HORECA PAGE DOC (unfiltered, for editing)
====================================================== */
export const getHorecaPageAdmin = async (req, res) => {
    try {
        const page = await HorecaPage.getSingleton();
        await page.populate(
            "offerings.products.product",
            "name images discountedPrice originalPrice slug isActive"
        );
        return res.status(200).json({ success: true, page });
    } catch (error) {
        console.error("getHorecaPageAdmin", error);
        return res.status(500).json({ message: "Error fetching page" });
    }
};

/* ======================================================
   (ADMIN) UPDATE HERO SECTION
====================================================== */
export const updateHeroSection = async (req, res) => {
    try {
        const { heading, subheading, ctaText } = req.body;
        const page = await HorecaPage.getSingleton();

        if (req.file) {
            // Only delete old image if it's a Cloudinary URL (not the default /horeca.png)
            if (page.hero.backgroundImage?.includes("cloudinary")) {
                await deleteFromCloudinary(page.hero.backgroundImage);
            }
            page.hero.backgroundImage = await uploadOnCloudinary(req.file.path, "horeca/hero");
        }

        if (heading !== undefined) page.hero.heading = heading;
        if (subheading !== undefined) page.hero.subheading = subheading;
        if (ctaText !== undefined) page.hero.ctaText = ctaText;

        await page.save();
        return res.status(200).json({
            success: true,
            message: "Hero section updated",
            hero: page.hero,
        });
    } catch (error) {
        console.error("updateHeroSection", error);
        return res.status(500).json({ message: "Error updating hero section" });
    }
};

/* ======================================================
   (ADMIN) UPDATE OFFERINGS META (heading/subheading)
====================================================== */
export const updateOfferingsMeta = async (req, res) => {
    try {
        const { heading, subheading } = req.body;
        const page = await HorecaPage.getSingleton();

        if (heading !== undefined) page.offerings.heading = heading;
        if (subheading !== undefined) page.offerings.subheading = subheading;

        await page.save();
        return res.status(200).json({
            success: true,
            message: "Offerings section updated",
            offerings: page.offerings,
        });
    } catch (error) {
        console.error("updateOfferingsMeta", error);
        return res
            .status(500)
            .json({ message: "Error updating offerings section" });
    }
};

/* ======================================================
   (ADMIN) SET TAGGED PRODUCTS
   Accepts: { productIds: [id1, id2, id3, ...] } — order preserved as sent
====================================================== */
export const setOfferingsProducts = async (req, res) => {
    try {
        const { productIds } = req.body;

        if (!Array.isArray(productIds)) {
            return res
                .status(400)
                .json({ message: "productIds must be an array" });
        }

        // Validate all products exist
        const found = await Product.find({ _id: { $in: productIds } }).select(
            "_id"
        );
        const validIds = new Set(found.map((p) => p._id.toString()));

        const invalid = productIds.filter((id) => !validIds.has(id));
        if (invalid.length > 0) {
            return res.status(400).json({
                message: `Invalid product IDs: ${invalid.join(", ")}`,
            });
        }

        const page = await HorecaPage.getSingleton();
        page.offerings.products = productIds.map((id, index) => ({
            product: id,
            order: index,
        }));

        await page.save();
        await page.populate(
            "offerings.products.product",
            "name images discountedPrice originalPrice slug isActive"
        );

        return res.status(200).json({
            success: true,
            message: "Tagged products updated",
            products: page.offerings.products,
        });
    } catch (error) {
        console.error("setOfferingsProducts", error);
        return res
            .status(500)
            .json({ message: "Error updating tagged products" });
    }
};

/* ======================================================
   (ADMIN) ADD SINGLE PRODUCT TO OFFERINGS
====================================================== */
export const addOfferingProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({ message: "productId is required" });
        }

        const product = await Product.findById(productId).select("_id");
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const page = await HorecaPage.getSingleton();

        const alreadyTagged = page.offerings.products.some(
            (p) => p.product.toString() === productId
        );
        if (alreadyTagged) {
            return res.status(400).json({ message: "Product already tagged" });
        }

        page.offerings.products.push({
            product: productId,
            order: page.offerings.products.length,
        });

        await page.save();
        await page.populate(
            "offerings.products.product",
            "name images discountedPrice originalPrice slug isActive"
        );

        return res.status(201).json({
            success: true,
            message: "Product added to offerings",
            products: page.offerings.products,
        });
    } catch (error) {
        console.error("addOfferingProduct", error);
        return res.status(500).json({ message: "Error adding product" });
    }
};

/* ======================================================
   (ADMIN) REMOVE PRODUCT FROM OFFERINGS
====================================================== */
export const removeOfferingProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const page = await HorecaPage.getSingleton();

        page.offerings.products = page.offerings.products
            .filter((p) => p.product.toString() !== productId)
            .map((p, idx) => ({ ...p.toObject(), order: idx }));

        await page.save();
        await page.populate(
            "offerings.products.product",
            "name images discountedPrice originalPrice slug isActive"
        );

        return res.status(200).json({
            success: true,
            message: "Product removed from offerings",
            products: page.offerings.products,
        });
    } catch (error) {
        console.error("removeOfferingProduct", error);
        return res.status(500).json({ message: "Error removing product" });
    }
};

/* ======================================================
   (ADMIN) REORDER OFFERING PRODUCTS
   Accepts: { productIds: [id1, id2, ...] } in new desired order
====================================================== */
export const reorderOfferingProducts = async (req, res) => {
    try {
        const { productIds } = req.body;
        if (!Array.isArray(productIds)) {
            return res
                .status(400)
                .json({ message: "productIds must be an array" });
        }

        const page = await HorecaPage.getSingleton();
        const orderMap = {};
        productIds.forEach((id, idx) => (orderMap[id] = idx));

        page.offerings.products.forEach((p) => {
            const id = p.product.toString();
            if (orderMap[id] !== undefined) p.order = orderMap[id];
        });

        await page.save();
        await page.populate(
            "offerings.products.product",
            "name images discountedPrice originalPrice slug isActive"
        );

        return res.status(200).json({
            success: true,
            message: "Products reordered",
            products: page.offerings.products,
        });
    } catch (error) {
        console.error("reorderOfferingProducts", error);
        return res.status(500).json({ message: "Error reordering products" });
    }
};

/* ======================================================
   (ADMIN) UPDATE WHO WE SERVE — meta
====================================================== */
export const updateWhoWeServeMeta = async (req, res) => {
    try {
        const { heading, subheading } = req.body;
        const page = await HorecaPage.getSingleton();

        if (heading !== undefined) page.whoWeServe.heading = heading;
        if (subheading !== undefined) page.whoWeServe.subheading = subheading;

        await page.save();
        return res.status(200).json({
            success: true,
            message: "Who We Serve section updated",
            whoWeServe: page.whoWeServe,
        });
    } catch (error) {
        console.error("updateWhoWeServeMeta", error);
        return res
            .status(500)
            .json({ message: "Error updating Who We Serve section" });
    }
};

/* ======================================================
   (ADMIN) ADD WHO WE SERVE CARD — image + title + description
====================================================== */
export const addWhoWeServeCard = async (req, res) => {
    try {
        const { title, description, order } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "Card image is required" });
        }
        if (!title || !description) {
            return res
                .status(400)
                .json({ message: "title and description are required" });
        }

        const image = await uploadOnCloudinary(req.file.path, "horeca/who-we-serve");

        const page = await HorecaPage.getSingleton();
        page.whoWeServe.cards.push({
            image,
            title,
            description,
            order: order ?? page.whoWeServe.cards.length,
            isActive: true,
        });

        await page.save();
        return res.status(201).json({
            success: true,
            message: "Card added",
            cards: page.whoWeServe.cards,
        });
    } catch (error) {
        console.error("addWhoWeServeCard", error);
        return res.status(500).json({ message: "Error adding card" });
    }
};

/* ======================================================
   (ADMIN) UPDATE WHO WE SERVE CARD
====================================================== */
export const updateWhoWeServeCard = async (req, res) => {
    try {
        const { cardId } = req.params;
        const { title, description, order, isActive } = req.body;

        const page = await HorecaPage.getSingleton();
        const card = page.whoWeServe.cards.id(cardId);

        if (!card) {
            return res.status(404).json({ message: "Card not found" });
        }

        // Replace image if a new file was uploaded
        if (req.file) {
            await deleteFromCloudinary(card.image);
            card.image = await uploadOnCloudinary(req.file.path, "horeca/who-we-serve");
        }

        if (title !== undefined) card.title = title;
        if (description !== undefined) card.description = description;
        if (order !== undefined) card.order = order;
        if (typeof isActive === "boolean") card.isActive = isActive;

        await page.save();
        return res.status(200).json({
            success: true,
            message: "Card updated",
            cards: page.whoWeServe.cards,
        });
    } catch (error) {
        console.error("updateWhoWeServeCard", error);
        return res.status(500).json({ message: "Error updating card" });
    }
};

/* ======================================================
   (ADMIN) DELETE WHO WE SERVE CARD
====================================================== */
export const deleteWhoWeServeCard = async (req, res) => {
    try {
        const { cardId } = req.params;
        const page = await HorecaPage.getSingleton();
        const card = page.whoWeServe.cards.id(cardId);

        if (!card) {
            return res.status(404).json({ message: "Card not found" });
        }

        await deleteFromCloudinary(card.image);

        page.whoWeServe.cards = page.whoWeServe.cards.filter(
            (c) => c._id.toString() !== cardId
        );

        await page.save();
        return res.status(200).json({
            success: true,
            message: "Card deleted",
            cards: page.whoWeServe.cards,
        });
    } catch (error) {
        console.error("deleteWhoWeServeCard", error);
        return res.status(500).json({ message: "Error deleting card" });
    }
};

/* ======================================================
   (ADMIN) REORDER WHO WE SERVE CARDS
   Accepts: [{ cardId, order }, ...]
====================================================== */
export const reorderWhoWeServeCards = async (req, res) => {
    try {
        const { items } = req.body;
        if (!Array.isArray(items)) {
            return res.status(400).json({ message: "items must be an array" });
        }

        const page = await HorecaPage.getSingleton();
        items.forEach(({ cardId, order }) => {
            const card = page.whoWeServe.cards.id(cardId);
            if (card) card.order = order;
        });

        await page.save();
        return res.status(200).json({
            success: true,
            message: "Cards reordered",
            cards: page.whoWeServe.cards,
        });
    } catch (error) {
        console.error("reorderWhoWeServeCards", error);
        return res.status(500).json({ message: "Error reordering cards" });
    }
};

/* ======================================================
   (ADMIN) UPDATE MOBILE APP SECTION
====================================================== */
export const updateMobileAppSection = async (req, res) => {
    try {
        const {
            isVisible,
            heading,
            subheading,
            appTitle,
            appDescription,
            badgeText,
            playStoreUrl,
            appStoreUrl,
        } = req.body;

        const page = await HorecaPage.getSingleton();

        if (typeof isVisible === "boolean")
            page.mobileApp.isVisible = isVisible;
        if (heading !== undefined) page.mobileApp.heading = heading;
        if (subheading !== undefined) page.mobileApp.subheading = subheading;
        if (appTitle !== undefined) page.mobileApp.appTitle = appTitle;
        if (appDescription !== undefined)
            page.mobileApp.appDescription = appDescription;
        if (badgeText !== undefined) page.mobileApp.badgeText = badgeText;
        if (playStoreUrl !== undefined)
            page.mobileApp.playStoreUrl = playStoreUrl;
        if (appStoreUrl !== undefined) page.mobileApp.appStoreUrl = appStoreUrl;

        await page.save();
        return res.status(200).json({
            success: true,
            message: "Mobile app section updated",
            mobileApp: page.mobileApp,
        });
    } catch (error) {
        console.error("updateMobileAppSection", error);
        return res
            .status(500)
            .json({ message: "Error updating mobile app section" });
    }
};

/* ======================================================
   (ADMIN) UPDATE INQUIRY MODAL TEXT
====================================================== */
export const updateInquiryModalSection = async (req, res) => {
    try {
        const { title, description } = req.body;
        const page = await HorecaPage.getSingleton();

        if (title !== undefined) page.inquiryModal.title = title;
        if (description !== undefined)
            page.inquiryModal.description = description;

        await page.save();
        return res.status(200).json({
            success: true,
            message: "Inquiry modal updated",
            inquiryModal: page.inquiryModal,
        });
    } catch (error) {
        console.error("updateInquiryModalSection", error);
        return res
            .status(500)
            .json({ message: "Error updating inquiry modal section" });
    }
};
