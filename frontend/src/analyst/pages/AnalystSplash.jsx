import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logos/logo1.webp";

function AnalystSplash() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const minDuration = 1800; // keeps the splash from flashing on fast loads

    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(100, Math.round((elapsed / minDuration) * 100)));
    }, 40);

    const redirect = setTimeout(() => {
      clearInterval(tick);
      const analyst = localStorage.getItem("active_analyst");
      navigate(analyst ? "/analyst/dashboard" : "/analyst/login", { replace: true });
    }, minDuration);

    return () => {
      clearInterval(tick);
      clearTimeout(redirect);
    };
  }, [navigate]);

  const status =
    progress < 34 ? "Loading console" : progress < 67 ? "Verifying session" : "Almost ready";

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 px-6 overflow-hidden relative">
      {/* ambient grid */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ambient glow */}
      <div className="absolute w-[60vmax] h-[60vmax] rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          <span className="absolute h-28 w-28 sm:h-32 sm:w-32 rounded-full border border-cyan-400/30 motion-safe:animate-ping" />
          <span className="absolute h-24 w-24 sm:h-28 sm:w-28 rounded-full border border-cyan-400/20" />
          <img
            src={logo}
            alt="ATO Shield"
            className="relative h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]"
          />
        </div>

        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">ATO Shield</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 tracking-wide">Analyst Console</p>
        </div>
      </div>

      <div className="absolute bottom-12 sm:bottom-16 flex flex-col items-center gap-2 w-48 sm:w-56">
        <div className="h-[3px] w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-cyan-400 rounded-full transition-[width] duration-150 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-500 tracking-wide">{status}</p>
      </div>
    </div>
  );
}

export default AnalystSplash;