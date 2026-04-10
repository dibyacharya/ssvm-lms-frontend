import { useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../../../context/AuthContext";
import { BarChart2, BookOpen, CheckCircle, FileText, PenTool } from "lucide-react";
import DashboardBanner from "./DashboardBanner";
import StatCard from "../../../components/ui/StatCard";
import GlassCard from "../../../components/ui/GlassCard";

// Student data
const studentData = {
  id: 1,
  rollNumber: "2305016",
  name: "AGGARWAL SOUMIL",
  assignment1: 9,
  assignment2: 9,
  quiz1: 8,
  quiz2: 8,
  activity1: 9,
  activity2: 9,
  midSem: 18,
  endSem: 40,
};

// Class averages (dummy data)
const classAverages = {
  assignment1: 7.5,
  assignment2: 7.8,
  quiz1: 7.2,
  quiz2: 7.6,
  activity1: 8.1,
  activity2: 8.0,
  midSem: 15.5,
  endSem: 35.2,
};

// Generate attendance data (dummy data)
const generateAttendanceData = () => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
  ];
  return months.map((month) => ({
    month,
    present: Math.floor(Math.random() * 10) + 15,
    total: 25,
  }));
};
// Generate course completion data (dummy data for 2 courses over 6 months)
const generateCourseCompletionData = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  // Initial completion percentages
  let course1Completion = 0;
  let course2Completion = 0;

  return months.map((month, index) => {
    // Simulate progress with some randomness - Course 1 progresses faster
    const course1Progress = Math.min(
      100,
      course1Completion + Math.floor(10 + Math.random() * 20)
    );
    const course2Progress = Math.min(
      100,
      course2Completion + Math.floor(5 + Math.random() * 15)
    );

    course1Completion = course1Progress;
    course2Completion = course2Progress;

    return {
      month,
      "Concrete Technology": course1Completion,
      "Fundamental of Probability and Statistics": course2Completion,
    };
  });
};
// Create monthly performance data (dummy data for growth tracking)
const generateMonthlyPerformanceData = () => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
  ];
  let score = 70;

  return months.map((month) => {
    // Simulate performance growth with some fluctuations
    const change = Math.floor(Math.random() * 6) - 2;
    score = Math.min(Math.max(score + change, 65), 95);

    return {
      month,
      score,
    };
  });
};

// Calculate total marks and percentage
const calculateTotalAndPercentage = (data) => {
  const totalObtained =
    data.assignment1 +
    data.assignment2 +
    data.quiz1 +
    data.quiz2 +
    data.activity1 +
    data.activity2 +
    data.midSem +
    data.endSem;

  // Assuming maximum marks (adjust as needed)
  const maxAssignment = 10 * 2; // 10 marks per assignment, 2 assignments
  const maxQuiz = 10 * 2; // 10 marks per quiz, 2 quizzes
  const maxActivity = 10 * 2; // 10 marks per activity, 2 activities
  const maxMidSem = 20; // 20 marks for mid-semester
  const maxEndSem = 50; // 50 marks for end-semester

  const totalMax =
    maxAssignment + maxQuiz + maxActivity + maxMidSem + maxEndSem;
  const percentage = (totalObtained / totalMax) * 100;

  return {
    obtained: totalObtained,
    maximum: totalMax,
    percentage: percentage.toFixed(2),
  };
};

// Prepare comparison data for charts
const prepareComparisonData = (student, classAvg) => {
  return [
    {
      name: "Assignment 1",
      student: student.assignment1,
      classAverage: classAvg.assignment1,
      fullMark: 10,
    },
    {
      name: "Assignment 2",
      student: student.assignment2,
      classAverage: classAvg.assignment2,
      fullMark: 10,
    },
    {
      name: "Quiz 1",
      student: student.quiz1,
      classAverage: classAvg.quiz1,
      fullMark: 10,
    },
    {
      name: "Quiz 2",
      student: student.quiz2,
      classAverage: classAvg.quiz2,
      fullMark: 10,
    },
    {
      name: "Activity 1",
      student: student.activity1,
      classAverage: classAvg.activity1,
      fullMark: 10,
    },
    {
      name: "Activity 2",
      student: student.activity2,
      classAverage: classAvg.activity2,
      fullMark: 10,
    },
    {
      name: "Mid Exam",
      student: student.midSem,
      classAverage: classAvg.midSem,
      fullMark: 20,
    },
    {
      name: "End Exam",
      student: student.endSem,
      classAverage: classAvg.endSem,
      fullMark: 50,
    },
  ];
};

