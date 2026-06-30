import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="h-full w-full flex flex-col justify-end bg-white px-6 pb-10">
      <div className="mb-10 text-center">
        <h2 className="text-xl font-semibold text-slate-900">Welcome to ATO Shield</h2>
        <p className="text-sm text-slate-500 mt-2">
          Sign in to continue or create a new account to get started.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          className="bg-cyan-500 hover:bg-cyan-600 text-white h-12 rounded-xl"
          onClick={() => navigate("/login")}
        >
          Log in
        </Button>
        <Button
          variant="outline"
          className="h-12 rounded-xl border-slate-300"
          onClick={() => navigate("/signup")}
        >
          Create account
        </Button>
      </div>
    </div>
  );
}

export default Welcome;