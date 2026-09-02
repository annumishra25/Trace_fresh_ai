function MetricCard({
  title,
  value,
  unit,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5">

      <h3 className="text-gray-500 text-sm">
        {title}
      </h3>

      <div className="flex items-end gap-2 mt-2">

        <span className="text-4xl font-bold">
          {value}
        </span>

        <span className="text-gray-500">
          {unit}
        </span>

      </div>

    </div>
  );
}

export default MetricCard;