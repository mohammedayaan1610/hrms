
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("1. LOGIN HANDLER FIRED");

    if (loading) return;

    setError("");

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      console.log("2. CALLING NEXTAUTH SIGN-IN");

      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      console.log("3. SIGN-IN RESULT", {
        ok: res?.ok,
        error: res?.error,
        status: res?.status,
        url: res?.url,
      });

      if (!res?.ok || res.error) {
        setError("Invalid email or password.");
        return;
      }

      console.log("4. FETCHING AUTHENTICATED SESSION");

      const sessionRes = await fetch("/api/auth/session", {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });

      if (!sessionRes.ok) {
        throw new Error("Failed to retrieve the authenticated session.");
      }

      const session = await sessionRes.json();

      console.log("5. SESSION STATUS", {
        authenticated: Boolean(session?.user),
        role: session?.user?.role,
      });

      if (!session?.user?.role) {
        setError(
          "Sign-in succeeded, but your session could not be verified. Please try again."
        );
        return;
      }

      const targetUrl =
        session.user.role === "admin"
          ? "/admin/dashboard"
          : "/employee/dashboard";

      console.log("6. REDIRECTING TO", targetUrl);

      // Use a full browser navigation so the destination is loaded afresh.
      window.location.assign(targetUrl);
    } catch (err) {
      console.error("LOGIN FLOW ERROR:", err);
      setError("Unable to complete sign-in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo */}
        <div className="mx-auto w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-xl shadow-md">
          H
        </div>

        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Sign in to HRMS Pulse
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Enter your workplace credentials to access your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200/80">
          {/* Error Alert */}
          {error && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4 text-rose-500 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="w-full">
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
              >
                Work Email Address{" "}
                <span className="text-rose-500 ml-1">*</span>
              </label>

              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="block w-full rounded-lg border border-slate-300 text-sm text-slate-900 transition-colors duration-150 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-slate-800 focus:ring-slate-200 pl-10 pr-3.5 py-2.5"
                />
              </div>
            </div>

            {/* Password */}
            <div className="w-full">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5"
              >
                Password <span className="text-rose-500 ml-1">*</span>
              </label>

              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-slate-300 text-sm text-slate-900 transition-colors duration-150 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-slate-800 focus:ring-slate-200 pl-10 pr-10 py-2.5"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none z-10"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Signing in..." : "Sign In to HRMS"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>
              Enterprise security with encrypted credential verification.
            </span>
          </div>
        </div>

        {/* Back to Home Link */}
        <p className="mt-6 text-center text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-800 underline">
            ← Return to Overview
          </Link>
        </p>
      </div>
    </div>
  );
}
