import React from "react";
import {
  FaTachometerAlt,
  FaBook,
  FaCalendarCheck,
  FaChalkboardTeacher,
  FaTasks,
  FaUserGraduate,
  FaSignOutAlt,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { HelpCircle, Settings } from "lucide-react";

const StudentDashboardSidebar = ({ activeSection, setActiveSection }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const navigate = useNavigate(); // Assuming you have a navigate function from react-router-dom
  const { logout } = useAuth(); // Assuming you have a logout function in your auth context
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Menu items configuration for better organization
  const menuItems = [
    {
      id: "Dashboard",
      label: "Dashboard",
      icon: <FaTachometerAlt />,
    },
    {
      id: "Courseware",
      label: "Courseware",
      icon: <FaBook />,
    },
    {
      id: "MyStats",
      label: "My Stats",
      icon: <FaCalendarCheck />,
    },
    {
      id: "LiveClass",
      label: "Live Class",
      icon: <FaChalkboardTeacher />,
    },
    {
      id: "ToDo",
      label: "Todo Section",
      icon: <FaTasks />,
    },
  ];

  return (
    <div
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } dark:bg-gray-900 bg-white  shadow-md transition-all duration-300 border-r border-gray-100 flex flex-col justify-between h-screen`}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <div>
        {/* Header Logo */}
        <div className="mt-6 text-black flex items-center justify-center px-4 gap-2">
          {isCollapsed ? (
            <img
              src="/logo.png"
              alt="Company Logo"
              className="transition-all duration-300 object-contain w-[50px] h-[40px]"
            />
          ) : (
            <img
              src="/logo_full.png"
              alt="Company Logo"
              className="transition-all duration-300 object-contain w-full h-auto"
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
            ? "bg-accent1/10 dark:bg-accent2 text-accent1 font-medium"
            : "text-tertiary hover:bg-gray-100  dark:text-secondary dark:hover:bg-gray-400"
        }`}
              >
                <span className="text-accent1 flex justify-center w-7">
                  {React.cloneElement(item.icon, { size: 22 })}
                </span>
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
          to="/student/profile/myprofile"
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-base text-tertiary dark:text-secondary dark:hover:bg-gray-400 hover:bg-gray-100"
        >
          <span className="text-accent1 flex justify-center w-7">
            <FaUserGraduate size={22} />
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
          to={"/student/profile/account"}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-base text-tertiary dark:text-secondary hover:bg-gray-100 dark:hover:bg-gray-400"
        >
          <span className="text-accent1 flex justify-center w-7">
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
          to={"/student/profile/help"}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-base text-tertiary dark:text-secondary hover:bg-gray-100 dark:hover:bg-gray-400"
        >
          <span className="text-accent1 flex justify-center w-7">
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
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-base text-red-500 hover:bg-red-100 mt-1"
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
  );
};

export default StudentDashboardSidebar;
