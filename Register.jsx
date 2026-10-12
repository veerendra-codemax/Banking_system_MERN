import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios.js";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      navigate("/verify-otp", { state: { userId: data.userId, email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      <p className="eyebrow">
        New Account Application
      </p>
      <h1 className="mt-1 font-display text-3xl">Open an account</h1>

      <form onSubmit={onSubmit} className="card mt-8 space-y-5">
        {error && (
          <p className="rounded-sm border border-coral-500/40 bg-coral-500/5 px-3 py-2 text-sm text-coral-500">
            {error}
          </p>
        )}
        <div>
          <label className="field-label">Full name</label>
          <input className="field-input" name="name" required value={form.name} onChange={onChange} placeholder="Jane Doe" />
        </div>
        <div>
          <label className="field-label">Email</label>
          <input className="field-input" type="email" name="email" required value={form.email} onChange={onChange} placeholder="you@example.com" />
        </div>
        <div>
          <label className="field-label">Phone (optional)</label>
          <input className="field-input" name="phone" value={form.phone} onChange={onChange} placeholder="+91 98765 43210" />
        </div>
        <div>
          <label className="field-label">Password</label>
          <input className="field-input" type="password" name="password" required minLength={8} value={form.password} onChange={onChange} placeholder="At least 8 characters" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account…" : "Create account"}
        </button>
        <p className="text-sm text-ink-700">
          Already have an account?{" "}
          <Link to="/login" className="text-mint-600 underline decoration-mint-400 underline-offset-4">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
