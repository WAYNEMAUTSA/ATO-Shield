import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchAnalysts } from "@/shared/api/endpoints/analystAuth";

function AnalystLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({ analystId: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (formError) setFormError("");
  };

  const handleAnalystLogin = async (e) => {
  e.preventDefault();
  setFormError("");

  if (!form.analystId.trim() || !form.password) {
    setFormError("Please enter your Analyst ID and password.");
    return;
  }

  setSubmitting(true);

  try {
    const analysts = await fetchAnalysts();
    
    // DEBUG: Look at the console to see the real keys
    console.log("Analyzing first record:", analysts[0]);

    const foundAnalyst = analysts.find((a) => {
      // Get the keys from your object dynamically
      // This maps whatever your keys are to local variables
      const id = a.analystId || a.AnalystID || a.analystID || a.id;
      const pass = a.password || a.Password || a.pass || a.Passcode;

      // Ensure the fields are not null/undefined before comparing
      const matchId = id?.toString().trim().toLowerCase() === form.analystId.trim().toLowerCase();
      const matchPass = pass?.toString().trim() === form.password.trim();

      return matchId && matchPass;
    });

    if (foundAnalyst) {
      localStorage.setItem("active_analyst", JSON.stringify(foundAnalyst));
      navigate("/analyst/dashboard");
    } else {
      setFormError("Invalid Analyst ID or Password.");
    }
  } catch (err) {
    console.error("Login Error:", err);
    setFormError("Unable to connect to authentication service.");
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0e1726_1px,transparent_1px),linear-gradient(to_bottom,#0e1726_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl z-10 relative">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center mb-3 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Analyst Sign In</h2>
          <p className="text-sm text-slate-400 mt-1">Sign in to access the fraud monitoring console</p>
        </div>

        <form onSubmit={handleAnalystLogin} className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-1.5">Analyst ID</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                type="text"
                name="analystId"
                value={form.analystId}
                onChange={handleChange}
                placeholder="e.g. ANALYST01"
                className="h-11 rounded-xl bg-slate-950/80 border-slate-800 text-white pl-10 focus-visible:ring-cyan-500 placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 block mb-1.5">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="h-11 rounded-xl bg-slate-950/80 border-slate-800 text-white pr-10 focus-visible:ring-cyan-500 placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {formError && (
            <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-xl flex items-start gap-2.5 text-sm text-red-400">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium h-11 rounded-xl mt-2"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="text-xs text-slate-500 text-center mt-6">
          Access is restricted to authorized fraud analysts only.
        </p>
      </div>
    </div>
  );
}

export default AnalystLogin;