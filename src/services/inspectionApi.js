const API_BASE_URL = "http://127.0.0.1:5000/api";

export const uploadAndInspectImage = async (file, batchId = "TF-APL-2026-001", nodeId = "TF-NODE-01") => {
  try {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("batchId", batchId);
    formData.append("nodeId", nodeId);
    formData.append("source", "UPLOAD");

    const res = await fetch(`${API_BASE_URL}/inspect`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Image inspection failed");
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error("Error uploading and inspecting image:", err);
    return null;
  }
};

export const runDemoInspection = async (scenario = "HEALTHY", batchId = "TF-APL-2026-001", nodeId = "TF-NODE-01") => {
  try {
    const res = await fetch(`${API_BASE_URL}/inspect/demo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ scenario, batchId, nodeId })
    });
    if (!res.ok) throw new Error("Demo inspection failed");
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error("Error running demo inspection:", err);
    return null;
  }
};

export const getBatchInspectionHistory = async (batchId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/inspect/batch/${batchId}`);
    if (!res.ok) throw new Error(`Failed to fetch inspection history for batch ${batchId}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error(`Error fetching inspection history for batch ${batchId}:`, err);
    return [];
  }
};

export const getInspectionById = async (inspectionId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/inspect/${inspectionId}`);
    if (!res.ok) throw new Error(`Failed to fetch inspection ${inspectionId}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error(`Error fetching inspection ${inspectionId}:`, err);
    return null;
  }
};
