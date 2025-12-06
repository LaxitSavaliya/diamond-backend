import Status from "../models/Status.js";

export const getStatus = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    const search = req.query.search || "";
    const statusFilter = req.query.status || "All";

    const limit = 5;
    const skip = (page - 1) * limit;

    const filter = {};

    if (search.trim() !== "") {
      filter.name = { $regex: search, $options: "i" };
    }

    if (statusFilter === "Active") filter.active = true;
    if (statusFilter === "Deactive") filter.active = false;

    const totalStatus = await Status.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(totalStatus / limit));

    if (page > totalPages) page = totalPages;

    const statuses = await Status.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: "Status data fetched successfully",
      totalCount: totalStatus,
      totalPages,
      currentPage: page,
      data: statuses,
    });
  } catch (error) {
    console.error("Error in getStatus controller: ", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const allStatus = async (req, res) => {
  try {
    const status = await Status.find({active: true}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "AllStatus data fetched Successfully",
      data: status,
    });
  } catch (error) {
    console.error("Error in allStatus controller: ", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createStatus = async (req, res) => {
  try {
    const { name, active } = req.body;

    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Name is required." });
    }

    const existingStatus = await Status.findOne({
      name: new RegExp(`^${name.trim()}$`, "i"),
    });

    if (existingStatus) {
      return res.status(400).json({
        success: false,
        message: "Status already exists.",
      });
    }

    const status = await Status.create({
      name: name.trim(),
      active: active ?? true,
    });

    res.status(201).json({
      success: true,
      message: "Status created successfully",
      data: status,
    });
  } catch (error) {
    console.error("Error in createStatus controller:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    if (req.body.name !== undefined && req.body.name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Name cannot be empty.",
      });
    }

    if (req.body.name) req.body.name = req.body.name.trim();

    const status = await Status.findByIdAndUpdate(
      req.params.statusId,
      { $set: req.body },
      { new: true }
    );

    if (!status) {
      return res.status(404).json({
        success: false,
        message: "Status not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: status,
    });
  } catch (error) {
    console.error("Error in updateStatus controller:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStatus = async (req, res) => {
  try {
    const status = await Status.findByIdAndDelete(req.params.statusId);

    if (!status) {
      return res.status(404).json({
        success: false,
        message: "Status not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Status deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteStatus controller:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
