import { useEffect, useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import BalanceCard from "../components/BalanceCard";
import QuickActions from "../components/QuickActions";
import SecurityStatusCard from "../components/SecurityStatusCard";
import TransactionList from "../components/TransactionList";
import { getBalance, getTransactions } from "@/shared/data";
import { sheety } from "@/shared/lib/sheetyClient";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [balance, setBalanceState] = useState(0);
  const [transactions, setTransactions] = useState([]);

  // Helper to load values from storage
  const syncDashboardData = () => {
    const stored = localStorage.getItem("ato_user");
    if (stored) {
      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);
      
      const activeBalance = localStorage.getItem("ato_balance") || parsedUser.balance;
      setBalanceState(getBalance(activeBalance));
    }
    setTransactions(getTransactions());
  };

  useEffect(() => {
    syncDashboardData();

    // Event handlers for internal page transitions/actions
    const updateBalance = () => {
      const freshBalance = localStorage.getItem("ato_balance");
      if (freshBalance) {
        setBalanceState(Number(freshBalance));
      } else {
        syncDashboardData();
      }
    };
    
    const updateTransactions = () => setTransactions(getTransactions());
    const handleGlobalUserSync = () => syncDashboardData();

    window.addEventListener("ato_balance_updated", updateBalance);
    window.addEventListener("ato_transactions_updated", updateTransactions);
    window.addEventListener("ato_notifications_updated", handleGlobalUserSync);

    // =========================================================
    // BACKGROUND SYNC POLLING (Checks server every 5 seconds)
    // =========================================================
    const intervalId = setInterval(() => {
      const stored = localStorage.getItem("ato_user");
      if (!stored) return;
      const cachedUser = JSON.parse(stored);

      sheety.getProfiles()
        .then((res) => {
          const profiles = res.profile || [];
          const freshData = profiles.find((p) => String(p.id) === String(cachedUser.id));
          
          if (freshData) {
            const serverBalance = Number(freshData.balance || 0);
            const localBalance = Number(cachedUser.balance || 0);

            // If server balance is higher, someone sent money to this account!
            if (serverBalance > localBalance) {
              const receivedAmount = serverBalance - localBalance;

              // 1. Generate Received Notification
              const existingNotifications = JSON.parse(localStorage.getItem("ato_notifications") || "[]");
              const incomingNotif = {
                id: Date.now(),
                type: "info",
                title: "💰 Funds Received Live",
                message: `An amount of ₹${receivedAmount.toLocaleString()} has been credited to your account right now.`,
                time: "Just now",
                read: false,
              };
              
              // 2. Save everything to storage immediately
              localStorage.setItem("ato_notifications", JSON.stringify([incomingNotif, ...existingNotifications]));
              localStorage.setItem("ato_balance", String(serverBalance));
              
              cachedUser.balance = serverBalance;
              localStorage.setItem("ato_user", JSON.stringify(cachedUser));

              // 3. Trigger immediate UI updates across the active dashboard view
              setBalanceState(serverBalance);
              setUser(cachedUser);
              setTransactions(getTransactions()); // pull new entries if mock updates them
              
              window.dispatchEvent(new Event("ato_balance_updated"));
              window.dispatchEvent(new Event("ato_notifications_updated"));
            }
          }
        })
        .catch((err) => console.error("Background sync fetch failed:", err));
    }, 5000); // 5000ms = 5 seconds

    return () => {
      window.removeEventListener("ato_balance_updated", updateBalance);
      window.removeEventListener("ato_transactions_updated", updateTransactions);
      window.removeEventListener("ato_notifications_updated", handleGlobalUserSync);
      clearInterval(intervalId); // Stop running the timer loop when dashboard unmounts
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