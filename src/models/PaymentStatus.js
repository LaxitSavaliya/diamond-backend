import mongoose from "mongoose";

const paymentStatusSchema = new mongoose.Schema(
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

const PaymentStatus = mongoose.model("PaymentStatus", paymentStatusSchema);

export default PaymentStatus;