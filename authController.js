import crypto from "crypto";
import User from "../models/User.js";
import Account from "../models/Account.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import { generateOtp, otpExpiryDate } from "../utils/otp.js";

const generateAccountNumber = () => {
  // 12-digit account number
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("");
};

// @desc  Register a new user + open a savings account, send OTP
// @route POST /api/auth/register
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const role = adminEmails.includes(email.toLowerCase()) ? "admin" : "customer";

    const otp = generateOtp();
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
      otp,
      otpExpires: otpExpiryDate(10),
      otpPurpose: "verify",
    });

    let accountNumber = generateAccountNumber();
    while (await Account.findOne({ accountNumber })) {
      accountNumber = generateAccountNumber();
    }

    await Account.create({
      user: user._id,
      accountNumber,
      accountType: "savings",
      balance: 0,
    });

    await sendEmail({
      to: user.email,
      subject: "Verify your MERN Bank account",
      text: `Your verification code is ${otp}. It expires in 10 minutes.`,
      html: `<p>Your verification code is <b>${otp}</b>. It expires in 10 minutes.</p>`,
    });

    res.status(201).json({
      message: "Registration successful. Check your email for the OTP to verify your account.",
      userId: user._id,
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Verify OTP to activate account
// @route POST /api/auth/verify-otp
export const verifyOtp = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Account already verified" });

    if (!user.otp || user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken(user._id, user.role);
    res.json({ message: "Account verified", token, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @desc  Resend OTP
// @route POST /api/auth/resend-otp
export const resendOtp = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "Account already verified" });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = otpExpiryDate(10);
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Your new MERN Bank verification code",
      text: `Your verification code is ${otp}. It expires in 10 minutes.`,
      html: `<p>Your verification code is <b>${otp}</b>. It expires in 10 minutes.</p>`,
    });

    res.json({ message: "A new OTP has been sent to your email" });
  } catch (err) {
    next(err);
  }
};

// @desc  Login
// @route POST /api/auth/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated. Contact support." });
    }
    if (!user.isVerified) {
      const otp = generateOtp();
      user.otp = otp;
      user.otpExpires = otpExpiryDate(10);
      await user.save();
      await sendEmail({
        to: user.email,
        subject: "Verify your MERN Bank account",
        text: `Your verification code is ${otp}.`,
        html: `<p>Your verification code is <b>${otp}</b>.</p>`,
      });
      return res.status(403).json({
        message: "Email not verified. A new OTP has been sent.",
        requiresVerification: true,
        userId: user._id,
      });
    }

    const token = generateToken(user._id, user.role);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @desc  Get current logged-in user
// @route GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
};

// @desc  Request password reset OTP
// @route POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    // Always respond success to avoid leaking which emails are registered
    if (!user) {
      return res.json({ message: "If that email exists, a reset code has been sent." });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = otpExpiryDate(10);
    user.otpPurpose = "reset";
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "MERN Bank password reset code",
      text: `Your password reset code is ${otp}. It expires in 10 minutes.`,
      html: `<p>Your password reset code is <b>${otp}</b>. It expires in 10 minutes.</p>`,
    });

    res.json({ message: "If that email exists, a reset code has been sent.", userId: user._id });
  } catch (err) {
    next(err);
  }
};

// @desc  Reset password using OTP
// @route POST /api/auth/reset-password
export const resetPassword = async (req, res, next) => {
  try {
    const { userId, otp, newPassword } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (
      !user.otp ||
      user.otp !== otp ||
      user.otpExpires < new Date() ||
      user.otpPurpose !== "reset"
    ) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    next(err);
  }
};
