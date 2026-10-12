import User from "../models/User.js";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";

// @desc  List all users
// @route GET /api/admin/users
export const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users: users.map((u) => u.toSafeObject()) });
  } catch (err) {
    next(err);
  }
};

// @desc  List all accounts (with owner populated)
// @route GET /api/admin/accounts
export const listAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find().populate("user", "name email");
    res.json({ accounts });
  } catch (err) {
    next(err);
  }
};

// @desc  Freeze / unfreeze an account
// @route PATCH /api/admin/accounts/:id/freeze
export const toggleFreezeAccount = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) return res.status(404).json({ message: "Account not found" });

    account.isFrozen = !account.isFrozen;
    await account.save();
    res.json({ message: `Account ${account.isFrozen ? "frozen" : "unfrozen"}`, account });
  } catch (err) {
    next(err);
  }
};

// @desc  Activate / deactivate a user
// @route PATCH /api/admin/users/:id/status
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot deactivate an admin account" });
    }

    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? "activated" : "deactivated"}`, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @desc  Get all transactions across the bank
// @route GET /api/admin/transactions
export const listAllTransactions = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 30, 200);

    const [transactions, total] = await Promise.all([
      Transaction.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Transaction.countDocuments(),
    ]);

    res.json({ transactions, page, totalPages: Math.ceil(total / limit), total });
  } catch (err) {
    next(err);
  }
};

// @desc  Bank-wide summary stats for the admin dashboard
// @route GET /api/admin/stats
export const getStats = async (req, res, next) => {
  try {
    const [userCount, accountCount, txnCount, balanceAgg] = await Promise.all([
      User.countDocuments(),
      Account.countDocuments(),
      Transaction.countDocuments(),
      Account.aggregate([{ $group: { _id: null, total: { $sum: "$balance" } } }]),
    ]);

    res.json({
      userCount,
      accountCount,
      transactionCount: txnCount,
      totalDeposits: balanceAgg[0]?.total || 0,
    });
  } catch (err) {
    next(err);
  }
};
