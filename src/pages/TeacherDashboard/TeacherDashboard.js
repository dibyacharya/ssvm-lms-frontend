import React, { useState } from "react";
import {
  FaTachometerAlt,
  FaBook,
  FaUserCircle,
  FaSignOutAlt,
  FaCalendarAlt,
  FaFileAlt,
} from "react-icons/fa";

import TeacherCourses from "./Components/TeacherCourses";
import TeacherDashboard2 from "./Components/TeacherDashboard2/TeacherDashboard2.jsx";
import Timetable from "../../components/timetable/Timetable.jsx";
import { useAuth } from "../../context/AuthContext.js";
import { Link, useNavigate } from "react-router-dom";
import { useUtilityContext } from "../../context/UtilityContext.js";
import { HelpCircle, Settings, Video, Pin, PinOff } from "lucide-react";
import ExamDashboard from "../Exam/teacher/ExamDashboard";
import useLiveClassAlert from "../../hooks/useLiveClassAlert";

const TeacherDashboard = () => {
  const { activeSection, setActiveSection } = useUtilityContext();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { alertClass, minutesLeft, isLive, joinUrl } = useLiveClassAlert(5);

  // Sidebar collapse state - matches admin portal behavior
  const [isPinned, setIsPinned] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isPinned || isHovered;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { id: "Dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { id: "myCourses", label: "My Courses", icon: <FaBook /> },
    { id: "Timetable", label: "Timetable", icon: <FaCalendarAlt /> },
    { id: "Exams", label: "Examinations", icon: <FaFileAlt /> },
  ];

  return (
    <div className="flex h-screen bg-[#F0F4F8] overflow-hidden">
      {/* Sidebar - collapse on hover like admin */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? "w-64" : "w-[68px]"
        }`}
      >
        <div>
          {/* Header Logo + Pin */}
          <div className={`flex items-center justify-between pt-5 pb-3 ${isExpanded ? "px-5" : "px-3"}`}>
            <span className="text-xl font-black tracking-tight select-none whitespace-nowrap">
              <span className="text-gray-900">S</span>
              {isExpanded && <span className="text-gray-900">SVM</span>}
              {isExpanded && <span className="text-blue-500 ml-1">LMS</span>}
            </span>
            {isExpanded && (
              <button
                onClick={() => setIsPinned(!isPinned)}
                className="p-1 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
              >
                {isPinned ? <Pin size={14} /> : <PinOff size={14} />}
              </button>
            )}
          </div>

          <div className={`mb-2 ${isExpanded ? "mx-4" : "mx-2"}`}>
            <div className="h-px bg-gray-200" />
          </div>

          {/* Navigation */}
          <ul className="mt-2 space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  title={!isExpanded ? item.label : undefined}
                  className={`w-full flex items-center gap-3 rounded-lg transition-all text-sm font-medium ${
                    isExpanded ? "px-4 py-2.5" : "px-0 py-2.5 justify-center"
                  } ${
                    activeSection === item.id
                      ? "bg-blue-50 text-blue-600 border-l-[3px] border-blue-500"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className={`flex justify-center w-7 shrink-0 ${activeSection === item.id ? "text-blue-500" : "text-gray-400"}`}>
                    {React.cloneElement(item.icon, { size: 18 })}
                  </span>
                  {isExpanded && <span className="truncate">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>

          {/* Live Class Alert */}
          {alertClass && joinUrl && (
            <div className="px-2 mt-3">
              <button
                onClick={() => navigate(joinUrl)}
                title={!isExpanded ? "Live Class" : undefined}
                className={`w-full flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition-all group ${
                  isExpanded ? "px-4 py-2.5" : "px-0 py-2.5 justify-center"
                }`}
              >
                <span className="relative flex justify-center w-7 shrink-0">
                  <Video size={18} className="text-red-600" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                </span>
                {isExpanded && (
                  <span className="flex flex-col items-start">
                    <span className="text-sm font-semibold text-red-700 animate-pulse">
                      {isLive ? "Live Class" : "Join Class"}
                    </span>
                    <span className="text-[10px] text-red-500 leading-tight truncate max-w-[140px]">
                      {isLive
                        ? alertClass.subject || alertClass.title || "Now"
                        : `Starts in ${minutesLeft} min`}
                    </span>
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Profile and Logout */}
        <div className="mb-4 px-2">
          <div className={`mb-2 ${isExpanded ? "mx-2" : "mx-1"}`}>
            <div className="h-px bg-gray-200" />
          </div>

          <Link
            to={"/profile"}
            title={!isExpanded ? "Profile" : undefined}
            className={`w-full flex items-center gap-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors ${
              isExpanded ? "px-4 py-2" : "px-0 py-2 justify-center"
            }`}
          >
            <span className="text-gray-400 flex justify-center w-7 shrink-0"><FaUserCircle size={18} /></span>
            {isExpanded && <span>Profile</span>}
          </Link>
          <Link
            to={"/teacher/profile/account"}
            title={!isExpanded ? "Account" : undefined}
            className={`w-full flex items-center gap-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors ${
              isExpanded ? "px-4 py-2" : "px-0 py-2 justify-center"
            }`}
          >
            <span className="text-gray-400 flex justify-center w-7 shrink-0"><Settings size={18} /></span>
            {isExpanded && <span>Account</span>}
          </Link>
          <Link
            to={"/teacher/profile/help"}
            title={!isExpanded ? "Help" : undefined}
            className={`w-full flex items-center gap-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors ${
              isExpanded ? "px-4 py-2" : "px-0 py-2 justify-center"
            }`}
          >
            <span className="text-gray-400 flex justify-center w-7 shrink-0"><HelpCircle size={18} /></span>
            {isExpanded && <span>Help</span>}
          </Link>
          <button
            className={`w-full flex items-center gap-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 mt-1 transition-colors ${
              isExpanded ? "px-4 py-2" : "px-0 py-2 justify-center"
            }`}
            onClick={handleLogout}
            title={!isExpanded ? "Logout" : undefined}
          >
            <span className="flex justify-center w-7 shrink-0"><FaSignOutAlt size={18} /></span>
            {isExpanded && <span>Logout</span>}
          </button>

          {/* User info - only when expanded */}
          {isExpanded && (
            <>
              <div className="mx-2 mt-2 mb-1">
                <div className="h-px bg-gray-200" />
              </div>
              <div className="px-4 py-2">
                <p className="text-sm font-medium text-gray-700 truncate">{user?.name || "Teacher"}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role || "teacher"}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="bg-white rounded-xl shadow-sm h-full border border-gray-100">
          {activeSection === "Dashboard" && <TeacherDashboard2 />}
          {activeSection === "myCourses" && <TeacherCourses />}
          {activeSection === "Timetable" && <Timetable />}
          {activeSection === "Exams" && <ExamDashboard />}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
