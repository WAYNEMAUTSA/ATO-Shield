import { useState, useEffect } from "react";
import { Search, MoreVertical, Loader2 } from "lucide-react";
import { sheety } from "@/shared/lib/googleSheetsClient";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCustomers = () => {
      sheety.getProfiles()
        .then((res) => {
          const data = res.profile || res.profiles || [];
          setCustomers(data);
        })
        .catch((err) => console.error("Error fetching customers:", err))
        .finally(() => setIsLoading(false));
    };

    loadCustomers();
    const interval = setInterval(loadCustomers, 15000); // keep it live
    return () => clearInterval(interval);
  }, []);

  const filtered = customers.filter((c) =>
    (c.fullName || c.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Customers</h1>
        <p className="text-slate-500 text-sm">Manage and monitor customer accounts</p>
      </div>

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

        {isLoading ? (
          <div className="p-10 flex justify-center text-cyan-500">
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">No customers found.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500 border-b border-slate-800">
              <tr>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Risk Score</th>
                <th className="p-4 font-medium">Account ID</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {filtered.map((customer) => (
                <tr
                  key={customer.accountId || customer._rowIndex}
                  className="border-b border-slate-800 hover:bg-slate-800/30"
                >
                  <td className="p-4 font-medium text-slate-100">{customer.fullName || customer.name}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        customer.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {customer.status || "active"}
                    </span>
                  </td>
                  <td className="p-4">{customer.riskScore || 0}</td>
                  <td className="p-4 font-mono text-slate-500">{customer.accountId}</td>
                  <td className="p-4 text-right">
                    <button className="text-slate-500 hover:text-white">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Customers;