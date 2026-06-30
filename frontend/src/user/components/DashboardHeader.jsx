import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ShieldCheck } from "lucide-react";
import { getInitials } from "@/shared/lib/getInitials";

function DashboardHeader({ fullName = "John Doe" }) {
  const navigate = useNavigate();
  const [hasUnread, setHasUnread] = useState(false);

  const checkUnread = () => {
    const notifications = JSON.parse(localStorage.getItem("ato_notifications") || "[]");
    setHasUnread(notifications.some((n) => !n.read));
  };

  useEffect(() => {
    checkUnread();
    window.addEventListener("ato_notifications_updated", checkUnread);
    return () => window.removeEventListener("ato_notifications_updated", checkUnread);
  }, []);

  return (
    <div className="flex items-center justify-between px-6 pt-6 pb-4">
      <button onClick={() => navigate("/profile")} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
          {getInitials(fullName)}
        </div>
        <div className="text-left">
          <p className="text-xs text-slate-400">Welcome back,</p>
          <p className="text-sm font-semibold text-slate-900">{fullName.split(" ")[0]}</p>
        </div>
      </button>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-cyan-50 text-cyan-600 text-xs font-medium px-2.5 py-1 rounded-full">
          <ShieldCheck size={14} />
          Protected
        </div>
        <button
          onClick={() => navigate("/notifications")}
          className="relative w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"
        >
          <Bell size={18} className="text-slate-600" />
          {hasUnread && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />}
        </button>
      </div>
    </div>
  );
}

export default DashboardHeader;