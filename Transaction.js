import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    fromAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account", default: null },
    toAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account", default: null },
    fromAccountNumber: { type: String },
    toAccountNumber: { type: String },
    amount: { type: Number, required: true, min: 0.01 },
    type: {
      type: String,
      enum: ["transfer", "deposit", "withdrawal", "bill_payment"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "success",
    },
    description: { type: String, default: "" },
    reference: { type: String, unique: true },
    initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
