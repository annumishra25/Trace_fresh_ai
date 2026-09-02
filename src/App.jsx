import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "./layout/DashboardLayout";

import Overview from "./pages/Overview";
import Monitoring from "./pages/Monitoring";
import Analytics from "./pages/Analytics";
import Devices from "./pages/Devices";
import Traceability from "./pages/Traceability";
import QRCodeCenter from "./pages/QRCodeCenter";
import Settings from "./pages/Settings";
import Warehouse from "./pages/Warehouse";
import ConsumerPortal from "./pages/ConsumerPortal";
import Logistics from "./pages/Logistics";

// NEW: QR-driven public batch passport page
import BatchPassport from "./pages/BatchPassport";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =========================
            PUBLIC QR / CUSTOMER ROUTE
            ========================= */}
        <Route path="/passport/:batchId" element={<BatchPassport />} />

        {/* =========================
            DASHBOARD ROUTES
            ========================= */}
        <Route
          path="*"
          element={
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/monitoring" element={<Monitoring />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/devices" element={<Devices />} />
                <Route path="/traceability" element={<Traceability />} />
                <Route path="/qrcode" element={<QRCodeCenter />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/warehouse" element={<Warehouse />} />
                <Route path="/consumer" element={<ConsumerPortal />} />
                <Route path="/logistics" element={<Logistics />} />
              </Routes>
            </DashboardLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;