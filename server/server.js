
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const db = require("./config/db");
const feedRoutes = require("./routes/feed");
const matchesRoutes = require("./routes/matches");
const swipeRoutes = require("./routes/swipe");

const app = express();

// Allowed frontend URLs
const allowedOrigins = [
    "http://localhost:5173",
    "https://coy-discover-three.vercel.app"
];

// CORS configuration
app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home route
app.get("/", (req, res) => {
    res.send("Coy Discover API is running!");
});

// API routes
app.use("/feed", feedRoutes);
app.use("/swipe", swipeRoutes);
app.use("/matches", matchesRoutes);

// Database health check
app.get("/health", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT DATABASE() AS databaseName"
        );

        res.json({
            success: true,
            message: "MySQL connected successfully!",
            database: rows[0].databaseName
        });

    } catch (error) {
        console.error("Database error:", error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
