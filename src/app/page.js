import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              H
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-lg">
              HRMS Pulse
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center flex-1 flex flex-col justify-center items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-xs font-semibold text-indigo-700 mb-6">
          <span className="w-2 h-2 rounded-full bg-indigo-600" />
          Enterprise Human Resource Management
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          HRMS Pulse
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
          A secure, unified platform for workforce records, leave management, and organizational administration.
        </p>

        <div className="mt-8 flex items-center justify-center">
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition shadow-md text-sm"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          HRMS Pulse • Enterprise Human Resource Management
        </div>
      </footer>
    </main>
  );
}