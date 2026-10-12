import express from "express";
import {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
