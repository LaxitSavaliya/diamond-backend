import mongoose from "mongoose";

const shapeSchema = new mongoose.Schema(
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

const Shape = mongoose.model("Shape", shapeSchema);

export default Shape;