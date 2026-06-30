import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, ShieldAlert, Users, Bell, Settings, ShieldCheck } from "lucide-react";

const navItems = [
  { label: "Overview", path: "/analyst/dashboard", icon: LayoutGrid },
  { label: "Case Review", path: "/analyst/cases", icon: ShieldAlert },
  { label: "Customers", path: "/analyst/customers", icon: Users },
  { label: "Notifications", path: "/analyst/notifications", icon: Bell },
  { label: "Settings", path: "/analyst/settings", icon: Settings },
];

function AnalystSidebar() {
  const location = useLocation();

  return (
    <aside className="w-60 shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col py-6">
      <div className="flex items-center gap-2 px-5 mb-8">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
          <ShieldCheck size={16} className="text-cyan-400" />
        </div>
        <span className="text-sm font-semibold text-white tracking-tight">ATO Shield</span>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {navItems.map(({ label, path, icon: Icon }) => {
          const active = location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-cyan-500/10 text-cyan-400 font-medium"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default AnalystSidebar;