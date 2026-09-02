function Traceability() {
  return (
    <div className="space-y-6">

      <h1 className="text-4xl font-bold">
        Product Traceability
      </h1>

      {/* Product Summary */}

      <div className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-2xl font-bold mb-4">
          Product Information
        </h2>

        <div className="grid grid-cols-2 gap-4">

          <p><strong>Batch ID:</strong> TF-APPLE-001</p>

          <p><strong>Product:</strong> Apple</p>

          <p><strong>Origin Farm:</strong> Coimbatore Farm</p>

          <p><strong>Harvest Date:</strong> 18 June 2026</p>

          <p><strong>Current Location:</strong> Chennai Retail Store</p>

          <p><strong>Last Updated:</strong> 19 June 2026 02:45 PM</p>

        </div>

      </div>

      {/* Quality Card */}

      <div className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-2xl font-bold mb-4">
          Quality Assessment
        </h2>

        <div className="grid grid-cols-4 gap-4">

          <div>
            <h3 className="text-gray-500">Health Score</h3>
            <p className="text-3xl font-bold text-green-600">
              94/100
            </p>
          </div>

          <div>
            <h3 className="text-gray-500">Freshness</h3>
            <p className="text-3xl font-bold text-green-600">
              Fresh
            </p>
          </div>

          <div>
            <h3 className="text-gray-500">Confidence</h3>
            <p className="text-3xl font-bold">
              96.4%
            </p>
          </div>

          <div>
            <h3 className="text-gray-500">Status</h3>
            <p className="text-3xl font-bold text-green-600">
              SAFE
            </p>
          </div>

        </div>

      </div>

      {/* Journey */}

      <div className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-2xl font-bold mb-4">
          Product Journey
        </h2>

        <div className="space-y-3">

          <p>🌱 Harvested at Coimbatore Farm</p>

          <p>📦 Quality Checked & Packed</p>

          <p>🚚 Transported Under Controlled Conditions</p>

          <p>🏬 Stored at Distribution Center</p>

          <p>🛒 Delivered to Retail Store</p>

        </div>

      </div>

      {/* Storage Conditions */}

      <div className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-2xl font-bold mb-4">
          Storage Conditions
        </h2>

        <div className="grid grid-cols-3 gap-4">

          <div>
            <h3>Temperature</h3>
            <p>24.8°C</p>
          </div>

          <div>
            <h3>Humidity</h3>
            <p>62%</p>
          </div>

          <div>
            <h3>Ethylene</h3>
            <p>0.21 ppm</p>
          </div>

        </div>

      </div>

      {/* AI Inspection */}

      <div className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-2xl font-bold mb-4">
          AI Inspection Report
        </h2>

        <p>
          Latest inspection indicates the fruit is in
          fresh condition with low spoilage risk.
          Environmental parameters remain within
          acceptable limits.
        </p>

      </div>

      {/* Sustainability */}

      <div className="bg-white rounded-2xl shadow p-6">

        <h2 className="text-2xl font-bold mb-4">
          Sustainability Information
        </h2>

        <p>Food Waste Risk: Low</p>

        <p>Estimated Shelf Life Remaining: 9 Days</p>

        <p>Supply Chain Compliance: Verified</p>

      </div>

    </div>
  );
}

export default Traceability;