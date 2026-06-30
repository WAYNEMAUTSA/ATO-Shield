import { Routes, Route } from "react-router-dom";
import PhoneFrame from "./shared/components/PhoneFrame";
import Splash from "./user/pages/Splash";
import Welcome from "./user/pages/Welcome";
import Login from "./user/pages/Login";
import Signup from "./user/pages/Signup";
import Dashboard from "./user/pages/Dashboard";
import Send from "./user/pages/Send";
import Receive from "./user/pages/Receive";
import Cards from "./user/pages/Cards";
import More from "./user/pages/More";
import Profile from "./user/pages/Profile";
import EditProfile from "./user/pages/EditProfile";
import Notifications from "./user/pages/Notifications";
import Activity from "@/user/pages/Activity";
import Support from "@/user/pages/Support";

function App() {
  return (
    <PhoneFrame>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />

       
       //inside routes
        <Route path="/send" element={<Send />} />
        <Route path="/receive" element={<Receive />} />
        <Route path="/cards" element={<Cards />} />
        <Route path="/more" element={<More />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/support" element={<Support />} />   
                 
      </Routes>
    </PhoneFrame>
  );
}

export default App;