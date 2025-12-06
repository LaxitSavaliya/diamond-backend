import Rate from "../models/Rate.js";
import Party from "../models/Party.js";

export const getRate = async (req, res) => {
    try {
        const { partyId } = req.query;

        if (!partyId) {
            return res.status(200).json({
                success: true,
                message: "No party selected",
                data: [],
            });
        }

        const filter = { userId: req.user._id, partyId };

        let rate = await Rate.find(filter)
            .populate("partyId")
            .lean();

        rate.sort((a, b) => Number(a.startingValue) - Number(b.startingValue));

        rate = rate.map(r => {
            if (Array.isArray(r.items)) {
                r.items.sort((a, b) => new Date(b.date) - new Date(a.date));
            }
            return r;
        });

        res.status(200).json({
            success: true,
            message: "Rate data fetched successfully",
            data: rate,
        });

    } catch (error) {
        console.error("Error in getRate controller:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createRate = async (req, res) => {
    try {
        const { partyId, startingValue, endingValue, rate, date } = req.body;

        if (!partyId || !startingValue || !endingValue || !rate || !date) {
            return res.status(400).json({
                success: false,
                message: "partyId, startingValue, endingValue, rate and date are required.",
            });
        }

        const existingParty = await Party.findById(partyId);
        if (!existingParty) {
            return res.status(400).json({
                success: false,
                message: "Party NOT found.",
            });
        }

        const newRate = await Rate.create({
            userId: req.user._id,
            partyId,
            startingValue,
            endingValue,
            items: [{ rate, date }],
        });

        res.status(201).json({
            success: true,
            message: "Rate created successfully",
            data: newRate,
        });
    } catch (error) {
        console.error("Error in createRate controller:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateRate = async (req, res) => {
    try {
        const { itemId, rate, date } = req.body;

        if (!rate || !date) {
            return res.status(400).json({
                success: false,
                message: "Rate and date are required.",
            });
        }

        const existingRate = await Rate.findById(req.params.rateId);
        if (!existingRate) {
            return res.status(404).json({
                success: false,
                message: "Rate not found",
            });
        }

        if (existingRate.userId.toString() !== req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You are NOT authorized to update this Rate.",
            });
        }

        if (itemId) {
            const itemIndex = existingRate.items.findIndex(
                (item) => item._id.toString() === itemId
            );

            if (itemIndex === -1) {
                return res.status(404).json({
                    success: false,
                    message: "Item not found",
                });
            }

            // Update the existing item
            existingRate.items[itemIndex].rate = rate;
            existingRate.items[itemIndex].date = date;

            await existingRate.save();

            return res.status(200).json({
                success: true,
                message: "Item updated successfully",
                data: existingRate,
            });
        }

        existingRate.items.push({ rate, date });
        await existingRate.save();

        res.status(200).json({
            success: true,
            message: "Rate item added successfully",
            data: existingRate,
        });

    } catch (error) {
        console.error("Error in updateRate controller:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteRate = async (req, res) => {
    try {
        const existingRate = await Rate.findById(req.params.rateId);

        if (!existingRate) {
            return res.status(404).json({
                success: false,
                message: "Rate not found",
            });
        }

        if (existingRate.userId.toString() !== req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You are NOT authorized to delete this Rate.",
            });
        }

        await Rate.findByIdAndDelete(req.params.rateId);

        res.status(200).json({
            success: true,
            message: "Rate deleted successfully",
        });
    } catch (error) {
        console.error("Error in deleteRate controller:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteItem = async (req, res) => {
    try {
        const { rateId } = req.params;
        const { itemId } = req.body;

        if (!itemId) {
            return res.status(400).json({
                success: false,
                message: "Item ID is required",
            });
        }

        const existingRate = await Rate.findById(rateId);

        if (!existingRate) {
            return res.status(404).json({
                success: false,
                message: "Rate not found",
            });
        }

        if (existingRate.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are NOT authorized to delete this Rate item.",
            });
        }

        const subDoc = existingRate.items.id ? existingRate.items.id(itemId) : null;

        if (subDoc && typeof subDoc.remove === "function") {
            subDoc.remove();
        } else {
            const idx = existingRate.items.findIndex(
                (it) => it._id?.toString() === itemId?.toString()
            );

            if (idx === -1) {
                return res.status(404).json({
                    success: false,
                    message: "Item not found inside Rate",
                });
            }

            existingRate.items.splice(idx, 1);
        }

        if (existingRate.items.length === 0) {
            await Rate.findByIdAndDelete(rateId);

            return res.status(200).json({
                success: true,
                message: "Item deleted. Rate removed because it had no more items.",
                deletedRateId: rateId,
                data: [],
            });
        }

        await existingRate.save();

        const updated = await Rate.findById(rateId).populate("partyId");

        return res.status(200).json({
            success: true,
            message: "Rate item deleted successfully",
            data: updated,
        });

    } catch (error) {
        console.error("Error in deleteItem controller:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};