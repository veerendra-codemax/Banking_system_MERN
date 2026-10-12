import express from "express";
import { getMyAccounts, getAccountById, getAccountTransactions } from "../controllers/accountController.js";
import { protect, requireVerified } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, requireVerified);
router.get("/", getMyAccounts);
router.get("/:id", getAccountById);
router.get("/:id/transactions", getAccountTransactions);

export default router;
