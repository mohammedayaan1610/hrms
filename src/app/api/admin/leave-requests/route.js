import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import LeaveRequest from "@/models/LeaveRequest";
import { authOptions } from "@/lib/auth";

// GET /api/admin/leave-requests - List all leave requests for admin oversight
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Please sign in" },
        { status: 401 }
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const requests = await LeaveRequest.find({})
      .sort({ createdAt: -1 })
      .lean();

    const formatted = requests.map((r) => ({
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
      count: formatted.length,
      leaveRequests: formatted,
    });
  } catch (error) {
    console.error("Fetch admin leave requests error:", error.message);
    return NextResponse.json(
      { success: false, message: "Could not fetch leave requests" },
      { status: 500 }
    );
  }
}
