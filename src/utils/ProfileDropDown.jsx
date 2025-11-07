import { User } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProfileDropdown = ({role}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const onDocumentClick = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  const handleNavigate = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div ref={containerRef} className="relative z-[2000]">
      {/* Profile Icon */}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open ? "true" : "false"}
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer flex items-center space-x-2 p-2 rounded-full hover:bg-primary/20 dark:hover:bg-blue-500/20"
      >
        <User />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[2000]">
          <ul className="py-2">
            <li
              onClick={() => handleNavigate(`/${role}/profile/myprofile`)}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200"
              role="menuitem"
            >
              My Profile
            </li>
            <li
              onClick={() => handleNavigate(`/${role}/profile/account`)}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200"
              role="menuitem"
            >
              Account Settings
            </li>
            <li
              onClick={() => handleNavigate(`/${role}/profile/help`)}
              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-200"
              role="menuitem"
            >
              Helpdesk
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
