"use client";

import { forwardRef } from "react";

const Input = forwardRef(function Input(
  {
    label,
    id,
    type = "text",
    error,
    helperText,
    icon = null,
    rightElement = null,
    className = "",
    required = false,
    ...props
  },
  ref
) {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          className={`block w-full rounded-lg border text-sm transition-colors duration-150 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-500 ${
            icon ? "pl-10" : "pl-3.5"
          } ${rightElement ? "pr-10" : "pr-3.5"} py-2.5 ${
            error
              ? "border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-200"
              : "border-slate-300 text-slate-900 focus:border-slate-800 focus:ring-slate-200"
          } ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10 pointer-events-auto">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>}
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
});

export default Input;
