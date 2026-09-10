import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import "./index.css";

import { SensorProvider } from "./context/SensorContext";
import { TelemetryProvider } from "./context/TelemetryContext";
import { MonitoringBatchProvider } from "./context/MonitoringBatchContext";

createRoot(document.getElementById("root")).render(
  <TelemetryProvider>
    <SensorProvider>
      <MonitoringBatchProvider>
        <App />
      </MonitoringBatchProvider>
    </SensorProvider>
  </TelemetryProvider>
);