import mongoose from "mongoose";

const diamondSchema = new mongoose.Schema(
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
        kapanNumber: {
            type: String,
            required: true,
        },
        PKTNumber: {
            type: String,
            required: true,
        },
        issueWeight: {
            type: Number,
            required: true,
        },
        expectedWeight: {
            type: Number,
            required: true,
        },
        shapeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shape',
            required: true
        },
        polishWeight: {
            type: Number
        },
        colorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Color',
        },
        clarityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Clarity',
        },
        polishDate: {
            type: Date
        },
        statusId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Status',
        },
        HPHTWeight: {
            type: Number
        },
        HPHTDate: {
            type: Date
        },
        paymentStatusId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PaymentStatus',
        },
        remark: {
            type: String
        },
        date: {
            type: Date,
            required: true
        },
    },
    { timestamps: true, }
);

const Diamond = mongoose.model("Diamond", diamondSchema);

export default Diamond;