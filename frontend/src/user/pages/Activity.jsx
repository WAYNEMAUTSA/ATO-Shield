import { useEffect, useState } from "react";
import { ArrowLeft, Inbox, ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { sheety } from "@/shared/lib/googleSheetsClient";

function Activity() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentUser = (() => {
    const stored = localStorage.getItem("ato_user");
    return stored ? JSON.parse(stored) : null;
  })();

  const loadTransactions = () => {
    if (!currentUser?.accountId) {
      setIsLoading(false);
      return;
    }

    sheety.getTransactions()
      .then((res) => {
        const allTx = res.transactions || [];
        const myId = String(currentUser.accountId).trim();

        const mine = allTx
          .filter(
            (t) =>
              String(t.accountId).trim() === myId ||
              String(t.recipientAccountId).trim() === myId
          )
          .map((t) => {
            const isSent = String(t.accountId).trim() === myId;

            // Sender sees recipientName; recipient sees customerName (the sender)
            const displayName = isSent
              ? t.recipientName || "Unknown"
              : t.customerName || "Unknown";

            return {
              id: t.id || t._rowIndex,
              name: displayName,
              type: isSent ? "sent" : "received",
              amount: Number(t.amount) || 0,
              date: t.timestamp,
            };
          })
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        setTransactions(mine);
      })
      .catch((err) => console.error("Error loading activity:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadTransactions();
    window.addEventListener("ato_transactions_updated", loadTransactions);

    const interval = setInterval(loadTransactions, 15000); // keep it live
    return () => {
      window.removeEventListener("ato_transactions_updated", loadTransactions);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-white px-6 py-8">
      <button onClick={() => navigate("/dashboard")} className="text-slate-500 mb-6">
        <ArrowLeft size={20} />
      </button>
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Activity</h2>

      {isLoading ? (
        <div className="flex justify-center mt-20 text-cyan-500">
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : transactions.length === 0 ? (
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
                  {t.date ? new Date(t.date).toLocaleString() : ""}
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