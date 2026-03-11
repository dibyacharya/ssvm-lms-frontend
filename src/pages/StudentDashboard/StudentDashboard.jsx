import React, { useState } from "react";

import CreateMeeting from "../../components/dashboard/CreateMeeting";

import { Calendar, Book, CheckSquare, Video, FileText } from "lucide-react";
import { courses, assignments, events } from "../../components/data/mockData";
import { Link, useNavigate } from "react-router-dom";
import AssignmentList from "./Components/AssignmentList";
import CalendarComponent from "../../components/dashboard/AttendanceCalender";
import Dashboard2 from "./Components/StudentDashboardSemester";
import StudentDashBoardSidebar from "./Components/Sidebar";
import DashboardSemester from "./Components/StudentDashboardSemester";
import Courseware from "./Components/Courseware";
import SwayamKanbanBoard from "./Components/ToDoList";
import { useUtilityContext } from "../../context/UtilityContext";
import StudentStatsSection from "./Components/StudentStatsSection";
import StudentGradebook from "./Components/StudentGradebook";
import Timetable from "../../components/timetable/Timetable.jsx";

const LiveClassSection = () => {
  const navigate = useNavigate();
  const vconfLinks = [
    { label: "View Recordings", path: "/vconf/recordings", icon: Video, color: "blue" },
  ];

  const colorMap = {
    blue: { bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", border: "border-t-blue-500" },
    purple: { bg: "bg-purple-50 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400", border: "border-t-purple-500" },
  };

  return (
    <div>
      <CreateMeeting />
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {vconfLinks.map((item) => {
            const Icon = item.icon;
            const colors = colorMap[item.color];
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-100 dark:border-gray-700 border-t-4 ${colors.border} hover:shadow-md transition-shadow text-left`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <span className="text-base font-semibold text-gray-800 dark:text-white">{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

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
        {activeSection === "Gradebook" && <StudentGradebook />}
        {activeSection === "Timetable" && <Timetable />}
        {activeSection === "ToDo" && <SwayamKanbanBoard />}
      </div>
    </div>
  );
};

export default Dashboard;
