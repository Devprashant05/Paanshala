import { Coupon } from "../models/coupon.model.js";
import { CouponUsage } from "../models/couponUsage.model.js";

// =============================
// (Admin) CREATE COUPON
// =============================
export const createCoupon = async (req, res) => {
    try {
        const data = req.body;

        const existing = await Coupon.findOne({ code: data.code });
        if (existing) {
            return res.status(400).json({ message: "Coupon already exists" });
        }

        const coupon = await Coupon.create(data);

        return res.status(201).json({
            success: true,
            message: "Coupon created successfully",
            coupon,
        });
    } catch (error) {
        console.error("createCoupon", error);
        return res.status(500).json({
            message: "Error while creating coupon",
        });
    }
};

// =============================
// (Admin) UPDATE COUPON
// =============================
export const updateCoupon = async (req, res) => {
    try {
        const { couponId } = req.params;

        const coupon = await Coupon.findByIdAndUpdate(couponId, req.body, {
            new: true,
        });

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Coupon updated successfully",
            coupon,
        });
    } catch (error) {
        console.error("updateCoupon", error);
        return res.status(500).json({
            message: "Error while updating coupon",
        });
    }
};

// =============================
// (Admin) LIST COUPONS
// =============================
export const listCouponsAdmin = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            coupons,
        });
    } catch (error) {
        console.error("listCouponsAdmin", error);
        return res.status(500).json({
            message: "Error while fetching coupons",
        });
    }
};

// =============================
// (Admin) TOGGLE COUPON
// =============================
export const toggleCoupon = async (req, res) => {
    try {
        const { couponId } = req.params;
        const { isActive } = req.body;

        const coupon = await Coupon.findByIdAndUpdate(
            couponId,
            { isActive },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            coupon,
        });
    } catch (error) {
        console.error("toggleCoupon", error);
        return res.status(500).json({
            message: "Error while toggling coupon",
        });
    }
};

// =============================
// (User) VALIDATE COUPON
// =============================
export const validateCoupon = async (req, res) => {
    try {
        const { code, cartTotal, categories = [] } = req.body;

        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            isActive: true,
            expiryDate: { $gte: new Date() },
        });

        if (!coupon) {
            return res
                .status(400)
                .json({ message: "Invalid or expired coupon" });
        }

        if (coupon.minCartValue > cartTotal) {
            return res.status(400).json({
                message: `Minimum cart value ₹${coupon.minCartValue} required`,
            });
        }

        if (
            coupon.applicableCategories?.length &&
            !coupon.applicableCategories.some((c) => categories.includes(c))
        ) {
            return res.status(400).json({
                message: "Coupon not applicable to selected products",
            });
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({
                message: "Coupon usage limit exceeded",
            });
        }

        const usage = await CouponUsage.findOne({
            couponId: coupon._id,
            userId: req.user._id,
        });

        if (usage && usage.usedCount >= coupon.usagePerUser) {
            return res.status(400).json({
                message: "Coupon already used",
            });
        }

        return res.status(200).json({
            success: true,
            coupon,
        });
    } catch (error) {
        console.error("validateCoupon", error);
        return res.status(500).json({
            message: "Error while validating coupon",
        });
    }
};

// =============================
// (User) LIST COUPONS
// =============================
export const listCouponsUser = async (req, res) => {
    try {
        const coupons = await Coupon.find({ isActive: true }).sort({
            createdAt: -1,
        }).select("-discountType -discountValue -maxDiscount -minCartValue -applicableCategories -usageLimit -usedCount -usagePerUser");

        return res.status(200).json({
            success: true,
            coupons,
        });
    } catch (error) {
        console.error("listCouponsUser", error);
        return res.status(500).json({
            message: "Error while fetching coupons",
        });
    }
};
