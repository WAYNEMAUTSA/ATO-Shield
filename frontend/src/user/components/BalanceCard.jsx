import { useState } from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";

function BalanceCard({ balance = 0, accountId = "000000000000" }) {
  const [visible, setVisible] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(accountId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mx-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white p-5 shadow-lg shadow-cyan-200">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-cyan-50">Total balance</p>
        <button onClick={() => setVisible(!visible)} className="text-cyan-50">
          {visible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>
      <p className="text-3xl font-bold tracking-tight">
        {visible ? `₹${balance.toLocaleString("en-IN")}` : "••••••"}
      </p>

      <div className="flex items-center gap-2 mt-3">
        <p className="text-xs text-cyan-50 tracking-wide">Account ID: {accountId}</p>
        <button onClick={handleCopy} className="text-cyan-50">
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
      </div>
    </div>
  );
}

export default BalanceCard;