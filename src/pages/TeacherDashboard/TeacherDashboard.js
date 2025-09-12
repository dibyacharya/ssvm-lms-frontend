import React, { useState } from "react";
import {
  FaTachometerAlt,
  FaBook,
  FaCalendarCheck,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";

import TeacherCourses from "./Components/TeacherCourses";
import TeacherCreateMeeting from "./Components/TeacherCreateMeeting";
import TeacherDashboard2 from "./Components/TeacherDashboard2/TeacherDashboard2.jsx";
import { useAuth } from "../../context/AuthContext.js";
import { Link, useNavigate } from "react-router-dom";
import { useUtilityContext } from "../../context/UtilityContext.js";
import { HelpCircle, Settings } from "lucide-react";
import { IoMdAnalytics } from "react-icons/io";
import TeacherAnalyticsDashboard from "./TeacherAnalyticsDashboard.jsx";

const TeacherDashboard = () => {
  // const [activeSection, setActiveSection] = useState("Dashboard");
  const { activeSection, setActiveSection } = useUtilityContext();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const menuItems = [
    {
      id: "Dashboard",
      label: "Dashboard",
      icon: <FaTachometerAlt />,
    },
    {
      id: "myCourses",
      label: "My Courses",
      icon: <FaBook />,
    },
    {
      id: "Analytics",
      label: "Analytics",
      icon: <IoMdAnalytics />,
    },
    {
      id: "NewMeetings",
      label: "Create Meetings",
      icon: <FaCalendarCheck />,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          isCollapsed ? "w-20" : "w-64"
        } bg-white dark:bg-gray-800 shadow-md dark:shadow-xl transition-all duration-300 border-r border-gray-100 dark:border-gray-600 flex flex-col justify-between`}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        <div>
          {/* Header Logo */}
          <div className="mt-6 text-black dark:text-white flex items-center justify-center px-4 gap-2">
            {isCollapsed ? (
              <img
                src="/logo.png"
                alt="Company Logo"
                className={`transition-all duration-300 object-contain ${"w-[50px] h-[40px]"}`}
              />
            ) : (
              <img
                src="/logo_full.png"
                alt="Company Logo"
                className={`transition-all duration-300 object-contain ${"w-full h-[auto"}`}
              />
            )}
          </div>
          {/* Navigation */}

          <ul className="mt-6 space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-base
        ${
          activeSection === item.id
            ? "bg-accent1/10 dark:bg-accent1/20 text-accent1 dark:text-accent1/90 font-medium"
            : "text-tertiary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
                >
                  {/* Icon remains visible */}
                  <span className="text-accent1 dark:text-accent1/90 flex justify-center w-7">
                    {React.cloneElement(item.icon, { size: 22 })}
                  </span>
                  {/* Text fades in and out */}
                  <span
                    className={`whitespace-nowrap transition-opacity duration-300 ${
                      isCollapsed ? "opacity-0" : "opacity-100"
                    }`}
                    style={{ transitionDelay: isCollapsed ? "0ms" : "300ms" }}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Profile and Logout */}

        <div className="mb-6 px-2">
          <Link
            to={"/teacher/profile/myprofile"}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-base text-tertiary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-accent1 dark:text-accent1/90 flex justify-center w-7">
              <FaUserCircle size={22} />
            </span>
            <span
              className={`whitespace-nowrap transition-opacity duration-300 ${
                isCollapsed ? "opacity-0" : "opacity-100"
              }`}
              style={{ transitionDelay: isCollapsed ? "0ms" : "300ms" }}
            >
              Profile
            </span>
          </Link>
          <Link
            to={"/teacher/profile/account"}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-base text-tertiary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-accent1 dark:text-accent1/90 flex justify-center w-7">
              <Settings size={22} />
            </span>
            <span
              className={`whitespace-nowrap transition-opacity duration-300 ${
                isCollapsed ? "opacity-0" : "opacity-100"
              }`}
              style={{ transitionDelay: isCollapsed ? "0ms" : "300ms" }}
            >
              Account
            </span>
          </Link>
          <Link
            to={"/teacher/profile/help"}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-base text-tertiary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-accent1 dark:text-accent1/90 flex justify-center w-7">
              <HelpCircle size={22} />
            </span>
            <span
              className={`whitespace-nowrap transition-opacity duration-300 ${
                isCollapsed ? "opacity-0" : "opacity-100"
              }`}
              style={{ transitionDelay: isCollapsed ? "0ms" : "300ms" }}
            >
              Help
            </span>
          </Link>
          <button
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-base text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 mt-1 transition-colors"
            onClick={handleLogout}
          >
            <span className="flex justify-center w-7">
              <FaSignOutAlt size={22} />
            </span>
            <span
              className={`whitespace-nowrap transition-opacity duration-300 ${
                isCollapsed ? "opacity-0" : "opacity-100"
              }`}
              style={{ transitionDelay: isCollapsed ? "0ms" : "300ms" }}
            >
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 overflow-auto max-auto w-full">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-xl h-full border border-gray-100 dark:border-gray-600">
          {activeSection === "Dashboard" && <TeacherDashboard2 />}
          {activeSection === "myCourses" && <TeacherCourses />}
          {activeSection === "NewMeetings" && <TeacherCreateMeeting />}
          {activeSection === "Analytics" && <TeacherAnalyticsDashboard />}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;