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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../../../../services/auth.service";

const defaultColorScheme = "green"

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

const AccountSettings = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);
  const [colorScheme, setColorScheme] = useState(() => {
    return localStorage.getItem("colorScheme") || defaultColorScheme;
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    document.body.setAttribute("data-color-scheme", colorScheme);
  }, []);

  const handleColorSchemeChange = (scheme) => {
    setColorScheme(scheme);
    document.body.setAttribute("data-color-scheme", scheme);
  };

  const handleSaveSettings = () => {
    setIsSettingsSaved(true);

    // Show success message
    setTimeout(() => {
      setIsSettingsSaved(false);
    }, 3000);
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordMessage(null);

    if (!currentPassword || !newPassword) {
      setPasswordError("Please enter both current and new password.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
      });
      setPasswordMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message;
      setPasswordError(apiMessage || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Color scheme classes mapping
  const colorSchemeClasses = {
    blue: {
      primary: "bg-blue-600 hover:bg-blue-700",
      secondary: "text-blue-600",
      highlight: "border-blue-500",
      accent: "bg-blue-100",
    },
    green: {
      primary: "bg-blue-600 hover:bg-blue-700",
      secondary: "text-blue-600",
      highlight: "border-blue-500",
      accent: "bg-blue-100",
    },
    purple: {
      primary: "bg-blue-600 hover:bg-blue-700",
      secondary: "text-blue-600",
      highlight: "border-blue-500",
      accent: "bg-blue-100",
    },
    amber: {
      primary: "bg-amber-600 hover:bg-amber-700",
      secondary: "text-amber-600",
      highlight: "border-amber-500",
      accent: "bg-amber-100",
    },
  };

  const currentScheme = colorSchemeClasses[colorScheme];
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-50 text-gray-800 dark:text-gray-800 py-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Success Notification */}
        {isSettingsSaved && (
          <div className="fixed top-4 right-4 bg-blue-500 text-gray-900 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-fade-in-right">
            <CheckCircle size={20} />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {/* Back Button */}
        <button
          className="p-2 rounded-full bg-white dark:bg-white shadow-sm hover:bg-gray-50 dark:hover:bg-gray-100 border border-transparent dark:border-gray-200 transition-colors duration-200"
          onClick={() => {
            navigate(-1);
          }}
        >
          <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-600" />
        </button>

        {/* Page Header Gradient Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 px-8 py-8 shadow-lg">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 right-20 w-24 h-24 bg-white/5 rounded-full" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Settings className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-gray-900/80 text-sm mt-1.5">Customize your account preferences</p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="">
          {/* Main Content */}
          <div className="md:col-span-4 space-y-6">
            {/* Appearance Settings Card */}
            <div
              id="appearance"
              className="bg-white dark:bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden"
            >
              {/* Gradient Section Header for Appearance */}
              <SectionHeader
                icon={Palette}
                title="Appearance"
                gradient="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500"
              />

              <div className="p-6 space-y-6">
                {/* Color Scheme */}
                <div>
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-900">
                    <Palette size={18} className={currentScheme.secondary} />
                    Color Scheme
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      onClick={() => handleColorSchemeChange("blue")}
                      className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${
                        colorScheme === "blue"
                          ? "border-blue-500 shadow-md"
                          : "border-gray-200 dark:border-gray-200"
                      }`}
                    >
                      <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                      <span>Blue</span>
                    </button>
                    <button
                      onClick={() => handleColorSchemeChange("green")}
                      className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${
                        colorScheme === "green"
                          ? "border-blue-500 shadow-md"
                          : "border-gray-200 dark:border-gray-200"
                      }`}
                    >
                      <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                      <span>Green</span>
                    </button>
                    <button
                      onClick={() => handleColorSchemeChange("purple")}
                      className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${
                        colorScheme === "purple"
                          ? "border-blue-500 shadow-md"
                          : "border-gray-200 dark:border-gray-200"
                      }`}
                    >
                      <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                      <span>Purple</span>
                    </button>
                    <button
                      onClick={() => handleColorSchemeChange("amber")}
                      className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${
                        colorScheme === "amber"
                          ? "border-amber-500 shadow-md"
                          : "border-gray-200 dark:border-gray-200"
                      }`}
                    >
                      <div className="w-8 h-8 bg-amber-500 rounded-full"></div>
                      <span>Amber</span>
                    </button>
                  </div>
                </div>

                {/* Theme Toggle */}
                <div>
                  <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-900">
                    <Sun size={18} className={currentScheme.secondary} />
                    Theme
                  </h3>
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
                      <button
                        onClick={() =>
                          handleThemeChange(theme === "dark" ? "light" : "dark")
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          theme === "dark" ? currentScheme.primary : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            theme === "dark" ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification settings intentionally commented out as requested */}
            {/*
            <div
              id="notifications"
              className="bg-white dark:bg-white rounded-xl shadow-sm dark:shadow-lg border border-gray-100 dark:border-gray-300 p-6"
            >
              ...existing notification toggles...
            </div>
            */}

            {/* Change Password Card */}
            <div
              id="security"
              className="bg-white dark:bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden"
            >
              {/* Gradient Section Header for Security */}
              <SectionHeader
                icon={Lock}
                title="Change Password"
                gradient="bg-gradient-to-r from-blue-500 to-blue-600"
              />

              <div className="p-6 space-y-4">
                {passwordError && (
                  <div className="p-3 bg-red-50 dark:bg-red-50 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-600 rounded-lg">
                    {passwordError}
                  </div>
                )}
                {passwordMessage && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-400 rounded-lg">
                    {passwordMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full p-3 pr-12 border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-300 text-gray-900 dark:text-gray-900"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-600"
                        aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                      >
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
                        className="w-full p-3 pr-12 border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-300 text-gray-900 dark:text-gray-900"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-600"
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
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

      </div>
    </div>
  );
};

export default AccountSettings;
