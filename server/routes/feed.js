
const express = require("express");
const router = express.Router();

const db = require("../config/db");

// GET /feed
router.get("/", async (req, res) => {
    try {
        const currentUserId = Number(process.env.CURRENT_USER_ID);

        if (!Number.isInteger(currentUserId) || currentUserId <= 0) {
            return res.status(500).json({
                success: false,
                message: "Invalid CURRENT_USER_ID configuration"
            });
        }

        const [profiles] = await db.execute(
            `SELECT
                p.id,
                p.name,
                p.age,
                p.photo,
                p.bio,
                p.city,
                p.interests
             FROM profiles p
             WHERE p.id != ?
             AND NOT EXISTS (
                SELECT 1
                FROM swipes s
                WHERE s.from_user = ?
                AND s.to_user = p.id
             )
             ORDER BY p.id ASC`,
            [currentUserId, currentUserId]
        );

        res.status(200).json({
            success: true,
            count: profiles.length,
            profiles
        });

    } catch (error) {
        console.error("Feed API error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to fetch profiles"
        });
    }
});

module.exports = router;
