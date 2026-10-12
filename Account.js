import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    accountNumber: { type: String, required: true, unique: true },
    accountType: { type: String, enum: ["savings", "current"], default: "savings" },
    balance: { type: Number, required: true, default: 0, min: 0 },
    currency: { type: String, default: "INR" },
    isFrozen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Account", accountSchema);
