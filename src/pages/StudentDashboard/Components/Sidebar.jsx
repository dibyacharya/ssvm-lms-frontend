import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  FileText,
  Video,
  UserCircle,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useLiveClassAlert from "../../../hooks/useLiveClassAlert";

const StudentDashboardSidebar = ({ activeSection, setActiveSection }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { alertClass, minutesLeft, isLive, joinUrl } = useLiveClassAlert(5);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      id: "Dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "Courseware",
      label: "Courseware",
      icon: BookOpen,
    },
    {
      id: "Timetable",
      label: "Timetable",
      icon: CalendarDays,
    },
    {
      id: "Exams",
      label: "Examinations",
      icon: FileText,
    },
  ];

  const bottomLinks = [
    {
      to: "/profile",
      label: "Profile",
      icon: UserCircle,
    },
    {
      to: "/student/profile/account",
      label: "Account",
      icon: Settings,
    },
    {
      to: "/student/profile/help",
      label: "Help",
      icon: HelpCircle,
    },
  ];

  const sidebarContent = (
    <aside className="w-64 flex flex-col justify-between h-screen bg-white border-r border-gray-200 shrink-0">
      {/* Top Section */}
      <div>
        {/* Logo / Brand */}
        <div className="px-6 pt-6 pb-4">
          <span className="text-2xl font-black tracking-tight select-none">
            <span className="text-gray-900">SSVM</span>
            <span className="text-blue-500 ml-1">LMS</span>
          </span>
        </div>

        <div className="mx-4 mb-2">
          <div className="h-px bg-gray-200" />
        </div>

        {/* Main Navigation */}
        <nav className="mt-2 px-2 space-y-1">
          {menuItems.map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-600 border-l-[3px] border-blue-500"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <span className="flex items-center justify-center w-7 shrink-0">
                  <Icon
                    size={20}
                    className={isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-600"}
                  />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Live Class Alert */}
        {alertClass && joinUrl && (
          <div className="px-2 mt-3">
            <button
              onClick={() => navigate(joinUrl)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                bg-red-50 border border-red-200
                hover:bg-red-100 transition-all group"
            >
              <span className="relative flex items-center justify-center w-7 shrink-0">
                <Video size={20} className="text-red-600" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500" />
              </span>
              <span className="flex flex-col items-start">
                <span className="text-sm font-semibold text-red-600 animate-pulse">
                  {isLive ? "Live Class" : "Join Class"}
                </span>
                <span className="text-[10px] text-red-600/70 leading-tight truncate max-w-[140px]">
                  {isLive
                    ? alertClass.subject || alertClass.title || "Now"
                    : `Starts in ${minutesLeft} min`}
                </span>
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="pb-4">
        <div className="mx-4 mb-2">
          <div className="h-px bg-gray-200" />
        </div>

        {/* Bottom nav links */}
        <div className="px-2 space-y-1 mt-2">
          {bottomLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-gray-600 hover:bg-gray-50 hover:text-gray-900
                  transition-colors text-sm font-medium"
              >
                <span className="flex items-center justify-center w-7 shrink-0">
                  <Icon
                    size={20}
                    className="text-gray-400 group-hover:text-gray-600 transition-colors"
                  />
                </span>
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
              text-red-500 hover:bg-red-50
              transition-colors text-sm font-medium"
          >
            <span className="flex items-center justify-center w-7 shrink-0">
              <LogOut size={20} className="group-hover:text-red-600 transition-colors" />
            </span>
            <span>Logout</span>
          </button>
        </div>

        {/* User info - simple name + role */}
        <div className="mx-4 mt-2">
          <div className="h-px bg-gray-200" />
        </div>
        <div className="px-6 py-3">
          <p className="text-sm font-medium text-gray-700 truncate">
            {user?.name || "Student"}
          </p>
          <p className="text-xs text-gray-400 capitalize">
            {user?.role || "student"}
          </p>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block">{sidebarContent}</div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            {sidebarContent}
          </div>
        </>
      )}

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen((prev) => !prev)}
        className="fixed bottom-4 left-4 z-50 md:hidden
          w-12 h-12 rounded-full flex items-center justify-center
          bg-white border border-gray-200
          shadow-sm text-gray-600 hover:text-blue-500
          transition-colors"
      >
        {mobileOpen ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
      </button>
    </>
  );
};

export default StudentDashboardSidebar;
