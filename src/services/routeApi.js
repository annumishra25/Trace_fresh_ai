const API_BASE_URL = "http://127.0.0.1:5000/api";

export const getRoutes = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/routes`);
    if (!res.ok) throw new Error("Failed to fetch routes");
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error("Error fetching routes:", err);
    return [];
  }
};

export const getRouteById = async (routeId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/routes/${routeId}`);
    if (!res.ok) throw new Error(`Failed to fetch route ${routeId}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error(`Error fetching route ${routeId}:`, err);
    return null;
  }
};

export const getRouteTrack = async (routeId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/routes/${routeId}/track`);
    if (!res.ok) throw new Error(`Failed to fetch track for ${routeId}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error(`Error fetching route track ${routeId}:`, err);
    return [];
  }
};

export const getRouteStatus = async (routeId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/routes/${routeId}/status`);
    if (!res.ok) throw new Error(`Failed to fetch status for ${routeId}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error(`Error fetching route status ${routeId}:`, err);
    return null;
  }
};

export const getRouteEvents = async (routeId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/routes/${routeId}/events`);
    if (!res.ok) throw new Error(`Failed to fetch events for ${routeId}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error(`Error fetching route events ${routeId}:`, err);
    return [];
  }
};

export const triggerDemoReplay = async (routeId, stepIndex) => {
  try {
    const res = await fetch(`${API_BASE_URL}/routes/${routeId}/replay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ stepIndex })
    });
    if (!res.ok) throw new Error("Failed to trigger demo replay step");
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error("Error triggering demo replay:", err);
    return null;
  }
};
