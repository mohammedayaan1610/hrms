import mongoose from "mongoose";
import User from "../src/models/User.js";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: "hrms",
  });

  try {
    const emailToCheck = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "admin@pulsehrms.com";
    const user = await User.findOne({
      email: emailToCheck,
    }).select("name email role employeeId");

    console.log("Database: hrms");

    if (!user) {
      console.log("Admin account: NOT FOUND");
      return;
    }

    console.log("Account found: YES");
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("Employee ID:", user.employeeId);
    console.log(
      "Can access admin dashboard:",
      user.role === "admin" ? "YES" : "NO"
    );
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("Verification failed:", error.message);
  process.exitCode = 1;
});
