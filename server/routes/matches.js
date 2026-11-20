
const express = require("express");
const router = express.Router();

const db = require("../config/db");

// GET /matches
router.get("/", async (req, res) => {
    try {
        const currentUserId = Number(process.env.CURRENT_USER_ID);

        if (!Number.isSafeInteger(currentUserId) || currentUserId <= 0) {
            return res.status(500).json({
                success: false,
                message: "Invalid CURRENT_USER_ID configuration"
            });
        }

        const [matches] = await db.execute(
            `SELECT
                m.id AS matchId,
                m.created_at AS matchedAt,
                p.id,
                p.name,
                p.age,
                p.photo,
                p.bio,
                p.city,
                p.interests
             FROM matches m

             JOIN profiles p
                ON p.id = CASE
                    WHEN m.user_one = ?
                    THEN m.user_two
                    ELSE m.user_one
                END

             -- Verify the first user liked the second user
             JOIN swipes s1
                ON s1.from_user = m.user_one
                AND s1.to_user = m.user_two
                AND s1.action = 'like'

             -- Verify the second user liked the first user
             JOIN swipes s2
                ON s2.from_user = m.user_two
                AND s2.to_user = m.user_one
                AND s2.action = 'like'

             WHERE m.user_one = ? OR m.user_two = ?

             ORDER BY m.created_at DESC`,
            [currentUserId, currentUserId, currentUserId]
        );

        return res.status(200).json({
            success: true,
            count: matches.length,
            matches
        });

    } catch (error) {
        console.error("Matches API error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch matches"
        });
    }
});

module.exports = router;
