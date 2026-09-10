import { API_BASE_URL } from "../config/appConfig";

export const loginUser = async (username, password) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || "Authentication failed");
    }

    return json.data;
  } catch (err) {
    if (err.name === "TypeError" || err.message.includes("Failed to fetch")) {
      throw new Error(`Unable to connect to TraceFresh backend at ${API_BASE_URL}. Please verify that the Flask backend (python backend/app.py) is running.`);
    }
    console.error("Login API Error:", err);
    throw err;
  }
};

export const getCurrentUser = async (token) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || "Failed to fetch user profile");
    }

    return json.data;
  } catch (err) {
    console.error("Get Current User API Error:", err);
    return null;
  }
};
