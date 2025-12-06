import express from "express";
import {
  allColors,
  createColor,
  deleteColor,
  getColors,
  updateColor,
} from "../controllers/colorController.js";

const router = express.Router();

router.get("/", getColors);
router.get("/allColors", allColors);
router.post("/", createColor);
router.put("/:colorId", updateColor);
router.delete("/:colorId", deleteColor);

export default router;
