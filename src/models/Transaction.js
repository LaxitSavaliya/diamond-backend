import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        partyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Party',
            required: true
        },
        amount: {
            type: Number,
            required: true,
        },
        date: {
            type: Date,
            required: true,
            default: Date.now
        },
        type: {
            type: String,
            enum: ['Paid', 'Offset'],
            required: true
        },
        remark: {
            type: String,
            trim: true
        }
    },
    { timestamps: true, }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;