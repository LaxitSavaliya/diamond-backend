import Shape from "../models/Shape.js";

export const getShape = async (req, res) => {
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

    const totalShape = await Shape.countDocuments(filter);

    const shape = await Shape.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.max(1, Math.ceil(totalShape / limit));

    res.status(200).json({
      success: true,
      message: "Shapes data fetched Successfully",
      totalCount: totalShape,
      totalPages,
      currentPage: page,
      data: shape,
    });
  } catch (error) {
    console.error("Error in getShape controller: ", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const allShape = async (req, res) => {
  try {
    const allShapes = await Shape.find({active: true}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "AllShape data fetched Successfully",
      data: allShapes,
    });
  } catch (error) {
    console.error("Error in allShape controller: ", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createShape = async (req, res) => {
  try {
    const { name, active } = req.body;

    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Name is required." });
    }

    const existingShape = await Shape.findOne({ name: name.trim() });
    if (existingShape) {
      return res
        .status(400)
        .json({ success: false, message: "Shape already exists." });
    }

    const shape = await Shape.create({
      name: name.trim(),
      active: active ?? true,
    });

    res.status(201).json({
      success: true,
      message: "Shape created successfully",
      data: shape,
    });
  } catch (error) {
    console.error("Error in createShape controller:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateShape = async (req, res) => {
  try {
    // Validate empty name (only if name is provided)
    if (req.body.name !== undefined && req.body.name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Name cannot be empty.",
      });
    }

    const shape = await Shape.findByIdAndUpdate(
      req.params.shapeId,
      { $set: req.body },
      { new: true }
    );

    if (!shape) {
      return res.status(404).json({
        success: false,
        message: "Shape not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Shape updated successfully",
      data: shape,
    });
  } catch (error) {
    console.error("Error in updateShape controller:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteShape = async (req, res) => {
  try {
    const shape = await Shape.findByIdAndDelete(req.params.shapeId);

    if (!shape)
      return res
        .status(404)
        .json({ success: false, message: "Shape not found" });

    res.status(200).json({
      success: true,
      message: "Shape deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteShape controller: ", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
