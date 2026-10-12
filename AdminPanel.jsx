import { useEffect, useState } from "react";
import api from "../api/axios.js";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);

const tabs = ["Overview", "Users", "Accounts", "Transactions"];

const AdminPanel = () => {
  const [tab, setTab] = useState("Overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    const [statsRes, usersRes, accountsRes, txnRes] = await Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/users"),
      api.get("/admin/accounts"),
      api.get("/admin/transactions", { params: { limit: 25 } }),
    ]);
    setStats(statsRes.data);
    setUsers(usersRes.data.users);
    setAccounts(accountsRes.data.accounts);
    setTransactions(txnRes.data.transactions);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const toggleUser = async (id) => {
    await api.patch(`/admin/users/${id}/status`);
    loadAll();
  };

  const toggleFreeze = async (id) => {
    await api.patch(`/admin/accounts/${id}/freeze`);
    loadAll();
  };

  if (loading) return <div className="mx-auto max-w-6xl px-6 py-10 text-ink-700">Loading admin console…</div>;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <p className="eyebrow">Back Office</p>
      <h1 className="mt-1 font-display text-3xl">Admin console</h1>

      <div className="mt-6 flex gap-1 border-b border-ink-950/10 font-mono text-xs uppercase tracking-[0.1em]">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 ${tab === t ? "border-b-2 border-mint-500 text-ink-950" : "text-ink-700/60"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && stats && (
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          {[
            ["Users", stats.userCount],
            ["Accounts", stats.accountCount],
            ["Transactions", stats.transactionCount],
            ["Total Deposits", fmt(stats.totalDeposits)],
          ].map(([label, value]) => (
            <div key={label} className="card">
              <p className="label-muted">{label}</p>
              <p className="mt-2 font-display text-2xl">{value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "Users" && (
        <div className="card mt-6 divide-y divide-ink-950/[0.06]">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{u.name} <span className="stamp ml-2 border-ink-950/10 text-ink-700/70">{u.role}</span></p>
                <p className="font-mono text-xs text-ink-700/70">{u.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`stamp ${u.isActive ? "border-mint-500 text-mint-600" : "border-coral-500 text-coral-500"}`}>
                  {u.isActive ? "Active" : "Deactivated"}
                </span>
                {u.role !== "admin" && (
                  <button onClick={() => toggleUser(u.id)} className="btn-ghost">
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "Accounts" && (
        <div className="card mt-6 divide-y divide-ink-950/[0.06]">
          {accounts.map((a) => (
            <div key={a._id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{a.user?.name} <span className="font-mono text-xs text-ink-700/70">•••• {a.accountNumber.slice(-4)}</span></p>
                <p className="font-mono text-xs text-ink-700/70">{a.user?.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-mono text-sm">{fmt(a.balance)}</p>
                <span className={`stamp ${a.isFrozen ? "border-coral-500 text-coral-500" : "border-mint-500 text-mint-600"}`}>
                  {a.isFrozen ? "Frozen" : "Active"}
                </span>
                <button onClick={() => toggleFreeze(a._id)} className="btn-ghost">
                  {a.isFrozen ? "Unfreeze" : "Freeze"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "Transactions" && (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-950/10 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-700/70">
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Reference</th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">From</th>
                <th className="pb-3 pr-4">To</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-950/[0.06]">
              {transactions.map((t) => (
                <tr key={t._id}>
                  <td className="py-3 pr-4 font-mono text-xs text-ink-700/70">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{t.reference}</td>
                  <td className="py-3 pr-4 capitalize">{t.type.replace("_", " ")}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{t.fromAccountNumber || "—"}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{t.toAccountNumber || "—"}</td>
                  <td className="py-3 text-right font-mono font-semibold">{fmt(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
