import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "./logo.jpg"; // Update the path to your logo
import logoMobile from "./logo.png"; // Update the path to your logo
import { User } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className=" shadow-md  h-[80px] p-2 rounded-br-lg rounded-bl-lg relative z-20 bg-white">
      <div className="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {user && user?.role === "teacher" ? (
              <Link to="/teacher/dashboard">
                <img src={logo} alt="Logo" className="h-20 w-25" />
              </Link>
            ) : (
              <Link to="/student/dashboard">
                <img src={logo} alt="Logo" className="h-20 w-25" />
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLogout}
                  className="text-white hover:bg-red-00 px-3 py-2 rounded-md text-sm font-medium bg-red-500"
                >
                  Logout
                </button>
                {user && user?.role === "teacher" ? (
                  <Link to="/teacher/profile">
                    <User className=" p-1 h-[35px] w-[35px] text-green-500 border rounded-full border-green-500" />
                  </Link>
                ) : (
                  <Link to="/student/profile">
                    <User className=" p-1 h-[35px] w-[35px] text-green-500 border rounded-full border-green-500" />
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition duration-150 ease-in-out"
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