// Prepare data for subject-wise performance
const prepareSubjectPerformance = (student) => {
  const assignmentPercentage =
    ((student.assignment1 + student.assignment2) / 20) * 100;
  const quizPercentage = ((student.quiz1 + student.quiz2) / 20) * 100;
  const activityPercentage =
    ((student.activity1 + student.activity2) / 20) * 100;
  const midSemPercentage = (student.midSem / 20) * 100;
  const endSemPercentage = (student.endSem / 50) * 100;

  return [
    { name: "Assignments", value: assignmentPercentage, fill: "#818cf8" },
    { name: "Quizzes", value: quizPercentage, fill: "#fb923c" },
    { name: "Activities", value: activityPercentage, fill: "#34d399" },
    { name: "Mid Exam", value: midSemPercentage, fill: "#22d3ee" },
    { name: "End Exam", value: endSemPercentage, fill: "#a78bfa" },
  ];
};

// Custom tooltip for dark theme charts
const DarkTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-xl border border-gray-200 rounded-lg px-4 py-3 shadow-xl">
        <p className="text-gray-600 text-xs font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: {formatter ? formatter(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
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

// Component for the dashboard
const StudentStatsSection = () => {
  const [attendanceData] = useState(generateAttendanceData());
  const [monthlyPerformance] = useState(generateMonthlyPerformanceData());
  const totalStats = calculateTotalAndPercentage(studentData);
  const comparisonData = prepareComparisonData(studentData, classAverages);
  const subjectPerformance = prepareSubjectPerformance(studentData);
  const [courseCompletionData] = useState(generateCourseCompletionData());
  const { user } = useAuth();

  // Calculate attendance percentage
  const calculateAttendancePercentage = () => {
    const totalPresent = attendanceData.reduce(
      (sum, day) => sum + day.present,
      0
    );
    const totalClasses = attendanceData.reduce(
      (sum, day) => sum + day.total,
      0
    );
    return ((totalPresent / totalClasses) * 100).toFixed(2);
  };

  const attendancePercentage = calculateAttendancePercentage();

  return (
    <div className="min-h-screen bg-gray-50 p-4 relative">
      {/* Background dot grid */}
      <div className="fixed inset-0 bg-dot-grid opacity-30 pointer-events-none z-0" />

      <motion.div
        className="max-w-7xl mx-auto relative z-10"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {/* Header Banner */}
        <motion.div className="mb-6" variants={staggerItem}>
          <DashboardBanner
            icon={BarChart2}
            title={user.name}
            subtitle={`Roll Number: ${studentData.rollNumber}`}
            gradient="bg-gradient-to-r from-primary-600 via-blue-600 to-blue-500"
            rightContent={
              <div className="flex space-x-2">
                <div className="bg-white/[0.06] backdrop-blur-sm p-4 rounded-xl border border-gray-200 text-center">
                  <p className="text-xs text-gray-500 font-medium">Total Score</p>
                  <p className="text-xl font-bold text-gray-900 font-mono">
                    {totalStats.obtained}/{totalStats.maximum}
                  </p>
                </div>
                <div className="bg-white/[0.06] backdrop-blur-sm p-4 rounded-xl border border-gray-200 text-center">
                  <p className="text-xs text-gray-500 font-medium">Percentage</p>
                  <p className="text-xl font-bold text-primary-600 font-mono">
                    {totalStats.percentage}%
                  </p>
                </div>
                <div className="bg-white/[0.06] backdrop-blur-sm p-4 rounded-xl border border-gray-200 text-center">
                  <p className="text-xs text-gray-500 font-medium">Attendance</p>
                  <p className="text-xl font-bold text-emerald-600 font-mono">
                    {attendancePercentage}%
                  </p>
                </div>
              </div>
            }
          />
        </motion.div>

        {/* Stat Cards Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          variants={staggerItem}
        >
          <StatCard
            title="Courses Enrolled"
            value={2}
            subtitle="Active this semester"
            icon={BookOpen}
            trend="up"
            trendValue="+1 new"
            color="indigo"
            delay={0.1}
          />
          <StatCard
            title="Attendance"
            value={`${attendancePercentage}%`}
            subtitle="Overall attendance rate"
            icon={CheckCircle}
            trend={parseFloat(attendancePercentage) >= 75 ? "up" : "down"}
            trendValue={parseFloat(attendancePercentage) >= 75 ? "On track" : "Below threshold"}
            color="orange"
            delay={0.2}
          />
          <StatCard
            title="Upcoming Exams"
            value={3}
            subtitle="Next 30 days"
            icon={FileText}
            trend="up"
            trendValue="2 this week"
            color="emerald"
            delay={0.3}
          />
          <StatCard
            title="Assignments"
            value={4}
            subtitle="Pending submissions"
            icon={PenTool}
            trend="down"
            trendValue="2 due soon"
            color="cyan"
            delay={0.4}
          />
        </motion.div>

        {/* Course Completion Progress */}
        <motion.div variants={staggerItem}>
          <GlassCard hover={false} padding="p-6" delay={0.3} className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Course Completion Progress
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={courseCompletionData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip content={<DarkTooltip formatter={(v) => `${v}%`} />} />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                <Line
                  type="monotone"
                  dataKey="Concrete Technology"
                  stroke="#818cf8"
                  activeDot={{ r: 8, fill: '#818cf8', stroke: '#312e81', strokeWidth: 2 }}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="Fundamental of Probability and Statistics"
                  stroke="#34d399"
                  activeDot={{ r: 8, fill: '#34d399', stroke: '#064e3b', strokeWidth: 2 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Performance Comparison Chart */}
          <motion.div variants={staggerItem}>
            <GlassCard hover={false} padding="p-4" delay={0.4}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Performance vs. Class Average
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={comparisonData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip content={<DarkTooltip />} />
                  <Legend wrapperStyle={{ color: '#94a3b8' }} />
                  <Bar dataKey="student" name="Your Score" fill="#818cf8" radius={[4, 4, 0, 0]} />
                  <Bar
                    dataKey="classAverage"
                    name="Class Average"
                    fill="#fb923c"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>

          {/* Progress Over Time Chart */}
          <motion.div variants={staggerItem}>
            <GlassCard hover={false} padding="p-4" delay={0.5}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Growth</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={monthlyPerformance}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis domain={[60, 100]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip content={<DarkTooltip />} />
                  <Legend wrapperStyle={{ color: '#94a3b8' }} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Monthly Score"
                    stroke="#818cf8"
                    activeDot={{ r: 8, fill: '#818cf8', stroke: '#312e81', strokeWidth: 2 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>

          {/* Subject Performance Pie Chart */}
          <motion.div variants={staggerItem}>
            <GlassCard hover={false} padding="p-4" delay={0.6}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Subject-wise Performance (%)
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={subjectPerformance}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#818cf8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={1}
                  />
                  <Tooltip content={<DarkTooltip formatter={(v) => `${v.toFixed(2)}%`} />} />
                  <Legend wrapperStyle={{ color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>

          {/* Attendance Chart */}
          <motion.div variants={staggerItem}>
            <GlassCard hover={false} padding="p-4" delay={0.7}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Attendance</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={attendanceData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip content={<DarkTooltip />} />
                  <Legend wrapperStyle={{ color: '#94a3b8' }} />
                  <Area
                    type="monotone"
                    dataKey="present"
                    name="Classes Attended"
                    stroke="#818cf8"
                    fill="#818cf8"
                    fillOpacity={0.15}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Total Classes"
                    stroke="#34d399"
                    fill="#34d399"
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>
        </div>

        {/* Performance Insights Section */}
        <motion.div variants={staggerItem}>
          <GlassCard hover={false} padding="p-6" delay={0.8} className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl p-4 bg-primary-600/10 border border-primary-500/20">
                <h3 className="font-medium text-primary-600">Strongest Areas</h3>
                <ul className="mt-2 text-sm">
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-2" />{" "}
                    Activities - 90%
                  </li>
                  <li className="flex items-center mt-1 text-gray-600">
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-2" />{" "}
                    Assignments - 90%
                  </li>
                </ul>
              </div>
              <div className="rounded-xl p-4 bg-accent-500/10 border border-accent-500/20">
                <h3 className="font-medium text-accent-600">
                  Areas for Improvement
                </h3>
                <ul className="mt-2 text-sm">
                  <li className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-accent-500 rounded-full mr-2" />{" "}
                    Quizzes - 80%
                  </li>
                </ul>
              </div>
              <div className="rounded-xl p-4 bg-emerald-600/10 border border-emerald-500/20">
                <h3 className="font-medium text-emerald-600">Attendance Impact</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Higher attendance in Feb-Mar correlates with improved
                  performance during those months.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StudentStatsSection;
