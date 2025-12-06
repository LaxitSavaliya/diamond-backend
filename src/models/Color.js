import mongoose from "mongoose";

const colorSchema = new mongoose.Schema(
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

const Color = mongoose.model("Color", colorSchema);

export default Color;