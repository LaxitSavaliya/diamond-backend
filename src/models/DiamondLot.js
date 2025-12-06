import mongoose from "mongoose";

const { Schema, model } = mongoose;

const diamondLotSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
      required: true,
    },
    kapanNumber: {
      type: String,
      required: true,
    },
    uniqueId: {
      type: Number,
      required: true,
      unique: true,
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
      ref: "Shape",
      required: true,
    },
    polishWeight: {
      type: Number,
    },
    colorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Color",
    },
    clarityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clarity",
    },
    polishDate: {
      type: Date,
    },
    rate: {
      type: Number,
    },
    amount: {
      type: Number,
    },
    statusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Status",
    },
    HPHTWeight: {
      type: Number,
    },
    HPHTDate: {
      type: Date,
    },
    paymentStatusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentStatus",
    },
    remark: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const DiamondLot = model("DiamondLot", diamondLotSchema);

export default DiamondLot;
