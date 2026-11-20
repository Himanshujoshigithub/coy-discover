
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const db = require("./config/db");
const feedRoutes = require("./routes/feed");
const matchesRoutes = require("./routes/matches");
const swipeRoutes = require("./routes/swipe");

const app = express();

// 1. Middleware MUST come before routes
app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/matches", matchesRoutes);

// 2. Routes
app.get("/", (req, res) => {
    res.send("Coy Discover API is running!");
});

app.use("/feed", feedRoutes);
app.use("/swipe", swipeRoutes);

// 3. Database health check
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
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

// 4. Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
