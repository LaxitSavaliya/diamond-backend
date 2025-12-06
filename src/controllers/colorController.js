import Color from "../models/Color.js";

export const getColors = async (req, res) => {
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

    const totalColor = await Color.countDocuments(filter);

    const colors = await Color.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.max(1, Math.ceil(totalColor / limit));

    res.status(200).json({
      success: true,
      message: "Colors data fetched Successfully",
      totalCount: totalColor,
      totalPages,
      currentPage: page,
      data: colors,
    });
  } catch (error) {
    console.error("Error in getColors controller: ", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const allColors = async (req, res) => {
  try {
    const allColor = await Color.find({ active: true }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "allColor data fetched Successfully",
      data: allColor,
    });
  } catch (error) {
    console.error("Error in allColors controller: ", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createColor = async (req, res) => {
  try {
    const { name, active } = req.body;

    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Name is required." });
    }

    const existingColor = await Color.findOne({ name: name.trim() });
    if (existingColor) {
      return res
        .status(400)
        .json({ success: false, message: "Color already exists." });
    }

    const color = await Color.create({
      name: name.trim(),
      active: active ?? true,
    });

    res.status(201).json({
      success: true,
      message: "Color created successfully",
      data: color,
    });
  } catch (error) {
    console.error("Error in createColor controller:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateColor = async (req, res) => {
  try {
    if (req.body.name !== undefined && req.body.name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Name cannot be empty.",
      });
    }

    const color = await Color.findByIdAndUpdate(
      req.params.colorId,
      { $set: req.body },
      { new: true }
    );

    if (!color) {
      return res.status(404).json({
        success: false,
        message: "Color not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Color updated successfully",
      data: color,
    });
  } catch (error) {
    console.error("Error in updateColor controller:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteColor = async (req, res) => {
  try {
    const color = await Color.findByIdAndDelete(req.params.colorId);

    if (!color)
      return res
        .status(404)
        .json({ success: false, message: "Color not found" });

    res.status(200).json({
      success: true,
      message: "Color deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteColor controller: ", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
