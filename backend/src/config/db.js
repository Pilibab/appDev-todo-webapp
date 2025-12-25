import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // load .env
const uri = process.env.MONGODB_URI

export async function connectDb() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: "todo_platform"
        });

        console.log("✅ MongoDB connected via Mongoose");
    } catch (err) {
        console.error("❌ MongoDB connection failed", err);
        process.exit(1);
    }
}