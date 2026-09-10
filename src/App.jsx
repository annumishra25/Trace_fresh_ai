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

import BatchPassport from "./pages/BatchPassport";
import PublicVerification from "./pages/PublicVerification";
import Login from "./pages/Login";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* =========================
                PUBLIC UNAUTHENTICATED ROUTES
                ========================= */}
            <Route path="/login" element={<Login />} />
            <Route path="/passport/:batchId" element={<BatchPassport />} />
            <Route path="/verify/:publicToken" element={<PublicVerification />} />
            <Route path="/verify" element={<PublicVerification />} />

            {/* =========================
                PROTECTED DASHBOARD ROUTES
                ========================= */}
            <Route
              path="*"
              element={
                <ProtectedRoute>
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
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;