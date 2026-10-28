import mongoose from "mongoose";

const ArchivedUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    employeeId: { type: String, required: true, trim: true },
    department: { type: String, default: "Unassigned" },
    designation: { type: String, default: "Employee" },
    phone: { type: String, default: "" },
    joiningDate: { type: String, default: "" },
    role: {
      type: String,
      enum: ["employee"],
      default: "employee",
      required: true,
    },
    passwordHash: { type: String, required: true, select: false },
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
    isActive: { type: Boolean, default: false },
    deletedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: "archivedUsers",
  }
);

export default mongoose.models.ArchivedUser ||
  mongoose.model("ArchivedUser", ArchivedUserSchema);
