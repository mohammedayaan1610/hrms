import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import ArchivedUser from "@/models/ArchivedUser";
import { authOptions } from "@/lib/auth";

async function adminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Please sign in.", status: 401 };
  if (session.user.role !== "admin") {
    return { error: "Admin access required.", status: 403 };
  }
  return { session };
}

function idQuery(id) {
  const value = decodeURIComponent(id).trim();
  const conditions = [{ employeeId: value }];
  if (/^[a-fA-F0-9]{24}$/.test(value)) conditions.push({ _id: value });
  return { $or: conditions };
}

// Archive an employee: move users -> archivedUsers.
export async function DELETE(request, context) {
  const auth = await adminSession();
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    );
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Employee ID is required." },
      { status: 400 }
    );
  }

  await connectDB();
  const dbSession = await mongoose.startSession();
  let result;

  try {
    await dbSession.withTransaction(async () => {
      const employee = await User.findOne(idQuery(id))
        .select("+passwordHash")
        .session(dbSession);

      if (!employee) {
        throw new Error("Active employee not found in users.");
      }
      if (employee.role !== "employee") {
        throw new Error("Only employee accounts can be archived.");
      }
      if (employee.isActive === false) {
        throw new Error(
          "This employee is already archived in users. Run the legacy migration before archiving again."
        );
      }

      const duplicate = await ArchivedUser.findOne({
        $or: [
          { _id: employee._id },
          { employeeId: employee.employeeId },
          { email: employee.email },
        ],
      }).session(dbSession);

      if (duplicate) {
        throw new Error("An archived record already exists. No changes made.");
      }

      const archivedData = employee.toObject();
      delete archivedData.__v;
      archivedData.isActive = false;
      archivedData.deletedAt = new Date();

      await ArchivedUser.create([archivedData], { session: dbSession });

      const removed = await User.deleteOne(
        { _id: employee._id, role: "employee", isActive: { $ne: false } },
        { session: dbSession }
      );

      if (removed.deletedCount !== 1) {
        throw new Error("Could not complete archive; transaction rolled back.");
      }

      result = { id: employee.employeeId, name: employee.name };
    });

    return NextResponse.json({
      success: true,
      message: `${result.name} (${result.id}) moved to archivedUsers.`,
      employee: { ...result, status: "Archived", isActive: false },
    });
  } catch (error) {
    console.error("Archive failed:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Could not archive employee." },
      { status: 400 }
    );
  } finally {
    await dbSession.endSession();
  }
}

// Restore an employee: archivedUsers -> users.
// Also supports legacy records still marked inactive in users.
export async function PATCH(request, context) {
  const auth = await adminSession();
  if (auth.error) {
    return NextResponse.json(
      { success: false, message: auth.error },
      { status: auth.status }
    );
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json(
      { success: false, message: "Employee ID is required." },
      { status: 400 }
    );
  }

  await connectDB();
  const dbSession = await mongoose.startSession();
  let result;

  try {
    await dbSession.withTransaction(async () => {
      const archived = await ArchivedUser.findOne(idQuery(id))
        .select("+passwordHash")
        .session(dbSession);

      if (!archived) {
        const legacy = await User.findOne(idQuery(id)).session(dbSession);

        if (legacy?.role === "employee" && legacy.isActive === false) {
          legacy.isActive = true;
          legacy.deletedAt = null;
          await legacy.save({ session: dbSession });
          result = { id: legacy.employeeId, name: legacy.name };
          return;
        }

        throw new Error("Archived employee not found.");
      }

      const duplicate = await User.findOne({
        $or: [
          { _id: archived._id },
          { employeeId: archived.employeeId },
          { email: archived.email },
        ],
      }).session(dbSession);

      if (duplicate) {
        throw new Error(
          "A matching record already exists in users. No changes made."
        );
      }

      const restoredData = archived.toObject();
      delete restoredData.__v;
      restoredData.isActive = true;
      restoredData.deletedAt = null;

      await User.create([restoredData], { session: dbSession });

      const removed = await ArchivedUser.deleteOne(
        { _id: archived._id },
        { session: dbSession }
      );

      if (removed.deletedCount !== 1) {
        throw new Error("Could not complete restore; transaction rolled back.");
      }

      result = { id: archived.employeeId, name: archived.name };
    });

    return NextResponse.json({
      success: true,
      message: `${result.name} (${result.id}) restored to users.`,
      employee: { ...result, status: "Active", isActive: true },
    });
  } catch (error) {
    console.error("Restore failed:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Could not restore employee." },
      { status: 400 }
    );
  } finally {
    await dbSession.endSession();
  }
}
