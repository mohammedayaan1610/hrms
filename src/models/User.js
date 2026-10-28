
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    department: {
      type: String,
      default: "Unassigned",
      trim: true,
    },
    designation: {
      type: String,
      default: "Employee",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    joiningDate: {
      type: String,
      default: "",
      trim: true,
    },
    role: {
      type: String,
      enum: ["employee", "admin"],
      default: "employee",
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    leaveBalance: {
      casual: {
        allocated: { type: Number, default: 5 },
        used: { type: Number, default: 0 },
      },
      sick: {
        allocated: { type: Number, default: 5 },
        used: { type: Number, default: 0 },
      },
      medical: {
        allocated: { type: Number, default: 5 },
        used: { type: Number, default: 0 },
      },
    },
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);
