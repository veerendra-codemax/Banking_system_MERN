import { useEffect, useState } from "react";
import api from "../api/axios.js";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);

const Transfer = () => {
  const [accounts, setAccounts] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [form, setForm] = useState({ fromAccountId: "", toAccountNumber: "", amount: "", description: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [accRes, benRes] = await Promise.all([api.get("/accounts"), api.get("/beneficiaries")]);
      setAccounts(accRes.data.accounts);
      setBeneficiaries(benRes.data.beneficiaries);
      if (accRes.data.accounts[0]) {
        setForm((f) => ({ ...f, fromAccountId: accRes.data.accounts[0]._id }));
      }
    };
    load();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setLoading(true);
    try {
      const { data } = await api.post("/transactions/transfer", form);
      setSuccess(data);
      setForm((f) => ({ ...f, toAccountNumber: "", amount: "", description: "" }));
    } catch (err) {
      setError(err.response?.data?.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <p className="eyebrow">Move Money</p>
      <h1 className="mt-1 font-display text-3xl">Transfer funds</h1>

      <form onSubmit={onSubmit} className="card mt-8 space-y-5">
        {error && <p className="rounded-sm border border-coral-500/40 bg-coral-500/5 px-3 py-2 text-sm text-coral-500">{error}</p>}
        {success && (
          <p className="rounded-sm border border-mint-500/40 bg-mint-500/5 px-3 py-2 text-sm text-mint-600">
            Transfer complete. Reference {success.transaction.reference}. New balance: {fmt(success.newBalance)}
          </p>
        )}

        <div>
          <label className="field-label">From account</label>
          <select className="field-input" name="fromAccountId" required value={form.fromAccountId} onChange={onChange}>
            {accounts.map((a) => (
              <option key={a._id} value={a._id}>
                {a.accountType} •••• {a.accountNumber.slice(-4)} — {fmt(a.balance)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label">To account number</label>
          <input
            className="field-input font-mono"
            name="toAccountNumber"
            required
            value={form.toAccountNumber}
            onChange={onChange}
            placeholder="12-digit account number"
            list="beneficiary-list"
          />
          <datalist id="beneficiary-list">
            {beneficiaries.map((b) => (
              <option key={b._id} value={b.accountNumber}>
                {b.nickname}
              </option>
            ))}
          </datalist>
          {beneficiaries.length > 0 && (
            <p className="mt-1.5 text-xs text-ink-700/60">
              Saved payees: {beneficiaries.map((b) => b.nickname).join(", ")}
            </p>
          )}
        </div>

        <div>
          <label className="field-label">Amount (INR)</label>
          <input
            className="field-input font-mono"
            type="number"
            step="0.01"
            min="0.01"
            name="amount"
            required
            value={form.amount}
            onChange={onChange}
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="field-label">Note (optional)</label>
          <input className="field-input" name="description" value={form.description} onChange={onChange} placeholder="What's this for?" />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Processing…" : "Send transfer"}
        </button>
      </form>
    </div>
  );
};

export default Transfer;
