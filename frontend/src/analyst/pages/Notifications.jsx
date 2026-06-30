import { useState, useEffect } from "react";
import { Bell, AlertTriangle, Check, Trash2, Loader2 } from "lucide-react";
import { fetchTransactions } from "@/shared/api/endpoints/transactions";

const ALERT_STATUSES = ["flagged", "raised"];

function Notifications() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = () => {
      fetchTransactions()
        .then((txs) => {
          const generatedAlerts = txs
            .filter((tx) => ALERT_STATUSES.includes((tx.status || "").toLowerCase().trim()))
            .map((tx) => ({
              id: tx.id,
              text: tx.description || `${tx.status === "raised" ? "Raised" : "Flagged"} transaction for ${tx.customerName}`,
              status: tx.status,
              time: tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString() : "",
            }))
            // newest first
            .sort((a, b) => new Date(b.time) - new Date(a.time));

          setAlerts(generatedAlerts);
        })
        .catch((err) => console.error("Error loading notifications:", err))
        .finally(() => setIsLoading(false));
    };

    loadAlerts();
    const interval = setInterval(loadAlerts, 15000); // keep it live
    return () => clearInterval(interval);
  }, []);

  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    window.dispatchEvent(new Event("ato_alerts_updated"));
  };

  const dismissAll = () => {
    setAlerts([]);
    window.dispatchEvent(new Event("ato_alerts_updated"));
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        {alerts.length > 0 && (
          <button
            onClick={dismissAll}
            className="text-xs text-slate-500 hover:text-cyan-400 flex items-center gap-1"
          >
            <Check size={14} /> Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-cyan-500">
          <Loader2 className="animate-spin mx-auto" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-xl">
          <Bell className="mx-auto text-slate-600 mb-2" size={32} />
          <p className="text-slate-500 text-sm">You're all caught up!</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 flex items-start justify-between group hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex gap-4">
                <div className="mt-1 text-red-400">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <p className="text-sm text-slate-200">{alert.text}</p>
                  <p className="text-xs text-slate-500 mt-1">{alert.time}</p>
                </div>
              </div>
              <button
                onClick={() => dismissAlert(alert.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;