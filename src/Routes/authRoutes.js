import express from "express";
import {
  getMe,
  getUsers,
  login,
  logout,
  signUp,
} from "../controllers/authController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protectRoute, getMe);
router.get("/users", protectRoute, getUsers);

export default router;
