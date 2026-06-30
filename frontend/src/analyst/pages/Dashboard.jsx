import { useState, useEffect } from "react";
import { ShieldAlert, ShieldCheck, ShieldX, Clock } from "lucide-react";
import StatCard from "../components/StatCard";
import RiskBreakdownChart from "../components/RiskBreakdownChart";
import VolumeChart from "../components/VolumeChart";
import FlaggedTable from "../components/FlaggedTable";
import { fetchTransactions } from "@/shared/api/endpoints/transactions";

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchTransactions();
        setTransactions(data);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // Optional: Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-white p-10">Loading live data...</div>;

  const flaggedCount = transactions.filter((t) => t.status === "flagged").length;
  const blockedCount = transactions.filter((t) => t.status === "blocked").length;
  const pendingCount = transactions.filter((t) => t.status === "pending").length;
  const approvedCount = transactions.filter((t) => t.status === "approved").length;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-10">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Flagged" value={flaggedCount} icon={ShieldAlert} tone="warning" />
        <StatCard label="Blocked" value={blockedCount} icon={ShieldX} tone="danger" />
        <StatCard label="Pending" value={pendingCount} icon={Clock} tone="default" />
        <StatCard label="Approved" value={approvedCount} icon={ShieldCheck} tone="success" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        <VolumeChart transactions={transactions} />
        <RiskBreakdownChart transactions={transactions} />
      </section>

      <FlaggedTable transactions={transactions} />
    </div>
  );
}

export default Dashboard;