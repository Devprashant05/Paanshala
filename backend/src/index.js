import express from "express";
import { connectDB } from "./db/connectDB.js";
import dotenv from "dotenv";

dotenv.config({
    path: "./.env",
});
const app = express();
const PORT = process.env.PORT || 5500;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => console.error("DB Connection Error: ", error));
