import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import LeaveRequest from "@/models/LeaveRequest";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";

// PATCH /api/admin/leave-requests/[id] - Approve or reject a leave request
export async function PATCH(request, context) {
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

    const { id } = await context.params;
    const body = await request.json();
    const { status, reviewerNote } = body;

    if (!["Approved", "Rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Status must be Approved or Rejected" },
        { status: 400 }
      );
    }

    await connectDB();

    const leaveReq = await LeaveRequest.findOne({
      $or: [{ requestId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }].filter(Boolean),
    });

    if (!leaveReq) {
      return NextResponse.json(
        { success: false, message: "Leave request not found" },
        { status: 404 }
      );
    }

    if (leaveReq.status === status) {
      return NextResponse.json(
        {
          success: false,
          message: `Leave request is already marked as ${status}.`,
        },
        { status: 400 }
      );
    }

    if (leaveReq.status !== "Pending") {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot modify a request that has already been finalized as ${leaveReq.status}.`,
        },
        { status: 400 }
      );
    }

    const previousStatus = leaveReq.status;
    leaveReq.status = status;
    if (reviewerNote !== undefined) {
      leaveReq.reviewerNote = reviewerNote;
    }
    await leaveReq.save();

    // If approved, update the User document's leaveBalance cache if present
    if (status === "Approved" && previousStatus !== "Approved") {
      const typeKey = leaveReq.leaveType?.toLowerCase().includes("sick")
        ? "sick"
        : leaveReq.leaveType?.toLowerCase().includes("medical")
        ? "medical"
        : "casual";

      await User.updateOne(
        { employeeId: leaveReq.employeeId },
        {
          $inc: {
            [`leaveBalance.${typeKey}.used`]: leaveReq.days,
          },
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully`,
      leaveRequest: {
        id: leaveReq.requestId,
        _id: leaveReq._id.toString(),
        employeeId: leaveReq.employeeId,
        employeeName: leaveReq.employeeName,
        department: leaveReq.department,
        leaveType: leaveReq.leaveType,
        startDate: leaveReq.startDate,
        endDate: leaveReq.endDate,
        days: leaveReq.days,
        reason: leaveReq.reason,
        status: leaveReq.status,
        appliedOn: leaveReq.appliedOn,
        reviewerNote: leaveReq.reviewerNote,
      },
    });
  } catch (error) {
    console.error("Update leave request error:", error.message);
    return NextResponse.json(
      { success: false, message: "Could not update leave request" },
      { status: 500 }
    );
  }
}
