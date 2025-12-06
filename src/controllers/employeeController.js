import Employee from "../models/Employee.js";

export const getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Employee data fetched Successfully',
            data: employees,
        });
    } catch (error) {
        console.error('Error in getEmployees controller: ', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createEmployee = async (req, res) => {
    try {
        const { name, active, remark } = req.body;

        if (!name || name.trim() === "") {
            return res
                .status(400)
                .json({ success: false, message: "Name is required." });
        }

        const existingEmployee = await Employee.findOne({ name: name.trim() });
        if (existingEmployee) {
            return res
                .status(400)
                .json({ success: false, message: "Employee already exists." });
        }

        const employee = await Employee.create({
            name: name.trim(),
            active: active ?? false,
            remark
        });

        res.status(201).json({
            success: true,
            message: "Employee created successfully",
            data: employee,
        });
    } catch (error) {
        console.error("Error in createEmployee controller:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateEmployee = async (req, res) => {
    try {
        if (!req.body.name) return res.status(500).json({ success: false, message: "Name is required." });

        const employee = await Employee.findByIdAndUpdate(
            req.params.employeeId,
            req.body,
            { new: true }
        );

        if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

        res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            data: employee,
        });
    } catch (error) {
        console.error('Error in updateEmployee controller: ', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.employeeId);

        if (!employee) return res.status(404).json({ success: false, message: "Employee not found" });

        res.status(200).json({
            success: true,
            message: "Employee deleted successfully",
        });
    } catch (error) {
        console.error('Error in deleteEmployee controller: ', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};