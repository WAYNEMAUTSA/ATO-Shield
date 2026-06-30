import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function EditProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("ato_user");
    if (stored) setForm(JSON.parse(stored));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = (e) => {
    e.preventDefault();
    // Placeholder — will call backend PATCH /api/user/profile later
    localStorage.setItem("ato_user", JSON.stringify(form));
    navigate("/profile");
  };

  const handlePasswordChange = (e) =>
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    // Placeholder — will call backend POST /api/user/change-password later
    setPasswordSuccess("Password updated successfully.");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  if (!form) return null;

  return (
    <div className="h-full w-full flex flex-col bg-white px-6 py-8">
      <button onClick={() => navigate("/profile")} className="text-slate-500 mb-6">
        <ArrowLeft size={20} />
      </button>
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Edit profile</h2>

      <form id="profile-form" onSubmit={handleSave} className="flex flex-col gap-4">
        <Field label="Full name" name="fullName" value={form.fullName} onChange={handleChange} />
        <Field label="Email" name="email" value={form.email} onChange={handleChange} />
        <Field label="Phone number" name="phone" value={form.phone} onChange={handleChange} />
      </form>

      <div className="border-t border-slate-100 mt-8 pt-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Change password</h3>

        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
          <Field
            label="Current password"
            name="currentPassword"
            type="password"
            value={passwordForm.currentPassword}
            onChange={handlePasswordChange}
          />
          <Field
            label="New password"
            name="newPassword"
            type="password"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
          />
          <Field
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
          />

          {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
          {passwordSuccess && <p className="text-sm text-green-600">{passwordSuccess}</p>}

          <Button
            type="submit"
            variant="outline"
            className="h-12 rounded-xl mt-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50"
          >
            Update password
          </Button>
        </form>
      </div>

      <Button
        type="submit"
        form="profile-form"
        className="bg-cyan-500 hover:bg-cyan-600 text-white h-12 rounded-xl mt-8"
      >
        Save changes
      </Button>
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <Input name={name} type={type} value={value} onChange={onChange} className="mt-1 h-12 rounded-xl" />
    </div>
  );
}

export default EditProfile;