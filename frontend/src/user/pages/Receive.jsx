import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Check } from "lucide-react";

function Receive() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("ato_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(user.accountId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!user) return null;

  return (
    <div className="h-full w-full flex flex-col bg-white px-6 py-8">
      <button onClick={() => navigate("/dashboard")} className="text-slate-500 mb-6">
        <ArrowLeft size={20} />
      </button>
      <h2 className="text-xl font-semibold text-slate-900 mb-1">Receive money</h2>
      <p className="text-sm text-slate-500 mb-8">Share your Account ID to receive funds.</p>

      <div className="bg-slate-50 rounded-2xl p-6 flex flex-col items-center">
        <p className="text-xs text-slate-400 mb-1">Your Account ID</p>
        <p className="text-lg font-semibold text-slate-900 tracking-wide">{user.accountId}</p>
        <button onClick={handleCopy} className="flex items-center gap-1 mt-3 text-sm text-cyan-600">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy ID"}
        </button>
      </div>

      <button onClick={() => navigate("/send")} className="text-sm text-cyan-600 mt-6">
        Send money instead
      </button>
    </div>
  );
}

export default Receive;