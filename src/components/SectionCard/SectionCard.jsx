function SectionCard({
  title,
  children,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6">

      <h2 className="text-2xl font-bold mb-5">
        {title}
      </h2>

      {children}

    </div>
  );
}

export default SectionCard;