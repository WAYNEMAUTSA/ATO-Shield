function StatCard({ label, value, change, icon: Icon, tone = "default" }) {
  const tones = {
    default: "text-slate-100",
    danger: "text-red-400",
    warning: "text-amber-400",
    success: "text-emerald-400",
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
        {Icon && <Icon size={16} className="text-slate-600" />}
      </div>
      <p className={`text-2xl font-semibold ${tones[tone]}`}>{value}</p>
      {change && <p className="text-xs text-slate-500 mt-1">{change}</p>}
    </div>
  );
}

export default StatCard;