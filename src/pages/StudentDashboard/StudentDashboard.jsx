import React from "react";
import { motion } from "framer-motion";

import CreateMeeting from "../../components/dashboard/CreateMeeting";
import StatCard from "../../components/ui/StatCard";
import GlassCard from "../../components/ui/GlassCard";

import { Video } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AssignmentList from "./Components/AssignmentList";
import CalendarComponent from "../../components/dashboard/AttendanceCalender";
import Dashboard2 from "./Components/StudentDashboardSemester";
import StudentDashBoardSidebar from "./Components/Sidebar";
import DashboardSemester from "./Components/StudentDashboardSemester";
import Courseware from "./Components/Courseware";
import { useUtilityContext } from "../../context/UtilityContext";
import Timetable from "../../components/timetable/Timetable.jsx";
import ExamList from "../Exam/student/ExamList";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const LiveClassSection = () => {
  const navigate = useNavigate();
  const vconfLinks = [
    { label: "View Recordings", path: "/vconf/recordings", icon: Video, color: "indigo" },
  ];

  return (
    <motion.div variants={staggerItem}>
      <CreateMeeting />
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {vconfLinks.map((item) => {
            const Icon = item.icon;
            return (
              <GlassCard
                key={item.path}
                hover={true}
                glow={true}
                glowColor="indigo"
                padding="p-5"
                onClick={() => navigate(item.path)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600/20 to-primary-500/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="text-base font-semibold text-gray-900">{item.label}</span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { activeSection, setActiveSection } = useUtilityContext();

  return (
    <div className="flex h-fit min-h-screen bg-gray-50 text-gray-900">
      {/* Background dot grid overlay */}
      <div className="fixed inset-0 bg-dot-grid opacity-30 pointer-events-none z-0" />

      {/* Sidebar */}
      <StudentDashBoardSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Content */}
      <motion.div
        className="max-h-screen overflow-x-auto flex-1 relative z-10"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {activeSection === "Dashboard" && (
          <motion.div variants={staggerItem}>
            <DashboardSemester setActiveSection={setActiveSection} />
          </motion.div>
        )}

        {activeSection === "Assignment" && (
          <motion.div variants={staggerItem}>
            <AssignmentList />
          </motion.div>
        )}
        {activeSection === "Courseware" && (
          <motion.div variants={staggerItem}>
            <Courseware />
          </motion.div>
        )}
        {activeSection === "Timetable" && (
          <motion.div variants={staggerItem}>
            <Timetable />
          </motion.div>
        )}
        {activeSection === "Exams" && (
          <motion.div variants={staggerItem}>
            <ExamList />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
