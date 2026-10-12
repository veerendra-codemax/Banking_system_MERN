import express from "express";
import { getBeneficiaries, addBeneficiary, deleteBeneficiary } from "../controllers/beneficiaryController.js";
import { protect, requireVerified } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, requireVerified);
router.get("/", getBeneficiaries);
router.post("/", addBeneficiary);
router.delete("/:id", deleteBeneficiary);

export default router;
