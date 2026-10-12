import { useEffect, useState } from "react";
import api from "../api/axios.js";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);

const Transactions = () => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/accounts").then((res) => setAccounts(res.data.accounts));
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get("/transactions", { params: { page, limit: 15 } })
      .then((res) => {
        setTransactions(res.data.transactions);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <p className="eyebrow">Ledger</p>
      <h1 className="mt-1 font-display text-3xl">Statement of account</h1>

      <div className="card mt-8 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink-950/10 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-700/70">
              <th className="pb-3 pr-4">Date</th>
              <th className="pb-3 pr-4">Reference</th>
              <th className="pb-3 pr-4">Type</th>
              <th className="pb-3 pr-4">Description</th>
              <th className="pb-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-950/[0.06]">
            {!loading && transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-ink-700">No transactions found.</td>
              </tr>
            )}
            {transactions.map((t) => {
              const isCredit = accounts.some((a) => a._id === t.toAccount);
              return (
                <tr key={t._id}>
                  <td className="py-3 pr-4 font-mono text-xs text-ink-700/70">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs">{t.reference}</td>
                  <td className="py-3 pr-4 capitalize">{t.type.replace("_", " ")}</td>
                  <td className="py-3 pr-4 text-ink-700">{t.description || "—"}</td>
                  <td className={`py-3 text-right font-mono font-semibold ${isCredit ? "text-mint-600" : "text-coral-500"}`}>
                    {isCredit ? "+" : "−"}
                    {fmt(t.amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 font-mono text-xs">
          <button className="btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            ← Prev
          </button>
          <span>Page {page} of {totalPages}</span>
          <button className="btn-ghost" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Transactions;
