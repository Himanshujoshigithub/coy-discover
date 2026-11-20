
import axios from "axios";

// Use localhost for local development
// Use Render for the deployed Vercel frontend
const API_BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000"
        : "https://coy-discover-teyo.onrender.com";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// Fetch available profiles
export const getFeed = async () => {
    const response = await api.get("/feed");
    return response.data;
};

// Save like or pass
export const submitSwipe = async (toUserId, action) => {
    const response = await api.post("/swipe", {
        toUserId,
        action
    });

    return response.data;
};

// Fetch mutual matches
export const getMatches = async () => {
    const response = await api.get("/matches");
    return response.data;
};

export default api;
