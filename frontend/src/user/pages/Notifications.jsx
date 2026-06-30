import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldAlert, Info } from "lucide-react";

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("ato_notifications");
    if (stored) {
      const parsed = JSON.parse(stored);
      setNotifications(parsed);

      // Mark all as read as soon as the page is opened
      const hasUnread = parsed.some((n) => !n.read);
      if (hasUnread) {
        const updated = parsed.map((n) => ({ ...n, read: true }));
        localStorage.setItem("ato_notifications", JSON.stringify(updated));
        setNotifications(updated);
        // Let other components (e.g. the bell icon) know notifications changed
        window.dispatchEvent(new Event("ato_notifications_updated"));
      }
    }
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-white px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate("/dashboard")} className="text-slate-500">
          <ArrowLeft size={20} />
        </button>
      </div>

      <h2 className="text-xl font-semibold text-slate-900 mb-6">Notifications</h2>

      {notifications.length === 0 ? (
        <p className="text-sm text-slate-400 text-center mt-10">No notifications yet</p>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex gap-3 p-3 rounded-xl ${
                n.read ? "bg-white" : "bg-cyan-50"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  n.type === "security" ? "bg-red-50" : "bg-slate-100"
                }`}
              >
                {n.type === "security" ? (
                  <ShieldAlert size={16} className="text-red-500" />
                ) : (
                  <Info size={16} className="text-slate-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;