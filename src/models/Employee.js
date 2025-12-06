import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        active: {
            type: Boolean,
            default: false,
        },
        remark: {
            type: String
        }
    },
    { timestamps: true, }
);

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;