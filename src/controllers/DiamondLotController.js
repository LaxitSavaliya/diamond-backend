// ---------------- IMPORTS ----------------
import mongoose from "mongoose";
import DiamondLot from "../models/DiamondLot.js";
import Party from "../models/Party.js";
import Shape from "../models/Shape.js";
import Color from "../models/Color.js";
import Clarity from "../models/Clarity.js";
import PaymentStatus from "../models/PaymentStatus.js";
import Status from "../models/Status.js";
import Rate from "../models/Rate.js";

const ObjectId = mongoose.Types.ObjectId;

// ---------------- GENERIC VALIDATOR ----------------
const validateId = async (id, Model, name) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`${name} ID is invalid`);
  }

  const exists = await Model.findById(id);
  if (!exists) {
    throw new Error(`${name} not found`);
  }

  return true;
};

const validateParty = (id) => validateId(id, Party, "Party");
const validateColors = (id) => validateId(id, Color, "Color");
const validateClarity = (id) => validateId(id, Clarity, "Clarity");
const validateStatus = (id) => validateId(id, Status, "Status");
const validatePaymentStatus = (id) => validateId(id, PaymentStatus, "Payment Status");

const validateShapes = async (shapeIds) => {
  for (const id of shapeIds) {
    await validateId(id, Shape, "Shape");
  }
};

const validateItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) return false;

  return items.every((item) =>
    item.PKTNumber &&
    item.issueWeight &&
    item.expectedWeight &&
    item.shapeId &&
    item.date
  );
};

// ---------------- UNIQUE ID CREATION ----------------
const generateUniqueIds = async (items) => {
  const last = await DiamondLot.findOne({}, { uniqueId: 1 })
    .sort({ uniqueId: -1 })
    .lean();

  let lastNumber = last?.uniqueId || 0;

  items.forEach((item, i) => {
    item.uniqueId = lastNumber + i + 1;
  });
};

