function Logistics() {
  return (
    <div className="space-y-6">

      <h1 className="text-4xl font-bold">
        Logistics Intelligence Center
      </h1>

      {/* Logistics KPIs */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="bg-white rounded-2xl shadow-md p-5">
          <h3 className="text-gray-500">
            Active Vehicles
          </h3>

          <p className="text-4xl font-bold text-blue-600">
            12
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5">
          <h3 className="text-gray-500">
            Deliveries Today
          </h3>

          <p className="text-4xl font-bold text-green-600">
            84
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5">
          <h3 className="text-gray-500">
            Cold Chain Compliance
          </h3>

          <p className="text-4xl font-bold text-green-600">
            98%
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-5">
          <h3 className="text-gray-500">
            Logistics Alerts
          </h3>

          <p className="text-4xl font-bold text-red-500">
            2
          </p>
        </div>

      </div>

      {/* Vehicle Tracking */}

      <div className="bg-white rounded-2xl shadow-md p-6">

        <h2 className="text-2xl font-bold mb-4">
          Active Vehicle Tracking
        </h2>

        <div className="grid md:grid-cols-4 gap-4">

          <div>
            <p className="text-gray-500">
              Vehicle ID
            </p>

            <p className="font-bold">
              TF-TRUCK-01
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Current Location
            </p>

            <p className="font-bold">
              Chennai
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              ETA
            </p>

            <p className="font-bold">
              02:15 Hours
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Status
            </p>

            <p className="font-bold text-green-600">
              IN TRANSIT
            </p>
          </div>

        </div>

      </div>

      {/* Cold Chain Conditions */}

      <div className="bg-white rounded-2xl shadow-md p-6">

        <h2 className="text-2xl font-bold mb-4">
          Cold Chain Conditions
        </h2>

        <div className="grid md:grid-cols-4 gap-4">

          <div>
            <p className="text-gray-500">
              Cargo Temperature
            </p>

            <p className="font-bold">
              4.5°C
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Cargo Humidity
            </p>

            <p className="font-bold">
              92%
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Compliance
            </p>

            <p className="font-bold text-green-600">
              PASS
            </p>
          </div>

          <div>
            <p className="text-gray-500">
              Risk
            </p>

            <p className="font-bold text-green-600">
              LOW
            </p>
          </div>

        </div>

      </div>

      {/* Logistics Alerts */}

      <div className="bg-white rounded-2xl shadow-md p-6">

        <h2 className="text-2xl font-bold mb-4">
          Logistics Alerts
        </h2>

        <div className="space-y-3">

          <div className="bg-yellow-50 p-4 rounded-xl">
            Vehicle TF-TRUCK-03 delayed by 30 minutes.
          </div>

          <div className="bg-red-50 p-4 rounded-xl">
            Cargo temperature exceeded threshold for 5 minutes.
          </div>

        </div>

      </div>

    </div>
  );
}

export default Logistics;