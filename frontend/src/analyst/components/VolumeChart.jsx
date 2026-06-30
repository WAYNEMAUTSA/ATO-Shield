import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

function VolumeChart({ transactions }) {
  // Parse + clean rows once
  const validTx = transactions
    .filter((tx) => tx.accountId || tx.customerName)
    .map((tx) => ({ ...tx, _date: new Date(tx.timestamp), _amount: parseFloat(tx.amount) || 0 }))
    .filter((tx) => !isNaN(tx._date.getTime()));

  if (validTx.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-4">Transaction Volume (₹)</p>
        <p className="text-sm text-slate-600 py-10 text-center">No valid transaction data to chart.</p>
      </div>
    );
  }

  // Check how many distinct calendar days are represented
  const distinctDays = new Set(validTx.map((tx) => tx._date.toISOString().slice(0, 10)));

  let data;
  if (distinctDays.size > 1) {
    // Multi-day view: group by date, cumulative isn't needed — just daily totals
    const byDate = validTx.reduce((acc, tx) => {
      const dateKey = tx._date.toISOString().slice(0, 10);
      const label = tx._date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      if (!acc[dateKey]) acc[dateKey] = { label, total: 0 };
      acc[dateKey].total += tx._amount;
      return acc;
    }, {});
    data = Object.keys(byDate)
      .sort()
      .map((dateKey) => ({ x: byDate[dateKey].label, total: byDate[dateKey].total }));
  } else {
    // Single-day view: plot each transaction in chronological order through the day,
    // as a running cumulative total so it reads as a volume line, not isolated dots
    const sorted = [...validTx].sort((a, b) => a._date - b._date);
    let running = 0;
    data = sorted.map((tx) => {
      running += tx._amount;
      return {
        x: tx._date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        total: running,
      };
    });
  }

  if (data.length === 1) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-4">Transaction Volume (₹)</p>
        <p className="text-sm text-slate-600 py-10 text-center">
          Only one transaction so far (₹{data[0].total.toLocaleString("en-IN")}).
          <br />The line will appear as more transactions come in.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-4">Transaction Volume (₹)</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="x" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#cbd5e1" }}
          />
          <Line type="monotone" dataKey="total" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3, fill: "#22d3ee" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default VolumeChart;