// -----------------------------------------------------
// ---------------- CREATE DIAMOND LOT -----------------
// -----------------------------------------------------
export const createDiamondLot = async (req, res) => {
  try {
    const { partyId, kapanNumber, items } = req.body;

    if (!partyId || !kapanNumber || !validateItems(items)) {
      return res.status(400).json({
        success: false,
        message: "partyId, kapanNumber and valid items array are required.",
      });
    }

    // Validate expectedWeight <= issueWeight
    for (const item of items) {
      if (Number(item.expectedWeight) > Number(item.issueWeight)) {
        return res.status(400).json({
          success: false,
          message: `ExpectedWeight (${item.expectedWeight}) cannot be bigger than IssueWeight (${item.issueWeight})`,
        });
      }
    }

    await validateParty(partyId);
    await validateShapes(items.map((i) => i.shapeId));

    // Create unique Ids
    await generateUniqueIds(items);

    const saved = await DiamondLot.insertMany(
      items.map((item) => ({
        userId: req.user._id,
        partyId,
        kapanNumber,
        ...item,
      }))
    );

    const populated = await DiamondLot.find({
      _id: { $in: saved.map((s) => s._id) },
    })
      .populate("userId", "name")
      .populate("partyId", "name")
      .populate("shapeId", "name")
      .populate("colorId", "name")
      .populate("clarityId", "name")
      .populate("statusId", "name")
      .populate("paymentStatusId", "name")
      .lean();

    return res.status(200).json({ success: true, data: populated });
  } catch (err) {
    console.error("Error (createDiamondLot):", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// -----------------------------------------------------
// ------------------- GET MULTIPLE LOTS ---------------
// -----------------------------------------------------
export const getDiamondLots = async (req, res) => {
  try {
    const {
      uniqueIdReverse,
      dateReverse,
      polishDateReverse,
      HPHTDateReverse,
    } = req.query;

    const page = Number(req.query.page || 1);
    const ITEMS = Number(req.query.record || 20);

    let {
      partyId,
      kapanNumber,
      statusId,
      paymentStatusId,
      search,
      startDate,
      endDate,
    } = req.query;

    const match = { userId: req.user._id };

    // -------- FILTER HELPERS ----------
    const parseArray = (value) => {
      if (!value) return [];
      if (typeof value === "string" && value.startsWith("[")) {
        try {
          return JSON.parse(value);
        } catch {
          return [value];
        }
      }
      return Array.isArray(value) ? value : [value];
    };

    const validateArrayIds = (arr, fieldName) => {
      const invalid = arr.some((id) => !ObjectId.isValid(id));
      if (invalid)
        return res.status(400).json({
          success: false,
          message: `Invalid ${fieldName} in array`,
        });
      return null;
    };

    // -------- PARTY FILTER --------
    partyId = parseArray(partyId);
    if (partyId.length) {
      if (validateArrayIds(partyId, "partyId")) return;
      match.partyId = { $in: partyId.map((id) => new ObjectId(id)) };
    }

    // -------- KAPAN FILTER --------
    kapanNumber = parseArray(kapanNumber);
    if (kapanNumber.length) match.kapanNumber = { $in: kapanNumber };

    // -------- STATUS FILTER --------
    statusId = parseArray(statusId);
    if (statusId.length) {
      if (validateArrayIds(statusId, "statusId")) return;
      match.statusId = { $in: statusId.map((id) => new ObjectId(id)) };
    }

    // -------- PAYMENT STATUS FILTER --------
    paymentStatusId = parseArray(paymentStatusId);
    if (paymentStatusId.length) {
      if (validateArrayIds(paymentStatusId, "paymentStatusId")) return;
      match.paymentStatusId = {
        $in: paymentStatusId.map((id) => new ObjectId(id)),
      };
    }

    // -------- DATE FILTER --------
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      match.date = {};
      if (start) match.date.$gte = start;
      if (end) {
        end.setHours(23, 59, 59, 999);
        match.date.$lte = end;
      }
    }

    // -------- SORT LOGIC --------
    const sort = {};

    if (dateReverse !== "default") sort.date = dateReverse === "asc" ? 1 : -1;
    else if (uniqueIdReverse !== "default")
      sort.uniqueId = uniqueIdReverse === "asc" ? 1 : -1;
    else if (polishDateReverse !== "default")
      sort.polishDate = polishDateReverse === "asc" ? 1 : -1;
    else if (HPHTDateReverse !== "default")
      sort.HPHTDateReverse = HPHTDateReverse === "asc" ? 1 : -1;
    else sort.uniqueId = 1;

    // -------- AGGREGATION --------
    const pipeline = [{ $match: match }];

    // SEARCH: uniqueId starts with
    if (search) {
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      pipeline.push({ $addFields: { uniqueIdStr: { $toString: "$uniqueId" } } });
      pipeline.push({
        $match: { uniqueIdStr: { $regex: `^${safe}`, $options: "i" } },
      });
    }

    pipeline.push({
      $facet: {
        metadata: [
          {
            $group: {
              _id: null,
              totalItems: { $sum: 1 },
              totalIssueWeight: { $sum: "$issueWeight" },
              totalPolishWeight: { $sum: "$polishWeight" },
              totalExpectedWeight: { $sum: "$expectedWeight" },
              totalHphtWeight: { $sum: "$HPHTWeight" },
              totalAmount: { $sum: "$amount" },
            },
          },
        ],
        data: [
          { $sort: sort },
          { $skip: (page - 1) * ITEMS },
          { $limit: ITEMS },
          ...populateStages(),
          { $project: { __v: 0, uniqueIdStr: 0 } },
        ],
      },
    });

    const result = await DiamondLot.aggregate(pipeline);

    const metadata = result[0]?.metadata[0] || {
      totalItems: 0,
      totalIssueWeight: 0,
      totalPolishWeight: 0,
    };

    return res.status(200).json({
      success: true,
      page,
      totalItems: metadata.totalItems,
      totalIssueWeight: metadata.totalIssueWeight,
      totalPolishWeight: metadata.totalPolishWeight,
      totalExpectedWeight: metadata.totalExpectedWeight,
      totalHphtWeight: metadata.totalHphtWeight,
      totalAmount: metadata.totalAmount,
      totalPages: Math.ceil(metadata.totalItems / ITEMS),
      data: result[0].data,
    });
  } catch (err) {
    console.error("Error (getDiamondLots):", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// -----------------------------------------------------
// ------------------- GET SINGLE LOT ------------------
// -----------------------------------------------------
export const getDiamondLot = async (req, res) => {
  try {
    const { uniqueId } = req.query;

    const diamondLot = await DiamondLot.findOne({ uniqueId })
      .populate("userId", "name")
      .populate("partyId", "name")
      .populate("shapeId", "name")
      .populate("colorId", "name")
      .populate("clarityId", "name")
      .populate("statusId", "name")
      .populate("paymentStatusId", "name");

    if (!diamondLot) {
      return res.status(404).json({
        success: false,
        message: "Diamond NOT found.",
      });
    }

    if (diamondLot.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Diamond fetched successfully.",
      data: diamondLot,
    });
  } catch (error) {
    console.error("Error (getDiamondLot):", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------
// ------------------- POPULATE STAGES -----------------
// -----------------------------------------------------
const populateStages = () => [
  { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "userId" } },
  { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
  { $lookup: { from: "parties", localField: "partyId", foreignField: "_id", as: "partyId" } },
  { $unwind: { path: "$partyId", preserveNullAndEmptyArrays: true } },
  { $lookup: { from: "shapes", localField: "shapeId", foreignField: "_id", as: "shapeId" } },
  { $unwind: { path: "$shapeId", preserveNullAndEmptyArrays: true } },
  { $lookup: { from: "colors", localField: "colorId", foreignField: "_id", as: "colorId" } },
  { $unwind: { path: "$colorId", preserveNullAndEmptyArrays: true } },
  { $lookup: { from: "clarities", localField: "clarityId", foreignField: "_id", as: "clarityId" } },
  { $unwind: { path: "$clarityId", preserveNullAndEmptyArrays: true } },
  { $lookup: { from: "status", localField: "statusId", foreignField: "_id", as: "statusId" } },
  { $unwind: { path: "$statusId", preserveNullAndEmptyArrays: true } },
  { $lookup: { from: "paymentstatuses", localField: "paymentStatusId", foreignField: "_id", as: "paymentStatusId" } },
  { $unwind: { path: "$paymentStatusId", preserveNullAndEmptyArrays: true } },
];

// -----------------------------------------------------
// ------------------- UPDATE DIAMOND LOT --------------
// -----------------------------------------------------
export const updateDiamondLot = async (req, res) => {
  try {
    const { diamondLotId } = req.params;

    const fields = {
      partyId: req.body.partyId,
      kapanNumber: req.body.kapanNumber,
      PKTNumber: req.body.PKTNumber,
      issueWeight: req.body.issueWeight,
      expectedWeight: req.body.expectedWeight,
      shapeId: req.body.shapeId,
      polishWeight: req.body.polishWeight,
      colorId: req.body.colorId,
      clarityId: req.body.clarityId,
      polishDate: req.body.polishDate,
      statusId: req.body.statusId,
      HPHTWeight: req.body.HPHTWeight,
      HPHTDate: req.body.HPHTDate,
      paymentStatusId: req.body.paymentStatusId,
      remark: req.body.remark,
      date: req.body.date,
    };

    // At least one field required
    if (!Object.values(fields).some((v) => v !== undefined)) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required.",
      });
    }

    const existing = await DiamondLot.findById(diamondLotId);
    if (!existing) {
      return res.status(404).json({ success: false, message: "DiamondLot not found" });
    }

    if (existing.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Validations
    if (fields.partyId) await validateParty(fields.partyId);
    if (fields.shapeId) await validateShapes([fields.shapeId]);
    if (fields.colorId) await validateColors(fields.colorId);
    if (fields.clarityId) await validateClarity(fields.clarityId);
    if (fields.statusId) await validateStatus(fields.statusId);
    if (fields.paymentStatusId) await validatePaymentStatus(fields.paymentStatusId);

    // Build update object
    const updateObj = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updateObj[key] = value === "" ? null : value;
    }

    // Reset rate if polishDate or polishWeight cleared
    if (fields.polishDate === "" || fields.polishWeight === "") {
      updateObj.rate = null;
      updateObj.amount = null;
    }

    // ---------- ISSUE & EXPECTED WEIGHT LOGIC ----------
    let finalIssueWeight = fields.issueWeight ?? existing.issueWeight;
    let finalExpectedWeight = fields.expectedWeight ?? existing.expectedWeight;

    if (fields.issueWeight !== undefined) {
      const newIssue = Number(fields.issueWeight);

      if (finalExpectedWeight > newIssue) {
        finalExpectedWeight = newIssue;
        updateObj.expectedWeight = newIssue;
      }

      // if polishWeight > new issue, reset polishWeight
      const polish = Number(fields.polishWeight ?? existing.polishWeight);
      if (polish > newIssue) {
        updateObj.polishWeight = null;
        updateObj.rate = null;
        updateObj.amount = null;
      }
    }

    // expectedWeight cannot exceed issueWeight
    if (fields.expectedWeight !== undefined) {
      const check = Number(fields.expectedWeight);
      const max = Number(updateObj.issueWeight ?? existing.issueWeight);
      if (check > max) {
        return res.status(400).json({
          success: false,
          message: `ExpectedWeight (${check}) cannot be bigger than IssueWeight (${max})`,
        });
      }
    }

    // ---------- POLISH WEIGHT VALIDATION ----------
    if (fields.polishWeight !== undefined && fields.polishWeight !== null) {
      const polishVal = Number(fields.polishWeight);
      const issue = Number(updateObj.issueWeight ?? existing.issueWeight);

      if (polishVal > issue) {
        return res.status(400).json({
          success: false,
          message: "polishWeight can't be bigger than issueWeight",
        });
      }

      updateObj.polishWeight = polishVal;
    }

    // ---------- RATE CALCULATION ----------
    const shouldCalcRate =
      (fields.polishDate && (fields.polishWeight || existing.polishWeight)) ||
      (fields.polishWeight && (fields.polishDate || existing.polishDate));

    if (shouldCalcRate) {
      const polishWeight = updateObj.polishWeight ?? existing.polishWeight;
      const polishDate = new Date(updateObj.polishDate ?? existing.polishDate);

      if (!polishWeight) {
        return res.status(400).json({
          success: false,
          message: "Polish weight is required to calculate rate",
        });
      }

      const rateList = await Rate.find({ partyId: existing.partyId });

      const nearestRange = rateList
        .filter((r) => r.startingValue <= polishWeight && r.endingValue > polishWeight)
        .sort((a, b) => b.startingValue - a.startingValue)[0];

      if (nearestRange?.items?.length > 0) {
        const validRates = nearestRange.items.filter((i) => i.date <= polishDate);
        const bestRate = validRates.sort((a, b) => b.date - a.date)[0];

        if (bestRate) {
          updateObj.rate = bestRate.rate;
          updateObj.amount = Number(polishWeight) * Number(bestRate.rate);
        }
      }
    }

    const updated = await DiamondLot.findByIdAndUpdate(diamondLotId, updateObj, {
      new: true,
    })
      .populate("userId", "name")
      .populate("partyId", "name")
      .populate("shapeId", "name")
      .populate("colorId", "name")
      .populate("clarityId", "name")
      .populate("statusId", "name")
      .populate("paymentStatusId", "name")
      .lean();

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error("Error (updateDiamondLot):", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// -----------------------------------------------------
// -------------------- DELETE LOT ---------------------
// -----------------------------------------------------
export const deleteDiamondLot = async (req, res) => {
  try {
    const { diamondLotId } = req.params;

    const lot = await DiamondLot.findById(diamondLotId);
    if (!lot)
      return res.status(404).json({ success: false, message: "Not found" });

    if (lot.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await DiamondLot.findByIdAndDelete(diamondLotId);
    return res.status(200).json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    console.error("Error (deleteDiamondLot):", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
