import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import { validateEnv } from "./config/validateEnv.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import beneficiaryRoutes from "./routes/beneficiaryRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
validateEnv();

// Surface unexpected errors with a readable message instead of a silent
// or opaque process exit, so "the app just crashed" is easier to debug.
process.on("unhandledRejection", (err) => {
  console.error("Unhandled promise rejection:", err);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Basic protection against brute-force login/register attempts
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/beneficiaries", beneficiaryRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
