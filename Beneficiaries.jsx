import { useEffect, useState } from "react";
import api from "../api/axios.js";

const Beneficiaries = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [form, setForm] = useState({ nickname: "", accountNumber: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => api.get("/beneficiaries").then((res) => setBeneficiaries(res.data.beneficiaries));

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/beneficiaries", form);
      setForm({ nickname: "", accountNumber: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add payee");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    await api.delete(`/beneficiaries/${id}`);
    load();
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="eyebrow">Payee Book</p>
      <h1 className="mt-1 font-display text-3xl">Saved payees</h1>

      <form onSubmit={onSubmit} className="card mt-8 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        {error && <p className="sm:col-span-3 rounded-sm border border-coral-500/40 bg-coral-500/5 px-3 py-2 text-sm text-coral-500">{error}</p>}
        <div>
          <label className="field-label">Nickname</label>
          <input className="field-input" required value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} placeholder="e.g. Landlord" />
        </div>
        <div>
          <label className="field-label">Account number</label>
          <input className="field-input font-mono" required value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} placeholder="12-digit number" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Adding…" : "Add payee"}
        </button>
      </form>

      <div className="card mt-6 divide-y divide-ink-950/[0.06]">
        {beneficiaries.length === 0 && <p className="py-4 text-sm text-ink-700">No saved payees yet.</p>}
        {beneficiaries.map((b) => (
          <div key={b._id} className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">{b.nickname}</p>
              <p className="font-mono text-xs text-ink-700/70">
                {b.accountHolderName} · •••• {b.accountNumber.slice(-4)}
              </p>
            </div>
            <button onClick={() => remove(b._id)} className="btn-ghost text-coral-500">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Beneficiaries;
