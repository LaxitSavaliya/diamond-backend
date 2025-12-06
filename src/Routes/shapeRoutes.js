import express from "express";
import {
  allShape,
  createShape,
  deleteShape,
  getShape,
  updateShape,
} from "../controllers/shapeController.js";

const router = express.Router();

router.get("/", getShape);
router.get("/allShape", allShape);
router.post("/", createShape);
router.put("/:shapeId", updateShape);
router.delete("/:shapeId", deleteShape);

export default router;
