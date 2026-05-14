const StatCard = ({ title, value, subtitle }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-800">{value}</div>
      {subtitle ? <div className="mt-1 text-xs text-gray-400">{subtitle}</div> : null}
    </div>
  );
};

export default StatCard;
