import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-[#F7F8F3] dark:bg-[#071A15] text-[#101513] dark:text-[#F4F7F2] antialiased overflow-hidden relative">
      <Sidebar />

      <main className="ml-64 flex-1 h-screen overflow-y-auto bg-[#F7F8F3] dark:bg-[#071A15] relative z-10 bg-grid-pattern">
        <Topbar />

        <div className="p-6 md:p-8 space-y-6 max-w-[1700px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;