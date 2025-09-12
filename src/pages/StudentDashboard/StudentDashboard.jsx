import React, { useState } from "react";

import CreateMeeting from "../../components/dashboard/CreateMeeting";

import { Calendar, Book, CheckSquare } from "lucide-react";
import { courses, assignments, events } from "../../components/data/mockData";
import { Link } from "react-router-dom";
import AssignmentList from "./Components/AssignmentList";
import CalendarComponent from "../../components/dashboard/AttendanceCalender";
import Dashboard2 from "./Components/StudentDashboardSemester";
import StudentDashBoardSidebar from "./Components/Sidebar";
import DashboardSemester from "./Components/StudentDashboardSemester";
import Courseware from "./Components/Courseware";
import SwayamKanbanBoard from "./Components/ToDoList";
import { useUtilityContext } from "../../context/UtilityContext";
import StudentStatsSection from "./Components/StudentStatsSection";

const Dashboard = () => {
  const { activeSection, setActiveSection } = useUtilityContext();

  return (
    <div className="flex h-fit min-h-screen dark:bg-gray-900 dark:text-white ">
      {/* Sidebar */}
      <StudentDashBoardSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Content */}
      <div className="max-h-screen && overflow-x-auto flex-1 ">
        {activeSection === "Dashboard" && (
          <DashboardSemester setActiveSection={setActiveSection} />
        )}


        {activeSection === "MyStats" && <StudentStatsSection />}
        {activeSection === "Assignment" && <AssignmentList />}
        {activeSection === "Courseware" && <Courseware />}
        {activeSection === "LiveClass" && <CreateMeeting />}
        {activeSection === "ToDo" && <SwayamKanbanBoard />}
      </div>
    </div>
  );
};

export default Dashboard;
