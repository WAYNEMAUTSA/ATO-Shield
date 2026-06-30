import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard } from "lucide-react";

function Cards() {
  const navigate = useNavigate();
  return (
    <div className="h-full w-full flex flex-col bg-white px-6 py-8">
      <button onClick={() => navigate("/dashboard")} className="text-slate-500 mb-6">
        <ArrowLeft size={20} />
      </button>
      <div className="flex flex-col items-center justify-center flex-1 text-center">
        <CreditCard size={32} className="text-slate-300 mb-3" />
        <p className="text-sm text-slate-500">Card management coming soon</p>
      </div>
    </div>
  );
}

export default Cards;