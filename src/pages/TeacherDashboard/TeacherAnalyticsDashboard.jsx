import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  AlertTriangle,
  Users,
  Clock,
  BookOpen,
  Award,
  BrainCircuit,
  BarChart2,
  MessageSquare,
  TrendingUp,
  FileText,
  Download,
  Activity,
  Target,
  Lightbulb,
} from "lucide-react";

// Sample data - this would come from your backend in a real app
const engagementData = [
  { day: "Mon", activeUsers: 120, avgDuration: 45 },
  { day: "Tue", activeUsers: 132, avgDuration: 52 },
  { day: "Wed", activeUsers: 101, avgDuration: 38 },
  { day: "Thu", activeUsers: 134, avgDuration: 57 },
  { day: "Fri", activeUsers: 90, avgDuration: 35 },
  { day: "Sat", activeUsers: 30, avgDuration: 20 },
  { day: "Sun", activeUsers: 40, avgDuration: 25 },
];

const videoCompletionData = [
  { name: "Module 1", completion: 87 },
  { name: "Module 2", completion: 76 },
  { name: "Module 3", completion: 90 },
  { name: "Module 4", completion: 65 },
  { name: "Module 5", completion: 45 },
];

const resourceDownloadsData = [
  { name: "Lecture Slides", downloads: 215 },
  { name: "Assignment Brief", downloads: 187 },
  { name: "Study Guide", downloads: 125 },
  { name: "Additional Reading", downloads: 78 },
  { name: "Practice Test", downloads: 156 },
];

const forumActivityData = [
  { week: "Week 1", posts: 25, replies: 45 },
  { week: "Week 2", posts: 32, replies: 58 },
  { week: "Week 3", posts: 28, replies: 62 },
  { week: "Week 4", posts: 45, replies: 95 },
  { week: "Week 5", posts: 38, replies: 77 },
];

const gradeDistributionData = [
  { name: "A", students: 42, fill: "#4CAF50" },
  { name: "B", students: 63, fill: "#8BC34A" },
  { name: "C", students: 48, fill: "#FFEB3B" },
  { name: "D", students: 27, fill: "#FF9800" },
  { name: "F", students: 15, fill: "#f5837a" },
];

const assignmentSubmissionData = [
  { assignment: "Assignment 1", onTime: 145, late: 37, missing: 18 },
  { assignment: "Assignment 2", onTime: 138, late: 42, missing: 20 },
  { assignment: "Assignment 3", onTime: 156, late: 25, missing: 19 },
  { assignment: "Assignment 4", onTime: 132, late: 45, missing: 23 },
];

const quizPerformanceData = [
  { question: "Q1", correct: 75, incorrect: 25 },
  { question: "Q2", correct: 65, incorrect: 35 },
  { question: "Q3", correct: 80, incorrect: 20 },
  { question: "Q4", correct: 60, incorrect: 40 },
  { question: "Q5", correct: 70, incorrect: 30 },
  { question: "Q6", correct: 55, incorrect: 45 },
  { question: "Q7", correct: 85, incorrect: 15 },
  { question: "Q8", correct: 45, incorrect: 55 },
];

const atRiskStudentsData = [
  {
    id: 1,
    name: "Alex Johnson",
    risk: "High",
    lastLogin: "15 days ago",
    completedAssignments: "2/5",
    avgGrade: "D",
  },
  {
    id: 2,
    name: "Sam Williams",
    risk: "High",
    lastLogin: "8 days ago",
    completedAssignments: "3/5",
    avgGrade: "D",
  },
  {
    id: 3,
    name: "Jamie Smith",
    risk: "Medium",
    lastLogin: "4 days ago",
    completedAssignments: "3/5",
    avgGrade: "C",
  },
  {
    id: 4,
    name: "Taylor Brown",
    risk: "Medium",
    lastLogin: "3 days ago",
    completedAssignments: "4/5",
    avgGrade: "C",
  },
  {
    id: 5,
    name: "Casey Davis",
    risk: "High",
    lastLogin: "12 days ago",
    completedAssignments: "1/5",
    avgGrade: "F",
  },
];

