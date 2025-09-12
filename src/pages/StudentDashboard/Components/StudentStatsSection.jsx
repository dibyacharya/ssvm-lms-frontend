import { useState } from "react";
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
      name: "Mid Sem",
      student: student.midSem,
      classAverage: classAvg.midSem,
      fullMark: 20,
    },
    {
      name: "End Sem",
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
    { name: "Assignments", value: assignmentPercentage, fill: "#8884d8" },
    { name: "Quizzes", value: quizPercentage, fill: "#83a6ed" },
    { name: "Activities", value: activityPercentage, fill: "#8dd1e1" },
    { name: "Mid Sem", value: midSemPercentage, fill: "#82ca9d" },
    { name: "End Sem", value: endSemPercentage, fill: "#ffc658" },
  ];
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

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
              <p className="text-gray-600">
                Roll Number: {studentData.rollNumber}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <div className="bg-blue-100 p-4 rounded-lg text-center">
                <p className="text-sm text-blue-600 font-medium">Total Score</p>
                <p className="text-xl font-bold text-blue-800">
                  {totalStats.obtained}/{totalStats.maximum}
                </p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <p className="text-sm text-green-600 font-medium">Percentage</p>
                <p className="text-xl font-bold text-green-800">
                  {totalStats.percentage}%
                </p>
              </div>
              <div className="bg-purple-100 p-4 rounded-lg text-center">
                <p className="text-sm text-purple-600 font-medium">
                  Attendance
                </p>
                <p className="text-xl font-bold text-purple-800">
                  {calculateAttendancePercentage()}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">
            Course Completion Progress
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={courseCompletionData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="Concrete Technology"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="Fundamental of Probability and Statistics"
                stroke="#82ca9d"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Performance Comparison Chart */}
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">
              Performance vs. Class Average
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={comparisonData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="student" name="Your Score" fill="#8884d8" />
                <Bar
                  dataKey="classAverage"
                  name="Class Average"
                  fill="#82ca9d"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Progress Over Time Chart */}
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Performance Growth</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={monthlyPerformance}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[60, 100]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Monthly Score"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Subject Performance Pie Chart */}
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">
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
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                ></Pie>
                <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Attendance Chart */}
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Monthly Attendance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={attendanceData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="present"
                  name="Classes Attended"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total Classes"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Insights Section */}
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">Performance Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="font-medium text-blue-800">Strongest Areas</h3>
              <ul className="mt-2 text-sm">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>{" "}
                  Activities - 90%
                </li>
                <li className="flex items-center mt-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>{" "}
                  Assignments - 90%
                </li>
              </ul>
            </div>
            <div className="border rounded-lg p-4 bg-yellow-50">
              <h3 className="font-medium text-yellow-800">
                Areas for Improvement
              </h3>
              <ul className="mt-2 text-sm">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>{" "}
                  Quizzes - 80%
                </li>
              </ul>
            </div>
            <div className="border rounded-lg p-4 bg-purple-50">
              <h3 className="font-medium text-purple-800">Attendance Impact</h3>
              <p className="mt-2 text-sm">
                Higher attendance in Feb-Mar correlates with improved
                performance during those months.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentStatsSection;
