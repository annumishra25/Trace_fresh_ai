import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export function DashboardLayout({ children }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 antialiased overflow-hidden relative">
      {/* Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="lg:ml-64 flex-1 h-screen overflow-y-auto bg-[#F8FAFC] relative z-10 bg-grid-pattern flex flex-col">
        <Topbar onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1700px] w-full mx-auto pb-16 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;