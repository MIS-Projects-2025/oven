// 🔹 Summary Card Component
function SummaryCard({ title, value, color, icon, onClick, tooltip }) {
  return (
    <div
      onClick={onClick}
      title={tooltip} // simpleng HTML tooltip
      className={`${color} cursor-pointer rounded-xl p-5 shadow-md
        hover:shadow-lg hover:scale-[1.02] transition-all duration-200`}
    >
      <div className={`p-4 ${color} rounded-lg shadow text-gray-700`}>
        <div>{icon}</div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-3xl font-bold flex justify-end">{value}</p>
      </div>
    </div>
  );
}