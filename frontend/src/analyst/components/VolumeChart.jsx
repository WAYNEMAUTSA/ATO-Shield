import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

function VolumeChart({ transactions }) {
  const byDay = transactions.reduce((acc, tx) => {
  // Ensure amount is treated as a number
  const amount = parseFloat(tx.amount) || 0; 
  const day = new Date(tx.timestamp).toLocaleDateString("en-IN", { weekday: "short" });
  acc[day] = (acc[day] || 0) + amount;
  return acc;
}, {});
  const data = Object.entries(byDay).map(([day, total]) => ({ day, total }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-4">Transaction Volume (₹)</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
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