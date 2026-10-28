import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import LeaveRequest from "@/models/LeaveRequest";
import { authOptions } from "@/lib/auth";

// GET /api/employee/dashboard - Fetch authenticated employee's dashboard profile, balances & requests
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Please sign in" },
        { status: 401 }
      );
    }

    if (session.user.role !== "employee") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Employee access required" },
        { status: 403 }
      );
    }

    await connectDB();

    // Query user by session identity
    const user = await User.findOne({
      $or: [
        { email: session.user.email },
        { employeeId: session.user.employeeId },
      ],
    }).lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Employee profile not found" },
        { status: 404 }
      );
    }

    if (user.isActive === false) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Account is inactive" },
        { status: 403 }
      );
    }

    // Fetch leave requests for this authenticated employee only
    const cleanId = (user.employeeId || "").replace("-", "");
    const userRequests = await LeaveRequest.find({
      $or: [
        { employeeId: user.employeeId },
        { employeeId: cleanId },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    // Map leave requests
    const formattedRequests = userRequests.map((r) => ({
      id: r.requestId || r._id.toString(),
      _id: r._id.toString(),
      employeeId: r.employeeId,
      employeeName: r.employeeName,
      department: r.department,
      leaveType: r.leaveType,
      startDate: r.startDate,
      endDate: r.endDate,
      days: r.days,
      reason: r.reason,
      status: r.status,
      appliedOn: r.appliedOn || (r.createdAt ? new Date(r.createdAt).toISOString().split("T")[0] : ""),
      reviewerNote: r.reviewerNote || null,
    }));

    // Balance rule:
    // Initial 5 days each for Casual, Sick, and Medical.
    // ONLY approved requests reduce available balances. Pending/rejected do NOT.
    const initialBalances = {
      casual: 5,
      sick: 5,
      medical: 5,
    };

    const usedBalances = {
      casual: 0,
      sick: 0,
      medical: 0,
    };

    const pendingBalances = {
      casual: 0,
      sick: 0,
      medical: 0,
    };

    // Calculate usage strictly from this employee's requests
    for (const req of formattedRequests) {
      const typeKey = req.leaveType?.toLowerCase().includes("sick")
        ? "sick"
        : req.leaveType?.toLowerCase().includes("medical")
        ? "medical"
        : "casual";

      const daysNum = Number(req.days) || 0;

      if (req.status === "Approved") {
        usedBalances[typeKey] += daysNum;
      } else if (req.status === "Pending") {
        pendingBalances[typeKey] += daysNum;
      }
    }

    const casualAvailable = Math.max(0, initialBalances.casual - usedBalances.casual);
    const sickAvailable = Math.max(0, initialBalances.sick - usedBalances.sick);
    const medicalAvailable = Math.max(0, initialBalances.medical - usedBalances.medical);

    const totalAllocated = initialBalances.casual + initialBalances.sick + initialBalances.medical;
    const totalUsed = usedBalances.casual + usedBalances.sick + usedBalances.medical;
    const totalPending = pendingBalances.casual + pendingBalances.sick + pendingBalances.medical;
    const totalAvailable = Math.max(0, totalAllocated - totalUsed);

    const leaveBalance = {
      casual: {
        total: initialBalances.casual,
        used: usedBalances.casual,
        pending: pendingBalances.casual,
        available: casualAvailable,
      },
      sick: {
        total: initialBalances.sick,
        used: usedBalances.sick,
        pending: pendingBalances.sick,
        available: sickAvailable,
      },
      medical: {
        total: initialBalances.medical,
        used: usedBalances.medical,
        pending: pendingBalances.medical,
        available: medicalAvailable,
      },
      total: {
        total: totalAllocated,
        used: totalUsed,
        pending: totalPending,
        available: totalAvailable,
      },
    };

    const profile = {
      id: user.employeeId,
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      department: user.department || "Unassigned",
      designation: user.designation || "Employee",
      joiningDate: user.joiningDate || (user.createdAt ? new Date(user.createdAt).toISOString().split("T")[0] : ""),
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces&auto=format&q=80`,
      role: user.role,
      leaveBalance,
    };

    return NextResponse.json({
      success: true,
      profile,
      leaveRequests: formattedRequests,
    });
  } catch (error) {
    console.error("Fetch employee dashboard error:", error.message);
    return NextResponse.json(
      { success: false, message: "Could not load employee dashboard data" },
      { status: 500 }
    );
  }
}