const studentRadarData = [
  { subject: "Engagement", fullMark: 100, average: 65, topStudent: 95 },
  { subject: "Quiz Scores", fullMark: 100, average: 70, topStudent: 98 },
  { subject: "Assignment", fullMark: 100, average: 75, topStudent: 92 },
  { subject: "Forum Activity", fullMark: 100, average: 60, topStudent: 85 },
  { subject: "Resource Usage", fullMark: 100, average: 55, topStudent: 90 },
];

const predictionData = [
  { week: "Week 1", predicted: 95, actual: 98 },
  { week: "Week 2", predicted: 90, actual: 92 },
  { week: "Week 3", predicted: 87, actual: 88 },
  { week: "Week 4", predicted: 82, actual: 85 },
  { week: "Week 5", predicted: 80, actual: 78 },
  { week: "Week 6", predicted: 78, actual: null },
  { week: "Week 7", predicted: 75, actual: null },
  { week: "Week 8", predicted: 73, actual: null },
];

// Added: Student-specific data for 3 sample students
const studentSpecificData = {
  "Emma Wilson": {
    engagement: [
      { day: "Mon", activeUsers: 1, avgDuration: 55 },
      { day: "Tue", activeUsers: 1, avgDuration: 62 },
      { day: "Wed", activeUsers: 1, avgDuration: 48 },
      { day: "Thu", activeUsers: 1, avgDuration: 67 },
      { day: "Fri", activeUsers: 1, avgDuration: 45 },
      { day: "Sat", activeUsers: 0, avgDuration: 0 },
      { day: "Sun", activeUsers: 1, avgDuration: 35 },
    ],
    grades: [
      { assignment: "Assignment 1", grade: 92 },
      { assignment: "Assignment 2", grade: 88 },
      { assignment: "Assignment 3", grade: 95 },
      { assignment: "Assignment 4", grade: 90 },
    ],
    quizPerformance: [
      { question: "Q1", correct: 1, incorrect: 0 },
      { question: "Q2", correct: 1, incorrect: 0 },
      { question: "Q3", correct: 1, incorrect: 0 },
      { question: "Q4", correct: 0, incorrect: 1 },
      { question: "Q5", correct: 1, incorrect: 0 },
      { question: "Q6", correct: 1, incorrect: 0 },
      { question: "Q7", correct: 1, incorrect: 0 },
      { question: "Q8", correct: 1, incorrect: 0 },
    ],
    radar: [
      { subject: "Engagement", fullMark: 100, value: 95 },
      { subject: "Quiz Scores", fullMark: 100, value: 87 },
      { subject: "Assignment", fullMark: 100, value: 91 },
      { subject: "Forum Activity", fullMark: 100, value: 75 },
      { subject: "Resource Usage", fullMark: 100, value: 85 },
    ],
  },
  "Michael Chen": {
    engagement: [
      { day: "Mon", activeUsers: 1, avgDuration: 35 },
      { day: "Tue", activeUsers: 1, avgDuration: 42 },
      { day: "Wed", activeUsers: 0, avgDuration: 0 },
      { day: "Thu", activeUsers: 1, avgDuration: 47 },
      { day: "Fri", activeUsers: 1, avgDuration: 30 },
      { day: "Sat", activeUsers: 1, avgDuration: 25 },
      { day: "Sun", activeUsers: 1, avgDuration: 20 },
    ],
    grades: [
      { assignment: "Assignment 1", grade: 78 },
      { assignment: "Assignment 2", grade: 82 },
      { assignment: "Assignment 3", grade: 75 },
      { assignment: "Assignment 4", grade: 80 },
    ],
    quizPerformance: [
      { question: "Q1", correct: 1, incorrect: 0 },
      { question: "Q2", correct: 0, incorrect: 1 },
      { question: "Q3", correct: 1, incorrect: 0 },
      { question: "Q4", correct: 0, incorrect: 1 },
      { question: "Q5", correct: 1, incorrect: 0 },
      { question: "Q6", correct: 0, incorrect: 1 },
      { question: "Q7", correct: 1, incorrect: 0 },
      { question: "Q8", correct: 0, incorrect: 1 },
    ],
    radar: [
      { subject: "Engagement", fullMark: 100, value: 72 },
      { subject: "Quiz Scores", fullMark: 100, value: 65 },
      { subject: "Assignment", fullMark: 100, value: 79 },
      { subject: "Forum Activity", fullMark: 100, value: 55 },
      { subject: "Resource Usage", fullMark: 100, value: 60 },
    ],
  },
  "Sophia Rodriguez": {
    engagement: [
      { day: "Mon", activeUsers: 1, avgDuration: 25 },
      { day: "Tue", activeUsers: 0, avgDuration: 0 },
      { day: "Wed", activeUsers: 1, avgDuration: 18 },
      { day: "Thu", activeUsers: 0, avgDuration: 0 },
      { day: "Fri", activeUsers: 1, avgDuration: 15 },
      { day: "Sat", activeUsers: 0, avgDuration: 0 },
      { day: "Sun", activeUsers: 0, avgDuration: 0 },
    ],
    grades: [
      { assignment: "Assignment 1", grade: 65 },
      { assignment: "Assignment 2", grade: 55 },
      { assignment: "Assignment 3", grade: 70 },
      { assignment: "Assignment 4", grade: 60 },
    ],
    quizPerformance: [
      { question: "Q1", correct: 0, incorrect: 1 },
      { question: "Q2", correct: 1, incorrect: 0 },
      { question: "Q3", correct: 0, incorrect: 1 },
      { question: "Q4", correct: 1, incorrect: 0 },
      { question: "Q5", correct: 0, incorrect: 1 },
      { question: "Q6", correct: 0, incorrect: 1 },
      { question: "Q7", correct: 1, incorrect: 0 },
      { question: "Q8", correct: 0, incorrect: 1 },
    ],
    radar: [
      { subject: "Engagement", fullMark: 100, value: 45 },
      { subject: "Quiz Scores", fullMark: 100, value: 38 },
      { subject: "Assignment", fullMark: 100, value: 62 },
      { subject: "Forum Activity", fullMark: 100, value: 30 },
      { subject: "Resource Usage", fullMark: 100, value: 25 },
    ],
  },
};

