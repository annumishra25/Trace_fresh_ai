import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import "./index.css";

import { SensorProvider }
from "./context/SensorContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>

    <SensorProvider>

      <App />

    </SensorProvider>

  </StrictMode>
);