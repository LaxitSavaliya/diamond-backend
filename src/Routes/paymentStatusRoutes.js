import express from "express";
import {
  allPaymentStatus,
  createPaymentStatus,
  deletePaymentStatus,
  getPaymentStatus,
  updatePaymentStatus,
} from "../controllers/paymentStatusController.js";

const router = express.Router();

router.get("/", getPaymentStatus);
router.get("/allPaymentStatus", allPaymentStatus);
router.post("/", createPaymentStatus);
router.put("/:paymentStatusId", updatePaymentStatus);
router.delete("/:paymentStatusId", deletePaymentStatus);

export default router;
