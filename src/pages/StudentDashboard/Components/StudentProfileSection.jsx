import React from "react";
import { Navigate, useParams } from "react-router-dom";
import AccountSettings from "../../TeacherDashboard/Components/TeacherProfile/TeacherAccountSettings";

const StudentProfileSection = () => {
  const { studentID } = useParams();
  return (
    <div>
      {studentID === "myprofile" && <Navigate to="/profile" replace />}
      {studentID === "account" && <AccountSettings />}
      {!["myprofile", "account"].includes(studentID || "") && (
        <Navigate to="/profile" replace />
      )}
    </div>
  );
};

export default StudentProfileSection;
