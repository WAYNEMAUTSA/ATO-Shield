import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, User, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getBalance, sendMoney } from "@/shared/data";
import { createTransaction } from "@/shared/api/endpoints/transactions";
import { sheety } from "@/shared/lib/sheetyClient";

function Send() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [recipientId, setRecipientId] = useState(searchParams.get("to") || "");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  // Dynamic Lookup State
  const [recipientName, setRecipientName] = useState("");
  const [recipientProfile, setRecipientProfile] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Dynamic Network Contacts State
  const [dynamicContacts, setDynamicContacts] = useState([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  // Lock the active sender profile session context on mount
  const [senderSession, setSenderSession] = useState(() => {
    const originalUser = localStorage.getItem("ato_user");
    return originalUser ? JSON.parse(originalUser) : null;
  });

  // =========================================================
  // DYNAMIC CONTACT LOADING LOOP (CLEAN DIRECT FILTER)
  // =========================================================
  useEffect(() => {
    if (!senderSession) return;
    
    setIsLoadingContacts(true);
    sheety.getProfiles()
      .then((res) => {
        const profiles = res.profile || res.profiles || [];
        
        // Filter out the currently logged-in user accurately
        const availableContacts = profiles.filter((p) => {
          return String(p.accountId).trim() !== String(senderSession.accountId).trim();
        });

        // Shuffle array using the Fisher-Yates algorithm
        const shuffled = [...availableContacts];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Safe Slicing: Keep up to 10 contacts maximum
        const sliceLimit = Math.min(10, shuffled.length);
        const selectedSelection = shuffled.slice(0, sliceLimit);
        
        setDynamicContacts(selectedSelection);
      })
      .catch((err) => console.error("Could not fetch database contacts:", err))
      .finally(() => setIsLoadingContacts(false));
  }, [senderSession]);

  // =========================================================
  // MANUAL & SELECTED ACCOUNT VERIFICATION ENGINE
  // =========================================================
  useEffect(() => {
    if (/^\d{12}$/.test(recipientId)) {
      setIsSearching(true);
      setError("");
      
      sheety.getProfiles()
        .then((res) => {
          const profiles = res.profile || res.profiles || [];
          const match = profiles.find((p) => String(p.accountId).trim() === String(recipientId).trim());
          
          if (match) {
            if (senderSession && String(match.accountId).trim() === String(senderSession.accountId).trim()) {
              setError("You cannot send money to your own account.");
              setRecipientName("");
              setRecipientProfile(null);
              return;
            }
            setRecipientName(match.fullName || match.name);
            setRecipientProfile(match);
          } else {
            setRecipientName("");
            setRecipientProfile(null);
            setError("Account ID not found in the system.");
          }
        })
        .catch((err) => {
          console.error("Failed to fetch recipient profile:", err);
          setError("Error looking up account information.");
        })
        .finally(() => setIsSearching(false));
    } else {
      setRecipientName("");
      setRecipientProfile(null);
    }
  }, [recipientId, senderSession]);

  const selectContact = (contact) => {
    setRecipientId(String(contact.accountId));
    setAmount(""); 
  };

// ... inside Send.jsx ...
const handleSend = async (e) => {
  e.preventDefault();
  const currentActiveSenderRaw = localStorage.getItem("ato_user");
  if (!currentActiveSenderRaw) return setError("Session expired.");
  const verifiedSender = JSON.parse(currentActiveSenderRaw);

  const numericAmount = Number(amount);
  setIsProcessing(true);
  setError("");

  try {
    // Balance updates
    await sheety.updateProfile(recipientProfile.id, { balance: Number(recipientProfile.balance) + numericAmount });
    
    const result = sendMoney({ accountId: recipientId, name: recipientName, amount: numericAmount, currentBalance: getBalance() });
    if (!result.success) throw new Error(result.error);

    verifiedSender.balance = result.newBalance;
    localStorage.setItem("ato_user", JSON.stringify(verifiedSender));
    await sheety.updateProfile(verifiedSender.id, { balance: result.newBalance });

    await createTransaction({
      user_id: verifiedSender.accountId || verifiedSender.id,
      amount: numericAmount,
      currency: "INR",
      location_lat: null,
      location_lon: null,
      device_id: localStorage.getItem("device_id") || "unknown",
      network_fingerprint: localStorage.getItem("network_fingerprint") || null,
      merchant_category: "Peer Transfer",
      description: `Send to ${recipientName}`,
    });

    window.dispatchEvent(new Event("ato_transactions_updated"));
    setSuccess({ amount: numericAmount, name: recipientName });
    setTimeout(() => navigate("/dashboard"), 1500);
  } catch (err) {
    setError(err.message);
  } finally {
    setIsProcessing(false);
  }
};

// Ensure your Map key is fixed in the JSX like this:
// {dynamicContacts.map((contact) => (
//   <button key={contact.id || contact.accountId} ...>
  return (
    <div className="h-full w-full flex flex-col bg-white px-6 py-8 overflow-y-auto">
      <button onClick={() => navigate("/dashboard")} className="text-slate-500 mb-6 flex items-center gap-1 w-fit" disabled={isProcessing}>
        <ArrowLeft size={20} />
      </button>
      
      <h2 className="text-xl font-semibold text-slate-900 mb-4">Send money</h2>

      {/* DYNAMIC REAL-TIME CONTACT CAROUSEL - CLEAN RENDERING LOOP */}
      {dynamicContacts.length > 0 && (
        <div className="mb-6">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
            Suggested Contacts from Network
          </label>
          
          <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin w-full items-center">
            {dynamicContacts.map((contact) => {
              const displayName = contact.fullName || contact.name || "User";
              const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
              
              return (
                <button
                  key={contact.id || contact.accountId}
                  type="button"
                  onClick={() => selectContact(contact)}
                  className={`flex-shrink-0 flex flex-col items-center p-3 border rounded-xl transition-all min-w-[105px] cursor-pointer ${
                    String(recipientId).trim() === String(contact.accountId).trim()
                      ? "bg-cyan-50 border-cyan-400 ring-2 ring-cyan-100 scale-95"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                  }`}
                  disabled={isProcessing}
                >
                  <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center mb-1 text-xs font-bold shadow-sm">
                    {initials}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 text-center truncate w-20">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5 tracking-tight">
                    {String(contact.accountId).slice(-4).padStart(8, "•")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <form onSubmit={handleSend} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Recipient Account ID</label>
          <div className="relative mt-1">
            <Input
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              placeholder="12-digit account ID"
              className="h-12 rounded-xl pr-10 font-mono tracking-wide"
              maxLength={12}
              disabled={isProcessing}
            />
            {isSearching && (
              <Loader2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-500 animate-spin" />
            )}
          </div>

          {recipientName && (
            <div className="mt-2 flex items-center gap-2 p-3 bg-cyan-50/50 rounded-xl border border-cyan-100">
              <User size={16} className="text-cyan-600" />
              <span className="text-xs text-slate-500">Recipient verified:</span>
              <span className="text-xs font-semibold text-slate-900">{recipientName}</span>
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Amount (₹)</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="mt-1 h-12 rounded-xl"
            disabled={!recipientName || isSearching || isProcessing}
          />
        </div>

        {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
        
        <Button 
          type="submit" 
          className="bg-cyan-500 hover:bg-cyan-600 text-white h-12 rounded-xl mt-2 font-medium shadow-md shadow-cyan-100"
          disabled={isSearching || !recipientName || isProcessing}
        >
          {isProcessing ? "Processing Transfer..." : "Send"}
        </Button>
      </form>
    </div>
  );
}

export default Send;