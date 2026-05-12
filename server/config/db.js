const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        if (process.env.USE_SUPABASE === "true") {
            console.log("Supabase mode enabled - skipping MongoDB connection");
            return;
        }

        const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/attendanceDB";

        if (!mongoUri) {
            throw new Error("MONGODB_URI is not configured");
        }

        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000
        });
        console.log("MongoDB Connected Successfully");
    } catch (err) {
        console.error("MongoDB Connection Failed:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
