import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, LogOut, ChevronRight } from "lucide-react";
import { getInitials } from "@/shared/lib/getInitials";
import { logout } from "@/shared/data";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("ato_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => logout(navigate);

  if (!user) return null;

  return (
    <div className="h-full w-full flex flex-col bg-white px-6 py-8">
      <button onClick={() => navigate("/dashboard")} className="text-slate-500 mb-6">
        <ArrowLeft size={20} />
      </button>

      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-cyan-500 flex items-center justify-center text-white text-2xl font-semibold mb-3">
          {getInitials(user.fullName)}
        </div>
        <h2 className="text-lg font-semibold text-slate-900">{user.fullName}</h2>
        <p className="text-sm text-slate-400">{user.email}</p>
      </div>

      <div className="flex flex-col gap-1 mb-6">
        <InfoRow label="Phone number" value={user.phone} />
        <InfoRow label="Date of birth" value={user.dob} />
        <InfoRow label="Account ID" value={user.accountId} />
      </div>

      <button
        onClick={() => navigate("/profile/edit")}
        className="flex items-center justify-between py-3 border-t border-slate-100"
      >
        <div className="flex items-center gap-3">
          <Pencil size={18} className="text-cyan-600" />
          <span className="text-sm text-slate-800">Edit profile</span>
        </div>
        <ChevronRight size={16} className="text-slate-300" />
      </button>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 py-3 border-t border-slate-100 text-red-500"
      >
        <LogOut size={18} />
        <span className="text-sm">Log out</span>
      </button>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-t border-slate-100">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}

export default Profile;