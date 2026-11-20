
import { useEffect, useState } from "react";
import { getMatches } from "../services/api";
import { Heart } from "lucide-react";

function Matches() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const data = await getMatches();
                setMatches(data.matches || []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Unable to load matches"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, []);

    if (loading) {
        return <p className="page-message">Loading matches...</p>;
    }

    if (error) {
        return <p className="page-message">{error}</p>;
    }

    return (
        <main className="matches-page">

            <h1>Your Matches</h1>
            <p className="section-subtitle">
                People you've mutually liked.
            </p>

            {matches.length === 0 ? (
                <div className="empty-state">
                    <Heart size={48} />
                    <h2>No matches yet</h2>
                    <p>Keep discovering new profiles!</p>
                </div>
            ) : (
                <div className="matches-grid">
                    {matches.map((person) => (
                        <div
                            className="match-card"
                            key={person.matchId}
                        >
                            <img
                                src={person.photo}
                                alt={person.name}
                            />

                            <div>
                                <h3>
                                    {person.name}, {person.age}
                                </h3>

                                <p>{person.city}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </main>
    );
}

export default Matches;
