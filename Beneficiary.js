import mongoose from "mongoose";

const beneficiarySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    nickname: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true },
    bankName: { type: String, default: "MERN Bank" },
    accountHolderName: { type: String, required: true },
  },
  { timestamps: true }
);

beneficiarySchema.index({ user: 1, accountNumber: 1 }, { unique: true });

export default mongoose.model("Beneficiary", beneficiarySchema);
