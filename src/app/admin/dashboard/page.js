"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useHrms } from "@/context/HrmsContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import LeaveStatusBadge from "@/components/leave/LeaveStatusBadge";

export default function AdminDashboardPage() {
  const { employees, leaveRequests, activities, approveLeaveRequest, rejectLeaveRequest } = useHrms();

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectModalReq, setRejectModalReq] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Statistics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === "Active").length;
  const pendingRequests = leaveRequests.filter((r) => r.status === "Pending");
  const approvedRequests = leaveRequests.filter((r) => r.status === "Approved");

  const handleApprove = (id) => {
    approveLeaveRequest(id);
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest((prev) => ({ ...prev, status: "Approved" }));
    }
  };

  const handleOpenReject = (req) => {
    setRejectModalReq(req);
    setRejectReason("Operational workload requirements during this time.");
  };

  const handleConfirmReject = () => {
    if (rejectModalReq) {
      rejectLeaveRequest(rejectModalReq.id, rejectReason);
      if (selectedRequest && selectedRequest.id === rejectModalReq.id) {
        setSelectedRequest((prev) => ({ ...prev, status: "Rejected" }));
      }
      setRejectModalReq(null);
      setRejectReason("");
    }
  };

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="People Operations oversight, workforce metrics, and pending approvals"
    >
      <div className="space-y-8">
        {/* Metric Cards (Total Employees, Active, Pending Requests, Approved Leaves) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Employees */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Employees
              </span>
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {totalEmployees}
              </span>
              <span className="text-xs text-slate-500 font-medium">Headcount</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold">100%</span>
              <span>onboarded</span>
            </div>
          </div>

          {/* Card 2: Active Employees */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Staff
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {activeEmployees}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {totalEmployees - activeEmployees} on leave
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span className="text-emerald-600 font-medium">
                {Math.round((activeEmployees / totalEmployees) * 100)}% attendance rate
              </span>
            </div>
          </div>

          {/* Card 3: Pending Leave Requests */}
          <div className="bg-white rounded-xl border border-amber-200/90 p-5 shadow-xs bg-amber-50/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                Pending Requests
              </span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-bold tracking-tight text-amber-700">
                {pendingRequests.length}
              </span>
              <span className="text-xs text-amber-600 font-medium">Needs Action</span>
            </div>
            <div className="mt-3 pt-3 border-t border-amber-100 text-xs text-amber-700 font-medium flex items-center justify-between">
              <span>Awaiting decision</span>
              <Link href="/admin/leave-requests" className="underline hover:text-amber-900">
                Review all →
              </Link>
            </div>
          </div>

          {/* Card 4: Approved Leaves */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Approved Leaves
              </span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {approvedRequests.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">This Cycle</span>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span>All recorded in payroll</span>
            </div>
          </div>
        </div>

        {/* Pending Leave Requests Section (HR Action Hub) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pending Leave Requests
              </h3>
              <p className="text-xs text-slate-500">
                Submissions requiring supervisor or HR authorization
              </p>
            </div>
            <Link
              href="/admin/leave-requests"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline underline-offset-4"
            >
              Manage All Requests →
            </Link>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200/80 p-8 text-center text-slate-500">
              <svg className="w-8 h-8 mx-auto text-emerald-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="text-sm font-semibold text-slate-800">
                Inbox Zero — All caught up!
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                There are no pending leave requests awaiting approval at this moment.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-slate-900 text-sm">
                        {req.employeeName}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {req.employeeId}
                      </span>
                      <Badge variant="info" size="sm">
                        {req.department}
                      </Badge>
                      <LeaveStatusBadge status={req.status} size="sm" />
                    </div>

                    <p className="text-xs text-slate-600">
                      <strong className="text-slate-800">{req.leaveType}</strong> • {req.startDate} to {req.endDate} ({req.days} {req.days === 1 ? "day" : "days"})
                    </p>

                    <p className="text-xs text-slate-500 italic truncate max-w-xl">
                      "{req.reason}"
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedRequest(req)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleOpenReject(req)}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleApprove(req.id)}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2-Column: Recent Activity & Employee Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <h4 className="font-bold text-slate-900 text-sm">
                  Recent Activity Stream
                </h4>
                <span className="text-xs text-slate-400">Live system audit</span>
              </div>
            }
          >
            <div className="flow-root">
              <ul className="-mb-6 space-y-4">
                {activities.map((act) => (
                  <li key={act.id} className="relative flex gap-3 text-xs">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                      {act.type === "leave_approved" ? (
                        <span className="text-emerald-600 font-bold">✓</span>
                      ) : act.type === "leave_rejected" ? (
                        <span className="text-rose-600 font-bold">✕</span>
                      ) : (
                        <span>📝</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-slate-800">
                        <strong className="text-slate-900 font-medium">{act.actor}</strong>{" "}
                        {act.action} <span className="font-medium text-slate-900">{act.target}</span>
                      </p>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        {act.time}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Employee Overview Summary — dynamic from MongoDB */}
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <h4 className="font-bold text-slate-900 text-sm">
                  Department Breakdown
                </h4>
                <Link
                  href="/admin/employees"
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
                >
                  View Directory →
                </Link>
              </div>
            }
          >
            {(() => {
              const deptColors = [
                "bg-indigo-600",
                "bg-emerald-500",
                "bg-amber-500",
                "bg-purple-500",
                "bg-rose-500",
                "bg-sky-500",
              ];
              const activeEmps = employees.filter((e) => e.status === "Active");
              const deptMap = {};
              for (const emp of activeEmps) {
                const d = emp.department || "Unassigned";
                deptMap[d] = (deptMap[d] || 0) + 1;
              }
              const deptList = Object.entries(deptMap).sort((a, b) => b[1] - a[1]);
              const total = activeEmps.length || 1;
              if (deptList.length === 0) {
                return (
                  <p className="text-xs text-slate-400 text-center py-4">
                    No active employees to display.
                  </p>
                );
              }
              return (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {deptList.map(([dept, count], idx) => {
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={dept}>
                          <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                            <span>{dept}</span>
                            <span className="text-slate-900 font-semibold">
                              {count} {count === 1 ? "employee" : "employees"} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`${deptColors[idx % deptColors.length]} h-full rounded-full transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{deptList.length} department{deptList.length !== 1 ? "s" : ""} represented</span>
                    <span className="font-semibold text-slate-700">{activeEmps.length} active</span>
                  </div>
                </div>
              );
            })()}
          </Card>
        </div>
      </div>

      {/* View Request Modal */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title="Leave Request Details"
        description={`Application ID: ${selectedRequest?.id}`}
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-400">
              Submitted: {selectedRequest?.appliedOn}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                Close
              </Button>
              {selectedRequest?.status === "Pending" && (
                <>
                  <Button
                    variant="danger"
                    onClick={() => {
                      const req = selectedRequest;
                      setSelectedRequest(null);
                      handleOpenReject(req);
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => {
                      handleApprove(selectedRequest.id);
                      setSelectedRequest(null);
                    }}
                  >
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        }
      >
        {selectedRequest && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="font-bold text-slate-900 text-sm block">
                  {selectedRequest.employeeName}
                </span>
                <span className="text-slate-500">
                  {selectedRequest.employeeId} • {selectedRequest.department}
                </span>
              </div>
              <LeaveStatusBadge status={selectedRequest.status} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block">Leave Category</span>
                <span className="font-semibold text-slate-900 text-sm">
                  {selectedRequest.leaveType}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block">Duration</span>
                <span className="font-semibold text-slate-900 text-sm">
                  {selectedRequest.days} {selectedRequest.days === 1 ? "day" : "days"}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block">Selected Date Span</span>
              <span className="font-medium text-slate-900">
                {selectedRequest.startDate} → {selectedRequest.endDate}
              </span>
            </div>

            <div>
              <span className="text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                Reason for Leave
              </span>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed italic">
                "{selectedRequest.reason}"
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal
        isOpen={!!rejectModalReq}
        onClose={() => setRejectModalReq(null)}
        title="Confirm Rejection"
        description={`You are about to reject the leave request for ${rejectModalReq?.employeeName}.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setRejectModalReq(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmReject}>
              Confirm Rejection
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            Please provide an optional feedback note to the employee detailing why this request could not be approved at this time:
          </p>
          <textarea
            rows="3"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400"
            placeholder="Reason for rejection..."
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
}
