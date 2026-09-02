function HealthBar({ value }) {
  return (
    <div>

      <div className="flex justify-between mb-2">

        <span>Health</span>

        <span>{value}%</span>

      </div>

      <div className="bg-gray-200 h-3 rounded-full">

        <div
          className="bg-green-500 h-3 rounded-full"
          style={{
            width: `${value}%`,
          }}
        />

      </div>

    </div>
  );
}

export default HealthBar;