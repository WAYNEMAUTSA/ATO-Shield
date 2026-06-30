import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = {
  flagged: "#f59e0b",
  approved: "#22d3ee",
  blocked: "#f87171",
  pending: "#64748b",
};

function RiskBreakdownChart({ transactions }) {
  const counts = transactions.reduce((acc, tx) => {
    acc[tx.status] = (acc[tx.status] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(counts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
    key: status,
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-4">Case Status</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3} stroke="none">
            {data.map((entry) => (
              <Cell key={entry.key} fill={COLORS[entry.key]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, fontSize: 12 }} />
          <Legend
            verticalAlign="bottom"
            height={30}
            iconType="circle"
            formatter={(value) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RiskBreakdownChart;