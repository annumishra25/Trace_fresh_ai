import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-[#03140e] text-white antialiased overflow-hidden relative selection:bg-emerald-500 selection:text-black">
      {/* Ambient Glowing Background Accents */}
      <div className="fixed top-0 left-64 w-[600px] h-[600px] bg-emerald-600/15 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-green-500/10 rounded-full blur-[160px] pointer-events-none z-0"></div>

      <Sidebar />

      <main className="ml-64 flex-1 h-screen overflow-y-auto bg-[#061d15]/90 text-white relative z-10 bg-grid-pattern">
        <Topbar />

        <div className="p-6 md:p-8 space-y-6 max-w-[1700px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;