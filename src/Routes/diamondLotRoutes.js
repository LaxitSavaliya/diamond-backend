import express from "express";
import {
  createDiamondLot,
  deleteDiamondLot,
  getDiamondLot,
  getDiamondLots,
  updateDiamondLot,
} from "../controllers/DiamondLotController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/lot", getDiamondLot);
router.get("/", getDiamondLots);
router.get("/lot", getDiamondLot);
router.post("/", createDiamondLot);
router.put("/:diamondLotId", updateDiamondLot);
router.delete("/:diamondLotId", deleteDiamondLot);

export default router;
