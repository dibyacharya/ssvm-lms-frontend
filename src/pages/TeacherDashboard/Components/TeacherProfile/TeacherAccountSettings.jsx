import React, { useEffect, useState } from "react";
import {
  Text,
  Save,
  Bell,
  ChevronLeft,
  Sun,
  Globe,
  Palette,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const defaultColorScheme = "green"

const AccountSettings = () => {
  const [fontSize, setFontSize] = useState("text-base"); // Default font size
  const [theme, setTheme] = useState(() => {
  return localStorage.getItem("theme") || "light";
});// Default theme
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  });
  const [language, setLanguage] = useState("english");
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);
  const [colorScheme, setColorScheme] = useState(() => {
    return localStorage.getItem("colorScheme") || defaultColorScheme;
  });
  const navigate = useNavigate();

  const handleFontSizeChange = (size) => {
    setFontSize(size);
  };

 const handleThemeChange = (newTheme) => {
  setTheme(newTheme);
  document.body.setAttribute("data-theme", newTheme);
};

  const handleNotificationChange = (type) => {
    setNotifications({
      ...notifications,
      [type]: !notifications[type],
    });
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
      } py-8 ${fontSize} transition-colors duration-200`}
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

              {/* Font Size Settings */}
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Text size={20} className={currentScheme.secondary} />
                Font Size
              </h2>
              <div className="space-y-4 mb-4">
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => handleFontSizeChange("text-sm")}
                    className={`px-5 py-2 rounded-lg transition-colors duration-200 ${
                      fontSize === "text-sm"
                        ? `${currentScheme.primary} text-white`
                        : theme === "dark"
                        ? "bg-gray-700 hover:bg-gray-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  >
                    <span className="text-sm">Small</span>
                  </button>
                  <button
                    onClick={() => handleFontSizeChange("text-base")}
                    className={`px-5 py-2 rounded-lg transition-colors duration-200 ${
                      fontSize === "text-base"
                        ? `${currentScheme.primary} text-white`
                        : theme === "dark"
                        ? "bg-gray-700 hover:bg-gray-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  >
                    <span className="text-base">Medium</span>
                  </button>
                  <button
                    onClick={() => handleFontSizeChange("text-lg")}
                    className={`px-5 py-2 rounded-lg transition-colors duration-200 ${
                      fontSize === "text-lg"
                        ? `${currentScheme.primary} text-white`
                        : theme === "dark"
                        ? "bg-gray-700 hover:bg-gray-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  >
                    <span className="text-lg">Large</span>
                  </button>
                </div>
                <div className={`p-4 ${currentScheme.accent} rounded-lg`}>
                  <p className="text-gray-700">
                    <span className="font-medium">Preview:</span> This is how
                    your text will appear across the application.
                  </p>
                </div>
              </div>

              {/* Language Settings */}
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Globe size={20} className={currentScheme.secondary} />
                Language
              </h2>
              <div className="mb-6">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-opacity-50 focus:ring-blue-500 focus:border-blue-500 ${
                    theme === "dark"
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                  <option value="german">German</option>
                  <option value="chinese">Chinese</option>
                  <option value="japanese">Japanese</option>
                </select>
              </div>
            </div>

            {/* Notification Settings */}
            <div
              id="notifications"
              className={`${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              } rounded-xl shadow-lg p-6`}
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Bell size={20} className={currentScheme.secondary} />
                Notification Preferences
              </h2>
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Receive account updates via email
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange("email")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.email
                          ? currentScheme.primary
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.email
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Push Notifications</h3>
                      <p
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Receive alerts on your device
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange("push")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.push
                          ? currentScheme.primary
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.push ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">SMS Notifications</h3>
                      <p
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Receive important updates via text
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationChange("sms")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications.sms
                          ? currentScheme.primary
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notifications.sms ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end sticky bottom-4">
          <button
            onClick={handleSaveSettings}
            className={`px-6 py-3 ${currentScheme.primary} text-white rounded-lg shadow-md flex items-center gap-2 transition-all hover:shadow-lg`}
          >
            <Save size={18} />
            <span>Save All Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
