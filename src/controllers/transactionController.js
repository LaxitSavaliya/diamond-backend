import Transaction from "../models/Transaction.js";
import Party from "../models/Party.js";

export const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user._id })
            .populate("partyId")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Transactions data fetched successfully.",
            data: transactions,
        });
    } catch (error) {
        console.error("Error in getTransactions controller:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createTransaction = async (req, res) => {
    try {
        const { partyId, amount, date, type, remark } = req.body;

        if (!partyId || !amount || !date || !type) {
            return res.status(400).json({
                success: false,
                message: "partyId, amount, date and type are required.",
            });
        }

        const existingParty = await Party.findById(partyId);
        if (!existingParty) {
            return res.status(400).json({
                success: false,
                message: "Party NOT found.",
            });
        }

        if (!["Paid", "Offset"].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Type must be Paid or Offset.",
            });
        }

        const transaction = await Transaction.create({
            userId: req.user._id,
            partyId,
            amount,
            date,
            type,
            remark,
        });

        res.status(201).json({
            success: true,
            message: "Transaction created successfully.",
            data: transaction,
        });
    } catch (error) {
        console.error("Error in createTransaction controller:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateTransaction = async (req, res) => {
    try {
        const existingTransaction = await Transaction.findById(req.params.transactionId);

        if (!existingTransaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction NOT found.",
            });
        }

        // Authorization check
        if (existingTransaction.userId.toString() !== req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You are NOT authorized to update this Transaction.",
            });
        }

        const { partyId, amount, date, type, remark } = req.body;

        if (!partyId || !amount || !date || !type) {
            return res.status(400).json({
                success: false,
                message: "partyId, amount, date and type are required.",
            });
        }

        const existingParty = await Party.findById(partyId);
        if (!existingParty) {
            return res.status(400).json({
                success: false,
                message: "Party NOT found.",
            });
        }

        if (!["Paid", "Offset"].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Type must be Paid or Offset.",
            });
        }

        const updatedTransaction = await Transaction.findByIdAndUpdate(
            req.params.transactionId,
            { partyId, amount, date, type, remark },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Transaction updated successfully.",
            data: updatedTransaction,
        });
    } catch (error) {
        console.error("Error in updateTransaction controller:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteTransaction = async (req, res) => {
    try {
        const existingTransaction = await Transaction.findById(req.params.transactionId);

        if (!existingTransaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction NOT found.",
            });
        }

        // Authorization check
        if (existingTransaction.userId.toString() !== req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You are NOT authorized to delete this Transaction.",
            });
        }

        await Transaction.findByIdAndDelete(req.params.transactionId);

        res.status(200).json({
            success: true,
            message: "Transaction deleted successfully.",
        });
    } catch (error) {
        console.error("Error in deleteTransaction controller:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};