import { useEffect, useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import BalanceCard from "../components/BalanceCard";
import QuickActions from "../components/QuickActions";
import SecurityStatusCard from "../components/SecurityStatusCard";
import TransactionList from "../components/TransactionList";
import { getBalance, getTransactions } from "@/shared/data";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [balance, setBalanceState] = useState(0);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // TEMP: reading from localStorage until backend /api/user/profile exists
    const stored = localStorage.getItem("ato_user");
    if (stored) {
      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);
      // Seed ato_balance from user.balance the first time, then always read from ato_balance
      setBalanceState(getBalance(parsedUser.balance));
    }
    setTransactions(getTransactions());

    const updateBalance = () => setBalanceState(getBalance());
    const updateTransactions = () => setTransactions(getTransactions());

    window.addEventListener("ato_balance_updated", updateBalance);
    window.addEventListener("ato_transactions_updated", updateTransactions);
    return () => {
      window.removeEventListener("ato_balance_updated", updateBalance);
      window.removeEventListener("ato_transactions_updated", updateTransactions);
    };
  }, []);

  if (!user) {
    return (
      <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
        Loading account...
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white pb-8">
      <DashboardHeader fullName={user.fullName} />
      <BalanceCard balance={balance} accountId={user.accountId} />
      <QuickActions />
      <SecurityStatusCard />
      <TransactionList transactions={transactions} />
    </div>
  );
}

export default Dashboard;