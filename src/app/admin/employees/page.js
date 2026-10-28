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
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Add Employee Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccessMsg, setCreateSuccessMsg] = useState("");

  const departments = [
    "Engineering",
    "Finance",
    "Product Design",
    "Human Resources",
    "Marketing",
    "Operations",
  ];

  // Fetch employees from MongoDB Atlas API
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError("");
      const res = await fetch("/api/employees");
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
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

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
      await fetchEmployees();
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
            <Button size="sm" variant="outline" onClick={fetchEmployees}>
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
                {employees.filter((e) => e.status === "Active").length}
              </span>
              <span className="text-xs text-emerald-600">Active</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase">Database</span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-bold text-indigo-600 font-mono">hrms.users</span>
              <span className="text-xs text-slate-400">Atlas</span>
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
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <Badge variant="success" size="sm" dot>
                    Active
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

            {/* Leave Balance Quotas */}
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
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
