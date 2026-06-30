import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Check, Loader2, Bell } from "lucide-react";
import { sheety } from "@/shared/lib/sheetyClient";

function Receive() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [displayBalance, setDisplayBalance] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loadingLiveBalance, setLoadingLiveBalance] = useState(false);
  const [incomingAlert, setIncomingAlert] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("ato_user");
    if (stored) {
      const parsedUser = JSON.parse(stored);
      setUser(parsedUser);
      setDisplayBalance(Number(parsedUser.balance || 0));

      // Fetch live data from server to check for new transfers
      setLoadingLiveBalance(true);
      sheety.getProfiles()
        .then((res) => {
          const profiles = res.profile || [];
          const freshData = profiles.find((p) => String(p.id) === String(parsedUser.id));
          
          if (freshData) {
            const serverBalance = Number(freshData.balance || 0);
            const localBalance = Number(parsedUser.balance || 0);

            if (serverBalance > localBalance) {
              const incomingAmount = serverBalance - localBalance;
              
              // Phase 1: Fire incoming notification alert
              setIncomingAlert(`You have an incoming transfer of ₹${incomingAmount.toLocaleString()}!`);
              
              // Append to your app notification list
              const existingNotifications = JSON.parse(localStorage.getItem("ato_notifications") || "[]");
              const newNotif = {
                id: Date.now(),
                type: "info",
                title: "Funds Received",
                message: `An amount of ₹${incomingAmount.toLocaleString()} has been credited to your account.`,
                time: "Just now",
                read: false,
              };
              localStorage.setItem("ato_notifications", JSON.stringify([newNotif, ...existingNotifications]));
              window.dispatchEvent(new Event("ato_notifications_updated"));

              // Phase 2: Wait 3 seconds, then dynamically increase the balance counter
              setTimeout(() => {
                setDisplayBalance(serverBalance);
                
                // Sync to storage
                const updatedUser = { ...parsedUser, balance: serverBalance };
                setUser(updatedUser);
                localStorage.setItem("ato_user", JSON.stringify(updatedUser));
                localStorage.setItem("ato_balance", String(serverBalance));
                window.dispatchEvent(new Event("ato_balance_updated"));
                
                // Clear the floating banner alert
                setIncomingAlert(null);
              }, 3000);

            } else {
              // Balances match perfectly
              setDisplayBalance(serverBalance);
            }
          }
        })
        .catch((err) => console.error("Could not fetch latest balance:", err))
        .finally(() => setLoadingLiveBalance(false));
    }
  }, []);

  const handleCopy = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.accountId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!user) return null;

  return (
    <div className="h-full w-full flex flex-col bg-white px-6 py-8 relative overflow-hidden">
      {/* Floating Incoming Alert Notification */}
      {incomingAlert && (
        <div className="absolute top-4 left-6 right-6 bg-cyan-500 text-white p-4 rounded-xl shadow-lg flex items-center gap-3 animate-bounce z-50">
          <Bell size={20} className="animate-pulse" />
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Notification</p>
            <p className="text-sm font-medium">{incomingAlert}</p>
          </div>
        </div>
      )}

      <button onClick={() => navigate("/dashboard")} className="text-slate-500 mb-6">
        <ArrowLeft size={20} />
      </button>
      <h2 className="text-xl font-semibold text-slate-900 mb-1">Receive money</h2>
      <p className="text-sm text-slate-500 mb-8">Share your Account ID to receive funds.</p>

      <div className="bg-slate-50 rounded-2xl p-6 flex flex-col items-center w-full">
        <p className="text-xs text-slate-400 mb-1">Your Account ID</p>
        <p className="text-lg font-semibold text-slate-900 tracking-wide">{user.accountId}</p>
        <button onClick={handleCopy} className="flex items-center gap-1 mt-3 text-sm text-cyan-600">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy ID"}
        </button>
      </div>

      {/* Live Balance Tracker Display with Dynamic Animation State */}
      <div className="mt-4 p-4 border border-slate-100 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">Current Balance</p>
          <p className={`text-base font-semibold mt-0.5 transition-all duration-500 ${
            incomingAlert ? "text-amber-500 scale-105" : "text-slate-900"
          }`}>
            ₹{displayBalance.toLocaleString()}
          </p>
        </div>
        {loadingLiveBalance && (
          <Loader2 size={16} className="text-cyan-500 animate-spin" />
        )}
      </div>

      <button onClick={() => navigate("/send")} className="text-sm text-cyan-600 mt-6 text-left">
        Send money instead
      </button>
    </div>
  );
}

export default Receive;