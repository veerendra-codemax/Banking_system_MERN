import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const requestCode = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setInfo(data.message);
      if (data.userId) {
        setUserId(data.userId);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { userId, otp, newPassword });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      <p className="eyebrow">Account Recovery</p>
      <h1 className="mt-1 font-display text-3xl">Reset your password</h1>

      {step === 1 ? (
        <form onSubmit={requestCode} className="card mt-8 space-y-5">
          {error && <p className="rounded-sm border border-coral-500/40 bg-coral-500/5 px-3 py-2 text-sm text-coral-500">{error}</p>}
          {info && <p className="rounded-sm border border-mint-500/40 bg-mint-500/5 px-3 py-2 text-sm text-mint-600">{info}</p>}
          <div>
            <label className="field-label">Email</label>
            <input className="field-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Sending…" : "Send reset code"}
          </button>
        </form>
      ) : (
        <form onSubmit={resetPassword} className="card mt-8 space-y-5">
          {error && <p className="rounded-sm border border-coral-500/40 bg-coral-500/5 px-3 py-2 text-sm text-coral-500">{error}</p>}
          <div>
            <label className="field-label">6-digit code</label>
            <input className="field-input text-center font-mono tracking-[0.4em]" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="000000" />
          </div>
          <div>
            <label className="field-label">New password</label>
            <input className="field-input" type="password" minLength={8} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Resetting…" : "Reset password"}
          </button>
        </form>
      )}
      <p className="mt-4 text-sm text-ink-700">
        <Link to="/login" className="text-mint-600 underline decoration-mint-400 underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
