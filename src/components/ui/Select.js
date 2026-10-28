"use client";

import { forwardRef } from "react";

const Select = forwardRef(function Select(
  {
    label,
    id,
    options = [],
    error,
    helperText,
    className = "",
    required = false,
    placeholder = "Select an option",
    ...props
  },
  ref
) {
  const selectId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        <select
          ref={ref}
          id={selectId}
          required={required}
          className={`block w-full appearance-none rounded-lg border text-sm transition-colors duration-150 py-2.5 pl-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-500 bg-white ${
            error
              ? "border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-200"
              : "border-slate-300 text-slate-900 focus:border-slate-800 focus:ring-slate-200"
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const value = typeof opt === "object" ? opt.value : opt;
            const labelText = typeof opt === "object" ? opt.label : opt;
            return (
              <option key={value} value={value}>
                {labelText}
              </option>
            );
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>}
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
});

export default Select;
