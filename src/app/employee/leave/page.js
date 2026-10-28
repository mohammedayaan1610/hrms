"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LeaveRequestTable from "@/components/leave/LeaveRequestTable";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import LeaveStatusBadge from "@/components/leave/LeaveStatusBadge";
import { useHrms } from "@/context/HrmsContext";

export default function MyLeaveRequestsPage() {
  const { employeeProfile, leaveRequests } = useHrms();

  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Filter requests strictly for this employee
  const myRequests = leaveRequests.filter((r) => {
    if (!employeeProfile?.id) return false;
    const cleanProfileId = employeeProfile.id.replace("-", "");
    const cleanReqId = (r.employeeId || "").replace("-", "");
    return r.employeeId === employeeProfile.id || cleanProfileId === cleanReqId;
  });

  const filteredRequests = myRequests.filter((req) => {
    const matchesType =
      typeFilter === "all" ||
      req.leaveType.toLowerCase().includes(typeFilter.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      req.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      req.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
  });

  const totalCount = myRequests.length;
  const pendingCount = myRequests.filter((r) => r.status === "Pending").length;
  const approvedCount = myRequests.filter((r) => r.status === "Approved").length;
  const rejectedCount = myRequests.filter((r) => r.status === "Rejected").length;

  return (
    <DashboardLayout
      title="My Leave History"
      subtitle="Comprehensive record of all your submitted leave applications"
    >
      <div className="space-y-6">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Total Submissions
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">{totalCount}</span>
              <span className="text-xs text-slate-400">All-time</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-amber-200/80 p-4 shadow-xs bg-amber-50/20">
            <span className="text-xs font-semibold text-amber-700 uppercase">
              Under Review
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-amber-700">{pendingCount}</span>
              <span className="text-xs text-amber-600">Pending</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-emerald-200/80 p-4 shadow-xs bg-emerald-50/20">
            <span className="text-xs font-semibold text-emerald-700 uppercase">
              Approved
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-emerald-700">{approvedCount}</span>
              <span className="text-xs text-emerald-600">Granted</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-rose-200/80 p-4 shadow-xs bg-rose-50/20">
            <span className="text-xs font-semibold text-rose-700 uppercase">
              Rejected
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-rose-700">{rejectedCount}</span>
              <span className="text-xs text-rose-600">Declined</span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <Card>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search */}
              <Input
                placeholder="Search reason or Ref ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />

              {/* Leave Type filter */}
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                placeholder={null}
                options={[
                  { value: "all", label: "All Leave Types" },
                  { value: "casual", label: "Casual Leave" },
                  { value: "sick", label: "Sick Leave" },
                  { value: "medical", label: "Medical Leave" },
                ]}
              />

              {/* Status filter */}
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                placeholder={null}
                options={[
                  { value: "all", label: "All Statuses" },
                  { value: "pending", label: "Pending" },
                  { value: "approved", label: "Approved" },
                  { value: "rejected", label: "Rejected" },
                ]}
              />
            </div>

            <div className="flex items-center gap-2">
              <Link href="/employee/leave/apply">
                <Button variant="primary">
                  Apply New Leave
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Results Count & Active Filters */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Showing <strong>{filteredRequests.length}</strong> of {totalCount} requests
          </span>
          {(typeFilter !== "all" || statusFilter !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setTypeFilter("all");
                setStatusFilter("all");
                setSearchQuery("");
              }}
              className="text-indigo-600 hover:text-indigo-800 font-medium underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Table / Mobile Cards */}
        <LeaveRequestTable
          requests={filteredRequests}
          showReason={true}
          showAppliedOn={true}
          onRowClick={(req) => setSelectedRequest(req)}
        />
      </div>

      {/* Request Details View Modal */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        title="Leave Request Details"
        description={`Application Reference: ${selectedRequest?.id}`}
        footer={
          <Button variant="primary" onClick={() => setSelectedRequest(null)}>
            Close
          </Button>
        }
      >
        {selectedRequest && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-semibold text-slate-900 text-base">
                  {selectedRequest.leaveType}
                </h4>
                <p className="text-xs text-slate-500">
                  Applied on {selectedRequest.appliedOn}
                </p>
              </div>
              <LeaveStatusBadge status={selectedRequest.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Start Date</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {selectedRequest.startDate}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">End Date</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {selectedRequest.endDate}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs flex justify-between items-center">
              <span className="text-slate-500">Duration Requested:</span>
              <span className="font-bold text-slate-900 text-sm">
                {selectedRequest.days} {selectedRequest.days === 1 ? "day" : "days"}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Reason Provided
              </span>
              <p className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/60 text-slate-700 italic text-xs leading-relaxed">
                "{selectedRequest.reason}"
              </p>
            </div>

            {selectedRequest.reviewerNote && (
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Manager Review Notes
                </span>
                <p className="p-3.5 bg-indigo-50/50 rounded-lg border border-indigo-100 text-indigo-900 text-xs">
                  {selectedRequest.reviewerNote}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
