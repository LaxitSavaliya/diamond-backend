import mongoose from "mongoose";

const statusSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true, }
);

const Status = mongoose.model("Status", statusSchema);

export default Status;