import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ArrowDownLeft, CreditCard, MoreHorizontal } from "lucide-react";

const actions = [
  { label: "Send", icon: ArrowUpRight, path: "/send" },
  { label: "Receive", icon: ArrowDownLeft, path: "/receive" },
  { label: "Cards", icon: CreditCard, path: "/cards" },
  { label: "More", icon: MoreHorizontal, path: "/more" },
];

function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between px-6 mt-5">
      {actions.map(({ label, icon: Icon, path }) => (
        <button key={label} onClick={() => navigate(path)} className="flex flex-col items-center gap-1.5">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
            <Icon size={18} className="text-cyan-600" />
          </div>
          <span className="text-xs text-slate-600">{label}</span>
        </button>
      ))}
    </div>
  );
}

export default QuickActions;