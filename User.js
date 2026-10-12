import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    phone: { type: String, trim: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    otp: { type: String },
    otpExpires: { type: Date },
    otpPurpose: { type: String, enum: ["verify", "reset"], default: "verify" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    isVerified: this.isVerified,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

export default mongoose.model("User", userSchema);
