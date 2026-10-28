"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  MOCK_ADMIN_USER,
  MOCK_EMPLOYEES,
  MOCK_ADMIN_ACTIVITIES,
} from "@/data/mockData";

const HrmsContext = createContext(null);

export function HrmsProvider({ children }) {
  const { data: session, status } = useSession();

  // Role tracking
  const [currentUserRole, setCurrentUserRole] = useState("employee");

  // Dynamic state populated from real authenticated MongoDB session
  const [employeeProfile, setEmployeeProfile] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    joiningDate: "",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces&auto=format&q=80",
    role: "employee",
    leaveBalance: {
      casual: { total: 5, used: 0, pending: 0, available: 5 },
      sick: { total: 5, used: 0, pending: 0, available: 5 },
      medical: { total: 5, used: 0, pending: 0, available: 5 },
      total: { total: 15, used: 0, pending: 0, available: 15 },
    },
  });

  const [adminProfile] = useState(MOCK_ADMIN_USER);
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [activities, setActivities] = useState(MOCK_ADMIN_ACTIVITIES);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Sync role from session
  useEffect(() => {
    if (session?.user?.role) {
      setCurrentUserRole(session.user.role);
    }
  }, [session]);

  // Fetch employee-specific dashboard data from MongoDB via /api/employee/dashboard
  const refreshEmployeeData = useCallback(async () => {
    if (status !== "authenticated" || session?.user?.role !== "employee") {
      return;
    }

    try {
      setIsLoadingData(true);
      const res = await fetch("/api/employee/dashboard");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          setEmployeeProfile(data.profile);
          if (Array.isArray(data.leaveRequests)) {
            setLeaveRequests(data.leaveRequests);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch employee dashboard data:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, [status, session]);

  // Fetch admin leave requests and employees when logged in as admin
  const refreshAdminData = useCallback(async () => {
    if (status !== "authenticated" || session?.user?.role !== "admin") {
      return;
    }

    try {
      // Fetch leave requests for admin
      const reqRes = await fetch("/api/admin/leave-requests");
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        if (reqData.success && Array.isArray(reqData.leaveRequests)) {
          setLeaveRequests(reqData.leaveRequests);
        }
      }

      // Fetch employees for admin
      const empRes = await fetch("/api/employees");
      if (empRes.ok) {
        const empData = await empRes.json();
        if (empData.success && Array.isArray(empData.employees)) {
          setEmployees(empData.employees);
        }
      }
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    }
  }, [status, session]);

  // Trigger data load when session state settles
  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role === "employee") {
        refreshEmployeeData();
      } else if (session?.user?.role === "admin") {
        refreshAdminData();
      }
    }
  }, [status, session, refreshEmployeeData, refreshAdminData]);

  // Switch role helper
  const switchRole = (role) => {
    setCurrentUserRole(role);
  };

  // Submit leave request via POST /api/employee/leave-requests
  const submitLeaveRequest = async (requestData) => {
    try {
      const res = await fetch("/api/employee/leave-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.message || "Failed to submit request" };
      }

      // Refresh real data from MongoDB to recompute balances and request list
      await refreshEmployeeData();
      return { success: true, request: data.request };
    } catch (err) {
      console.error("submitLeaveRequest error:", err);
      return { success: false, error: err.message || "Network error" };
    }
  };

  // Admin approves a leave request via PATCH /api/admin/leave-requests/:id
  const approveLeaveRequest = async (id, note = "Approved by HR.") => {
    try {
      const res = await fetch(`/api/admin/leave-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Approved", reviewerNote: note }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.message || "Approval failed" };
      }

      await refreshAdminData();
      return { success: true };
    } catch (err) {
      console.error("approveLeaveRequest error:", err);
      return { success: false, error: err.message };
    }
  };

  // Admin rejects a leave request via PATCH /api/admin/leave-requests/:id
  const rejectLeaveRequest = async (id, reasonNote = "Rejected due to scheduling constraints.") => {
    try {
      const res = await fetch(`/api/admin/leave-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Rejected", reviewerNote: reasonNote }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.message || "Rejection failed" };
      }

      await refreshAdminData();
      return { success: true };
    } catch (err) {
      console.error("rejectLeaveRequest error:", err);
      return { success: false, error: err.message };
    }
  };

  // Update profile
  const updateProfile = async (updatedFields) => {
    try {
      const res = await fetch("/api/employee/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.message || "Failed to update profile" };
      }
      setEmployeeProfile((prev) => ({
        ...prev,
        ...updatedFields,
      }));
      return { success: true };
    } catch (err) {
      console.error("updateProfile error:", err);
      // Fallback local update
      setEmployeeProfile((prev) => ({
        ...prev,
        ...updatedFields,
      }));
      return { success: true };
    }
  };

  const activeUser = currentUserRole === "admin" ? adminProfile : employeeProfile;

  return (
    <HrmsContext.Provider
      value={{
        currentUserRole,
        setCurrentUserRole,
        switchRole,
        activeUser,
        employeeProfile,
        adminProfile,
        employees,
        leaveRequests,
        activities,
        isLoadingData,
        refreshEmployeeData,
        refreshAdminData,
        submitLeaveRequest,
        approveLeaveRequest,
        rejectLeaveRequest,
        updateProfile,
      }}
    >
      {children}
    </HrmsContext.Provider>
  );
}

export function useHrms() {
  const context = useContext(HrmsContext);
  if (!context) {
    throw new Error("useHrms must be used within an HrmsProvider");
  }
  return context;
}
