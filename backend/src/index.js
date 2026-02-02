import express from "express";
import { connectDB } from "./db/connectDB.js";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import productRoutes from './routes/product.route.js'

dotenv.config({
    path: "./.env",
});
const app = express();
const PORT = process.env.PORT || 5500;

const allowedOrigins = [
    process.env.CLIENT_ORIGIN,
    process.env.ADMIN_ORIGIN,
    "http://localhost:3000",
    "http://localhost:3001",
];

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
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => console.error("DB Connection Error: ", error));
