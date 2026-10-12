import Beneficiary from "../models/Beneficiary.js";
import Account from "../models/Account.js";

// @desc  List logged-in user's saved beneficiaries
// @route GET /api/beneficiaries
export const getBeneficiaries = async (req, res, next) => {
  try {
    const beneficiaries = await Beneficiary.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ beneficiaries });
  } catch (err) {
    next(err);
  }
};

// @desc  Add a new beneficiary (validates the target account exists)
// @route POST /api/beneficiaries
export const addBeneficiary = async (req, res, next) => {
  try {
    const { nickname, accountNumber } = req.body;
    if (!nickname || !accountNumber) {
      return res.status(400).json({ message: "Nickname and account number are required" });
    }

    const targetAccount = await Account.findOne({ accountNumber }).populate("user", "name");
    if (!targetAccount) {
      return res.status(404).json({ message: "No account found with that account number" });
    }

    const beneficiary = await Beneficiary.create({
      user: req.user._id,
      nickname,
      accountNumber,
      accountHolderName: targetAccount.user.name,
    });

    res.status(201).json({ beneficiary });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "This beneficiary is already saved" });
    }
    next(err);
  }
};

// @desc  Remove a saved beneficiary
// @route DELETE /api/beneficiaries/:id
export const deleteBeneficiary = async (req, res, next) => {
  try {
    const beneficiary = await Beneficiary.findOne({ _id: req.params.id, user: req.user._id });
    if (!beneficiary) return res.status(404).json({ message: "Beneficiary not found" });

    await beneficiary.deleteOne();
    res.json({ message: "Beneficiary removed" });
  } catch (err) {
    next(err);
  }
};
