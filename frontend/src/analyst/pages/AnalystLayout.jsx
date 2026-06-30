import { Outlet } from "react-router-dom";
import AnalystSidebar from "./AnalystSidebar";
import AnalystTopbar from "./AnalystTopbar";

function AnalystLayout() {
  return (
    <div className="flex h-screen w-full bg-slate-950">
      <AnalystSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnalystTopbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AnalystLayout;