import { ShieldCheck, ChevronRight } from "lucide-react";

function SecurityStatusCard() {
  return (
    <button className="mx-6 mt-6 w-[calc(100%-3rem)] flex items-center justify-between bg-slate-50 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-cyan-100 flex items-center justify-center">
          <ShieldCheck size={18} className="text-cyan-600" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-slate-900">Account secure</p>
          <p className="text-xs text-slate-400">No suspicious activity detected</p>
        </div>
      </div>
      <ChevronRight size={18} className="text-slate-400" />
    </button>
  );
}

export default SecurityStatusCard;