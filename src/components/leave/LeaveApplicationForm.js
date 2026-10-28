"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

export default function LeaveApplicationForm({
  onSubmit,
  onCancel,
  leaveBalance,
}) {
  const [formData, setFormData] = useState({
    leaveType: "Casual Leave",
    startDate: "",
    endDate: "",
    days: "1",
    reason: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const calculateDays = (start, end) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = e - s;
    if (diffTime < 0) return 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto update days if start or end date changes
      if (name === "startDate" || name === "endDate") {
        const s = name === "startDate" ? value : prev.startDate;
        const e = name === "endDate" ? value : prev.endDate;
        if (s && e) {
          const days = calculateDays(s, e);
          if (days > 0) {
            updated.days = String(days);
          }
        }
      }
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.leaveType) {
      newErrors.leaveType = "Please select a leave type";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = "End date cannot be earlier than start date";
    }

    const daysNum = Number(formData.days);
    if (!formData.days || isNaN(daysNum) || daysNum < 1) {
      newErrors.days = "Please specify a valid number of days (at least 1)";
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Reason for leave is required";
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = "Please provide a more descriptive reason (min 10 characters)";
    }

    // Check balance
    if (leaveBalance) {
      const typeKey = formData.leaveType.toLowerCase().split(" ")[0];
      const avail = leaveBalance[typeKey]?.available ?? 5;
      if (daysNum > avail) {
        newErrors.days = `Requested duration (${daysNum} days) exceeds available balance (${avail} days)`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Simulate network latency (250ms)
      await new Promise((resolve) => setTimeout(resolve, 350));

      if (onSubmit) {
        await onSubmit(formData);
      }

      setIsSuccess(true);
      // Reset form
      setFormData({
        leaveType: "Casual Leave",
        startDate: "",
        endDate: "",
        days: "1",
        reason: "",
      });
    } catch (err) {
      setErrorMessage(err.message || "Failed to submit leave request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Notification */}
      {isSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 animate-in fade-in">
          <div className="p-1 rounded-full bg-emerald-100 text-emerald-600 mt-0.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-emerald-900">
              Leave Request Submitted Successfully
            </h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              Your manager and HR have been notified. You can track status in your Leave History tab.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsSuccess(false)}
            className="ml-auto text-xs text-emerald-600 hover:text-emerald-800 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="space-y-4">
        {/* Leave Type */}
        <Select
          label="Leave Type"
          name="leaveType"
          value={formData.leaveType}
          onChange={handleChange}
          required
          options={[
            { value: "Casual Leave", label: "Casual Leave (Personal / Errands)" },
            { value: "Sick Leave", label: "Sick Leave (Illness / Doctor's appointment)" },
            { value: "Medical Leave", label: "Medical Leave (Hospitalization / Recovery)" },
          ]}
          error={errors.leaveType}
          helperText="Selected category will deduct from your allocated quota."
        />

        {/* Date Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            error={errors.startDate}
          />
          <Input
            label="End Date"
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
            error={errors.endDate}
          />
        </div>

        {/* Duration / Number of Days */}
        <Input
          label="Number of Days"
          type="number"
          name="days"
          min="1"
          max="30"
          value={formData.days}
          onChange={handleChange}
          required
          error={errors.days}
          helperText="Automatically calculated from selected dates, or manually override for half-day requests."
        />

        {/* Reason Field */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Reason for Leave <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="reason"
            rows="4"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Please describe the purpose of your absence clearly for approval review..."
            className={`block w-full rounded-lg border text-sm py-2.5 px-3.5 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
              errors.reason
                ? "border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-200"
                : "border-slate-300 text-slate-900 focus:border-slate-800 focus:ring-slate-200"
            }`}
          />
          {errors.reason ? (
            <p className="mt-1.5 text-xs text-rose-600 font-medium">
              {errors.reason}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-slate-500">
              Minimum 10 characters. Confidential medical notes can be kept brief.
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={isSubmitting}>
          Submit Leave Request
        </Button>
      </div>
    </form>
  );
}
