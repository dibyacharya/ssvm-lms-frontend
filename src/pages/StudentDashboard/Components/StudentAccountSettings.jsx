import React, { useEffect, useState } from "react";
import {
  Save,
  Sun,
  Palette,
  CheckCircle,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Settings,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../../../services/auth.service";
import { getMyProfile, updateMyProfile } from "../../../services/profile.service";
import { useAuth } from "../../../context/AuthContext";

const defaultColorScheme = "green";

const SectionHeader = ({ icon: Icon, title, gradient }) => (
  <div className={`relative overflow-hidden px-6 py-4 ${gradient}`}>
    <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
    <div className="absolute -bottom-4 right-12 w-12 h-12 bg-white/5 rounded-full" />
    <div className="relative z-10 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
        <Icon className="w-5 h-5 text-gray-900" />
      </div>
      <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>
    </div>
  </div>
);

const StudentAccountSettings = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // Profile edit state
  const [profileForm, setProfileForm] = useState({ name: "", mobileNo: "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileErr, setProfileErr] = useState(null);

  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [colorScheme, setColorScheme] = useState(() => localStorage.getItem("colorScheme") || defaultColorScheme);
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  // Load profile
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyProfile();
        const p = res.user || res;
        setProfileForm({ name: p.name || "", mobileNo: p.mobileNo || "" });
      } catch {
        // fallback to context
        setProfileForm({ name: user?.name || "", mobileNo: user?.mobileNo || "" });
      }
    };
    load();
  }, [user]);

  const handleProfileSave = async () => {
    setProfileErr(null);
    setProfileMsg(null);
    if (!profileForm.name.trim()) {
      setProfileErr("Name is required");
      return;
    }
    setProfileLoading(true);
    try {
      const res = await updateMyProfile({ name: profileForm.name.trim(), mobileNo: profileForm.mobileNo.trim() });
      updateUser(res.user || res);
      setProfileMsg("Profile updated successfully");
      setTimeout(() => setProfileMsg(null), 3000);
    } catch (err) {
      setProfileErr(err?.response?.data?.message || err?.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  // Theme handlers
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.body.setAttribute("data-theme", newTheme);
  };

  useEffect(() => {
    document.body.setAttribute("data-color-scheme", colorScheme);
    localStorage.setItem("colorScheme", colorScheme);
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [colorScheme, theme]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleColorSchemeChange = (scheme) => {
    setColorScheme(scheme);
    document.body.setAttribute("data-color-scheme", scheme);
  };

  // Password handler
  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordMessage(null);
    if (!currentPassword || !newPassword) {
      setPasswordError("Please enter both current and new password.");
      return;
    }
    setIsChangingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      const apiMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message;
      setPasswordError(apiMessage || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const colorSchemeClasses = {
    blue: { primary: "bg-blue-600 hover:bg-blue-700", secondary: "text-blue-600", highlight: "border-blue-500" },
    green: { primary: "bg-blue-600 hover:bg-blue-700", secondary: "text-blue-600", highlight: "border-blue-500" },
    purple: { primary: "bg-blue-600 hover:bg-blue-700", secondary: "text-blue-600", highlight: "border-blue-500" },
    amber: { primary: "bg-amber-600 hover:bg-amber-700", secondary: "text-amber-600", highlight: "border-amber-500" },
  };

  const currentScheme = colorSchemeClasses[colorScheme];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-50 text-gray-800 dark:text-gray-800 py-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {isSettingsSaved && (
          <div className="fixed top-4 right-4 bg-blue-500 text-gray-900 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
            <CheckCircle size={20} />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <button
          className="p-2 rounded-full bg-white dark:bg-white shadow-sm hover:bg-gray-50 dark:hover:bg-gray-100 border border-transparent dark:border-gray-200 transition-colors duration-200"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-600" />
        </button>

        {/* Page Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 px-8 py-8 shadow-lg">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 right-20 w-24 h-24 bg-white/5 rounded-full" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Settings className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-gray-900/80 text-sm mt-1.5">Manage your profile, appearance, and security</p>
            </div>
          </div>
        </div>

        {/* Profile Edit Card */}
        <div className="bg-white dark:bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden">
          <SectionHeader icon={User} title="Profile Information" gradient="bg-gradient-to-r from-blue-500 to-blue-700" />
          <div className="p-6 space-y-4">
            {profileErr && (
              <div className="p-3 bg-red-50 dark:bg-red-50 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-600 rounded-lg">{profileErr}</div>
            )}
            {profileMsg && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-400 rounded-lg">{profileMsg}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-300 text-gray-900 dark:text-gray-900"
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mobile Number</label>
                <input
                  type="tel"
                  value={profileForm.mobileNo}
                  onChange={(e) => setProfileForm((p) => ({ ...p, mobileNo: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-300 text-gray-900 dark:text-gray-900"
                  placeholder="Mobile number"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleProfileSave}
                disabled={profileLoading}
                className={`px-6 py-3 ${currentScheme.primary} text-gray-900 rounded-lg shadow-md flex items-center gap-2 transition-all hover:shadow-lg disabled:opacity-70`}
              >
                <Save size={18} />
                {profileLoading ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        </div>

        {/* Appearance Card */}
        <div className="bg-white dark:bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden">
          <SectionHeader icon={Palette} title="Appearance" gradient="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500" />
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-900">
                <Palette size={18} className={currentScheme.secondary} />
                Color Scheme
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["blue", "green", "purple", "amber"].map((scheme) => (
                  <button
                    key={scheme}
                    onClick={() => handleColorSchemeChange(scheme)}
                    className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${
                      colorScheme === scheme ? `border-${scheme}-500 shadow-md` : "border-gray-200 dark:border-gray-200"
                    }`}
                  >
                    <div className={`w-8 h-8 bg-${scheme}-500 rounded-full`}></div>
                    <span className="capitalize">{scheme}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-900">
                <Sun size={18} className={currentScheme.secondary} />
                Theme
              </h3>
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
                  <button
                    onClick={() => handleThemeChange(theme === "dark" ? "light" : "dark")}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      theme === "dark" ? currentScheme.primary : "bg-gray-300"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === "dark" ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white dark:bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden">
          <SectionHeader icon={Lock} title="Change Password" gradient="bg-gradient-to-r from-blue-500 to-blue-600" />
          <div className="p-6 space-y-4">
            {passwordError && (
              <div className="p-3 bg-red-50 dark:bg-red-50 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-600 rounded-lg">{passwordError}</div>
            )}
            {passwordMessage && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-400 rounded-lg">{passwordMessage}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-300 text-gray-900 dark:text-gray-900"
                    placeholder="Enter current password"
                  />
                  <button type="button" onClick={() => setShowCurrentPassword((p) => !p)} className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-600">
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-300 text-gray-900 dark:text-gray-900"
                    placeholder="Enter new password"
                  />
                  <button type="button" onClick={() => setShowNewPassword((p) => !p)} className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-600">
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className={`px-6 py-3 ${currentScheme.primary} text-gray-900 rounded-lg shadow-md flex items-center gap-2 transition-all hover:shadow-lg disabled:opacity-70`}
              >
                {isChangingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAccountSettings;
