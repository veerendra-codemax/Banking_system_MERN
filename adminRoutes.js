import express from "express";
import {
  listUsers,
  listAccounts,
  toggleFreezeAccount,
  toggleUserStatus,
  listAllTransactions,
  getStats,
} from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, admin);
router.get("/stats", getStats);
router.get("/users", listUsers);
router.patch("/users/:id/status", toggleUserStatus);
router.get("/accounts", listAccounts);
router.patch("/accounts/:id/freeze", toggleFreezeAccount);
router.get("/transactions", listAllTransactions);

export default router;
