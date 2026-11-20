
import { motion } from "framer-motion";
import { Heart, X, MapPin } from "lucide-react";

function ProfileCard({ profile, onSwipe, busy }) {

    const handleDragEnd = (_, info) => {
        if (busy) return;

        if (info.offset.x > 100) {
            onSwipe("like");
        } else if (info.offset.x < -100) {
            onSwipe("pass");
        }
    };

    let interests = profile.interests;

    if (typeof interests === "string") {
        try {
            interests = JSON.parse(interests);
        } catch {
            interests = [];
        }
    }

    if (!Array.isArray(interests)) {
        interests = [];
    }

    return (
        <div className="card-container">

            <motion.div
                className="profile-card"
                drag={busy ? false : "x"}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.8}
                onDragEnd={handleDragEnd}
                whileDrag={{ scale: 1.04, rotate: 3 }}
                whileTap={{ cursor: "grabbing" }}
            >
                <img
                    src={profile.photo}
                    alt={profile.name}
                    className="profile-image"
                    draggable="false"
                />

                <div className="image-overlay"></div>

                <div className="profile-info">

                    <h2>
                        {profile.name}, {profile.age}
                    </h2>

                    <p className="profile-location">
                        <MapPin size={16} />
                        {profile.city}
                    </p>

                    <p className="profile-bio">
                        {profile.bio}
                    </p>

                    <div className="interests">
                        {interests.map((interest, index) => (
                            <span key={index}>
                                {interest}
                            </span>
                        ))}
                    </div>

                </div>
            </motion.div>

            <div className="swipe-buttons">

                <button
                    className="pass-button"
                    onClick={() => onSwipe("pass")}
                    disabled={busy}
                    aria-label="Pass profile"
                >
                    <X size={30} />
                </button>

                <button
                    className="like-button"
                    onClick={() => onSwipe("like")}
                    disabled={busy}
                    aria-label="Like profile"
                >
                    <Heart size={30} fill="currentColor" />
                </button>

            </div>

        </div>
    );
}

export default ProfileCard;
