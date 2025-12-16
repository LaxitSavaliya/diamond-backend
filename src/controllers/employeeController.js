import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";

// ========================= GET EMPLOYEES (Paginated + Search + Filter) =========================

export const getEmployees = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const search = req.query.search || "";
        const status = req.query.status || "All";

        const limit = 5;
        const skip = (page - 1) * limit;

        const filter = {};

        if (search.trim() !== "") {
            filter.name = { $regex: search, $options: "i" };
        }

        if (status === "Active") {
            filter.active = true;
        } else if (status === "Deactive") {
            filter.active = false;
        }

        const totalEmployees = await Employee.countDocuments(filter);

        const employees = await Employee.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPages = Math.max(1, Math.ceil(totalEmployees / limit));

        res.status(200).json({
            success: true,
            message: "Employees data fetched successfully",
            totalCount: totalEmployees,
            totalPages,
            currentPage: page,
            data: employees,
        });
    } catch (error) {
        console.error("Error in getEmployees controller:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ========================= GET ALL ACTIVE EMPLOYEES =========================

export const allEmployees = async (req, res) => {
    try {
        const allEmployee = await Employee.find({ active: true }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "All active employees fetched successfully",
            data: allEmployee,
        });
    } catch (error) {
        console.error("Error in allEmployees controller:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ========================= CREATE EMPLOYEE =========================

export const createEmployee = async (req, res) => {
    try {
        const { name, active = true, remark = "" } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name is required",
            });
        }

        const existingEmployee = await Employee.findOne({
            name: name.trim(),
        });

        if (existingEmployee) {
            return res.status(400).json({
                success: false,
                message: "Employee already exists",
            });
        }

        // 1️⃣ Create employee
        const employee = await Employee.create({
            name: name.trim(),
            active,
            remark,
        });

        // 2️⃣ Create empty attendance list for employee
        await Attendance.create({
            employeeId: employee._id,
            attendance: [],
            remarks: "",
        });

        return res.status(201).json({
            success: true,
            message: "Employee created successfully",
            data: employee,
        });
    } catch (error) {
        console.error("Error in createEmployee:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ========================= UPDATE EMPLOYEE =========================

export const updateEmployee = async (req, res) => {
    try {
        if (req.body.name !== undefined && req.body.name.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Name cannot be empty.",
            });
        }

        const employee = await Employee.findByIdAndUpdate(
            req.params.employeeId,
            { $set: req.body },
            { new: true }
        );

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            data: employee,
        });
    } catch (error) {
        console.error("Error in updateEmployee controller:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ========================= DELETE EMPLOYEE =========================

export const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.employeeId);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Employee deleted successfully",
        });
    } catch (error) {
        console.error("Error in deleteEmployee controller:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};