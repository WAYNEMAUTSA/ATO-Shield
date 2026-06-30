import { useNavigate, useLocation } from "react-router-dom";
import { Home, Send, Receipt, User } from "lucide-react";

const tabs = [
  { label: "Home", path: "/dashboard", icon: Home },
  { label: "Send", path: "/send", icon: Send },
  { label: "Activity", path: "/activity", icon: Receipt },
  { label: "Profile", path: "/profile", icon: User },
];
// Add analyst routes to the exclusion list
const hiddenRoutes = ["/", "/welcome", "/login"];

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on exact matches or any route starting with "/analyst"
  if (hiddenRoutes.includes(location.pathname) || location.pathname.startsWith("/analyst")) {
    return null;
  }
  
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around py-3 z-40">
      {tabs.map(({ label, path, icon: Icon }) => {
        const active = location.pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-1"
          >
            <Icon size={20} className={active ? "text-cyan-600" : "text-slate-400"} />
            <span className={`text-[10px] ${active ? "text-cyan-600 font-medium" : "text-slate-400"}`}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default BottomNav;