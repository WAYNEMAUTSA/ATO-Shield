import { ArrowUpRight, ArrowDownLeft, Inbox } from "lucide-react";
import { useNavigate } from "react-router-dom";

function TransactionList({ transactions = [] }) {
  const navigate = useNavigate();

  return (
    <div className="px-6 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Recent activity</h3>
        {transactions.length > 0 && (
          <button
            onClick={() => navigate("/activity")}
            className="text-xs text-cyan-600 font-medium"
          >
            See all
          </button>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <Inbox size={20} className="text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">No transactions yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Your activity will appear here once you start using your account.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {transactions.slice(0, 5).map((tx, index) => {
            const displayName =
              tx.type === "received"
                ? tx.customerName || tx.name || "Unknown"
                : tx.recipientName || tx.name || "Unknown";

            return (
              <button
                key={tx.id ?? `tx-${tx.accountId}-${index}`}
                onClick={() => navigate(`/send?to=${tx.recipientAccountId || tx.accountId || ""}`)}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      tx.type === "received" ? "bg-green-50" : "bg-slate-100"
                    }`}
                  >
                    {tx.type === "received" ? (
                      <ArrowDownLeft size={16} className="text-green-600" />
                    ) : (
                      <ArrowUpRight size={16} className="text-slate-500" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-900">{displayName}</p>
                    <p className="text-xs text-slate-400">
                      {tx.timestamp || tx.date
                        ? new Date(tx.timestamp || tx.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })
                        : "—"}
                    </p>
                  </div>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    tx.type === "received" ? "text-green-600" : "text-slate-900"
                  }`}
                >
                  {tx.type === "received" ? "+" : "-"}₹
                  {Math.abs(Number(tx.amount)).toLocaleString("en-IN")}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TransactionList;