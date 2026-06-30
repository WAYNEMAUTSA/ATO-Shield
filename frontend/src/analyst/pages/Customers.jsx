import { useState } from "react";
import { Search, MoreVertical } from "lucide-react";

// Mock data: In a real app, this would come from your backend
const initialCustomers = [
  { id: 1, name: "Leo Zuze", status: "Active", risk: 12, lastActive: "2026-06-30" },
  { id: 2, name: "Aisha Khan", status: "Flagged", risk: 65, lastActive: "2026-06-29" },
  { id: 3, name: "Rahul Mehta", status: "Active", risk: 8, lastActive: "2026-06-28" },
];

function Customers() {
  const [search, setSearch] = useState("");

  const filtered = initialCustomers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Customers</h1>
        <p className="text-slate-500 text-sm">Manage and monitor customer accounts</p>
      </div>

      {/* Table Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center gap-4">
          <Search className="text-slate-500" size={20} />
          <input 
            className="bg-transparent text-sm text-slate-200 outline-none w-full"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <table className="w-full text-left text-sm">
          <thead className="text-slate-500 border-b border-slate-800">
            <tr>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Account Status</th>
              <th className="p-4 font-medium">Risk Score</th>
              <th className="p-4 font-medium">Last Active</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-slate-300">
            {filtered.map((customer) => (
              <tr key={customer.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                <td className="p-4 font-medium text-slate-100">{customer.name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    customer.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                  }`}>
                    {customer.status}
                  </span>
                </td>
                <td className="p-4">{customer.risk}</td>
                <td className="p-4">{customer.lastActive}</td>
                <td className="p-4 text-right">
                  <button className="text-slate-500 hover:text-white">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Customers;