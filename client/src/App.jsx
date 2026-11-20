import { useCallback, useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import ProfileCard from "./components/ProfileCard";
import MatchModal from "./components/MatchModal";

import Home from "./pages/Home";
import Matches from "./pages/Matches.jsx";
import {
    getFeed,
    getMatches,
    submitSwipe
} from "./services/api";

function App() {
    const [activeTab, setActiveTab] = useState("discover");

    const [profiles, setProfiles] = useState([]);
    const [matches, setMatches] = useState([]);

    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    const [error, setError] = useState("");
    const [newMatch, setNewMatch] = useState(null);

    const loadFeed = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getFeed();

            setProfiles(data.profiles || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load profiles"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const loadMatches = useCallback(async () => {
        try {
            const data = await getMatches();
            setMatches(data.matches || []);
        } catch (err) {
            console.error("Unable to load matches:", err);
        }
    }, []);

    useEffect(() => {
        loadFeed();
        loadMatches();
    }, [loadFeed, loadMatches]);

    const handleSwipe = async (action) => {
        const currentProfile = profiles[0];

        if (!currentProfile || busy) return;

        setBusy(true);
        setError("");

        try {
            const data = await submitSwipe(
                currentProfile.id,
                action
            );

            // Remove swiped profile only after
            // the backend successfully saves it.
            setProfiles((previous) =>
                previous.filter(
                    (profile) => profile.id !== currentProfile.id
                )
            );

            if (data.matched && data.match) {
                setNewMatch(data.match);
                await loadMatches();
            }

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save swipe. Please try again."
            );
        } finally {
            setBusy(false);
        }
    };

    const changeTab = (tab) => {
        setActiveTab(tab);

        if (tab === "matches") {
            loadMatches();
        }
    };

    return (
        <div className="app">

            <Navbar
                activeTab={activeTab}
                onTabChange={changeTab}
            />

            <main className="main-content">

                {activeTab === "home" && (
                    <Home />
                )}

                {activeTab === "discover" && (
                    <section className="discover-page">

                        <div className="page-heading">
                            <h1>Discover</h1>
                            <p>
                                Find people who share your interests.
                            </p>
                        </div>

                        {loading ? (
                            <div className="empty-state">
                                Loading profiles...
                            </div>
                        ) : error ? (
                            <div className="empty-state">
                                <p>{error}</p>
                                <button
                                    className="continue-button"
                                    onClick={loadFeed}
                                >
                                    Try again
                                </button>
                            </div>
                        ) : profiles.length === 0 ? (
                            <div className="empty-state">
                                <h2>No more profiles!</h2>
                                <p>
                                    You've discovered everyone available.
                                </p>
                            </div>
                        ) : (
                            <ProfileCard
                                profile={profiles[0]}
                                onSwipe={handleSwipe}
                                busy={busy}
                            />
                        )}

                    </section>
                )}

                {activeTab === "matches" && (
                    <Matches key="matches" />
                )}

            </main>

            <MatchModal
                match={newMatch}
                onClose={() => setNewMatch(null)}
            />

            <footer className="app-footer">
                Discover · Find your connection
            </footer>

        </div>
    );
}

export default App;
