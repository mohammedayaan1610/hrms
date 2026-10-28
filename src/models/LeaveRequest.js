import mongoose from "mongoose";

const LeaveRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    employeeId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      default: "Unassigned",
      trim: true,
    },
    leaveType: {
      type: String,
      required: true,
      enum: ["Casual Leave", "Sick Leave", "Medical Leave"],
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    days: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },
    appliedOn: {
      type: String,
      required: true,
    },
    reviewerNote: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.LeaveRequest ||
  mongoose.model("LeaveRequest", LeaveRequestSchema);
