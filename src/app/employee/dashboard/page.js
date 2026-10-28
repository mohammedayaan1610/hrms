"use client";

import Link from "next/link";
import { useHrms } from "@/context/HrmsContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LeaveBalanceCard from "@/components/leave/LeaveBalanceCard";
import LeaveRequestTable from "@/components/leave/LeaveRequestTable";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function EmployeeDashboard() {
  const { employeeProfile, leaveRequests } = useHrms();

  const balance = employeeProfile.leaveBalance;

  // Filter requests belonging to this employee
  const myRequests = leaveRequests.filter((r) => {
    if (!employeeProfile?.id) return false;
    const cleanProfileId = employeeProfile.id.replace("-", "");
    const cleanReqId = (r.employeeId || "").replace("-", "");
    return r.employeeId === employeeProfile.id || cleanProfileId === cleanReqId;
  });

  const pendingCount = myRequests.filter((r) => r.status === "Pending").length;
  const approvedCount = myRequests.filter((r) => r.status === "Approved").length;
  const rejectedCount = myRequests.filter((r) => r.status === "Rejected").length;

  return (
    <DashboardLayout
      title="Employee Dashboard"
      subtitle="Overview of your leave entitlements, balance metrics, and active requests"
    >
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={employeeProfile.avatar}
              alt={employeeProfile.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-indigo-400 ring-4 ring-white/10"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                  Welcome back
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight mt-0.5">
                {employeeProfile.name}
              </h2>
              <p className="text-sm text-slate-300">
                {employeeProfile.designation} • {employeeProfile.department}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/employee/leave/apply">
              <Button
                variant="primary"
                className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md border-0"
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Apply for Leave
              </Button>
            </Link>
            <Link href="/employee/profile">
              <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-white/10">
                View Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Leave Balance Section (4 Cards as requested) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">
              Leave Quota & Balances
            </h3>
            <span className="text-xs text-slate-500">
              Allocated for Calendar Year 2026
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <LeaveBalanceCard
              title="Casual Leave"
              available={balance.casual.available}
              total={balance.casual.total}
              used={balance.casual.used}
              pending={balance.casual.pending}
              accentColor="indigo"
              icon={
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <LeaveBalanceCard
              title="Sick Leave"
              available={balance.sick.available}
              total={balance.sick.total}
              used={balance.sick.used}
              pending={balance.sick.pending}
              accentColor="amber"
              icon={
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              }
            />

            <LeaveBalanceCard
              title="Medical Leave"
              available={balance.medical.available}
              total={balance.medical.total}
              used={balance.medical.used}
              pending={balance.medical.pending}
              accentColor="emerald"
              icon={
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              }
            />

            <LeaveBalanceCard
              title="Total Leave"
              available={balance.total.available}
              total={balance.total.total}
              used={balance.total.used}
              pending={balance.total.pending}
              accentColor="slate"
              icon={
                <svg className="w-5 h-5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
          </div>
        </div>

        {/* Leave Overview Section with Progress Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card
            className="lg:col-span-2"
            header={
              <div className="flex items-center justify-between w-full">
                <h4 className="font-bold text-slate-900 text-sm">
                  Leave Utilization Overview
                </h4>
                <span className="text-xs text-slate-500 font-medium">
                  {balance.total.available} of 15 days remaining
                </span>
              </div>
            }
          >
            <div className="space-y-6">
              {/* Stacked Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-2">
                  <span>Annual Quota Consumption</span>
                  <span>
                    {Math.round((balance.total.used / balance.total.total) * 100)}% used
                  </span>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                  {/* Used segment */}
                  <div
                    style={{
                      width: `${(balance.total.used / balance.total.total) * 100}%`,
                    }}
                    className="bg-indigo-600 transition-all duration-300"
                    title={`Used: ${balance.total.used} days`}
                  />
                  {/* Pending segment */}
                  <div
                    style={{
                      width: `${(balance.total.pending / balance.total.total) * 100}%`,
                    }}
                    className="bg-amber-400 transition-all duration-300"
                    title={`Pending: ${balance.total.pending} days`}
                  />
                  {/* Available segment */}
                  <div
                    style={{
                      width: `${(balance.total.available / balance.total.total) * 100}%`,
                    }}
                    className="bg-slate-200 transition-all duration-300"
                    title={`Available: ${balance.total.available} days`}
                  />
                </div>
              </div>

              {/* Stat breakdown pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-500 block">Total Allocated</span>
                  <span className="text-lg font-bold text-slate-900">
                    {balance.total.total} <span className="text-xs font-normal text-slate-400">days</span>
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100">
                  <span className="text-xs text-indigo-600 font-medium block">Approved & Used</span>
                  <span className="text-lg font-bold text-indigo-900">
                    {balance.total.used} <span className="text-xs font-normal text-indigo-400">days</span>
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                  <span className="text-xs text-amber-700 font-medium block">Under Review</span>
                  <span className="text-lg font-bold text-amber-900">
                    {balance.total.pending} <span className="text-xs font-normal text-amber-500">days</span>
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                  <span className="text-xs text-emerald-700 font-medium block">Available</span>
                  <span className="text-lg font-bold text-emerald-900">
                    {balance.total.available} <span className="text-xs font-normal text-emerald-500">days</span>
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Request Stats & Guideline */}
          <Card
            header={
              <h4 className="font-bold text-slate-900 text-sm">
                Request Activity Summary
              </h4>
            }
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <span className="text-xs font-medium text-slate-600">Pending Approvals</span>
                <span className="font-bold text-amber-600 text-sm">{pendingCount}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <span className="text-xs font-medium text-slate-600">Approved Leaves</span>
                <span className="font-bold text-emerald-600 text-sm">{approvedCount}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <span className="text-xs font-medium text-slate-600">Rejected Requests</span>
                <span className="font-bold text-rose-600 text-sm">{rejectedCount}</span>
              </div>

              <div className="pt-2 text-xs text-slate-500 border-t border-slate-100">
                <p className="leading-relaxed">
                  💡 <strong>Tip:</strong> Planned leaves should be requested at least 3 business days in advance to ensure smooth handover coverage.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Leave Requests Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Recent Leave Requests
              </h3>
              <p className="text-xs text-slate-500">
                Status of your submitted applications
              </p>
            </div>
            <Link
              href="/employee/leave"
              className="text-xs font-semibold text-slate-900 hover:text-indigo-600 underline underline-offset-4"
            >
              View Full History →
            </Link>
          </div>

          <LeaveRequestTable
            requests={myRequests.slice(0, 5)}
            showReason={true}
            showAppliedOn={true}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
