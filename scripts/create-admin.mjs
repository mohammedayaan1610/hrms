import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User.js";

async function main() {
  const uri = process.env.MONGODB_URI;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const employeeId = process.env.ADMIN_EMPLOYEE_ID || "HRMS-ADMIN-001";

  if (!uri || !email || !password) {
    throw new Error("Missing MongoDB URI, admin email, or admin password.");
  }

  if (password.length < 12) {
    throw new Error("Use a password of at least 12 characters.");
  }

  await mongoose.connect(uri, {
    dbName: "hrms",
    bufferCommands: false,
  });

  try {
    const existing = await User.findOne({
      $or: [{ email }, { employeeId }],
    });

    if (existing) {
      throw new Error(
        "That email or employee ID already exists. No account was changed."
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await User.create({
      name: "HR Administrator",
      email,
      employeeId,
      department: "Human Resources",
      designation: "HR Administrator",
      role: "admin",
      passwordHash,
    });

    console.log("Admin account created successfully.");
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);
    console.log("Database: hrms");
    console.log("Password was hashed and was not displayed.");
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("Admin setup failed:", error.message);
  process.exitCode = 1;
});
