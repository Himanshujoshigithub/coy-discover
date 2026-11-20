
const express = require("express");
const router = express.Router();

const db = require("../config/db");

// POST /swipe
router.post("/", async (req, res) => {
    let connection;

    try {
        // 1. Get logged-in user and request data
        const currentUserId = Number(process.env.CURRENT_USER_ID);
        const { toUserId, action } = req.body;

        // 2. Validate request
        if (
            !Number.isSafeInteger(currentUserId) ||
            currentUserId <= 0 ||
            !Number.isSafeInteger(toUserId) ||
            toUserId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        if (currentUserId === toUserId) {
            return res.status(400).json({
                success: false,
                message: "You cannot swipe on yourself"
            });
        }

        if (!["like", "pass"].includes(action)) {
            return res.status(400).json({
                success: false,
                message: "Action must be like or pass"
            });
        }

        // 3. Get database connection
        connection = await db.getConnection();

        // 4. Start transaction
        await connection.beginTransaction();

        // 5. Lock both profile rows in a consistent order.
        // This also helps prevent concurrent reciprocal swipes
        // from missing each other.
        const firstId = Math.min(currentUserId, toUserId);
        const secondId = Math.max(currentUserId, toUserId);

        const [firstUser] = await connection.execute(
            "SELECT id FROM profiles WHERE id = ? FOR UPDATE",
            [firstId]
        );

        const [secondUser] = await connection.execute(
            "SELECT id FROM profiles WHERE id = ? FOR UPDATE",
            [secondId]
        );

        if (firstUser.length === 0 || secondUser.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        // 6. Check whether the user already swiped
        const [existingSwipe] = await connection.execute(
            `SELECT id
             FROM swipes
             WHERE from_user = ? AND to_user = ?`,
            [currentUserId, toUserId]
        );

        if (existingSwipe.length > 0) {
            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: "You have already swiped on this profile"
            });
        }

        // 7. Save the current swipe
        await connection.execute(
            `INSERT INTO swipes
             (from_user, to_user, action)
             VALUES (?, ?, ?)`,
            [currentUserId, toUserId, action]
        );

        let matched = false;
        let match = null;

        // 8. Check for mutual like
        if (action === "like") {

            const [reverseLike] = await connection.execute(
                `SELECT id
                 FROM swipes
                 WHERE from_user = ?
                 AND to_user = ?
                 AND action = 'like'`,
                [toUserId, currentUserId]
            );

            // 9. Create match only when both users liked each other
            if (reverseLike.length > 0) {

                // Always save IDs in ascending order
                // to prevent duplicate matches.
                await connection.execute(
                    `INSERT IGNORE INTO matches
                     (user_one, user_two)
                     VALUES (?, ?)`,
                    [firstId, secondId]
                );

                // Fetch the created match
                const [matchRows] = await connection.execute(
                    `SELECT id, created_at
                     FROM matches
                     WHERE user_one = ?
                     AND user_two = ?`,
                    [firstId, secondId]
                );

                // Fetch the matched profile
                const [profileRows] = await connection.execute(
                    `SELECT id, name, age, photo, bio, city, interests
                     FROM profiles
                     WHERE id = ?`,
                    [toUserId]
                );

                matched = true;

                match = {
                    matchId: matchRows[0].id,
                    ...profileRows[0]
                };
            }
        }

        // 10. Commit transaction
        await connection.commit();

        return res.status(201).json({
            success: true,
            message: matched
                ? "It's a match!"
                : "Swipe saved successfully",
            swipe: {
                toUserId,
                action
            },
            matched,
            match
        });

    } catch (error) {

        // Undo database changes if anything fails
        if (connection) {
            await connection.rollback();
        }

        console.error("Swipe API error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to process swipe"
        });

    } finally {

        // Return connection to pool
        if (connection) {
            connection.release();
        }
    }
});

module.exports = router;
