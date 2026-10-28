export default function Card({
  children,
  className = "",
  header = null,
  footer = null,
  padding = true,
  onClick = null,
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all ${
        onClick ? "cursor-pointer hover:shadow-md hover:border-slate-300" : ""
      } ${className}`}
    >
      {header && (
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          {header}
        </div>
      )}
      <div className={padding ? "p-6" : ""}>{children}</div>
      {footer && (
        <div className="px-6 py-3.5 bg-slate-50/50 border-t border-slate-100 rounded-b-xl flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
}
