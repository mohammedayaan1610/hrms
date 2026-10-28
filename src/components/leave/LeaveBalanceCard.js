export default function LeaveBalanceCard({
  title,
  available,
  total = 5,
  used = 0,
  pending = 0,
  icon = null,
  accentColor = "indigo", // "emerald" | "amber" | "indigo" | "slate"
}) {
  const percentage = Math.min(100, Math.round(((total - available) / total) * 100));

  const colorVariants = {
    indigo: {
      border: "hover:border-indigo-200",
      bgBadge: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
      bar: "bg-indigo-600",
      iconBg: "bg-indigo-50 text-indigo-600",
    },
    emerald: {
      border: "hover:border-emerald-200",
      bgBadge: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
      bar: "bg-emerald-600",
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    amber: {
      border: "hover:border-amber-200",
      bgBadge: "bg-amber-50 text-amber-700 border-amber-200/60",
      bar: "bg-amber-500",
      iconBg: "bg-amber-50 text-amber-600",
    },
    slate: {
      border: "hover:border-slate-300",
      bgBadge: "bg-slate-100 text-slate-800 border-slate-200",
      bar: "bg-slate-800",
      iconBg: "bg-slate-100 text-slate-700",
    },
  };

  const scheme = colorVariants[accentColor] || colorVariants.slate;

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-150 ${scheme.border} hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-slate-900">
              {available}
            </span>
            <span className="text-sm font-medium text-slate-400">/ {total} days</span>
          </div>
        </div>
        <div className={`p-2.5 rounded-lg ${scheme.iconBg}`}>
          {icon || (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${scheme.bar}`}
            style={{ width: `${Math.max(5, 100 - percentage)}%` }}
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Used: <strong className="text-slate-700 font-medium">{used}</strong></span>
        {pending > 0 && (
          <span className="text-amber-600 font-medium">
            Pending: {pending}
          </span>
        )}
        <span>Available: <strong className="text-slate-900 font-semibold">{available}</strong></span>
      </div>
    </div>
  );
}
