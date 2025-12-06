import mongoose from "mongoose";

const AttendanceEntrySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Halfday", "Absent"],
      required: true,
    },
  },
  { _id: false }
);

const AttendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    attendance: {
      type: [AttendanceEntrySchema],
      default: [],
    },

    remarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

AttendanceSchema.index(
  { employeeId: 1, "attendance.date": 1 },
  { unique: true }
);

const Attendance = mongoose.model("Attendance", AttendanceSchema);

export default Attendance;
