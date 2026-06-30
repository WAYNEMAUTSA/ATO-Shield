import { useState } from "react";
import { Outlet } from "react-router-dom";
import AnalystSidebar from "./AnalystSidebar";
import AnalystTopbar from "./AnalystTopbar";

function AnalystLayout() {
  const [alerts, setAlerts] = useState([]);

  // This function is now the "Gatekeeper" for notifications
  const addAlert = (message, type = "critical") => {
    const newAlert = {
      id: Date.now(), // Unique ID based on time
      text: message,
      time: "Just now",
      type: type,
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  return (
    <div className="flex h-screen w-full bg-slate-950">
      <AnalystSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnalystTopbar alertCount={alerts.length} />
        <main className="flex-1 overflow-y-auto">
          {/* Now passing addAlert to all children */}
          <Outlet context={{ alerts, setAlerts, addAlert }} />
        </main>
      </div>
    </div>
  );
}

export default AnalystLayout;