// Section Header component matching TeacherHome style
const SectionHeader = ({ icon: Icon, title, gradient }) => (
  <div className={`relative overflow-hidden px-6 py-4 ${gradient}`}>
    <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
    <div className="absolute -bottom-4 right-12 w-12 h-12 bg-white/5 rounded-full" />
    <div className="relative z-10 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
        <Icon className="w-5 h-5 text-gray-900" />
      </div>
      <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>
    </div>
  </div>
);

// Dashboard Component
const TeacherAnalyticsDashboard = () => {
  const [activeSection, setActiveSection] = useState("engagement");
  // Added: State for selected student
  const [selectedStudent, setSelectedStudent] = useState("class_average");

  // Get data based on selected student or default to class data
  const getEngagementData = () => {
    if (selectedStudent === "class_average") {
      return engagementData;
    }
    return studentSpecificData[selectedStudent]?.engagement || engagementData;
  };

  const getQuizPerformanceData = () => {
    if (selectedStudent === "class_average") {
      return quizPerformanceData;
    }
    return (
      studentSpecificData[selectedStudent]?.quizPerformance ||
      quizPerformanceData
    );
  };

  const getRadarData = () => {
    if (selectedStudent === "class_average") {
      return studentRadarData;
    }
    // For a specific student, map their radar data to the format needed
    return (
      studentSpecificData[selectedStudent]?.radar.map((item) => ({
        ...item,
        average: item.value,
        topStudent:
          studentRadarData.find((d) => d.subject === item.subject)
            ?.topStudent || 95,
      })) || studentRadarData
    );
  };

  // Get assignment grades for specific students
  const getStudentGrades = () => {
    if (selectedStudent === "class_average") {
      return assignmentSubmissionData;
    }

    // For student-specific view, transform their grades to show comparison
    const studentGrades = studentSpecificData[selectedStudent]?.grades || [];
    return studentGrades.map((item) => ({
      assignment: item.assignment,
      grade: item.grade,
      classAverage: 78, // Dummy average value
    }));
  };

  const tabs = [
    { key: "engagement", label: "Learner Engagement", icon: Users },
    { key: "performance", label: "Performance & Grades", icon: Award },
    { key: "predictive", label: "Predictive Insights", icon: BrainCircuit },
  ];

  return (
    <div className="max-w-[1600px] pt-12 relative -top-6 mx-auto space-y-8 p-6 bg-gray-50 dark:bg-gray-50 min-h-screen">
      {/* Header Section - Gradient Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 px-8 py-8 shadow-lg">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 right-20 w-24 h-24 bg-white/5 rounded-full" />
        <div className="absolute top-4 left-[40%] w-16 h-16 bg-white/5 rounded-full" />
        <div className="absolute -bottom-6 left-[20%] w-20 h-20 bg-white/5 rounded-full" />

        <div className="relative z-10 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <BarChart2 className="w-7 h-7 text-gray-900" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Course Analytics Dashboard
            </h1>
            <p className="text-gray-900/80 text-sm font-medium mt-1.5">
              Data-driven insights to improve teaching and learning outcomes
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Pill style */}
      <div className="flex gap-2 bg-white dark:bg-white rounded-2xl shadow-sm border border-tertiary/10 dark:border-gray-200 p-2">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              className={`flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeSection === tab.key
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-gray-900 shadow-md"
                  : "text-tertiary dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-100"
              }`}
              onClick={() => setActiveSection(tab.key)}
            >
              <TabIcon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Student selection banner - visible when a student is selected */}
      {selectedStudent !== "class_average" && (
        <div className="bg-white dark:bg-white rounded-2xl shadow-sm border border-tertiary/10 dark:border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/20 p-5 flex justify-between items-center border-l-4 border-l-blue-500">
            <div>
              <h2 className="text-xl font-bold text-primary dark:text-gray-900">
                Viewing data for: {selectedStudent}
              </h2>
              <p className="text-tertiary dark:text-gray-400 text-sm mt-0.5">
                Showing individual performance metrics and comparison with class
                average
              </p>
            </div>
            <button
              onClick={() => setSelectedStudent("class_average")}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-gray-900 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all"
            >
              Back to Class View
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      <div className="space-y-8">
        {/* Engagement Section */}
        {activeSection === "engagement" && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Daily Active Users */}
              <div className="bg-white dark:bg-white rounded-xl shadow-sm p-6 border border-tertiary/10 dark:border-gray-200 border-t-4 border-t-blue-500 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-tertiary dark:text-gray-400 text-sm">Daily Active Users</p>
                    <h3 className="text-3xl font-bold text-primary dark:text-gray-900 mt-1">134</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-tertiary dark:text-gray-400">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">+12%</span>
                  <span className="mx-1">from last week</span>
                </div>
              </div>

              {/* Avg Session Time */}
              <div className="bg-white dark:bg-white rounded-xl shadow-sm p-6 border border-tertiary/10 dark:border-gray-200 border-t-4 border-t-blue-500 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-tertiary dark:text-gray-400 text-sm">Avg. Session Time</p>
                    <h3 className="text-3xl font-bold text-primary dark:text-gray-900 mt-1">45 min</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-tertiary dark:text-gray-400">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">+5 min</span>
                  <span className="mx-1">from last week</span>
                </div>
              </div>

              {/* Content Completion */}
              <div className="bg-white dark:bg-white rounded-xl shadow-sm p-6 border border-tertiary/10 dark:border-gray-200 border-t-4 border-t-blue-500 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-tertiary dark:text-gray-400 text-sm">Content Completion</p>
                    <h3 className="text-3xl font-bold text-primary dark:text-gray-900 mt-1">72%</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-tertiary dark:text-gray-400">
                  <span className="text-amber-500 dark:text-amber-600 font-medium">-3%</span>
                  <span className="mx-1">from last week</span>
                </div>
              </div>

              {/* Forum Engagement */}
              <div className="bg-white dark:bg-white rounded-xl shadow-sm p-6 border border-tertiary/10 dark:border-gray-200 border-t-4 border-t-amber-500 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-tertiary dark:text-gray-400 text-sm">Forum Engagement</p>
                    <h3 className="text-3xl font-bold text-primary dark:text-gray-900 mt-1">183</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-50 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-amber-600 dark:text-amber-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-tertiary dark:text-gray-400">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">+23%</span>
                  <span className="mx-1">from last week</span>
                </div>
              </div>
            </div>

            {/* Weekly Active Users Chart */}
            <div className="bg-white dark:bg-white rounded-2xl shadow-sm border border-tertiary/10 dark:border-gray-200 overflow-hidden">
              <SectionHeader
                icon={Activity}
                title={
                  selectedStudent === "class_average"
                    ? "Weekly User Activity"
                    : `Weekly Activity - ${selectedStudent}`
                }
                gradient="bg-gradient-to-r from-blue-500 to-blue-700"
              />
              <div className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getEngagementData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="activeUsers"
                      name={
                        selectedStudent === "class_average"
                          ? "Active Users"
                          : "Login Status (1=Active)"
                      }
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="avgDuration"
                      name="Avg. Duration (min)"
                      stroke="#82ca9d"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Content Engagement Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Video Completion Rates */}
              <div className="bg-white dark:bg-white rounded-2xl shadow-sm border border-tertiary/10 dark:border-gray-200 overflow-hidden">
                <SectionHeader
                  icon={BookOpen}
                  title="Video Completion Rates"
                  gradient="bg-gradient-to-r from-blue-500 to-blue-600"
                />
                <div className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={videoCompletionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="completion"
                        name="Completion Rate (%)"
                        fill="#8884d8"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Resource Downloads */}
              <div className="bg-white dark:bg-white rounded-2xl shadow-sm border border-tertiary/10 dark:border-gray-200 overflow-hidden">
                <SectionHeader
                  icon={Download}
                  title="Resource Downloads"
                  gradient="bg-gradient-to-r from-blue-500 to-blue-600"
                />
                <div className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={resourceDownloadsData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="downloads" name="Downloads" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Forum Activity */}
            <div className="bg-white dark:bg-white rounded-2xl shadow-sm border border-tertiary/10 dark:border-gray-200 overflow-hidden">
              <SectionHeader
                icon={MessageSquare}
                title="Forum Activity Trends"
                gradient="bg-gradient-to-r from-rose-500 to-pink-600"
              />
              <div className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={forumActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="posts"
                      name="Posts"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                    />
                    <Area
                      type="monotone"
                      dataKey="replies"
                      name="Replies"
                      stackId="1"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Performance Section */}
        {activeSection === "performance" && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-white rounded-xl shadow-sm p-6 border border-tertiary/10 dark:border-gray-200 border-t-4 border-t-amber-500 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-tertiary dark:text-gray-400 text-sm">
                      {selectedStudent === "class_average"
                        ? "Class Average"
                        : "Student Average"}
                    </p>
                    <h3 className="text-3xl font-bold text-primary dark:text-gray-900 mt-1">
                      {selectedStudent === "class_average"
                        ? "78%"
                        : selectedStudent === "Emma Wilson"
                        ? "91%"
                        : selectedStudent === "Michael Chen"
                        ? "79%"
                        : "63%"}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-50 flex items-center justify-center">
                    <Award className="w-6 h-6 text-amber-600 dark:text-amber-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-tertiary dark:text-gray-400">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">+2%</span>
                  <span className="mx-1">from last assessment</span>
                </div>
              </div>

              <div className="bg-white dark:bg-white rounded-xl shadow-sm p-6 border border-tertiary/10 dark:border-gray-200 border-t-4 border-t-blue-500 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-tertiary dark:text-gray-400 text-sm">Pass Rate</p>
                    <h3 className="text-3xl font-bold text-primary dark:text-gray-900 mt-1">
                      {selectedStudent === "class_average"
                        ? "91%"
                        : selectedStudent === "Emma Wilson"
                        ? "100%"
                        : selectedStudent === "Michael Chen"
                        ? "100%"
                        : "75%"}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-tertiary dark:text-gray-400">
                  <span className="text-amber-500 dark:text-amber-600 font-medium">-1%</span>
                  <span className="mx-1">from last assessment</span>
                </div>
              </div>

              <div className="bg-white dark:bg-white rounded-xl shadow-sm p-6 border border-tertiary/10 dark:border-gray-200 border-t-4 border-t-blue-500 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-tertiary dark:text-gray-400 text-sm">Assignment Completion</p>
                    <h3 className="text-3xl font-bold text-primary dark:text-gray-900 mt-1">
                      {selectedStudent === "class_average"
                        ? "85%"
                        : selectedStudent === "Emma Wilson"
                        ? "100%"
                        : selectedStudent === "Michael Chen"
                        ? "100%"
                        : "60%"}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-tertiary dark:text-gray-400">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">+5%</span>
                  <span className="mx-1">from last week</span>
                </div>
              </div>
            </div>

            {/* Grade Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-white rounded-2xl shadow-sm border border-tertiary/10 dark:border-gray-200 overflow-hidden">
                <SectionHeader
                  icon={BarChart2}
                  title={
                    selectedStudent === "class_average"
                      ? "Grade Distribution"
                      : `${selectedStudent}'s Grades`
                  }
                  gradient="bg-gradient-to-r from-blue-500 to-blue-600"
                />
                <div className="p-6">
                  {selectedStudent === "class_average" ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={gradeDistributionData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="students"
                          nameKey="name"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {gradeDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value} students`, "Count"]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getStudentGrades()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="assignment" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="grade"
                          name="Student Grade"
                          fill="#8884d8"
                        />
                        <Bar
                          dataKey="classAverage"
                          name="Class Average"
                          fill="#82ca9d"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Assignment Submission Trends */}
              <div className="bg-white dark:bg-white rounded-2xl shadow-sm border border-tertiary/10 dark:border-gray-200 overflow-hidden">
                <SectionHeader
                  icon={FileText}
                  title="Assignment Submissions"
                  gradient="bg-gradient-to-r from-amber-500 to-blue-500"
                />
                <div className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={assignmentSubmissionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="assignment" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="onTime"
                        name="On Time"
                        stackId="a"
                        fill="#9bf296"
                      />
                      <Bar
                        dataKey="late"
                        name="Late"
                        stackId="a"
                        fill="#fab784"
                      />
                      <Bar
                        dataKey="missing"
                        name="Missing"
                        stackId="a"
                        fill="#f5837a"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Quiz Performance */}
            <div className="bg-white dark:bg-white rounded-2xl shadow-sm border border-tertiary/10 dark:border-gray-200 overflow-hidden">
              <SectionHeader
                icon={Award}
                title={
                  selectedStudent === "class_average"
                    ? "Quiz Question Performance"
                    : `${selectedStudent}'s Quiz Performance`
                }
                gradient="bg-gradient-to-r from-rose-500 to-pink-600"
              />
              <div className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getQuizPerformanceData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="question" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="correct"
                      name="Correct"
                      stackId="a"
                      fill="#9bf296"
                    />
                    <Bar
                      dataKey="incorrect"
                      name="Incorrect"
                      stackId="a"
                      fill="#f5837a"
                    />
                  </BarChart>
                </ResponsiveContainer>
                {selectedStudent === "class_average" && (
                  <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700">
                    <h3 className="font-semibold flex items-center text-yellow-800 dark:text-yellow-300">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Question Analysis
                    </h3>
                    <p className="text-yellow-800 dark:text-yellow-200 mt-1 text-sm">
                      Question 8 appears to be particularly challenging with a 45%
                      success rate. Consider revisiting this content or providing
                      additional support materials.
                    </p>
                  </div>
                )}
                {selectedStudent !== "class_average" && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                    <h3 className="font-semibold flex items-center text-blue-800 dark:text-blue-300">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Individual Performance
                    </h3>
                    <p className="text-blue-800 dark:text-blue-200 mt-1 text-sm">
                      {selectedStudent === "Emma Wilson"
                        ? "Excellent performance overall. Only missed question 4."
                        : selectedStudent === "Michael Chen"
                        ? "Good performance with areas for improvement on questions 2, 4, 6, and 8."
                        : "Struggling with multiple questions. Consider scheduling a tutoring session."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Predictive Section */}
        {activeSection === "predictive" && (
          <>
            {/* At-Risk Students */}
            {/* <div className="bg-white dark:bg-white rounded-2xl shadow-sm border border-tertiary/10 dark:border-gray-200 overflow-hidden">
              <SectionHeader
                icon={AlertTriangle}
                title="Students at Risk"
                gradient="bg-gradient-to-r from-red-500 to-rose-600"
              />
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    <thead className="bg-gray-50 dark:bg-white">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Risk Level
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Completed Assignments
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Avg Grade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                      {atRiskStudentsData.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                          <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-900">
                            {student.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                student.risk === "High"
                                  ? "bg-red-100 dark:bg-red-50 text-red-800 dark:text-red-600"
                                  : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                              }`}
                            >
                              {student.risk}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-600">
                            {student.lastLogin}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-600">
                            {student.completedAssignments}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-600">
                            {student.avgGrade}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-primary/80 hover:text-primary mr-3">
                              Message
                            </button>
                            <button
                              className="text-primary/80 hover:text-primary"
                              onClick={() => setSelectedStudent(student.name)}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700">
                  <h3 className="font-semibold flex items-center text-red-800 dark:text-red-600">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    High Risk Alert
                  </h3>
                  <p className="text-red-800 dark:text-red-200 mt-1 text-sm">
                    3 students haven't logged in for over a week and are at high
                    risk of falling behind. Consider sending a group reminder or
                    scheduling individual check-ins.
                  </p>
                </div>
              </div>
            </div> */}

            {/* Comparative Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-white rounded-2xl shadow-sm border border-tertiary/10 dark:border-gray-200 overflow-hidden">
                <SectionHeader
                  icon={Target}
                  title={
                    selectedStudent === "class_average"
                      ? "Student Performance Analysis"
                      : `${selectedStudent}'s Performance Analysis`
                  }
                  gradient="bg-gradient-to-r from-blue-500 to-blue-600"
                />
                <div className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart outerRadius={90} data={getRadarData()}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name={
                          selectedStudent === "class_average"
                            ? "Class Average"
                            : selectedStudent
                        }
                        dataKey="average"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                      <Radar
                        name="Top Performing Student"
                        dataKey="topStudent"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        fillOpacity={0.6}
                      />
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Completion Forecast */}
              <div className="bg-white dark:bg-white rounded-2xl shadow-sm border border-tertiary/10 dark:border-gray-200 overflow-hidden">
                <SectionHeader
                  icon={TrendingUp}
                  title="Course Completion Forecast"
                  gradient="bg-gradient-to-r from-blue-500 to-blue-700"
                />
                <div className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={predictionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        name="Actual Completion %"
                        stroke="#8884d8"
                      />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        name="Predicted Completion %"
                        stroke="#82ca9d"
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                      Forecast Insight
                    </h3>
                    <p className="text-blue-800 dark:text-blue-200 mt-1 text-sm">
                      Based on current trends, we predict a 73% overall completion
                      rate by the end of the course. This is 5% lower than the
                      previous cohort.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actionable Recommendations */}
            <div className="bg-white dark:bg-white rounded-2xl shadow-sm border border-tertiary/10 dark:border-gray-200 overflow-hidden">
              <SectionHeader
                icon={Lightbulb}
                title={
                  selectedStudent === "class_average"
                    ? "AI-Generated Recommendations"
                    : `Personalized Recommendations for ${selectedStudent}`
                }
                gradient="bg-gradient-to-r from-amber-500 to-blue-500"
              />
              <div className="p-6 space-y-4">
                {selectedStudent === "class_average" ? (
                  <>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                      <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                        Engagement Opportunity
                      </h3>
                      <p className="text-blue-800 dark:text-blue-200 mt-1 text-sm">
                        Video completion rates drop significantly after Module
                        3. Consider adding interactive elements or breaking
                        content into smaller segments.
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                      <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                        Assignment Insight
                      </h3>
                      <p className="text-blue-800 dark:text-blue-200 mt-1 text-sm">
                        Assignment 4 has the highest late submission rate.
                        Consider extending the deadline or providing clearer
                        instructions.
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                      <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                        Content Improvement
                      </h3>
                      <p className="text-blue-800 dark:text-blue-200 mt-1 text-sm">
                        The "Study Guide" resource has fewer downloads than
                        other materials. Consider promoting this resource or
                        updating its content to better serve student needs.
                      </p>
                    </div>
                  </>
                ) : (
                  // Student-specific recommendations
                  <>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                      <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                        Personalized Feedback
                      </h3>
                      <p className="text-blue-800 dark:text-blue-200 mt-1 text-sm">
                        {selectedStudent === "Emma Wilson"
                          ? "Emma is performing exceptionally well. Consider providing more challenging content to maintain engagement."
                          : selectedStudent === "Michael Chen"
                          ? "Michael is performing above average but struggles with quiz questions 2, 4, 6, and 8. Consider providing targeted support in these areas."
                          : "Sophia is struggling with engagement and quiz performance. Schedule a one-on-one meeting to discuss challenges and create a support plan."}
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                      <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                        Learning Style Insight
                      </h3>
                      <p className="text-blue-800 dark:text-blue-200 mt-1 text-sm">
                        {selectedStudent === "Emma Wilson"
                          ? "Emma engages consistently with all content types. Her learning style indicates a preference for video content."
                          : selectedStudent === "Michael Chen"
                          ? "Michael engages more on weekends. Consider providing flexible deadlines to accommodate his schedule."
                          : "Sophia's engagement pattern shows inconsistent access. Consider providing downloadable resources she can access offline."}
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                      <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                        Next Steps
                      </h3>
                      <p className="text-blue-800 dark:text-blue-200 mt-1 text-sm">
                        {selectedStudent === "Emma Wilson"
                          ? "Provide Emma with advanced learning materials and consider having her mentor other students."
                          : selectedStudent === "Michael Chen"
                          ? "Check in with Michael about questions 2, 4, 6, and 8 on the quiz. Provide supplementary materials for these topics."
                          : "Set up a meeting with Sophia to understand barriers to engagement and create a personalized study plan."}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Export/Filter Controls */}
      <div className="flex justify-between items-center bg-white dark:bg-white p-4 rounded-2xl shadow-sm border border-tertiary/10 dark:border-gray-200">
        <div className="flex flex-wrap gap-3">
          <select className="border border-tertiary/10 dark:border-gray-300 rounded-xl px-4 py-2.5 text-sm text-primary dark:text-gray-700 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
            <option>Current Cohort</option>
            <option>2024 Cohort</option>
            <option>2023 Cohort</option>
          </select>
          <select className="border border-tertiary/10 dark:border-gray-300 rounded-xl px-4 py-2.5 text-sm text-primary dark:text-gray-700 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
            <option>All Students</option>
            <option>At-Risk Students</option>
            <option>High Performers</option>
          </select>
          <select className="border border-tertiary/10 dark:border-gray-300 rounded-xl px-4 py-2.5 text-sm text-primary dark:text-gray-700 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Entire Course</option>
          </select>
          {/* Added: Student select dropdown */}
          <select
            className="border border-tertiary/10 dark:border-gray-300 rounded-xl px-4 py-2.5 text-sm text-primary dark:text-gray-700 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="class_average">Class Average</option>
            <option value="Emma Wilson">Emma Wilson</option>
            <option value="Michael Chen">Michael Chen</option>
            <option value="Sophia Rodriguez">Sophia Rodriguez</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-primary dark:text-gray-700 font-semibold py-2.5 px-5 rounded-xl text-sm transition-colors">
            Export CSV
          </button>
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-gray-900 font-semibold py-2.5 px-5 rounded-xl text-sm shadow-md transition-all">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherAnalyticsDashboard;
