import BottomNav from "@/user/components/BottomNav";

function PhoneFrame({ children }) {
  return (
    // On mobile: no background color or padding. On desktop: center the phone frame.
    <div className="md:min-h-screen w-full md:bg-slate-100 md:flex md:items-center md:justify-center md:p-4">
      
      {/* Phone body: Full screen on mobile, absolute sizing on desktop */}
      <div className="relative w-full h-screen md:w-[440px] md:h-[920px] bg-white md:bg-black md:rounded-[3.2rem] md:shadow-2xl md:p-3">
        
        {/* Side buttons - hidden on mobile devices */}
        <div className="hidden md:block absolute -left-[2px] top-36 w-[3px] h-20 bg-slate-800 rounded-r" />
        <div className="hidden md:block absolute -right-[2px] top-32 w-[3px] h-28 bg-slate-800 rounded-l" />

        {/* Screen: Edge-to-edge on mobile, nested layout on desktop */}
        <div className="relative w-full h-full bg-white md:rounded-[2.8rem] overflow-hidden flex flex-col">
          
          {/* Camera notch - hidden on mobile (since actual phones have their own status bars) */}
          <div className="hidden md:block absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-black rounded-full z-50" />

          {/* Actual app content */}
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