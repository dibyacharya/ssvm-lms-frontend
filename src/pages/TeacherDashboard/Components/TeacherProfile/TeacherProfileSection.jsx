import React from "react";
import { Navigate, useParams } from "react-router-dom";
import AccountSettings from "./TeacherAccountSettings";
import HelpdeskSection from "../../../HelpDesk/HelpdeskSection";

const TeacherProfileSection = () => {
  const { teacherID } = useParams();
  return (
    <div>
      {teacherID === "myprofile" && <Navigate to="/profile" replace />}
      {teacherID === "account" && <AccountSettings />}
      {teacherID === "help" && <HelpdeskSection />}
      {!["myprofile", "account", "help"].includes(teacherID || "") && (
        <Navigate to="/profile" replace />
      )}
    </div>
  );
};

export default TeacherProfileSection;
