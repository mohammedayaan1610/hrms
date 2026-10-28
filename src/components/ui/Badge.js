export default function Badge({
  children,
  variant = "default", // default | success | warning | danger | info | neutral
  size = "md", // sm | md
  className = "",
  dot = false,
}) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-xs font-semibold",
  };

  const variantClasses = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    warning: "bg-amber-50 text-amber-800 border-amber-200/60",
    danger: "bg-rose-50 text-rose-700 border-rose-200/60",
    info: "bg-blue-50 text-blue-700 border-blue-200/60",
    purple: "bg-purple-50 text-purple-700 border-purple-200/60",
    neutral: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const dotColors = {
    default: "bg-slate-400",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-blue-500",
    purple: "bg-purple-500",
    neutral: "bg-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${
        variantClasses[variant] || variantClasses.default
      } ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            dotColors[variant] || dotColors.default
          }`}
        />
      )}
      {children}
    </span>
  );
}
