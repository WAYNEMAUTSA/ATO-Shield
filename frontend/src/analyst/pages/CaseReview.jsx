import { useState } from "react";
import { Smartphone, Globe, Clock } from "lucide-react";
import { mockTransactions } from "../data/mockTransactions";

function CaseReview() {
  const [selectedCase, setSelectedCase] = useState(mockTransactions[0]);

  return (
    <div className="flex h-[calc(100vh-100px)] gap-4">
      {/* LEFT: Case List */}
      <div className="w-80 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-white">Pending Reviews</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {mockTransactions.map((tx) => (
            <button 
              key={tx.id}
              onClick={() => setSelectedCase(tx)}
              className={`w-full p-4 text-left border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${selectedCase.id === tx.id ? 'bg-slate-800 border-l-4 border-l-cyan-500' : ''}`}
            >
              <p className="text-sm font-medium text-slate-200">{tx.customerName}</p>
              <p className="text-xs text-slate-500">Risk Score: {tx.riskScore}</p>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT: Detail Workspace */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6 overflow-y-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">{selectedCase.customerName}</h1>
            <p className="text-slate-500 text-sm">Account ID: {selectedCase.accountId}</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors">Block</button>
            <button className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition-colors">Approve</button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <Smartphone className="text-cyan-400 mb-2" size={20} />
            <p className="text-xs text-slate-500">Device</p>
            <p className="text-sm text-slate-200">{selectedCase.device || "N/A"}</p>
          </div>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <Globe className="text-cyan-400 mb-2" size={20} />
            <p className="text-xs text-slate-500">Location</p>
            <p className="text-sm text-slate-200">{selectedCase.location || "N/A"}</p>
          </div>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <Clock className="text-cyan-400 mb-2" size={20} />
            <p className="text-xs text-slate-500">Attempted</p>
            <p className="text-sm text-slate-200">{selectedCase.time || "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CaseReview;