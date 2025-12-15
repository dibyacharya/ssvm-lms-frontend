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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../../../../services/auth.service";

const defaultColorScheme = "green"

const AccountSettings = () => {
  const [theme, setTheme] = useState(() => {
  return localStorage.getItem("theme") || "light";
});// Default theme
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
  }, [colorScheme,theme]);

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
      primary: "bg-green-600 hover:bg-green-700",
      secondary: "text-green-600",
      highlight: "border-green-500",
      accent: "bg-green-100",
    },
    purple: {
      primary: "bg-purple-600 hover:bg-purple-700",
      secondary: "text-purple-600",
      highlight: "border-purple-500",
      accent: "bg-purple-100",
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
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-50 text-gray-800"
      } py-8 transition-colors duration-200`}
    >
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Success Notification */}
        {isSettingsSaved && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-fade-in-right">
            <CheckCircle size={20} />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <button
            className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            onClick={() => {
              navigate(-1);
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <p
              className={`mt-1 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Customize your account preferences
            </p>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="">
          {/* Sidebar Navigation */}

          {/* Main Content */}
          <div className="md:col-span-4 space-y-6">
            {/* Color Scheme Settings */}
            <div
              id="appearance"
              className={`${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } rounded-xl shadow-lg p-6 border-l-4 ${currentScheme.highlight}`}
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Palette size={20} className={currentScheme.secondary} />
                Color Scheme
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <button
                  onClick={() => handleColorSchemeChange("blue")}
                  className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${
                    colorScheme === "blue"
                      ? "border-blue-500 shadow-md"
                      : theme === "dark"
                      ? "border-gray-700"
                      : "border-gray-200"
                  }`}
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                  <span>Blue</span>
                </button>
                <button
                  onClick={() => handleColorSchemeChange("green")}
                  className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${
                    colorScheme === "green"
                      ? "border-green-500 shadow-md"
                      : theme === "dark"
                      ? "border-gray-700"
                      : "border-gray-200"
                  }`}
                >
                  <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                  <span>Green</span>
                </button>
                <button
                  onClick={() => handleColorSchemeChange("purple")}
                  className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${
                    colorScheme === "purple"
                      ? "border-purple-500 shadow-md"
                      : theme === "dark"
                      ? "border-gray-700"
                      : "border-gray-200"
                  }`}
                >
                  <div className="w-8 h-8 bg-purple-500 rounded-full"></div>
                  <span>Purple</span>
                </button>
                <button
                  onClick={() => handleColorSchemeChange("amber")}
                  className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${
                    colorScheme === "amber"
                      ? "border-amber-500 shadow-md"
                      : theme === "dark"
                      ? "border-gray-700"
                      : "border-gray-200"
                  }`}
                >
                  <div className="w-8 h-8 bg-amber-500 rounded-full"></div>
                  <span>Amber</span>
                </button>
              </div>

              {/* Theme Toggle */}
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sun size={20} className={currentScheme.secondary} />
                Theme
              </h2>
              <div
                className={`p-4 ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                } rounded-lg mb-6`}
              >
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

            {/* Notification settings intentionally commented out as requested */}
            {/*
            <div
              id="notifications"
              className={`${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } rounded-xl shadow-lg p-6`}
            >
              ...existing notification toggles...
            </div>
            */}

            {/* Change Password */}
            <div
              id="security"
              className={`${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } rounded-xl shadow-lg p-6 space-y-4`}
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Lock size={20} className={currentScheme.secondary} />
                Change Password
              </h2>

              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 text-sm text-red-700 rounded-lg">
                  {passwordError}
                </div>
              )}
              {passwordMessage && (
                <div className="p-3 bg-green-50 border border-green-200 text-sm text-green-700 rounded-lg">
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
                      className={`w-full p-3 pr-12 border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:ring-blue-500 focus:border-blue-500 ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300"
                      }`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
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
                      className={`w-full p-3 pr-12 border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:ring-blue-500 focus:border-blue-500 ${
                        theme === "dark"
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300"
                      }`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
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
                  className={`px-6 py-3 ${currentScheme.primary} text-white rounded-lg shadow-md flex items-center gap-2 transition-all hover:shadow-lg disabled:opacity-70`}
                >
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AccountSettings;
