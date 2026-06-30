import { useLocation } from "react-router-dom";
import BottomNav from "@/user/components/BottomNav";

function PhoneFrame({ children }) {
  const location = useLocation();
  const isAnalystRoute = location.pathname.startsWith("/analyst");

  // If it's an analyst screen, bypass the phone layout completely
  if (isAnalystRoute) {
    return <div className="w-full min-h-screen">{children}</div>;
  }

  return (
    <div className="md:min-h-screen w-full md:bg-slate-100 md:flex md:items-center md:justify-center md:p-4">
      <div className="relative w-full h-screen md:w-[440px] md:h-[920px] bg-white md:bg-black md:rounded-[3.2rem] md:shadow-2xl md:p-3">
        <div className="relative w-full h-full bg-white md:rounded-[2.8rem] overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
          <BottomNav />
        </div>
      </div>
    </div>
  );
}

export default PhoneFrame;