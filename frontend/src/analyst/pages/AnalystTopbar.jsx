import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, ChevronDown } from "lucide-react";

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "A";
}

function AnalystTopbar({ alertCount = 0 }) {
  const navigate = useNavigate();
  const [analyst, setAnalyst] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("active_analyst");
    if (stored) setAnalyst(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("active_analyst");
    navigate("/analyst/login");
  };

  return (
    <header className="h-16 shrink-0 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-6">
      <div>
        <p className="text-xs text-slate-500">Fraud Operations</p>
        <p className="text-sm text-slate-200 font-medium">Console</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell - Now dynamic based on alertCount prop */}
        <button
          onClick={() => navigate("/analyst/notifications")}
          className="relative w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center transition-all hover:bg-slate-800"
        >
          <Bell size={16} className="text-slate-300" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center border border-slate-950 font-bold">
              {alertCount}
            </span>
          )}
        </button>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-900 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white text-xs font-semibold">
              {getInitials(analyst?.name || analyst?.analystId)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs text-slate-200 font-medium leading-tight">
                {analyst?.name || analyst?.analystId || "Analyst"}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">{analyst?.role || "Fraud Analyst"}</p>
            </div>
            <ChevronDown size={14} className="text-slate-500" />
          </button>

          {/* Logout Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-800"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AnalystTopbar;