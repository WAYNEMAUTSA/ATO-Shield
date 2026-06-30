import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockContacts, getBalance, sendMoney } from "@/shared/data";

function Send() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [recipientId, setRecipientId] = useState(searchParams.get("to") || "");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const handleSend = (e) => {
    e.preventDefault();

    if (!/^\d{12}$/.test(recipientId)) {
      setError("Enter a valid 12-digit Account ID.");
      return;
    }

    const numericAmount = Number(amount);
    if (!amount || numericAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    const currentBalance = getBalance();
    if (numericAmount > currentBalance) {
      setError(`Insufficient balance. You only have ₹${currentBalance.toLocaleString()}.`);
      return;
    }

    const matchedContact = mockContacts.find((c) => c.accountId === recipientId);

    const result = sendMoney({
      accountId: recipientId,
      name: matchedContact?.name,
      amount: numericAmount,
      currentBalance,
    });

    if (!result.success) {
      setError(result.error);
      return;
    }

    setError("");
    setSuccess({ amount: numericAmount, name: matchedContact?.name || recipientId });

    setTimeout(() => navigate("/dashboard"), 1500);
  };

  if (success) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-white px-6 py-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <p className="text-lg font-semibold text-slate-900">Money sent!</p>
        <p className="text-sm text-slate-500 mt-1">
          ₹{success.amount.toLocaleString()} sent to {success.name}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-white px-6 py-8">
      <button onClick={() => navigate("/dashboard")} className="text-slate-500 mb-6">
        <ArrowLeft size={20} />
      </button>
      <h2 className="text-xl font-semibold text-slate-900 mb-4">Send money</h2>

      <div className="mb-6">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
          Recent contacts
        </p>
        <div className="grid grid-cols-5 gap-y-4 gap-x-2">
          {mockContacts.map((c) => (
            <button
              key={c.accountId}
              onClick={() => setRecipientId(c.accountId)}
              className={`flex flex-col items-center gap-1 rounded-lg p-1 transition-colors ${
                recipientId === c.accountId ? "bg-cyan-50" : "hover:bg-slate-50"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-medium text-sm ${
                  recipientId === c.accountId
                    ? "bg-cyan-500 text-white"
                    : "bg-cyan-50 text-cyan-600"
                }`}
              >
                {c.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <span className="text-[11px] text-slate-500 truncate w-full text-center">
                {c.name.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSend} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Recipient Account ID</label>
          <Input
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            placeholder="12-digit account ID"
            className="mt-1 h-12 rounded-xl"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Amount (₹)</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="mt-1 h-12 rounded-xl"
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white h-12 rounded-xl mt-2">
          Send
        </Button>
      </form>
    </div>
  );
}

export default Send;