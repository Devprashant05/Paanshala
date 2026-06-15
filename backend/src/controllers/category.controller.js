import { Category } from "../models/category.model.js";
import slugify from "slugify";

/* =========================
   CREATE CATEGORY
========================= */
export const createCategory = async (req, res) => {
    try {
        const { name, parent, order } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        let level = 0;

        if (parent) {
            const parentCat = await Category.findById(parent);
            if (!parentCat) {
                return res
                    .status(404)
                    .json({ message: "Parent category not found" });
            }
            level = parentCat.level + 1;
        }

        const slug = slugify(name, { lower: true });

        const category = await Category.create({
            name,
            slug,
            parent: parent || null,
            level,
            order: order || 0,
        });

        res.status(201).json({
            success: true,
            category,
        });
    } catch (error) {
        console.error("createCategory", error);
        res.status(500).json({ message: "Error creating category" });
    }
};

/* =========================
   GET ALL (ADMIN)
========================= */
export const getAllCategoriesAdmin = async (req, res) => {
    try {
        const categories = await Category.find()
            .populate("parent", "name")
            .sort({ order: 1 });

        res.status(200).json({
            success: true,
            categories,
        });
    } catch (error) {
        console.error("getAllCategoriesAdmin", error);
        res.status(500).json({ message: "Error fetching categories" });
    }
};

/* =========================
   GET ACTIVE (PUBLIC)
========================= */
export const getActiveCategories = async (req, res) => {
    try {
        const isCombo = req.query.combo === "true";

        let rawCategories;

        if (isCombo) {
            const comboRoots = await Category.find({
                isActive: true,
                showInCombo: true,
                $or: [{ parent: null }, { parent: { $exists: false } }],
            })
                .sort({ order: 1 })
                .lean();

            const rootIds = comboRoots.map((r) => r._id);

            const children = await Category.find({
                isActive: true,
                parent: { $in: rootIds },
            })
                .sort({ order: 1 })
                .lean();

            rawCategories = [...comboRoots, ...children];
        } else {
            rawCategories = await Category.find({ isActive: true })
                .sort({ order: 1 })
                .lean();
        }

        // Build tree — stringify IDs for reliable map lookup
        const map = {};
        const rootNodes = [];

        rawCategories.forEach((cat) => {
            map[cat._id.toString()] = { ...cat, children: [] };
        });

        rawCategories.forEach((cat) => {
            if (cat.parent) {
                const parentId = cat.parent.toString();
                if (map[parentId]) {
                    map[parentId].children.push(map[cat._id.toString()]);
                }
            } else {
                rootNodes.push(map[cat._id.toString()]);
            }
        });

        res.status(200).json({
            success: true,
            categories: rootNodes,
        });
    } catch (error) {
        console.error("getActiveCategories", error);
        res.status(500).json({ message: "Error fetching categories" });
    }
};

/* =========================
   UPDATE CATEGORY
========================= */
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            parent,
            isActive,
            order,
            showInCombo,
            requiresScheduling,
            isCODAvailable,
        } = req.body;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        if (name) {
            category.name = name;
            category.slug = slugify(name, { lower: true });
        }

        if (typeof isActive === "boolean") {
            category.isActive = isActive;
        }

        if (typeof showInCombo === "boolean") {
            category.showInCombo = showInCombo;
        }

        if (typeof requiresScheduling === "boolean") {
            // Only root categories can require scheduling
            if (category.level !== 0) {
                return res.status(400).json({
                    message:
                        "requiresScheduling can only be set on root categories",
                });
            }
            category.requiresScheduling = requiresScheduling;
        }

        if (typeof isCODAvailable === "boolean") {
            category.isCODAvailable = isCODAvailable;
        }

        if (order !== undefined) {
            category.order = order;
        }

        // Update parent
        if (parent !== undefined) {
            category.parent = parent || null;

            if (parent) {
                const parentCat = await Category.findById(parent);
                category.level = parentCat.level + 1;
            } else {
                category.level = 0;
            }
        }

        await category.save();

        res.status(200).json({
            success: true,
            category,
        });
    } catch (error) {
        console.error("updateCategory", error);
        res.status(500).json({ message: "Error updating category" });
    }
};

/* =========================
   DELETE CATEGORY
========================= */
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check children
        const hasChildren = await Category.findOne({ parent: id });
        if (hasChildren) {
            return res.status(400).json({
                message: "Delete subcategories first",
            });
        }

        await Category.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Category deleted",
        });
    } catch (error) {
        console.error("deleteCategory", error);
        res.status(500).json({ message: "Error deleting category" });
    }
};

/* =========================
   TOGGLE STATUS
========================= */
export const toggleCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const category = await Category.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        res.status(200).json({
            success: true,
            category,
        });
    } catch (error) {
        console.error("toggleCategoryStatus", error);
        res.status(500).json({ message: "Error updating status" });
    }
};
