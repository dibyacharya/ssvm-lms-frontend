import React from "react";
import { useParams } from "react-router-dom";
import StudentProfilePage from "./ProfileSection";
import AccountSettings from "../../TeacherDashboard/Components/TeacherProfile/TeacherAccountSettings";
import HelpdeskSection from "../../HelpDesk/HelpdeskSection";

const StudentProfileSection = () => {
  const { studentID } = useParams();
  return (
    <div>
      {studentID === "myprofile" && <StudentProfilePage />}
      {studentID === "account" && <AccountSettings />}
      {studentID === "help" && <HelpdeskSection />}
    </div>
  );
};

export default StudentProfileSection;
