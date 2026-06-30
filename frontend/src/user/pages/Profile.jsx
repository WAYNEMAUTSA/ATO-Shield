import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, LogOut, ChevronRight, MapPin, Check, X } from "lucide-react";
import { getInitials } from "@/shared/lib/getInitials";
import { logout } from "@/shared/data";
import { getDeviceId } from "@/shared/lib/getDeviceId";
import { detectLocation } from "@/shared/lib/detectLocation";
import { sheety } from "@/shared/lib/sheetyClient";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editingLocation, setEditingLocation] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("ato_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setLocationInput(parsed.location || "");

      const deviceId = parsed.deviceId || getDeviceId();

      if (!parsed.location) {
        setDetecting(true);
        detectLocation()
          .then((loc) => {
            const updated = { ...parsed, deviceId, location: loc };
            setUser(updated);
            setLocationInput(loc);
            localStorage.setItem("ato_user", JSON.stringify(updated));
            syncToSheety(updated, { deviceId, location: loc });
          })
          .catch(() => {
            const updated = { ...parsed, deviceId };
            setUser(updated);
            localStorage.setItem("ato_user", JSON.stringify(updated));
            syncToSheety(updated, { deviceId });
          })
          .finally(() => setDetecting(false));
      } else if (!parsed.deviceId) {
        const updated = { ...parsed, deviceId };
        setUser(updated);
        localStorage.setItem("ato_user", JSON.stringify(updated));
        syncToSheety(updated, { deviceId });
      }
    }
  }, []);

  const syncToSheety = (updatedUser, fields) => {
    if (!updatedUser.id) return;
    sheety
      .updateProfile(updatedUser.id, fields)
      .catch((err) => console.error("Profile sync failed:", err));
  };

  const handleLogout = () => logout(navigate);

  const handleSaveLocation = () => {
    const trimmed = locationInput.trim();
    const updated = { ...user, location: trimmed };
    setUser(updated);
    localStorage.setItem("ato_user", JSON.stringify(updated));
    syncToSheety(updated, { location: trimmed });
    setEditingLocation(false);
  };

  const handleCancelEditLocation = () => {
    setLocationInput(user.location || "");
    setEditingLocation(false);
  };

  const handleRedetect = () => {
    setDetecting(true);
    detectLocation()
      .then((loc) => {
        setLocationInput(loc);
        const updated = { ...user, location: loc };
        setUser(updated);
        localStorage.setItem("ato_user", JSON.stringify(updated));
        syncToSheety(updated, { location: loc });
      })
      .catch(() => {
        // permission denied or failed — leave as is
      })
      .finally(() => setDetecting(false));
  };

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
        <InfoRow label="Device ID" value={user.deviceId} mono />

        <div className="flex items-center justify-between py-3 border-t border-slate-100">
          <span className="text-sm text-slate-500 flex items-center gap-1">
            <MapPin size={14} className="text-slate-400" />
            Location
          </span>

          {editingLocation ? (
            <div className="flex items-center gap-2">
              <input
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="text-sm text-right border-b border-slate-300 focus:outline-none focus:border-cyan-500 w-36"
                placeholder="City, Country"
                autoFocus
              />
              <button onClick={handleSaveLocation} className="text-emerald-500">
                <Check size={16} />
              </button>
              <button onClick={handleCancelEditLocation} className="text-slate-400">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-900">
                {detecting ? "Detecting..." : user.location || "Not set"}
              </span>
              <button
                onClick={() => setEditingLocation(true)}
                className="text-cyan-600"
              >
                <Pencil size={14} />
              </button>
            </div>
          )}
        </div>

        {!editingLocation && (
          <button
            onClick={handleRedetect}
            disabled={detecting}
            className="text-xs text-cyan-600 text-left mt-1"
          >
            {detecting ? "Detecting location..." : "Use current location"}
          </button>
        )}
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

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between py-3 border-t border-slate-100">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-medium text-slate-900 ${mono ? "font-mono text-xs" : ""}`}>
        {value || "—"}
      </span>
    </div>
  );
}

export default Profile;