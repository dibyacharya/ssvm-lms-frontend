import { User } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const ProfileDropdown = ({role}) => {
  const navigate = useNavigate();

  return (
    <div className="relative group">
      {/* Profile Icon */}
      <div className="cursor-pointer flex items-center space-x-2">
        <User />
      </div>

      {/* Dropdown Menu */}
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <ul className="py-2">
          <li
            onClick={() => navigate(`/${role}/profile/myprofile`)}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
          >
            My Profile
          </li>
          <li
            onClick={() => navigate(`/${role}/profile/account`)}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
          >
            Account Settings
          </li>
          <li
            onClick={() => navigate(`/${role}/profile/help`)}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
          >
            Helpdesk
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProfileDropdown;
