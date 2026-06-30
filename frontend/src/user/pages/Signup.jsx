import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react";
import { sheety } from "@/shared/lib/sheetyClient";


const PATTERNS = {
  fullName: /^[a-zA-Z\s'-]{2,50}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[1-9]\d{7,14}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=]).{8,}$/,
};

function calculateAge(dobString) {
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function generateAccountId() {
  let id = "";
  for (let i = 0; i < 12; i++) {
    id += Math.floor(Math.random() * 10);
  }
  return id;
}

function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!PATTERNS.fullName.test(form.fullName.trim())) {
      newErrors.fullName = "Enter a valid full name (letters only, 2–50 characters).";
    }
    if (!PATTERNS.email.test(form.email.trim())) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!PATTERNS.phone.test(form.phone.replace(/[\s()-]/g, ""))) {
      newErrors.phone = "Enter a valid phone number, e.g. +15550001234.";
    }
    if (!form.dob) {
      newErrors.dob = "Date of birth is required.";
    } else if (calculateAge(form.dob) < 18) {
      newErrors.dob = "You must be at least 18 years old to register.";
    }
    if (!PATTERNS.password.test(form.password)) {
      newErrors.password =
        "Password must be 8+ characters with uppercase, lowercase, a number, and a symbol.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setFormError("");
  if (!validate()) return;

  setSubmitting(true);

  try {
    const existing = await sheety.getProfiles();
    const emailTaken = existing.profile.some(
      (p) => p.email.toLowerCase() === form.email.trim().toLowerCase()
    );

    if (emailTaken) {
      setSubmitting(false);
      setFormError("An account with this email already exists.");
      return;
    }

    const startingBalance = Math.floor(Math.random() * (50000 - 5000 + 1)) + 5000;
    const accountId = generateAccountId();

    const newProfile = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      dob: form.dob,
      password: form.password,
      accountId,
      balance: startingBalance,
      createdAt: new Date().toISOString(),
    };

    await sheety.createProfile(newProfile);

    localStorage.setItem("ato_user", JSON.stringify(newProfile));

    const sampleNotifications = [
      {
        id: 1,
        type: "security",
        title: "New device login detected",
        message: "Your account was accessed from a new device in Mumbai, India.",
        time: "2 hours ago",
        read: false,
      },
      {
        id: 2,
        type: "info",
        title: "Welcome to ATO Shield",
        message: "Your account has been created and is fully protected.",
        time: "Just now",
        read: false,
      },
    ];
    localStorage.setItem("ato_notifications", JSON.stringify(sampleNotifications));

    setSubmitting(false);
    navigate("/dashboard");
} catch (err) {
  console.error("Signup error:", err);
  setSubmitting(false);
  setFormError(err.message || "Something went wrong creating your account. Please try again.");
}
};

  return (
    <div className="h-full w-full flex flex-col bg-white px-6 py-8 overflow-y-auto">
      <button
        onClick={() => navigate("/welcome")}
        className="flex items-center text-slate-500 mb-6"
      >
        <ArrowLeft size={20} />
      </button>

      <h2 className="text-xl font-semibold text-slate-900 mb-1">Create your account</h2>
      <p className="text-sm text-slate-500 mb-6">
        Your information is encrypted and securely protected.
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Field
          label="Full legal name"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="John Doe"
          error={errors.fullName}
        />

        <Field
          label="Email address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          error={errors.email}
        />

        <Field
          label="Phone number"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          placeholder="+1 (555) 000-0000"
          error={errors.phone}
        />

        <Field
          label="Date of birth"
          name="dob"
          type="date"
          value={form.dob}
          onChange={handleChange}
          error={errors.dob}
        />

        <div>
          <label className="text-sm font-medium text-slate-700">Password</label>
          <div className="relative mt-1">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              className={`h-12 rounded-xl pr-10 ${
                errors.password ? "border-red-400 focus-visible:ring-red-300" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password ? (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={12} /> {errors.password}
            </p>
          ) : (
            <p className="text-xs text-slate-400 mt-1">
              Minimum 8 characters, including uppercase, lowercase, a number, and a symbol.
            </p>
          )}
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
          {submitting ? "Creating account..." : "Continue"}
        </Button>
      </form>

      <p className="text-xs text-slate-400 text-center mt-6">
        By continuing, you agree to ATO Shield's Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}

function Field({ label, name, value, onChange, error, type = "text", placeholder }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <Input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`mt-1 h-12 rounded-xl ${
          error ? "border-red-400 focus-visible:ring-red-300" : ""
        }`}
      />
      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

export default Signup;