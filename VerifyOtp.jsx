import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const VerifyOtp = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  if (!state?.userId) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <p className="text-ink-700">No pending verification found.</p>
        <Link to="/register" className="mt-3 inline-block text-mint-600 underline underline-offset-4">
          Start registration
        </Link>
      </div>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/verify-otp", { userId: state.userId, otp });
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError("");
    setInfo("");
    try {
      await api.post("/auth/resend-otp", { userId: state.userId });
      setInfo("A new code was sent.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend code");
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      <p className="eyebrow">
        Identity Verification
      </p>
      <h1 className="mt-1 font-display text-3xl">Enter your code</h1>
      <p className="mt-2 text-sm text-ink-700">
        We sent a 6-digit code to <span className="font-mono">{state.email}</span>. In development
        without SMTP configured, check the backend server console for the code.
      </p>

      <form onSubmit={onSubmit} className="card mt-8 space-y-5">
        {error && <p className="rounded-sm border border-coral-500/40 bg-coral-500/5 px-3 py-2 text-sm text-coral-500">{error}</p>}
        {info && <p className="rounded-sm border border-mint-500/40 bg-mint-500/5 px-3 py-2 text-sm text-mint-600">{info}</p>}
        <div>
          <label className="field-label">6-digit code</label>
          <input
            className="field-input text-center font-mono text-lg tracking-[0.4em]"
            maxLength={6}
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
          />
        </div>
        <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full">
          {loading ? "Verifying…" : "Verify & continue"}
        </button>
        <button type="button" onClick={resend} className="btn-ghost w-full">
          Resend code
        </button>
      </form>
    </div>
  );
};

export default VerifyOtp;
