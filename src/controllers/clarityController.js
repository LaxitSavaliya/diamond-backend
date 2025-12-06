import Clarity from "../models/Clarity.js";

export const getClarity = async (req, res) => {
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

    const totalClarity = await Clarity.countDocuments(filter);

    const clarity = await Clarity.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.max(1, Math.ceil(totalClarity / limit));

    res.status(200).json({
      success: true,
      message: "Clarity data fetched Successfully",
      totalCount: totalClarity,
      totalPages,
      currentPage: page,
      data: clarity,
    });
  } catch (error) {
    console.error("Error in getClarity controller: ", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const allClarity = async (req, res) => {
  try {
    const clarity = await Clarity.find({active: true}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "AllClarity data fetched Successfully",
      data: clarity,
    });
  } catch (error) {
    console.error("Error in allClarity controller: ", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createClarity = async (req, res) => {
  try {
    const { name, active } = req.body;

    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Name is required." });
    }

    const existingClarity = await Clarity.findOne({ name: name.trim() });
    if (existingClarity) {
      return res
        .status(400)
        .json({ success: false, message: "Clarity already exists." });
    }

    const clarity = await Clarity.create({
      name: name.trim(),
      active: active ?? true,
    });

    res.status(201).json({
      success: true,
      message: "Clarity created successfully",
      data: clarity,
    });
  } catch (error) {
    console.error("Error in createClarity controller:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateClarity = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate name ONLY if client is trying to update name
    if (req.body.hasOwnProperty("name") && !name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    const clarity = await Clarity.findByIdAndUpdate(
      req.params.clarityId,
      req.body,
      { new: true }
    );

    if (!clarity) {
      return res.status(404).json({
        success: false,
        message: "Clarity not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Clarity updated successfully",
      data: clarity,
    });
  } catch (error) {
    console.error("Error in updateClarity controller:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteClarity = async (req, res) => {
  try {
    const clarity = await Clarity.findByIdAndDelete(req.params.clarityId);

    if (!clarity)
      return res
        .status(404)
        .json({ success: false, message: "Clarity not found" });

    res.status(200).json({
      success: true,
      message: "Clarity deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteClarity controller: ", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
