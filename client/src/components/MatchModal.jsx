
import { Heart, X } from "lucide-react";

function MatchModal({ match, onClose }) {
    if (!match) return null;

    return (
        <div className="modal-overlay">

            <div className="match-modal">

                <button
                    className="modal-close"
                    onClick={onClose}
                    aria-label="Close match popup"
                >
                    <X />
                </button>

                <Heart
                    size={48}
                    fill="currentColor"
                    className="match-heart"
                />

                <h1>It's a Match!</h1>

                <p>
                    You and {match.name} liked each other.
                </p>

                <img
                    src={match.photo}
                    alt={match.name}
                    className="match-photo"
                />

                <h2>
                    {match.name}, {match.age}
                </h2>

                <button
                    className="continue-button"
                    onClick={onClose}
                >
                    Continue Discovering
                </button>

            </div>

        </div>
    );
}

export default MatchModal;
