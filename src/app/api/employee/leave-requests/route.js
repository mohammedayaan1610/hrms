import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import LeaveRequest from "@/models/LeaveRequest";
import { authOptions } from "@/lib/auth";

// GET /api/employee/leave-requests - List only the authenticated employee's leave requests
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

    const employeeId = session.user.employeeId;
    if (!employeeId) {
      return NextResponse.json(
        { success: false, message: "Employee identity missing from session" },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      $or: [
        { email: session.user.email },
        { employeeId },
      ],
    }).select("isActive");

    if (user && user.isActive === false) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Account is inactive" },
        { status: 403 }
      );
    }

    const cleanId = (employeeId || "").replace("-", "");
    const requests = await LeaveRequest.find({
      $or: [
        { employeeId },
        { employeeId: cleanId },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    const formattedRequests = requests.map((r) => ({
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

    return NextResponse.json({
      success: true,
      leaveRequests: formattedRequests,
    });
  } catch (error) {
    console.error("Fetch employee leave requests error:", error.message);
    return NextResponse.json(
      { success: false, message: "Could not fetch leave requests" },
      { status: 500 }
    );
  }
}

// POST /api/employee/leave-requests - Submit a new leave request (ownership derived strictly from session)
export async function POST(request) {
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

    // Verify authenticated user from database
    const user = await User.findOne({
      $or: [
        { email: session.user.email },
        { employeeId: session.user.employeeId },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Employee record not found" },
        { status: 404 }
      );
    }

    if (user.isActive === false) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Account is inactive" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { leaveType, startDate, endDate, days, reason } = body;

    // Validate inputs
    const validTypes = ["Casual Leave", "Sick Leave", "Medical Leave"];
    if (!validTypes.includes(leaveType)) {
      return NextResponse.json(
        { success: false, message: "Invalid leave type" },
        { status: 400 }
      );
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: "Start date and end date are required" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid date format provided" },
        { status: 400 }
      );
    }

    if (start > end) {
      return NextResponse.json(
        { success: false, message: "End date cannot be earlier than start date" },
        { status: 400 }
      );
    }

    const daysNum = Number(days);
    if (!daysNum || isNaN(daysNum) || daysNum < 1 || !Number.isInteger(daysNum)) {
      return NextResponse.json(
        { success: false, message: "Days must be a positive whole number" },
        { status: 400 }
      );
    }

    if (!reason || !reason.trim() || reason.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          message: "A detailed reason of at least 10 characters is required",
        },
        { status: 400 }
      );
    }

    // Verify available balance:
    // 5 days each initially. Only Approved requests reduce available balance.
    const typeKey = leaveType.toLowerCase().includes("sick")
      ? "sick"
      : leaveType.toLowerCase().includes("medical")
      ? "medical"
      : "casual";

    const approvedRequests = await LeaveRequest.find({
      employeeId: user.employeeId,
      leaveType,
      status: "Approved",
    }).lean();

    const usedDays = approvedRequests.reduce((acc, cur) => acc + (Number(cur.days) || 0), 0);
    const available = Math.max(0, 5 - usedDays);

    if (daysNum > available) {
      return NextResponse.json(
        {
          success: false,
          message: `Requested days (${daysNum}) exceeds your remaining available balance (${available} days).`,
        },
        { status: 400 }
      );
    }

    const requestId = `LR-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split("T")[0];

    const newRequest = await LeaveRequest.create({
      requestId,
      employeeId: user.employeeId, // Enforced from authenticated server session
      employeeName: user.name,
      department: user.department || "Unassigned",
      leaveType,
      startDate,
      endDate,
      days: daysNum,
      reason: reason.trim(),
      status: "Pending",
      appliedOn: today,
      reviewerNote: null,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Leave application submitted successfully",
        request: {
          id: newRequest.requestId,
          _id: newRequest._id.toString(),
          employeeId: newRequest.employeeId,
          employeeName: newRequest.employeeName,
          department: newRequest.department,
          leaveType: newRequest.leaveType,
          startDate: newRequest.startDate,
          endDate: newRequest.endDate,
          days: newRequest.days,
          reason: newRequest.reason,
          status: newRequest.status,
          appliedOn: newRequest.appliedOn,
          reviewerNote: newRequest.reviewerNote,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submit leave request error:", error.message);
    return NextResponse.json(
      { success: false, message: "Could not submit leave request" },
      { status: 500 }
    );
  }
}
