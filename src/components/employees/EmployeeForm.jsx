"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

// Department options matching HRMS conventions
export const DEPARTMENT_OPTIONS = [
  { value: "Engineering", label: "Engineering" },
  { value: "Finance", label: "Finance" },
  { value: "Product Design", label: "Product Design" },
  { value: "Human Resources", label: "Human Resources" },
  { value: "Marketing", label: "Marketing" },
  { value: "Operations", label: "Operations" },
];

// Form field configuration schema for clean extensibility
export const EMPLOYEE_FORM_FIELDS = [
  {
    name: "name",
    label: "Full Name",
    type: "text",
    placeholder: "e.g. Jane Doe",
    required: true,
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    placeholder: "e.g. jane.doe@pulsehrms.com",
    required: true,
  },
  {
    name: "employeeId",
    label: "Employee ID",
    type: "text",
    placeholder: "e.g. EMP-105",
    required: true,
  },
  {
    name: "department",
    label: "Department",
    type: "select",
    options: DEPARTMENT_OPTIONS,
    required: true,
  },
  {
    name: "designation",
    label: "Designation",
    type: "text",
    placeholder: "e.g. Senior Frontend Engineer",
    required: true,
  },
  {
    name: "phone",
    label: "Phone Number",
    type: "tel",
    placeholder: "e.g. +1 (555) 019-2834",
    required: false,
  },
  {
    name: "joiningDate",
    label: "Joining Date",
    type: "date",
    required: false,
  },
  {
    name: "password",
    label: "Initial Password",
    type: "password",
    placeholder: "Leave empty to auto-generate temporary password",
    required: false,
    helperText: "Minimum 6 characters. If left empty, a secure temporary password will be assigned.",
  },
];

export default function EmployeeForm({
  onSubmit,
  onCancel,
  loading = false,
  error = "",
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    employeeId: "",
    department: "Engineering",
    designation: "",
    phone: "",
    joiningDate: new Date().toISOString().split("T")[0],
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Full name is required";
    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!formData.email.includes("@")) {
      errors.email = "Please enter a valid email address";
    }
    if (!formData.employeeId.trim()) {
      errors.employeeId = "Employee ID is required";
    }
    if (!formData.designation.trim()) {
      errors.designation = "Designation is required";
    }
    if (formData.password && formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {EMPLOYEE_FORM_FIELDS.map((field) => {
          if (field.type === "select") {
            return (
              <div key={field.name} className="col-span-1">
                <Select
                  label={field.label}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  options={field.options}
                  required={field.required}
                  error={fieldErrors[field.name]}
                  placeholder={null}
                />
              </div>
            );
          }

          const isFullWidth = field.name === "password" || field.name === "name";

          return (
            <div
              key={field.name}
              className={isFullWidth ? "col-span-1 sm:col-span-2" : "col-span-1"}
            >
              <Input
                label={field.label}
                name={field.name}
                type={field.type}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.required}
                error={fieldErrors[field.name]}
                helperText={field.helperText}
              />
            </div>
          );
        })}
      </div>

      {/* Leave balance info banner */}
      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600">
        <span className="font-semibold text-slate-800 block mb-1">
          Default Annual Entitlements Assigned:
        </span>
        <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono">
          <div className="bg-white p-1.5 rounded border border-slate-200">
            <span className="text-indigo-600 font-bold block">5 Days</span>
            <span className="text-[10px] text-slate-400">Casual</span>
          </div>
          <div className="bg-white p-1.5 rounded border border-slate-200">
            <span className="text-amber-600 font-bold block">5 Days</span>
            <span className="text-[10px] text-slate-400">Sick</span>
          </div>
          <div className="bg-white p-1.5 rounded border border-slate-200">
            <span className="text-emerald-600 font-bold block">5 Days</span>
            <span className="text-[10px] text-slate-400">Medical</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          {loading ? "Creating Employee..." : "Save Employee"}
        </Button>
      </div>
    </form>
  );
}
