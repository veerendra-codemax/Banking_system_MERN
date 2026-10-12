import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";

// @desc  Get all accounts belonging to the logged-in user
// @route GET /api/accounts
export const getMyAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({ user: req.user._id });
    res.json({ accounts });
  } catch (err) {
    next(err);
  }
};

// @desc  Get a single account (must belong to the user, or caller is admin)
// @route GET /api/accounts/:id
export const getAccountById = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) return res.status(404).json({ message: "Account not found" });

    if (account.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this account" });
    }
    res.json({ account });
  } catch (err) {
    next(err);
  }
};

// @desc  Get paginated transaction history for an account
// @route GET /api/accounts/:id/transactions
export const getAccountTransactions = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) return res.status(404).json({ message: "Account not found" });

    if (account.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this account" });
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const filter = {
      $or: [{ fromAccount: account._id }, { toAccount: account._id }],
    };

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      transactions,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    next(err);
  }
};
