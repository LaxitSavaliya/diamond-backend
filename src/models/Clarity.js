import mongoose from "mongoose";

const claritySchema = new mongoose.Schema(
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

const Clarity = mongoose.model("Clarity", claritySchema);

export default Clarity;