import { useState, useEffect } from "react";

function Settings() {
  // 1. Initialize state from localStorage or default
  const [alertsEnabled, setAlertsEnabled] = useState(() => {
    return JSON.parse(localStorage.getItem("alertsEnabled") ?? "true");
  });

  // 2. Persist to localStorage whenever the state changes
  useEffect(() => {
    localStorage.setItem("alertsEnabled", JSON.stringify(alertsEnabled));
  }, [alertsEnabled]);

  const handleLogoutAll = () => {
    // In a real app, you would call an API here
    alert("Signing out of all sessions...");
    localStorage.clear();
    window.location.href = "/analyst/login";
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
      
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Preferences</h2>
        
        {/* Desktop Alerts Toggle */}
        <div className="flex justify-between items-center py-3 border-b border-slate-800">
          <p className="text-sm text-slate-300">Enable Desktop Alerts</p>
          <input 
            type="checkbox" 
            checked={alertsEnabled}
            onChange={(e) => setAlertsEnabled(e.target.checked)}
            className="cursor-pointer accent-cyan-500 w-5 h-5" 
          />
        </div>
        
        {/* Dark Mode (Visual state only) */}
        <div className="flex justify-between items-center py-3">
          <p className="text-sm text-slate-300">Dark Mode</p>
          <input 
            type="checkbox" 
            checked={true} 
            disabled 
            className="cursor-not-allowed accent-cyan-500 w-5 h-5" 
          />
        </div>
      </div>

      <button 
        onClick={handleLogoutAll}
        className="text-red-400 text-sm font-medium hover:text-red-300 transition-colors"
      >
        Sign out of all sessions
      </button>
    </div>
  );
}

export default Settings;