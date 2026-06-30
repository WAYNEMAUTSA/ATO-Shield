import { useNavigate } from "react-router-dom";

const statusStyles = {
  flagged: "bg-amber-500/10 text-amber-400",
  approved: "bg-cyan-500/10 text-cyan-400",
  blocked: "bg-red-500/10 text-red-400",
  pending: "bg-slate-500/10 text-slate-400",
};

function FlaggedTable({ transactions = [] }) {
  const navigate = useNavigate();

  // Safety check: if transactions is not an array, return nothing
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return <div className="text-slate-500 p-5">No recent transactions.</div>;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-slate-500 uppercase tracking-wide">Recent Transactions</p>
        <button onClick={() => navigate("/analyst/cases")} className="text-xs text-cyan-400 font-medium">
          View all
        </button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-500 border-b border-slate-800">
            <th className="py-2 font-medium">Customer</th>
            <th className="py-2 font-medium">Amount</th>
            <th className="py-2 font-medium">Risk</th>
            <th className="py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, index) => (
            <tr
              // Use unique ID or fallback to index to avoid React warning
              key={tx.id || index}
              onClick={() => tx.id && navigate(`/analyst/cases/${tx.id}`)}
              className="border-b border-slate-800/60 cursor-pointer hover:bg-slate-800/40"
            >
              <td className="py-3">
                <p className="font-medium text-slate-100">{tx.customerName || "Unknown"}</p>
                <p className="text-xs text-slate-500">{tx.accountId || "N/A"}</p>
              </td>
              <td className="py-3 text-slate-300">
                ₹{(Number(tx.amount) || 0).toLocaleString("en-IN")}
              </td>
              <td className="py-3 text-slate-300">{tx.riskScore || 0}</td>
              <td className="py-3">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyles[tx.status] || statusStyles.pending}`}>
                  {tx.status || "pending"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FlaggedTable;