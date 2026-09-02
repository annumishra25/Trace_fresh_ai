function StatusBadge({ status }) {

  const colors = {
    ONLINE: "bg-green-100 text-green-700",
    WARNING: "bg-yellow-100 text-yellow-700",
    OFFLINE: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full font-semibold ${colors[status]}`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;