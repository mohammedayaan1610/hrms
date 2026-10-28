"use client";

import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LeaveApplicationForm from "@/components/leave/LeaveApplicationForm";
import LeaveBalanceCard from "@/components/leave/LeaveBalanceCard";
import Card from "@/components/ui/Card";
import { useHrms } from "@/context/HrmsContext";

export default function ApplyLeavePage() {
  const router = useRouter();
  const { employeeProfile, submitLeaveRequest } = useHrms();
  const balance = employeeProfile.leaveBalance;

  const handleSubmit = async (formData) => {
    const result = await submitLeaveRequest(formData);
    if (!result.success) {
      throw new Error(result.error || "Submission failed");
    }
  };

  return (
    <DashboardLayout
      title="Apply for Leave"
      subtitle="Submit a formal leave absence request for managerial approval"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Application Form (2 cols) */}
        <div className="lg:col-span-2">
          <Card
            header={
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Leave Application Form
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete all required fields accurately. Once approved, the days will be deducted.
                </p>
              </div>
            }
          >
            <LeaveApplicationForm
              leaveBalance={balance}
              onSubmit={handleSubmit}
              onCancel={() => router.push("/employee/leave")}
            />
          </Card>
        </div>

        {/* Right Sidebar: Current Available Balance & Policies */}
        <div className="space-y-6">
          <Card
            header={
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Your Available Leave Balances
                </h4>
                <p className="text-xs text-slate-500">Real-time quota allowance</p>
              </div>
            }
          >
            <div className="space-y-3.5">
              {/* Casual */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Casual Leave
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    {balance.casual.used} used • {balance.casual.pending} pending
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-indigo-600">
                    {balance.casual.available}
                  </span>
                  <span className="text-xs text-slate-400"> / 5 days</span>
                </div>
              </div>

              {/* Sick */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Sick Leave
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    {balance.sick.used} used • {balance.sick.pending} pending
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-amber-600">
                    {balance.sick.available}
                  </span>
                  <span className="text-xs text-slate-400"> / 5 days</span>
                </div>
              </div>

              {/* Medical */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Medical Leave
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    {balance.medical.used} used • {balance.medical.pending} pending
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-emerald-600">
                    {balance.medical.available}
                  </span>
                  <span className="text-xs text-slate-400"> / 5 days</span>
                </div>
              </div>

              {/* Total Quota Total */}
              <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Total Remaining Quota
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {balance.total.available} days
                </span>
              </div>
            </div>
          </Card>

          {/* HR Leave Guidelines */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Leave Policy Guidelines
            </h5>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
              <li>
                Casual leaves must be submitted <strong>3 days</strong> in advance.
              </li>
              <li>
                Sick leaves can be applied retroactively within 48 hours of return.
              </li>
              <li>
                Medical leaves exceeding 2 consecutive days require medical certificate attachment upon resumption.
              </li>
              <li>
                Weekend days do not deduct from your quota count.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
