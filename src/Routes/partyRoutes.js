import express from "express";
import {
  allParty,
  createParty,
  deleteParty,
  getParty,
  updateParty,
} from "../controllers/partyController.js";

const router = express.Router();

router.get("/", getParty);
router.get("/allParty", allParty);
router.post("/", createParty);
router.put("/:partyId", updateParty);
router.delete("/:partyId", deleteParty);

export default router;
