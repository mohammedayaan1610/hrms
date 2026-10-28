"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useHrms } from "@/context/HrmsContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

export default function EmployeeProfilePage() {
  const { employeeProfile, updateProfile } = useHrms();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: employeeProfile.name || "",
    phone: employeeProfile.phone || "",
    address: employeeProfile.address || "742 Evergreen Terrace, San Francisco, CA",
    designation: employeeProfile.designation || "",
    department: employeeProfile.department || "",
  });

  useEffect(() => {
    if (employeeProfile.name) {
      setFormData({
        name: employeeProfile.name || "",
        phone: employeeProfile.phone || "",
        address: employeeProfile.address || "742 Evergreen Terrace, San Francisco, CA",
        designation: employeeProfile.designation || "",
        department: employeeProfile.department || "",
      });
    }
  }, [employeeProfile]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await updateProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditModalOpen(false);
    }, 700);
  };

  return (
    <DashboardLayout
      title="My Profile"
      subtitle="View and manage your employment details and personal contact information"
    >
      <div className="space-y-6">
        {/* Profile Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <img
                  src={employeeProfile.avatar}
                  alt={employeeProfile.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-md ring-1 ring-slate-200"
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {employeeProfile.name}
                  </h2>
                  <Badge variant="success" size="sm" dot>
                    Active
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mt-0.5">
                  {employeeProfile.designation}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    {employeeProfile.id}
                  </span>
                  <span>•</span>
                  <span>{employeeProfile.department}</span>
                  <span>•</span>
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(true)}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
            >
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employment Information Card */}
          <Card
            header={
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="font-bold text-slate-900 text-sm">
                  Employment Details
                </h3>
              </div>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Employee ID
                </dt>
                <dd className="mt-1 text-sm font-mono font-medium text-slate-900">
                  {employeeProfile.id}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Department
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {employeeProfile.department}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Designation
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {employeeProfile.designation}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Joining Date
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {employeeProfile.joiningDate}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Employment Type
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {employeeProfile.workType || "Full-Time (Remote)"}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Reporting Manager
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {employeeProfile.manager || "Sarah Jenkins"}
                </dd>
              </div>
            </div>
          </Card>

          {/* Contact Details Card */}
          <Card
            header={
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="font-bold text-slate-900 text-sm">
                  Personal & Contact Information
                </h3>
              </div>
            }
          >
            <div className="space-y-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Email Address
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {employeeProfile.email}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Phone Number
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {employeeProfile.phone}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Residential Address
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-900">
                  {employeeProfile.address || "742 Evergreen Terrace, San Francisco, CA 94107"}
                </dd>
              </div>
            </div>
          </Card>
        </div>

        {/* Leave Allocation Summary Card */}
        <Card
          header={
            <div className="flex items-center justify-between w-full">
              <h3 className="font-bold text-slate-900 text-sm">
                Annual Leave Entitlement Breakdown
              </h3>
              <span className="text-xs text-slate-500">15 Days Standard Policy</span>
            </div>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Casual Leave
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900">
                  {employeeProfile.leaveBalance.casual.available}
                </span>
                <span className="text-xs text-slate-500">
                  Used: {employeeProfile.leaveBalance.casual.used} / 5
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Sick Leave
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900">
                  {employeeProfile.leaveBalance.sick.available}
                </span>
                <span className="text-xs text-slate-500">
                  Used: {employeeProfile.leaveBalance.sick.used} / 5
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Medical Leave
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900">
                  {employeeProfile.leaveBalance.medical.available}
                </span>
                <span className="text-xs text-slate-500">
                  Used: {employeeProfile.leaveBalance.medical.used} / 5
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Profile Modal UI */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile Information"
        description="Update your personal details. Changes are updated in the local session."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveProfile}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {saveSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium">
              Profile updated successfully!
            </div>
          )}

          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />

          <Input
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />

          <Input
            label="Residential Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Department"
              name="department"
              value={formData.department}
              disabled
              helperText="Controlled by HR"
            />
            <Input
              label="Designation"
              name="designation"
              value={formData.designation}
              disabled
              helperText="Controlled by HR"
            />
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
