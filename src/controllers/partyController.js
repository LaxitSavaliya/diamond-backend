import DiamondLot from "../models/DiamondLot.js";
import Party from "../models/Party.js";

export const getParty = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || "";
    const status = req.query.status || "All";

    const limit = 5;
    const skip = (page - 1) * limit;

    const filter = {};

    if (search.trim() !== "") {
      filter.name = { $regex: search, $options: "i" };
    }

    if (status === "Active") {
      filter.active = true;
    } else if (status === "Deactive") {
      filter.active = false;
    }

    const totalParty = await Party.countDocuments(filter);

    const party = await Party.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.max(1, Math.ceil(totalParty / limit));

    res.status(200).json({
      success: true,
      message: "Partys data fetched Successfully",
      totalCount: totalParty,
      totalPages,
      currentPage: page,
      data: party,
    });
  } catch (error) {
    console.error("Error in getParty controller: ", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const allParty = async (req, res) => {
  try {
    const allParty = await Party.find({ active: true }).sort({ createdAt: -1 });

    const allData = await Promise.all(
      allParty.map(async (p) => {
        const lots = await DiamondLot.find(
          { partyId: p._id },
          { kapanNumber: 1 }   // only take kapanNumber field
        );

        return {
          ...p._doc,   // if p is mongoose document
          kapanNumbers: [...new Set(lots.map((l) => l.kapanNumber))], // unique array
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "AllParty data fetched Successfully",
      data: allData,
    });
  } catch (error) {
    console.error("Error in allParty controller: ", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createParty = async (req, res) => {
  try {
    const { name, active } = req.body;

    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Name is required." });
    }

    const existingParty = await Party.findOne({ name: name.trim() });
    if (existingParty) {
      return res
        .status(400)
        .json({ success: false, message: "Party already exists." });
    }

    const party = await Party.create({
      name: name.trim(),
      active: active ?? true,
    });

    res.status(201).json({
      success: true,
      message: "Party created successfully",
      data: party,
    });
  } catch (error) {
    console.error("Error in createParty controller:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateParty = async (req, res) => {
  try {
    // Validate name if it is provided
    if (req.body.name !== undefined && req.body.name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Name cannot be empty.",
      });
    }

    const party = await Party.findByIdAndUpdate(
      req.params.partyId,
      { $set: req.body },
      { new: true }
    );

    if (!party) {
      return res.status(404).json({
        success: false,
        message: "Party not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Party updated successfully",
      data: party,
    });
  } catch (error) {
    console.error("Error in updateParty controller:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteParty = async (req, res) => {
  try {
    const party = await Party.findByIdAndDelete(req.params.partyId);

    if (!party)
      return res
        .status(404)
        .json({ success: false, message: "Party not found" });

    res.status(200).json({
      success: true,
      message: "Party deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteParty controller: ", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
