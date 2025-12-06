import mongoose from "mongoose";

const partySchema = new mongoose.Schema(
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

const Party = mongoose.model("Party", partySchema);

export default Party;