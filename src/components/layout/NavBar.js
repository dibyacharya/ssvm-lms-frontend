import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { CountBadge } from "../ui";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [notificationCount] = useState(3);

  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  // Derive page title from path
  const getPageTitle = () => {
    const path = location.pathname;
    const segments = path.split("/").filter(Boolean);
    if (segments.length === 0) return "Dashboard";
    return segments
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " "))
      .join(" / ");
  };

  const dashboardPath =
    user?.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard";

  const roleBadgeColor =
    user?.role === "teacher"
      ? "bg-blue-500/20 text-blue-600 border-blue-500/30"
      : "bg-blue-500/20 text-blue-600 border-blue-500/30";

  return (
    <nav className="glass-navbar fixed top-0 left-0 right-0 z-50 h-16"
      style={{
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(209, 213, 219, 1)",
      }}
    >
      <div className="max-w-[95%] mx-auto h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">

          {/* ── Left: Breadcrumb / Page Title ── */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to={dashboardPath}
              className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors whitespace-nowrap"
            >
              SSVM LMS
            </Link>
            <ChevronDown className="w-3 h-3 text-gray-400 -rotate-90 flex-shrink-0" />
            <span className="text-gray-900 text-sm font-semibold truncate">
              {getPageTitle()}
            </span>
          </div>

          {/* ── Right: Search, Notifications, User ── */}
          <div className="flex items-center gap-3">

            {/* Search Bar */}
            {user && (
              <div className="relative hidden sm:flex items-center">
                <motion.div
                  className="glass-input flex items-center rounded-lg overflow-hidden"
                  animate={{ width: searchFocused ? 280 : 180 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  style={{
                    background: "rgba(243, 244, 246, 0.7)",
                    border: "1px solid rgba(209, 213, 219, 1)",
                  }}
                >
                  <Search className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className="w-full bg-transparent text-gray-900 text-sm placeholder-gray-400 px-2 py-2 outline-none"
                  />
                </motion.div>
              </div>
            )}

            {/* Dark mode toggle */}
            {user && (
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                title={darkMode ? "Light mode" : "Dark mode"}
              >
                {darkMode ? (
                  <Sun className="w-4.5 h-4.5" />
                ) : (
                  <Moon className="w-4.5 h-4.5" />
                )}
              </button>
            )}

            {/* Notification Bell */}
            {user && (
              <button className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200">
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5">
                    <CountBadge count={notificationCount} />
                    <span className="absolute inset-0 rounded-full bg-blue-500/40 animate-ping" />
                  </span>
                )}
              </button>
            )}

            {/* User section */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-gray-100 transition-all duration-200"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-gray-900 text-xs font-bold ring-2 ring-gray-200">
                    {user?.name
                      ? user.name.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                  <span className="hidden md:block text-gray-700 text-sm font-medium max-w-[120px] truncate">
                    {user?.name || "User"}
                  </span>
                  <motion.div
                    animate={{ rotate: dropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </motion.div>
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="glass-dropdown absolute right-0 mt-2 w-72 rounded-xl overflow-hidden shadow-lg"
                      style={{
                        background: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)",
                        border: "1px solid rgba(209, 213, 219, 1)",
                      }}
                    >
                      {/* User info header */}
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-gray-900 text-sm font-bold ring-2 ring-gray-200">
                            {user?.name
                              ? user.name.charAt(0).toUpperCase()
                              : "U"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-gray-900 text-sm font-semibold truncate">
                              {user?.name || "User"}
                            </p>
                            <p className="text-gray-400 text-xs truncate">
                              {user?.email || ""}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${roleBadgeColor}`}
                          >
                            {user?.role
                              ? user.role.charAt(0).toUpperCase() +
                                user.role.slice(1)
                              : "User"}
                          </span>
                        </div>
                      </div>

                      {/* Links */}
                      <div className="p-1.5">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-150 text-sm"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-150 text-sm"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="p-1.5 border-t border-gray-200">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-150 text-sm"
                        >
                          <LogOut className="w-4 h-4" />
                          Log out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-500 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg shadow-blue-500/20"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
