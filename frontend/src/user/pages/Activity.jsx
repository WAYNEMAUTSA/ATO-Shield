import { useEffect, useState } from "react";
import { ArrowLeft, Inbox, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getTransactions } from "@/shared/data";

function Activity() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);

  const loadTransactions = () => setTransactions(getTransactions());

  useEffect(() => {
    loadTransactions();
    window.addEventListener("ato_transactions_updated", loadTransactions);
    return () => window.removeEventListener("ato_transactions_updated", loadTransactions);
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-white px-6 py-8">
      <button onClick={() => navigate("/dashboard")} className="text-slate-500 mb-6">
        <ArrowLeft size={20} />
      </button>
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Activity</h2>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center mt-20 gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
            <Inbox size={20} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700">No transactions yet</p>
          <p className="text-xs text-slate-400 max-w-[220px]">
            Your activity will appear here once you start using your account.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  t.type === "sent" ? "bg-red-50" : "bg-green-50"
                }`}
              >
                {t.type === "sent" ? (
                  <ArrowUpRight size={18} className="text-red-500" />
                ) : (
                  <ArrowDownLeft size={18} className="text-green-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{t.name}</p>
                <p className="text-xs text-slate-400">
                  {new Date(t.date).toLocaleString()}
                </p>
              </div>
              <p
                className={`text-sm font-semibold ${
                  t.type === "sent" ? "text-red-500" : "text-green-500"
                }`}
              >
                {t.type === "sent" ? "-" : "+"}₹{t.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Activity;