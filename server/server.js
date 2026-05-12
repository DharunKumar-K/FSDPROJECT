require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const connectDB = require("./config/db");

const app = express();

// Ensure uploads directory exists
fs.mkdirSync("uploads", { recursive: true });

const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",")
    : ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman, server-side)
        if (!origin) return callback(null, true);
        // Allow any localhost origin in development
        if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const adminRoutes = require("./routes/adminRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const activityRoutes = require("./routes/activityRoutes");
const curriculumRoutes = require("./routes/curriculumRoutes");
const intelligenceRoutes = require("./routes/intelligenceRoutes");
const sessionRoutes = require("./routes/sessionRoutes");

connectDB();

app.get("/", (req,res)=>{
    res.send("Attendance Server V2 Running");
});

app.get("/api/test", (req, res) => {
    res.json({ message: "API is working", time: new Date() });
});

app.use("/api", studentRoutes);
app.use("/api", teacherRoutes);
app.use("/api", adminRoutes);
app.use("/api", attendanceRoutes);
app.use("/api", activityRoutes);
app.use("/api", curriculumRoutes);
app.use("/api", intelligenceRoutes);
app.use("/api", sessionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", ()=>{
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
