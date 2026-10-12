import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      const res = err.response?.data;
      if (res?.requiresVerification) {
        navigate("/verify-otp", { state: { userId: res.userId, email: form.email } });
        return;
      }
      setError(res?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      <p className="eyebrow">
        Statement of Access
      </p>
      <h1 className="mt-1 font-display text-3xl">Sign in to your account</h1>

      <form onSubmit={onSubmit} className="card mt-8 space-y-5">
        {error && (
          <p className="rounded-sm border border-coral-500/40 bg-coral-500/5 px-3 py-2 text-sm text-coral-500">
            {error}
          </p>
        )}
        <div>
          <label className="field-label">Email</label>
          <input
            className="field-input"
            type="email"
            name="email"
            required
            value={form.email}
            onChange={onChange}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="field-label">Password</label>
          <input
            className="field-input"
            type="password"
            name="password"
            required
            value={form.password}
            onChange={onChange}
            placeholder="••••••••"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <div className="flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="text-ink-700 underline decoration-brand-400 underline-offset-4">
            Forgot password?
          </Link>
          <Link to="/register" className="text-mint-600 underline decoration-mint-400 underline-offset-4">
            Open an account
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
