import React from "react";
import { Navigate, useParams } from "react-router-dom";
import AccountSettings from "../../TeacherDashboard/Components/TeacherProfile/TeacherAccountSettings";
import HelpdeskSection from "../../HelpDesk/HelpdeskSection";

const StudentProfileSection = () => {
  const { studentID } = useParams();
  return (
    <div>
      {studentID === "myprofile" && <Navigate to="/profile" replace />}
      {studentID === "account" && <AccountSettings />}
      {studentID === "help" && <HelpdeskSection />}
      {!["myprofile", "account", "help"].includes(studentID || "") && (
        <Navigate to="/profile" replace />
      )}
    </div>
  );
};

export default StudentProfileSection;
