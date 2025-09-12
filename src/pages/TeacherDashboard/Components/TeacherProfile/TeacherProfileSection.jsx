import React from "react";
import { useParams } from "react-router-dom";
import TeacherProfilePage from "./TeacherProfilePage";
import AccountSettings from "./TeacherAccountSettings";
import HelpdeskSection from "../../../HelpDesk/HelpdeskSection";

const TeacherProfileSection = () => {
  const { teacherID } = useParams();
  return (
    <div>
      {teacherID === "myprofile" && <TeacherProfilePage />}
      {teacherID === "account" && <AccountSettings />}
      {teacherID === "help" && <HelpdeskSection />}
    </div>
  );
};

export default TeacherProfileSection;
