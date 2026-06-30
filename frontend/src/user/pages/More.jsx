import { useNavigate } from "react-router-dom";
import { ArrowLeft, Receipt, Settings, HelpCircle, ChevronRight } from "lucide-react";

const items = [
  { label: "Transaction history", icon: Receipt, path: "/activity" },
  { label: "Account settings", icon: Settings, path: "/profile" },
  { label: "Help & support", icon: HelpCircle, path: "/support" },
];

function More() {
  const navigate = useNavigate();
  return (
    <div className="h-full w-full flex flex-col bg-white px-6 py-8">
      <button onClick={() => navigate("/dashboard")} className="text-slate-500 mb-6">
        <ArrowLeft size={20} />
      </button>
      <h2 className="text-xl font-semibold text-slate-900 mb-6">More</h2>
      <div className="flex flex-col gap-1">
        {items.map(({ label, icon: Icon, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="flex items-center justify-between py-3 border-b border-slate-100"
          >
            <div className="flex items-center gap-3">
              <Icon size={18} className="text-cyan-600" />
              <span className="text-sm text-slate-800">{label}</span>
            </div>
            <ChevronRight size={16} className="text-slate-300" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default More;