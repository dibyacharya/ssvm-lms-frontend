import React from "react";
import { Navigate, useParams } from "react-router-dom";
import AccountSettings from "./TeacherAccountSettings";

const TeacherProfileSection = () => {
  const { teacherID } = useParams();
  return (
    <div>
      {teacherID === "myprofile" && <Navigate to="/profile" replace />}
      {teacherID === "account" && <AccountSettings />}
      {!["myprofile", "account"].includes(teacherID || "") && (
        <Navigate to="/profile" replace />
      )}
    </div>
  );
};

export default TeacherProfileSection;
