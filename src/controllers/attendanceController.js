import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

export const markAttendance = async (req, res) => {
    try {
        const { employeeId, date, status, remarks } = req.body;

        if (!employeeId || !date || !status) {
            return res.status(400).json({
                success: false,
                message: "employeeId, date and status are required",
            });
        }

        const existingEmployee = await Employee.findById(employeeId);
        if (!existingEmployee) {
            return res.status(400).json({
                success: false,
                message: "Employee NOT found.",
            });
        }

        if (status !== 'Present' && status !== 'Halfday' && status !== 'Absent') {
            return res.status(400).json({
                success: false,
                message: "Status must be Present, Halfday or Absent.",
            });
        }

        // Convert date to actual date object
        const attendanceDate = new Date(date);

        // Check if attendance document exists for employee
        let record = await Attendance.findOne({ employeeId });

        if (!record) {
            // Create new record
            record = await Attendance.create({
                employeeId,
                attendance: [{ date: attendanceDate, status }],
                remarks: remarks || "",
            });
        } else {
            // Check if date already exists in attendance array
            const existingIndex = record.attendance.findIndex(
                (entry) =>
                    entry.date.toDateString() === attendanceDate.toDateString()
            );

            if (existingIndex !== -1) {
                // Update existing
                record.attendance[existingIndex].status = status;
            } else {
                // Add new entry
                record.attendance.push({ date: attendanceDate, status });
            }

            if (remarks) record.remarks = remarks;

            await record.save();
        }

        res.status(200).json({
            success: true,
            message: "Attendance marked successfully",
            data: record,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error in marking attendance",
            error: error.message,
        });
    }
};

export const getAttendanceByEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;

        const data = await Attendance.findOne({ employeeId }).populate("employeeId");

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "No attendance found for this employee",
            });
        }

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error while fetching attendance",
            error: error.message,
        });
    }
};

export const deleteAttendanceDate = async (req, res) => {
    try {
        const { employeeId, date } = req.body;

        if (!employeeId || !date) {
            return res.status(400).json({
                success: false,
                message: "employeeId and date are required",
            });
        }

        const attendanceDate = new Date(date);

        const record = await Attendance.findOne({ employeeId });

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Attendance record not found",
            });
        }

        record.attendance = record.attendance.filter(
            (entry) => entry.date.toDateString() !== attendanceDate.toDateString()
        );

        await record.save();

        res.status(200).json({
            success: true,
            message: "Attendance date deleted",
            data: record,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error while deleting attendance date",
            error: error.message,
        });
    }
};

export const getAllAttendance = async (req, res) => {
    try {
        const data = await Attendance.find().populate("employeeId");

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching all attendance",
            error: error.message,
        });
    }
};