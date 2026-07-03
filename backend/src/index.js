import "dotenv/config";
import express from "express";
import { connectDB } from "./db/connectDB.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import hpp from "hpp";
import rateLimit from "express-rate-limit";

import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import productRoutes from "./routes/product.route.js";
import couponRoutes from "./routes/coupon.route.js";
import blogRoutes from "./routes/blog.route.js";
import addressRoutes from "./routes/address.route.js";
import reviewRoutes from "./routes/review.route.js";
import wishlistRoutes from "./routes/wishlist.route.js";
import contactRoutes from "./routes/contact.route.js";
import pageSettingsRoutes from "./routes/pageSettings.route.js";
import dashboardRoutes from "./routes/dashboard.route.js";
import shopByVideoRoutes from "./routes/shopByVideo.route.js";
import orderRoutes from "./routes/order.route.js";
import videoBannerRoutes from "./routes/videoBanner.route.js";
import cartRoutes from "./routes/cart.route.js";
import categoryRoutes from "./routes/category.route.js";
import rewardRoutes from "./routes/reward.route.js";
import testRoutes from "./routes/test.route.js";
import announcementRoutes from "./routes/announcement.route.js";
import horecaPageRoutes from "./routes/horecaPage.route.js";

/* =========================
   ENV VALIDATION — fail fast at boot instead of failing
   mysteriously mid-request when a required var is missing
========================= */
const REQUIRED_ENV_VARS = ["MONGO_URI", "CLIENT_ORIGIN"];
const missingEnvVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missingEnvVars.length > 0) {
    console.error(
        `Missing required environment variables: ${missingEnvVars.join(", ")}`
    );
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5500;
const isProduction = process.env.NODE_ENV === "production";

const allowedOrigins = [
    process.env.CLIENT_ORIGIN,
    process.env.ADMIN_ORIGIN,
    process.env.CLIENT_ORIGIN_NEW,
    "http://localhost:3000",
    "http://localhost:3001",
].filter(Boolean);

app.set("trust proxy", 1);

/* =========================
   SECURITY HEADERS
   Sets X-Content-Type-Options, X-Frame-Options, HSTS, and more
   automatically. crossOriginResourcePolicy is relaxed to
   "cross-origin" since your frontend (paanshala.com) and backend
   (api.paanshala.com) are different origins consuming these
   responses/images — the default "same-origin" would block that.
========================= */
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);

/* =========================
   COMPRESSION — gzip/brotli API responses.
   Note: Cloudflare already compresses static frontend assets, but
   this backend sits behind your own VPS setup (not proxied through
   Cloudflare per your last message), so API JSON responses need
   their own compression here.
========================= */
app.use(compression());

/* =========================
   CORS — unchanged logic, just kept as-is since it already
   correctly restricts to known origins with credentials support
========================= */
app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("CORS not allowed"));
            }
        },
        credentials: true,
    })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* =========================
   NoSQL INJECTION PROTECTION — custom, Express-5-safe.
   The express-mongo-sanitize package tries to reassign req.query
   directly (`req.query = sanitized`), but Express 5 made req.query
   a getter-only property derived from the URL — reassigning it
   throws "Cannot set property query of #<IncomingMessage> which
   has only a getter". Mutating the object IN PLACE (not reassigning
   the reference) works fine under Express 5, so this does that
   instead: strips any object keys starting with "$" or containing
   "." recursively, which blocks classic NoSQL operator-injection
   payloads like { "email": { "$gt": "" } }.
========================= */
function sanitizeInPlace(obj) {
    if (!obj || typeof obj !== "object") return;

    for (const key of Object.keys(obj)) {
        if (key.startsWith("$") || key.includes(".")) {
            delete obj[key];
            continue;
        }
        if (obj[key] && typeof obj[key] === "object") {
            sanitizeInPlace(obj[key]);
        }
    }
}

app.use((req, res, next) => {
    if (req.body) sanitizeInPlace(req.body);
    if (req.query) sanitizeInPlace(req.query); // mutates in place — safe under Express 5
    if (req.params) sanitizeInPlace(req.params);
    next();
});

/* =========================
   HTTP PARAMETER POLLUTION PROTECTION
   Prevents ?sort=price&sort=name style duplicate-param attacks
   from producing unexpected array values in req.query
========================= */
app.use(hpp());

app.use(express.static("public"));
app.use(cookieParser());

/* =========================
   RATE LIMITING — applied only to auth-sensitive routes.
   A global limiter would also throttle normal product browsing
   traffic, which is counterproductive for an e-commerce site.
========================= */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 attempts per IP per window
    message: {
        success: false,
        message: "Too many attempts. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);
app.use("/api/admin/login", authLimiter);

/* =========================
   HEALTH CHECK — for uptime monitoring (UptimeRobot, Cloudflare
   health checks if you ever proxy the API, or simple cron pings)
   without hitting a real DB-backed route
========================= */
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/page-settings", pageSettingsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/shop-by-video", shopByVideoRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/video-banners", videoBannerRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/test", testRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/horeca-page", horecaPageRoutes);

/* =========================
   404 HANDLER — for any route not matched above
========================= */
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

/* =========================
   CENTRALIZED ERROR HANDLER — must be last, with 4 params so
   Express recognizes it as an error middleware. Without this,
   an uncaught error in any controller sends the default Express
   HTML error page (which can leak stack traces in production if
   NODE_ENV isn't set correctly) instead of a clean JSON response.
========================= */
app.use((err, req, res, next) => {
    console.error(err.stack);

    if (err.message === "CORS not allowed") {
        return res
            .status(403)
            .json({ success: false, message: "CORS not allowed" });
    }

    res.status(err.status || 500).json({
        success: false,
        message: isProduction ? "Something went wrong" : err.message,
        ...(isProduction ? {} : { stack: err.stack }),
    });
});

/* =========================
   GRACEFUL SHUTDOWN — finish in-flight requests (e.g. an order
   being placed) instead of dropping connections abruptly on
   deploy/restart
========================= */
let server;

connectDB()
    .then(() => {
        server = app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("DB Connection Error: ", error);
        process.exit(1);
    });

process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully");
    server?.close(() => {
        console.log("Server closed");
        process.exit(0);
    });
});

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
});