import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react";
import { sheety } from "@/shared/lib/sheetyClient";
import { getDeviceId } from "@/shared/lib/getDeviceId";
import { detectLocation } from "@/shared/lib/detectLocation";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (formError) setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.email.trim() || !form.password) {
      setFormError("Enter your email and password.");
      return;
    }

    setSubmitting(true);

    try {
      const { profile } = await sheety.getProfiles();
      const match = profile.find(
        (p) =>
          p.email &&
          p.email.toLowerCase() === form.email.trim().toLowerCase() &&
          p.password === form.password
      );

      if (!match) {
        setSubmitting(false);
        setFormError("Invalid email or password.");
        return;
      }

      // Safe evaluation now that getDeviceId has a fallback wrapper
      const currentDeviceId = getDeviceId();
      let currentLocation = match.location || "";
      try {
        currentLocation = await detectLocation();
      } catch {
        // geolocation denied/unavailable — leave layout as is
      }

      const updatedUser = { ...match, deviceId: currentDeviceId, location: currentLocation };
      localStorage.setItem("ato_user", JSON.stringify(updatedUser));

      const displayLocation = currentLocation || "an unknown location";
      const existingNotifications = JSON.parse(localStorage.getItem("ato_notifications") || "[]");

      // DETECT UNRECOGNIZED DEVICE FRAUD / ATO SIGNALS
      const isNewDevice = match.deviceId && String(match.deviceId) !== String(currentDeviceId);
      
      let systemAlert;
      if (isNewDevice) {
        // High Severity Fraud / ATO Event Warning Object
        systemAlert = {
          id: Date.now(),
          type: "fraud_alert",
          title: "🚨 CRITICAL: Suspicious Login Detected",
          message: `An unrecognized device (${currentDeviceId.substring(0, 8)}) attempted access from ${displayLocation}. ATO Shield is analyzing behavior signals.`,
          time: "Just now",
          read: false,
          severity: "high"
        };
      } else {
        // Standard Authorized Login log
        systemAlert = {
          id: Date.now(),
          type: "security",
          title: "New login event",
          message: `Account logged in from ${displayLocation} using authorized device.`,
          time: "Just now",
          read: false,
          severity: "low"
        };
      }

      // Append and save alert logs directly to local storage cache array pipeline
      localStorage.setItem("ato_notifications", JSON.stringify([systemAlert, ...existingNotifications]));

      if (updatedUser.id) {
        sheety
          .updateProfile(updatedUser.id, { deviceId: currentDeviceId, location: currentLocation })
          .catch((err) => console.error("Profile remote syncing failed:", err));
      }

      setSubmitting(false);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login handling pipeline error:", err);
      setSubmitting(false);
      setFormError(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-white px-6 py-8">
      <button
        onClick={() => navigate("/welcome")}
        className="flex items-center text-slate-500 mb-6 w-fit"
      >
        <ArrowLeft size={20} />
      </button>

      <h2 className="text-xl font-semibold text-slate-900 mb-1">Welcome back</h2>
      <p className="text-sm text-slate-500 mb-6">Log in to access your account.</p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700">Email address</label>
          <Input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="mt-1 h-12 rounded-xl"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Password</label>
          <div className="relative mt-1">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="h-12 rounded-xl pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {formError && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle size={12} /> {formError}
          </p>
        )}

        <Button
          type="submit"
          disabled={submitting}
          className="bg-cyan-500 hover:bg-cyan-600 text-white h-12 rounded-xl mt-2"
        >
          {submitting ? "Logging in..." : "Log in"}
        </Button>
      </form>
    </div>
  );
}

export default Login;