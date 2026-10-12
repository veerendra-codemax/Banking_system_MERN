import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);

const Dashboard = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [accRes, txnRes] = await Promise.all([
          api.get("/accounts"),
          api.get("/transactions", { params: { limit: 6 } }),
        ]);
        setAccounts(accRes.data.accounts);
        setRecent(txnRes.data.transactions);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <p className="eyebrow">Account Summary</p>
      <h1 className="mt-1 font-display text-3xl">Welcome back, {user?.name?.split(" ")[0]}</h1>

      {loading ? (
        <p className="mt-8 text-ink-700">Loading your accounts…</p>
      ) : (
        <>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="card md:col-span-1 bg-ink-950 text-white">
              <p className="label-muted !text-mint-400">Total Balance</p>
              <p className="mt-3 font-display text-4xl">{fmt(totalBalance)}</p>
              <p className="mt-1 font-mono text-xs text-white/50">across {accounts.length} account{accounts.length !== 1 ? "s" : ""}</p>
              <div className="mt-6 flex gap-2">
                <Link to="/transfer" className="btn-primary flex-1 !py-2 text-center">Transfer</Link>
                <Link to="/transactions" className="btn-secondary flex-1 !py-2 text-center">Statement</Link>
              </div>
            </div>

            <div className="card md:col-span-2">
              <p className="label-muted">Your Accounts</p>
              <div className="mt-4 divide-y divide-ink-950/[0.06]">
                {accounts.map((a) => (
                  <div key={a._id} className="row-hover -mx-2 flex items-center justify-between rounded-lg px-2 py-3">
                    <div className="flex items-center gap-3">
                      <span className="icon-tile">
                        <Wallet size={16} strokeWidth={2.25} />
                      </span>
                      <div>
                        <p className="font-body text-sm font-medium capitalize">{a.accountType} account</p>
                        <p className="font-mono text-xs text-ink-500">•••• {a.accountNumber.slice(-4)}</p>
                      </div>
                    </div>
                    <p className="font-mono text-base font-semibold">{fmt(a.balance)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card mt-6">
            <div className="flex items-center justify-between">
              <p className="label-muted">Recent Activity</p>
              <Link to="/transactions" className="text-xs text-mint-600 underline underline-offset-4">View full statement</Link>
            </div>
            <div className="mt-4 divide-y divide-ink-950/[0.06]">
              {recent.length === 0 && <p className="py-4 text-sm text-ink-700">No transactions yet.</p>}
              {recent.map((t) => {
                const isCredit = accounts.some((a) => a._id === t.toAccount);
                return (
                  <div key={t._id} className="row-hover -mx-2 flex items-center justify-between rounded-lg px-2 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${isCredit ? "bg-mint-500/10 text-mint-600" : "bg-coral-500/10 text-coral-500"}`}>
                        {isCredit ? <ArrowDownLeft size={16} strokeWidth={2.25} /> : <ArrowUpRight size={16} strokeWidth={2.25} />}
                      </span>
                      <div>
                        <p className="text-sm font-medium capitalize">{t.type.replace("_", " ")}</p>
                        <p className="font-mono text-xs text-ink-500">
                          {new Date(t.createdAt).toLocaleString()} · {t.reference}
                        </p>
                      </div>
                    </div>
                    <p className={`font-mono text-sm font-semibold ${isCredit ? "text-mint-600" : "text-coral-500"}`}>
                      {isCredit ? "+" : "−"}
                      {fmt(t.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
