import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { Review } from "../models/review.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";

dotenv.config();

/* ══════════════════════════════════════
   CONFIG
══════════════════════════════════════ */
const REVIEWS_PER_PRODUCT_MIN = 8;
const REVIEWS_PER_PRODUCT_MAX = 18;
const RATING_MIN = 4;
const RATING_MAX = 5;
const FAKE_USERS_TO_CREATE = 40; // creates a pool of fake reviewers

/* ══════════════════════════════════════
   FAKE INDIAN NAMES POOL
══════════════════════════════════════ */
const FIRST_NAMES = [
    "Aarav",
    "Vivaan",
    "Aditya",
    "Vihaan",
    "Arjun",
    "Sai",
    "Reyansh",
    "Ayaan",
    "Krishna",
    "Ishaan",
    "Priya",
    "Ananya",
    "Pooja",
    "Neha",
    "Sneha",
    "Divya",
    "Kavya",
    "Riya",
    "Sanya",
    "Tanya",
    "Rohit",
    "Rahul",
    "Amit",
    "Suresh",
    "Ramesh",
    "Sunita",
    "Geeta",
    "Meena",
    "Lata",
    "Rekha",
    "Vikram",
    "Nikhil",
    "Karan",
    "Rohan",
    "Varun",
    "Anjali",
    "Shreya",
    "Nisha",
    "Poonam",
    "Swati",
    "Deepak",
    "Manish",
    "Rajesh",
    "Sunil",
    "Anil",
    "Shweta",
    "Preeti",
    "Jyoti",
    "Sapna",
    "Komal",
];

const LAST_NAMES = [
    "Sharma",
    "Verma",
    "Gupta",
    "Singh",
    "Kumar",
    "Patel",
    "Shah",
    "Mehta",
    "Joshi",
    "Mishra",
    "Agarwal",
    "Yadav",
    "Chauhan",
    "Pandey",
    "Tiwari",
    "Rao",
    "Reddy",
    "Nair",
    "Pillai",
    "Menon",
    "Desai",
    "Patil",
    "More",
    "Kulkarni",
    "Jain",
    "Srivastava",
    "Dubey",
    "Tripathi",
    "Chaudhary",
    "Saxena",
];

/* ══════════════════════════════════════
   REVIEW TEXT POOL
══════════════════════════════════════ */
const REVIEW_TEXTS = [
    "Absolutely loved it! The taste is authentic and fresh. Will definitely order again.",
    "Best paan I've had outside of a paan shop. Packaging was great too.",
    "Amazing quality. My whole family enjoyed it. 10/10 would recommend.",
    "Superb taste, very fresh. Delivery was fast. Highly recommended!",
    "Exactly as described. The flavors are spot on. Very happy with my purchase.",
    "Outstanding product. Quality is top notch and the freshness is unmatched.",
    "Loved the taste! Reminded me of the paan I used to have back home.",
    "Excellent product. Will be ordering regularly from now on.",
    "Fantastic! The ingredients are fresh and the taste is incredible.",
    "Perfect order. Everything was intact and super fresh.",
    "Great product, great packaging. Very satisfied.",
    "Really impressed with the quality. Will order again soon!",
    "Delicious and fresh. Exactly what I was looking for.",
    "Premium quality paan delivered right to my doorstep. Love it!",
    "Wonderful experience. The taste is authentic and very satisfying.",
    "Very good product. Taste is great, just wish the quantity was a bit more.",
    "Good quality overall. Would have given 5 stars but delivery took a bit longer.",
    "Nice taste and fresh ingredients. Good value for money.",
    "Pretty good! The taste is authentic. Packaging could be improved slightly.",
    "Good product. Enjoyed the taste. Will probably order again.",
    "Tasty and fresh. Minor delay in delivery but overall a good experience.",
    "Quite good. The flavor is strong and authentic. Happy with the purchase.",
    "Good quality paan. Satisfied with my order. Will try other variants next time.",
    "Nice product. Fresh and well-packaged. Good for gifting too.",
    "Decent quality for the price. Would order again.",
    "Good experience overall. Product met my expectations.",
    "Taste is good and ingredients seem fresh. Happy with this purchase.",
    "Very satisfying purchase. Good taste and fair pricing.",
    "Good product, will be ordering more varieties soon.",
    "Liked it overall. Slight improvement in packaging would make it perfect.",
    "Loved it! Fresh and delicious!",
    "Great taste, fast delivery.",
    "Highly recommended! Worth every rupee.",
    "Superb quality! Very authentic taste.",
    "Will order again! Excellent product.",
    "Fresh and well-packaged. Best in class.",
    "Absolutely delicious. Great experience.",
    "Really good quality. Happy with my order.",
    "Maza aa gaya! Bilkul asli swad hai.",
    "Bahut achha product hai. Jarur order karein.",
    "Fresh aur tasty. Delivery bhi time pe aayi.",
    "Ghar jaisa swad. Bohot pasand aaya.",
    "Ekdum badhiya! Paisa vasool.",
    null,
    null,
    null,
    null,
    null, // ~10% rating-only
];

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
const randomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateFakeName = () =>
    `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`;

