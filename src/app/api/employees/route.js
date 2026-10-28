import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import ArchivedUser from "@/models/ArchivedUser";
import { authOptions } from "@/lib/auth";

function formatEmployee(emp, archived = false) {
  const casual = emp.leaveBalance?.casual || { allocated: 5, used: 0 };
  const sick = emp.leaveBalance?.sick || { allocated: 5, used: 0 };
  const medical = emp.leaveBalance?.medical || { allocated: 5, used: 0 };

  return {
    id: emp.employeeId,
    _id: emp._id.toString(),
    name: emp.name,
    email: emp.email,
    department: emp.department || "Unassigned",
    designation: emp.designation || "Employee",
    phone: emp.phone || "",
    joiningDate:
      emp.joiningDate ||
      (emp.createdAt ? new Date(emp.createdAt).toISOString().split("T")[0] : ""),
    status: archived ? "Archived" : "Active",
    isActive: !archived,
    deletedAt: emp.deletedAt || null,
    role: emp.role,
    leaveBalance: {
      casual: casual.allocated - casual.used,
      sick: sick.allocated - sick.used,
      medical: medical.allocated - medical.used,
      totalRemaining:
        casual.allocated - casual.used +
        sick.allocated - sick.used +
        medical.allocated - medical.used,
      raw: emp.leaveBalance,
    },
  };
}

// GET /api/employees?status=active|archived|all
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "active";

    if (!["active", "archived", "all"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status filter" },
        { status: 400 }
      );
    }

    const activeQuery = User.find({
      role: "employee",
      isActive: { $ne: false },
    }).select("-passwordHash").lean();

    // Legacy archived employees are still in users with isActive:false.
    const legacyArchivedQuery = User.find({
      role: "employee",
      isActive: false,
    }).select("-passwordHash").lean();

    const archivedQuery = ArchivedUser.find({
      role: "employee",
    }).select("-passwordHash").lean();

    const [activeDocs, legacyArchivedDocs, archivedDocs] = await Promise.all([
      activeQuery,
      legacyArchivedQuery,
      archivedQuery,
    ]);

    const activeEmployees = activeDocs.map((emp) => formatEmployee(emp, false));
    const legacyArchived = legacyArchivedDocs.map((emp) => formatEmployee(emp, true));
    const archivedEmployees = archivedDocs.map((emp) => formatEmployee(emp, true));

    // Prefer archivedUsers when a record exists in both collections.
    const archivedIds = new Set(
      archivedEmployees.map((emp) => String(emp.id).toLowerCase())
    );
    const legacyOnly = legacyArchived.filter(
      (emp) => !archivedIds.has(String(emp.id).toLowerCase())
    );
    const allArchived = [...archivedEmployees, ...legacyOnly];

    let employees;
    if (status === "active") employees = activeEmployees;
    else if (status === "archived") employees = allArchived;
    else employees = [...activeEmployees, ...allArchived];

    employees.sort((a, b) => String(b.joiningDate).localeCompare(String(a.joiningDate)));

    return NextResponse.json({
      success: true,
      count: employees.length,
      activeCount: activeEmployees.length,
      archivedCount: allArchived.length,
      employees,
    });
  } catch (error) {
    console.error("Fetch employees failed:", error);
    return NextResponse.json(
      { success: false, message: "Could not fetch employees" },
      { status: 500 }
    );
  }
}

// POST /api/employees - Create employee (Admin only)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
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

    const body = await request.json();
    const {
      name,
      email,
      employeeId,
      department,
      designation,
      phone,
      joiningDate,
      password,
    } = body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof employeeId !== "string" ||
      !employeeId.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "Name, email, and employee ID are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedEmployeeId = employeeId.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    await connectDB();

    const duplicateFilter = {
      $or: [
        { email: normalizedEmail },
        { employeeId: normalizedEmployeeId },
      ],
    };

    const [existingUser, existingArchived] = await Promise.all([
      User.findOne(duplicateFilter),
      ArchivedUser.findOne(duplicateFilter),
    ]);

    if (existingUser || existingArchived) {
      const existing = existingUser || existingArchived;
      const isEmailDuplicate = existing.email === normalizedEmail;

      return NextResponse.json(
        {
          success: false,
          message: isEmailDuplicate
            ? `An employee with email "${normalizedEmail}" already exists, including archived records.`
            : `An employee with ID "${normalizedEmployeeId}" already exists, including archived records.`,
        },
        { status: 409 }
      );
    }

    const rawPassword =
      typeof password === "string" && password.trim().length >= 6
        ? password.trim()
        : crypto.randomUUID().slice(0, 10);

    const passwordHash = await bcrypt.hash(rawPassword, 12);

    const initialLeaveBalance = {
      casual: { allocated: 5, used: 0 },
      sick: { allocated: 5, used: 0 },
      medical: { allocated: 5, used: 0 },
    };

    const newEmployee = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      employeeId: normalizedEmployeeId,
      department: department?.trim() || "Engineering",
      designation: designation?.trim() || "Employee",
      phone: phone?.trim() || "",
      joiningDate: joiningDate?.trim() || new Date().toISOString().split("T")[0],
      role: "employee",
      passwordHash,
      leaveBalance: initialLeaveBalance,
      isActive: true,
      deletedAt: null,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Employee account created successfully",
        employee: {
          id: newEmployee.employeeId,
          _id: newEmployee._id.toString(),
          name: newEmployee.name,
          email: newEmployee.email,
          employeeId: newEmployee.employeeId,
          department: newEmployee.department,
          designation: newEmployee.designation,
          phone: newEmployee.phone,
          joiningDate: newEmployee.joiningDate,
          role: newEmployee.role,
          leaveBalance: {
            casual: 5,
            sick: 5,
            medical: 5,
            totalRemaining: 15,
            raw: newEmployee.leaveBalance,
          },
          status: "Active",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create employee failed:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Email or employee ID already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Could not create employee" },
      { status: 500 }
    );
  }
}
