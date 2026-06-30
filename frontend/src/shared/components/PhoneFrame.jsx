import BottomNav from "@/user/components/BottomNav";

function PhoneFrame({ children }) {
  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4">
      {/* Phone body */}
      <div className="relative w-[440px] h-[920px] bg-black rounded-[3.2rem] shadow-2xl p-3">
        {/* Side buttons */}
        <div className="absolute -left-[2px] top-36 w-[3px] h-20 bg-slate-800 rounded-r" />
        <div className="absolute -right-[2px] top-32 w-[3px] h-28 bg-slate-800 rounded-l" />

        {/* Screen */}
        <div className="relative w-full h-full bg-white rounded-[2.8rem] overflow-hidden flex flex-col">
          {/* Notch / camera punch hole */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-black rounded-full z-50" />

          {/* Actual app content scrolls inside here */}
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