import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">

      <Sidebar />

      <main
        className="
          ml-64
          flex-1
          h-screen
          overflow-y-auto
          bg-slate-100
        "
      >

        <Topbar />

        <div className="p-6">
          {children}
        </div>

      </main>

    </div>
  );
}

export default DashboardLayout;