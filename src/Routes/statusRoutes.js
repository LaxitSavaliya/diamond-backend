import express from "express";
import {
  allStatus,
  createStatus,
  deleteStatus,
  getStatus,
  updateStatus,
} from "../controllers/statusController.js";

const router = express.Router();

router.get("/", getStatus);
router.get("/allStatus", allStatus);
router.post("/", createStatus);
router.put("/:statusId", updateStatus);
router.delete("/:statusId", deleteStatus);

export default router;
