import {
  Bell,
  Wifi,
  Clock3
} from "lucide-react";

function Topbar() {

  const currentTime = new Date().toLocaleString();

  return (
    <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">

      {/* Title */}

      <div>

        <h2 className="text-2xl font-bold">
          TraceFresh AI Dashboard
        </h2>

        <p className="text-sm text-gray-500">
          Real-Time Food Quality Intelligence Platform
        </p>

      </div>

      {/* Right Side */}

      <div className="flex items-center gap-6">

        {/* Clock */}

        <div className="flex items-center gap-2 text-gray-600">

          <Clock3 size={18} />

          <span className="text-sm">
            {currentTime}
          </span>

        </div>

        {/* Alerts */}

        <div className="relative cursor-pointer">

          <Bell size={22} />

          <span
            className="
              absolute
              -top-2
              -right-2
              bg-red-500
              text-white
              text-xs
              rounded-full
              px-2
            "
          >
            2
          </span>

        </div>

        {/* Connectivity */}

        <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-xl">

          <Wifi
            size={18}
            className="text-green-600"
          />

          <span className="text-green-700 font-medium">
            Online
          </span>

        </div>

        {/* User */}

        <div className="bg-slate-900 text-white px-4 py-2 rounded-xl font-semibold">

          Admin

        </div>

      </div>

    </div>
  );
}

export default Topbar;