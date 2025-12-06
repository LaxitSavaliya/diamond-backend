import PaymentStatus from "../models/PaymentStatus.js";

export const getPaymentStatus = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || "";
    const status = req.query.status || "All";

    const limit = 5;
    const skip = (page - 1) * limit;

    const filter = {};

    // Search filter
    if (search.trim() !== "") {
      filter.name = { $regex: search, $options: "i" };
    }

    // Active / Deactive filter
    if (status === "Active") {
      filter.active = true;
    } else if (status === "Deactive") {
      filter.active = false;
    }

    const totalPaymentStatus = await PaymentStatus.countDocuments(filter);

    const paymentStatus = await PaymentStatus.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.max(1, Math.ceil(totalPaymentStatus / limit));

    res.status(200).json({
      success: true,
      message: "PaymentStatus data fetched successfully",
      totalCount: totalPaymentStatus,
      totalPages,
      currentPage: page,
      data: paymentStatus,
    });
  } catch (error) {
    console.error("Error in getPaymentStatus controller:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const allPaymentStatus = async (req, res) => {
  try {
    const paymentStatus = await PaymentStatus.find({active: true}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "AllPaymentStatus data fetched Successfully",
      data: paymentStatus,
    });
  } catch (error) {
    console.error("Error in allPaymentStatus controller: ", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPaymentStatus = async (req, res) => {
  try {
    const { name, active } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    const existing = await PaymentStatus.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "PaymentStatus already exists.",
      });
    }

    const paymentStatus = await PaymentStatus.create({
      name: name.trim(),
      active: active ?? true,
    });

    res.status(201).json({
      success: true,
      message: "PaymentStatus created successfully",
      data: paymentStatus,
    });
  } catch (error) {
    console.error("Error in createPaymentStatus controller:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    // Cannot allow blank name
    if (req.body.name !== undefined && req.body.name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Name cannot be empty.",
      });
    }

    const updatedPaymentStatus = await PaymentStatus.findByIdAndUpdate(
      req.params.paymentStatusId,
      { $set: req.body },
      { new: true }
    );

    if (!updatedPaymentStatus) {
      return res.status(404).json({
        success: false,
        message: "PaymentStatus not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "PaymentStatus updated successfully",
      data: updatedPaymentStatus,
    });
  } catch (error) {
    console.error("Error in updatePaymentStatus controller:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePaymentStatus = async (req, res) => {
  try {
    const deleted = await PaymentStatus.findByIdAndDelete(
      req.params.paymentStatusId
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "PaymentStatus not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "PaymentStatus deleted successfully",
    });
  } catch (error) {
    console.error("Error in deletePaymentStatus controller:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
