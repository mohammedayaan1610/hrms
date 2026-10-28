import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";

// PATCH /api/employee/profile - Authenticated employee can update only their allowed personal info
export async function PATCH(request) {
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

    const body = await request.json();
    const { phone, name } = body;

    await connectDB();

    // Find the authenticated user from session strictly
    const user = await User.findOne({
      $or: [
        { email: session.user.email },
        { employeeId: session.user.employeeId },
      ],
    });

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

    // Only allow updating permitted personal fields
    if (typeof phone === "string") {
      user.phone = phone.trim();
    }
    if (typeof name === "string" && name.trim()) {
      user.name = name.trim();
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        id: user.employeeId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        designation: user.designation,
        joiningDate: user.joiningDate,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    return NextResponse.json(
      { success: false, message: "Could not update profile" },
      { status: 500 }
    );
  }
}
