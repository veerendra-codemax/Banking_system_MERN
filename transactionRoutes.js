import express from "express";
import { transferFunds, payBill, getMyTransactions } from "../controllers/transactionController.js";
import { protect, requireVerified } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, requireVerified);
router.post("/transfer", transferFunds);
router.post("/bill-payment", payBill);
router.get("/", getMyTransactions);

export default router;
