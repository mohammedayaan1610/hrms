"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import Table from "@/components/ui/Table";
import EmptyState from "@/components/ui/EmptyState";
import LeaveStatusBadge from "@/components/leave/LeaveStatusBadge";
import { useHrms } from "@/context/HrmsContext";

export default function AdminLeaveRequestsPage() {
  const { leaveRequests, approveLeaveRequest, rejectLeaveRequest } = useHrms();

  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [viewRequest, setViewRequest] = useState(null);
  const [rejectModalReq, setRejectModalReq] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Counts
  const totalCount = leaveRequests.length;
  const pendingCount = leaveRequests.filter((r) => r.status === "Pending").length;
  const approvedCount = leaveRequests.filter((r) => r.status === "Approved").length;
  const rejectedCount = leaveRequests.filter((r) => r.status === "Rejected").length;

  // Filtered
  const filteredRequests = leaveRequests.filter((req) => {
    const matchesStatus =
      statusFilter === "all" ||
      req.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesType =
      typeFilter === "all" ||
      req.leaveType.toLowerCase().includes(typeFilter.toLowerCase());

    const matchesSearch =
      !searchQuery ||
      req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  const handleApprove = (id) => {
    approveLeaveRequest(id);
    if (viewRequest && viewRequest.id === id) {
      setViewRequest((prev) => ({ ...prev, status: "Approved" }));
    }
  };

  const handleOpenReject = (req) => {
    setRejectModalReq(req);
    setRejectionReason("High project deadline overlap during the requested timeframe.");
  };

  const handleConfirmReject = () => {
    if (rejectModalReq) {
      rejectLeaveRequest(rejectModalReq.id, rejectionReason);
      if (viewRequest && viewRequest.id === rejectModalReq.id) {
        setViewRequest((prev) => ({ ...prev, status: "Rejected" }));
      }
      setRejectModalReq(null);
      setRejectionReason("");
    }
  };

  const headers = [
    "Employee",
    "Leave Type",
    "Duration",
    "Dates",
    "Reason",
    "Status",
    "Actions",
  ];

  return (
    <DashboardLayout
      title="Leave Approvals & Requests"
      subtitle="HR review portal to inspect, approve, or reject employee leave requests"
    >
      <div className="space-y-6">
        {/* Summary Cards (All Requests, Pending, Approved, Rejected) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`p-4 rounded-xl border text-left transition-all ${
              statusFilter === "all"
                ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10"
                : "bg-white text-slate-900 border-slate-200/80 hover:border-slate-300"
            }`}
          >
            <span
              className={`text-xs font-semibold uppercase ${
                statusFilter === "all" ? "text-slate-300" : "text-slate-500"
              }`}
            >
              All Requests
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold">{totalCount}</span>
              <span
                className={`text-xs ${
                  statusFilter === "all" ? "text-slate-300" : "text-slate-400"
                }`}
              >
                Total
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`p-4 rounded-xl border text-left transition-all ${
              statusFilter === "pending"
                ? "bg-amber-500 text-white border-amber-500 shadow-md ring-2 ring-amber-500/20"
                : "bg-white text-slate-900 border-amber-200/80 bg-amber-50/10 hover:border-amber-300"
            }`}
          >
            <span
              className={`text-xs font-semibold uppercase ${
                statusFilter === "pending" ? "text-amber-100" : "text-amber-700"
              }`}
            >
              Pending
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold">{pendingCount}</span>
              <span
                className={`text-xs ${
                  statusFilter === "pending" ? "text-amber-100" : "text-amber-600"
                }`}
              >
                Awaiting
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("approved")}
            className={`p-4 rounded-xl border text-left transition-all ${
              statusFilter === "approved"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-600/20"
                : "bg-white text-slate-900 border-emerald-200/80 bg-emerald-50/10 hover:border-emerald-300"
            }`}
          >
            <span
              className={`text-xs font-semibold uppercase ${
                statusFilter === "approved" ? "text-emerald-100" : "text-emerald-700"
              }`}
            >
              Approved
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold">{approvedCount}</span>
              <span
                className={`text-xs ${
                  statusFilter === "approved" ? "text-emerald-100" : "text-emerald-600"
                }`}
              >
                Authorized
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("rejected")}
            className={`p-4 rounded-xl border text-left transition-all ${
              statusFilter === "rejected"
                ? "bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-600/20"
                : "bg-white text-slate-900 border-rose-200/80 bg-rose-50/10 hover:border-rose-300"
            }`}
          >
            <span
              className={`text-xs font-semibold uppercase ${
                statusFilter === "rejected" ? "text-rose-100" : "text-rose-700"
              }`}
            >
              Rejected
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold">{rejectedCount}</span>
              <span
                className={`text-xs ${
                  statusFilter === "rejected" ? "text-rose-100" : "text-rose-600"
                }`}
              >
                Declined
              </span>
            </div>
          </button>
        </div>

        {/* Filter Toolbar */}
        <Card>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                placeholder="Search employee, ID, reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />

              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                placeholder={null}
                options={[
                  { value: "all", label: "Filter: All Statuses" },
                  { value: "pending", label: "Filter: Pending Only" },
                  { value: "approved", label: "Filter: Approved Only" },
                  { value: "rejected", label: "Filter: Rejected Only" },
                ]}
              />

              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                placeholder={null}
                options={[
                  { value: "all", label: "Filter: All Categories" },
                  { value: "casual", label: "Casual Leave" },
                  { value: "sick", label: "Sick Leave" },
                  { value: "medical", label: "Medical Leave" },
                ]}
              />
            </div>

            {(searchQuery || statusFilter !== "all" || typeFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}
              >
                Reset All
              </Button>
            )}
          </div>
        </Card>

        {/* Requests Table / Cards */}
        {filteredRequests.length === 0 ? (
          <EmptyState
            title="No matching requests found"
            description="Adjust your search criteria or filter options to display records."
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <Table headers={headers}>
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div>
                        <span className="font-semibold text-slate-900 block text-sm">
                          {req.employeeName}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {req.employeeId} • {req.department}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">
                      {req.leaveType}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-700">
                      {req.days} {req.days === 1 ? "day" : "days"}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-mono text-xs text-slate-600">
                      {req.startDate} → {req.endDate}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600 max-w-xs truncate">
                      {req.reason}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <LeaveStatusBadge status={req.status} size="sm" />
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewRequest(req)}
                        >
                          View
                        </Button>
                        {req.status === "Pending" && (
                          <>
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
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </Table>
            </div>

            {/* Mobile / Tablet Cards */}
            <div className="lg:hidden space-y-3">
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{req.employeeName}</h4>
                      <p className="text-xs text-slate-400 font-mono">
                        {req.employeeId} • {req.department}
                      </p>
                    </div>
                    <LeaveStatusBadge status={req.status} size="sm" />
                  </div>

                  <div className="text-xs space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Category:</span>
                      <span className="font-medium text-slate-800">{req.leaveType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Duration:</span>
                      <span className="font-semibold text-slate-900">
                        {req.days} {req.days === 1 ? "day" : "days"} ({req.startDate} to {req.endDate})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Reason:</span>
                      <p className="p-2 bg-slate-50 rounded border border-slate-200/60 text-slate-700 italic text-xs">
                        "{req.reason}"
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewRequest(req)}
                    >
                      View
                    </Button>
                    {req.status === "Pending" && (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Inspect Request Modal */}
      <Modal
        isOpen={!!viewRequest}
        onClose={() => setViewRequest(null)}
        title="Leave Application Inspection"
        description={`Application Reference: ${viewRequest?.id}`}
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-400">
              Submitted: {viewRequest?.appliedOn}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setViewRequest(null)}>
                Close
              </Button>
              {viewRequest?.status === "Pending" && (
                <>
                  <Button
                    variant="danger"
                    onClick={() => {
                      const req = viewRequest;
                      setViewRequest(null);
                      handleOpenReject(req);
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="success"
                    onClick={() => {
                      handleApprove(viewRequest.id);
                      setViewRequest(null);
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
        {viewRequest && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {viewRequest.employeeName}
                </h4>
                <p className="text-slate-500 font-mono">
                  {viewRequest.employeeId} • {viewRequest.department}
                </p>
              </div>
              <LeaveStatusBadge status={viewRequest.status} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block uppercase font-semibold">Category</span>
                <span className="font-bold text-slate-900 text-sm">{viewRequest.leaveType}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block uppercase font-semibold">Total Duration</span>
                <span className="font-bold text-slate-900 text-sm">
                  {viewRequest.days} {viewRequest.days === 1 ? "day" : "days"}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block uppercase font-semibold">Date Schedule</span>
              <span className="font-mono text-slate-800 font-medium">
                {viewRequest.startDate} through {viewRequest.endDate}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block uppercase font-semibold mb-1">
                Employee Justification Note
              </span>
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 leading-relaxed italic">
                "{viewRequest.reason}"
              </div>
            </div>

            {viewRequest.reviewerNote && (
              <div>
                <span className="text-slate-400 block uppercase font-semibold mb-1">
                  Manager Reviewer Note
                </span>
                <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-indigo-900">
                  {viewRequest.reviewerNote}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Confirmation Modal with Reason */}
      <Modal
        isOpen={!!rejectModalReq}
        onClose={() => setRejectModalReq(null)}
        title="Confirm Leave Rejection"
        description={`Rejecting request ${rejectModalReq?.id} for ${rejectModalReq?.employeeName}.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setRejectModalReq(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmReject}>
              Reject Request
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            Provide an explanatory rationale for the rejection that the employee will view:
          </p>
          <textarea
            rows="3"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Type rejection explanation here..."
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
}
