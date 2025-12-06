import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
    {
        rate: {
            type: Number,
            required: true,
            min: [0, "Rate must be a positive number"],
        },
        date: {
            type: Date,
            required: true,
        },
    },
    { _id: true }
);

const rateSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        partyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Party",
            required: true,
            index: true,
        },

        startingValue: {
            type: Number,
            required: true,
            min: [0, "Starting value must be positive"],
        },

        endingValue: {
            type: Number,
            required: true,
            min: [0, "Ending value must be positive"],
        },

        items: {
            type: [itemSchema],
            default: [],
        },
    },
    { timestamps: true }
);

// Optional: ensure endingValue is always > startingValue
rateSchema.pre("save", function (next) {
    if (this.endingValue <= this.startingValue) {
        return next(new Error("endingValue must be greater than startingValue"));
    }
    next();
});

const Rate = mongoose.model("Rate", rateSchema);

export default Rate;