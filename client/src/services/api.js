
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000","https://coy-discover-teyo.onrender.com",
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
