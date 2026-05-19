import { Reward } from "../models/reward.model.js";

/* ======================================================
   GET USER REWARD HISTORY
====================================================== */
export const getMyRewardHistory = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        // Get rewards
        const rewards = await Reward.find({
            userId: req.user._id,
        })
            .populate("orderId", "orderNumber totalAmount status createdAt")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Total count
        const total = await Reward.countDocuments({
            userId: req.user._id,
        });

        // Summary calculations
        const summary = await Reward.aggregate([
            {
                $match: {
                    userId: req.user._id,
                },
            },
            {
                $group: {
                    _id: "$type",

                    totalPoints: {
                        $sum: "$points",
                    },
                },
            },
        ]);

        let totalEarned = 0;
        let totalRedeemed = 0;

        summary.forEach((item) => {
            if (item._id === "earned") {
                totalEarned = item.totalPoints;
            }

            if (item._id === "redeemed") {
                totalRedeemed = item.totalPoints;
            }
        });

        return res.status(200).json({
            success: true,

            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit,
            },

            summary: {
                totalEarned,
                totalRedeemed,
                currentBalance: totalEarned - totalRedeemed,
            },

            rewards,
        });
    } catch (error) {
        console.error("getMyRewardHistory", error);

        return res.status(500).json({
            message: "Error while fetching reward history",
        });
    }
};