const generateFakeEmail = (name, index) => {
    const clean = name.toLowerCase().replace(/\s+/g, ".");
    const suffixes = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"];
    const num = randomInt(10, 999);
    return `${clean}${num}${index}@${randomFrom(suffixes)}`;
};

/* ══════════════════════════════════════
   MAIN SCRIPT
══════════════════════════════════════ */
const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✓ Connected to MongoDB");

        /* ── 1. Get all active products ── */
        const products = await Product.find({ isActive: true }).select(
            "_id name"
        );
        console.log(`✓ Found ${products.length} active products`);

        if (products.length === 0) {
            console.log("No active products found. Exiting.");
            process.exit(0);
        }

        /* ── 2. Create fake users ── */
        console.log(
            `\nCreating ${FAKE_USERS_TO_CREATE} fake reviewer accounts...`
        );
        const fakeUserIds = [];
        const hashedPassword = await bcrypt.hash("FakeUser@123!", 10);

        for (let i = 0; i < FAKE_USERS_TO_CREATE; i++) {
            const name = generateFakeName();
            const email = generateFakeEmail(name, i);

            // Check if email already exists (script safety for re-runs)
            const existing = await User.findOne({ email });
            if (existing) {
                fakeUserIds.push(existing._id);
                continue;
            }

            const user = await User.create({
                full_name: name,
                email,
                password: hashedPassword,
                isVerified: true,
                isFakeReviewer: true, // flag to identify fake accounts
            });

            fakeUserIds.push(user._id);
        }

        console.log(`✓ ${fakeUserIds.length} fake reviewer accounts ready`);

        /* ── 3. Seed reviews per product ── */
        console.log("\nSeeding reviews...\n");

        let totalCreated = 0;
        let totalSkipped = 0;

        for (const product of products) {
            const reviewCount = randomInt(
                REVIEWS_PER_PRODUCT_MIN,
                REVIEWS_PER_PRODUCT_MAX
            );

            // Shuffle fake users and pick subset
            const shuffled = [...fakeUserIds].sort(() => Math.random() - 0.5);
            const selectedUsers = shuffled.slice(
                0,
                Math.min(reviewCount, fakeUserIds.length)
            );

            let productCreated = 0;

            for (const userId of selectedUsers) {
                const existing = await Review.findOne({
                    product: product._id,
                    user: userId,
                });

                if (existing) {
                    totalSkipped++;
                    continue;
                }

                const rating = randomInt(RATING_MIN, RATING_MAX);
                const reviewText = randomFrom(REVIEW_TEXTS);

                // Spread created dates over the past 6 months for realism
                const daysAgo = randomInt(1, 180);
                const createdAt = new Date(
                    Date.now() - daysAgo * 24 * 60 * 60 * 1000
                );

                await Review.create({
                    product: product._id,
                    user: userId,
                    rating,
                    review: reviewText,
                    isApproved: true,
                    createdAt,
                    updatedAt: createdAt,
                });

                productCreated++;
                totalCreated++;
            }

            /* ── 4. Recalculate product stats ── */
            const stats = await Review.aggregate([
                { $match: { product: product._id, isApproved: true } },
                {
                    $group: {
                        _id: "$product",
                        avgRating: { $avg: "$rating" },
                        count: { $sum: 1 },
                    },
                },
            ]);

            await Product.findByIdAndUpdate(product._id, {
                averageRating: parseFloat(
                    (stats[0]?.avgRating || 0).toFixed(1)
                ),
                totalReviews: stats[0]?.count || 0,
            });

            console.log(
                `  ✓ ${product.name.padEnd(35)} → ${productCreated} reviews | avg: ${(stats[0]?.avgRating || 0).toFixed(1)} ⭐`
            );
        }

        console.log("\n══════════════════════════════════════");
        console.log(`✓ Reviews created : ${totalCreated}`);
        console.log(`✓ Skipped (exist) : ${totalSkipped}`);
        console.log(`✓ Fake users used : ${fakeUserIds.length}`);
        console.log("══════════════════════════════════════");
        console.log(
            "\nNOTE: Fake reviewer accounts are marked with isFakeReviewer: true"
        );
        console.log(
            "      They won't appear in admin user lists if you filter them out.\n"
        );

        process.exit(0);
    } catch (error) {
        console.error("✗ Seed failed:", error);
        process.exit(1);
    }
};

seed();
