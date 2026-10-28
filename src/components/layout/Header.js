"use client";

import { useSession } from "next-auth/react";
import Badge from "@/components/ui/Badge";
import Link from "next/link";

export default function Header({ onMenuClick, title, subtitle }) {
  const { data: session } = useSession();

  const userRole = session?.user?.role || "employee";
  const userName = session?.user?.name || "User";
  const userEmpId = session?.user?.employeeId || "EMP-001";

  const todayStr = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & Page Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg lg:hidden focus:outline-none"
            aria-label="Open mobile navigation"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div>
            {title && (
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right Side: Date, Role Pill, Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Current Date Display */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60 font-medium">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{todayStr}</span>
          </div>

          {/* Role Indicator Badge */}
          <Badge
            variant={userRole === "admin" ? "purple" : "info"}
            size="sm"
          >
            {userRole === "admin" ? "Admin Mode" : "Employee"}
          </Badge>

          {/* Quick Profile Link */}
          <Link
            href={userRole === "admin" ? "/admin/dashboard" : "/employee/profile"}
            className="flex items-center gap-2.5 pl-2 sm:border-l sm:border-slate-200"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center border border-slate-700">
              {userName?.charAt(0) || "U"}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                {userName}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                {userEmpId}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
