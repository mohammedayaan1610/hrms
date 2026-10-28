"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmployeeTable from "@/components/employees/EmployeeTable";
import EmployeeForm from "@/components/employees/EmployeeForm";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Add Employee Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccessMsg, setCreateSuccessMsg] = useState("");

  // Archive / Restore modal state
  const [archiveTarget, setArchiveTarget] = useState(null); // employee to archive
  const [restoreTarget, setRestoreTarget] = useState(null); // employee to restore
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const departments = [
    "Engineering",
    "Finance",
    "Product Design",
    "Human Resources",
    "Marketing",
    "Operations",
  ];

  // Fetch employees from MongoDB Atlas API
  const fetchEmployees = useCallback(async (status = statusFilter) => {
    try {
      setLoading(true);
      setFetchError("");
      const res = await fetch(`/api/employees?status=${status}`);
      const data = await res.json();

      if (data.success) {
        setEmployees(data.employees || []);
      } else {
        setFetchError(data.message || "Failed to load employees from database.");
      }
    } catch (err) {
      setFetchError("Network error while connecting to server.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchEmployees(statusFilter);
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle employee creation submission
  const handleCreateEmployee = async (formData) => {
    try {
      setCreateLoading(true);
      setCreateError("");

      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setCreateError(data.message || "Failed to create employee.");
        setCreateLoading(false);
        return;
      }

      // Success: refresh list from MongoDB, close modal, show success toast
      await fetchEmployees(statusFilter);
      setCreateLoading(false);
      setIsAddModalOpen(false);
      setCreateSuccessMsg(`Employee ${data.employee?.name || ""} created successfully!`);

      setTimeout(() => {
        setCreateSuccessMsg("");
      }, 5000);
    } catch (err) {
      setCreateLoading(false);
      setCreateError("An unexpected error occurred while saving the employee.");
    }
  };

  // Confirm archive (soft delete)
  const handleConfirmArchive = async () => {
  if (!archiveTarget) return;

  try {
    setActionLoading(true);
    setActionError("");

    const employeeId =
      archiveTarget.employeeId ||
      archiveTarget.id ||
      archiveTarget._id;

    if (!employeeId) {
      throw new Error("Employee ID missing. Please refresh and try again.");
    }

    const res = await fetch(
      `/api/employees/${encodeURIComponent(employeeId)}`,
      { method: "DELETE" }
    );

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to archive employee.");
    }

    setArchiveTarget(null);
    setCreateSuccessMsg(
      data.message || `Employee ${archiveTarget.name} has been archived.`
    );

    await fetchEmployees(statusFilter);

    setTimeout(() => setCreateSuccessMsg(""), 5000);
  } catch (err) {
    setActionError(err.message || "Network error while archiving employee.");
  } finally {
    setActionLoading(false);
  }
};

  // Confirm restore
  const handleConfirmRestore = async () => {
    if (!restoreTarget) return;
    try {
      setActionLoading(true);
      setActionError("");

      const res = await fetch(`/api/employees/${encodeURIComponent(restoreTarget.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setActionError(data.message || "Failed to restore employee.");
        setActionLoading(false);
        return;
      }

      setRestoreTarget(null);
      setActionLoading(false);
      setCreateSuccessMsg(`Employee ${restoreTarget.name} has been restored.`);
      setTimeout(() => setCreateSuccessMsg(""), 5000);
      await fetchEmployees(statusFilter);
    } catch (err) {
      setActionError("Network error while restoring employee.");
      setActionLoading(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      !searchQuery ||
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept =
      departmentFilter === "all" ||
      emp.department.toLowerCase() === departmentFilter.toLowerCase();

    return matchesSearch && matchesDept;
  });

  const activeCount = employees.filter((e) => e.status === "Active").length;
  const archivedCount = employees.filter((e) => e.status === "Archived").length;

  return (
    <DashboardLayout
      title="Employee Directory"
      subtitle="View, search and manage all company personnel records from MongoDB Atlas"
    >
      <div className="space-y-6">
        {/* Success Alert Banner */}
        {createSuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{createSuccessMsg}</span>
            </div>
            <button
              onClick={() => setCreateSuccessMsg("")}
              className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Database Error Banner */}
        {fetchError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-800 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{fetchError}</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => fetchEmployees(statusFilter)}>
              Retry
            </Button>
          </div>
        )}

        {/* Top Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Personnel</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">{employees.length}</span>
              <span className="text-xs text-slate-400">In MongoDB</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase">Active Status</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-emerald-600">
                {activeCount}
              </span>
              <span className="text-xs text-emerald-600">Active</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase">Archived</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-amber-600">{archivedCount}</span>
              <span className="text-xs text-slate-400">Inactive</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase">Departments</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">{departments.length}</span>
              <span className="text-xs text-slate-400">Units</span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar & Add Employee Button */}
        <Card>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                placeholder="Search by name, ID or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />

              <Select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                placeholder={null}
                options={[
                  { value: "all", label: "All Departments" },
                  ...departments.map((d) => ({ value: d, label: d })),
                ]}
              />

              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                placeholder={null}
                options={[
                  { value: "active", label: "Active Only" },
                  { value: "archived", label: "Archived Only" },
                  { value: "all", label: "All Employees" },
                ]}
              />
            </div>

            <div className="flex items-center gap-3">
              {(searchQuery || departmentFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setDepartmentFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}

              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setCreateError("");
                  setIsAddModalOpen(true);
                }}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Add Employee
              </Button>
            </div>
          </div>
        </Card>

        {/* Loading State or Employee Table */}
        {loading ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <svg
              className="animate-spin mx-auto h-8 w-8 text-indigo-600 mb-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-sm font-medium text-slate-600">Loading personnel from MongoDB Atlas...</p>
          </div>
        ) : (
          <EmployeeTable
            employees={filteredEmployees}
            onViewEmployee={(emp) => setSelectedEmployee(emp)}
            onArchiveEmployee={(emp) => {
              setActionError("");
              setArchiveTarget(emp);
            }}
            onRestoreEmployee={(emp) => {
              setActionError("");
              setRestoreTarget(emp);
            }}
            emptyMessage={
              employees.length === 0
                ? "No employee records found in MongoDB. Click 'Add Employee' to register the first employee."
                : "No employees match your search query."
            }
          />
        )}
      </div>

      {/* Add Employee Modal with Reusable EmployeeForm */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          if (!createLoading) setIsAddModalOpen(false);
        }}
        title="Add New Employee"
        description="Provision a new employee record and allocate default 15-day annual leave balances"
        maxWidth="max-w-2xl"
      >
        <EmployeeForm
          onSubmit={handleCreateEmployee}
          onCancel={() => setIsAddModalOpen(false)}
          loading={createLoading}
          error={createError}
        />
      </Modal>

      {/* Employee Detail Modal */}
      <Modal
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        title="Employee Dossier"
        description="Comprehensive employee record and leave entitlement profile"
        maxWidth="max-w-2xl"
        footer={
          <Button variant="primary" onClick={() => setSelectedEmployee(null)}>
            Done
          </Button>
        }
      >
        {selectedEmployee && (
          <div className="space-y-6">
            {/* Header Identity */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/60">
              <div className="w-14 h-14 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xl shadow-sm border-2 border-white">
                {selectedEmployee.name?.charAt(0) || "E"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-base truncate">
                    {selectedEmployee.name}
                  </h4>
                  <Badge
                    variant={selectedEmployee.status === "Active" ? "success" : "neutral"}
                    size="sm"
                    dot
                  >
                    {selectedEmployee.status || "Active"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {selectedEmployee.designation} • {selectedEmployee.department}
                </p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  ID: {selectedEmployee.id} • Joined: {selectedEmployee.joiningDate || "N/A"}
                </p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block font-semibold uppercase">Email</span>
                <span className="font-medium text-slate-800">{selectedEmployee.email}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block font-semibold uppercase">Phone</span>
                <span className="font-medium text-slate-800">{selectedEmployee.phone || "Not provided"}</span>
              </div>
            </div>

            {/* Archived Notice */}
            {selectedEmployee.status === "Archived" && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                <strong>Archived:</strong> This employee account is inactive. Their data is preserved in the database.
                {selectedEmployee.deletedAt && (
                  <span className="block text-amber-600 mt-0.5">
                    Archived on: {new Date(selectedEmployee.deletedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}

            {/* Leave Balance Quotas */}
            {selectedEmployee.status !== "Archived" && (
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Annual Leave Entitlement (15 Days Total)
                </h5>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-center">
                    <span className="text-[11px] text-indigo-700 font-medium block">Casual Leave</span>
                    <span className="text-xl font-bold text-indigo-900">
                      {selectedEmployee.leaveBalance?.casual ?? 5}
                    </span>
                    <span className="text-[10px] text-indigo-600 block">/ 5 days</span>
                  </div>

                  <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg text-center">
                    <span className="text-[11px] text-amber-700 font-medium block">Sick Leave</span>
                    <span className="text-xl font-bold text-amber-900">
                      {selectedEmployee.leaveBalance?.sick ?? 5}
                    </span>
                    <span className="text-[10px] text-amber-600 block">/ 5 days</span>
                  </div>

                  <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-center">
                    <span className="text-[11px] text-emerald-700 font-medium block">Medical Leave</span>
                    <span className="text-xl font-bold text-emerald-900">
                      {selectedEmployee.leaveBalance?.medical ?? 5}
                    </span>
                    <span className="text-[10px] text-emerald-600 block">/ 5 days</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Archive Confirmation Modal */}
      <Modal
        isOpen={!!archiveTarget}
        onClose={() => {
          if (!actionLoading) setArchiveTarget(null);
        }}
        title="Archive Employee"
        description={`You are about to archive ${archiveTarget?.name}'s account.`}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setArchiveTarget(null)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmArchive}
              disabled={actionLoading}
            >
              {actionLoading ? "Archiving..." : "Confirm Archive"}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            Archiving <strong>{archiveTarget?.name}</strong> ({archiveTarget?.id}) will:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
            <li>Mark the account as inactive — they cannot log in</li>
            <li>Preserve <strong>all</strong> their data in MongoDB (nothing is deleted)</li>
            <li>They can be restored at any time by an administrator</li>
          </ul>
          {actionError && (
            <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2 rounded-lg border border-rose-200">
              {actionError}
            </p>
          )}
        </div>
      </Modal>

      {/* Restore Confirmation Modal */}
      <Modal
        isOpen={!!restoreTarget}
        onClose={() => {
          if (!actionLoading) setRestoreTarget(null);
        }}
        title="Restore Employee"
        description={`You are about to reactivate ${restoreTarget?.name}'s account.`}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setRestoreTarget(null)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleConfirmRestore}
              disabled={actionLoading}
            >
              {actionLoading ? "Restoring..." : "Confirm Restore"}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            Restoring <strong>{restoreTarget?.name}</strong> ({restoreTarget?.id}) will:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
            <li>Mark the account as active again</li>
            <li>Allow them to log in with their original credentials</li>
            <li>All leave history and balances remain intact</li>
          </ul>
          {actionError && (
            <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2 rounded-lg border border-rose-200">
              {actionError}
            </p>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  );
}
