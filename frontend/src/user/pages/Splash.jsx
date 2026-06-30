import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "@/assets/logos/logo1.webp";

function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasAccount = localStorage.getItem("ato_user_exists");
      navigate(hasAccount ? "/dashboard" : "/welcome");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-white px-6">
      <motion.img
        src={logo}
        alt="ATO Shield logo"
        className="w-24 h-24 mb-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      <motion.h1
        className="text-2xl font-bold text-slate-900 tracking-tight"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        ATO Shield
      </motion.h1>
      <motion.p
        className="text-sm text-slate-500 mt-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        Securing every transaction, intelligently.
      </motion.p>

      <motion.div
        className="absolute bottom-16 w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      />
    </div>
  );
}

export default Splash;