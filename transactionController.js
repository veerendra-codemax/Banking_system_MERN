import mongoose from "mongoose";
import crypto from "crypto";
import Account from "../models/Account.js";
import Transaction from "../models/Transaction.js";

const genRef = () => "TXN" + crypto.randomBytes(6).toString("hex").toUpperCase();

// @desc  Transfer funds from one of the user's own accounts to another
//        account (own, saved beneficiary, or any valid account number).
// @route POST /api/transactions/transfer
export const transferFunds = async (req, res, next) => {
  const { fromAccountId, toAccountNumber, amount, description } = req.body;

  if (!fromAccountId || !toAccountNumber || !amount) {
    return res.status(400).json({ message: "fromAccountId, toAccountNumber and amount are required" });
  }
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ message: "Amount must be a positive number" });
  }

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const fromAccount = await Account.findById(fromAccountId).session(session);
      if (!fromAccount) throw Object.assign(new Error("Source account not found"), { status: 404 });
      if (fromAccount.user.toString() !== req.user._id.toString()) {
        throw Object.assign(new Error("Not authorized to debit this account"), { status: 403 });
      }
      if (fromAccount.isFrozen) {
        throw Object.assign(new Error("Source account is frozen"), { status: 403 });
      }
      if (fromAccount.accountNumber === toAccountNumber) {
        throw Object.assign(new Error("Cannot transfer to the same account"), { status: 400 });
      }
      if (fromAccount.balance < numericAmount) {
        throw Object.assign(new Error("Insufficient funds"), { status: 400 });
      }

      const toAccount = await Account.findOne({ accountNumber: toAccountNumber }).session(session);
      if (!toAccount) throw Object.assign(new Error("Recipient account not found"), { status: 404 });
      if (toAccount.isFrozen) {
        throw Object.assign(new Error("Recipient account is frozen"), { status: 403 });
      }

      fromAccount.balance -= numericAmount;
      toAccount.balance += numericAmount;
      await fromAccount.save({ session });
      await toAccount.save({ session });

      const [txn] = await Transaction.create(
        [
          {
            fromAccount: fromAccount._id,
            toAccount: toAccount._id,
            fromAccountNumber: fromAccount.accountNumber,
            toAccountNumber: toAccount.accountNumber,
            amount: numericAmount,
            type: "transfer",
            status: "success",
            description: description || "",
            reference: genRef(),
            initiatedBy: req.user._id,
          },
        ],
        { session }
      );

      result = { transaction: txn, newBalance: fromAccount.balance };
    });

    res.status(201).json({ message: "Transfer successful", ...result });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    next(err);
  } finally {
    session.endSession();
  }
};

// @desc  Pay a bill (debits an account, no matching credited account)
// @route POST /api/transactions/bill-payment
export const payBill = async (req, res, next) => {
  const { fromAccountId, biller, amount, description } = req.body;

  if (!fromAccountId || !biller || !amount) {
    return res.status(400).json({ message: "fromAccountId, biller and amount are required" });
  }
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ message: "Amount must be a positive number" });
  }

  try {
    const fromAccount = await Account.findById(fromAccountId);
    if (!fromAccount) return res.status(404).json({ message: "Account not found" });
    if (fromAccount.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to debit this account" });
    }
    if (fromAccount.isFrozen) return res.status(403).json({ message: "Account is frozen" });
    if (fromAccount.balance < numericAmount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    fromAccount.balance -= numericAmount;
    await fromAccount.save();

    const txn = await Transaction.create({
      fromAccount: fromAccount._id,
      fromAccountNumber: fromAccount.accountNumber,
      amount: numericAmount,
      type: "bill_payment",
      status: "success",
      description: description || `Bill payment - ${biller}`,
      reference: genRef(),
      initiatedBy: req.user._id,
    });

    res.status(201).json({ message: "Bill payment successful", transaction: txn, newBalance: fromAccount.balance });
  } catch (err) {
    next(err);
  }
};

// @desc  Get all transactions initiated by / involving the logged-in user
// @route GET /api/transactions
export const getMyTransactions = async (req, res, next) => {
  try {
    const accounts = await Account.find({ user: req.user._id }).select("_id");
    const accountIds = accounts.map((a) => a._id);

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const filter = { $or: [{ fromAccount: { $in: accountIds } }, { toAccount: { $in: accountIds } }] };

    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Transaction.countDocuments(filter),
    ]);

    res.json({ transactions, page, totalPages: Math.ceil(total / limit), total });
  } catch (err) {
    next(err);
  }
};
