import React, { useState, useEffect, useMemo } from "react";
import {
  Book,
  CheckSquare,
  Users,
  Video,
  Bell,
  Home,
  Sunrise,
  Sun,
  Sunset,
  Moon,
} from "lucide-react";

import { getAllCourses } from "../../../../services/course.service";

const SectionHeader = ({ icon: Icon, title, gradient, count }) => (
  <div className={`relative overflow-hidden px-6 py-4 ${gradient}`}>
    <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
    <div className="absolute -bottom-4 right-12 w-12 h-12 bg-white/5 rounded-full" />
    <div className="relative z-10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
      </div>
      {count != null && (
        <span className="px-2.5 py-1 text-xs font-bold text-white bg-white/20 rounded-full backdrop-blur-sm">
          {count}
        </span>
      )}
    </div>
  </div>
);

const TeacherDashboard2 = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getAllCourses();
        setDashboardData(data);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- STATS CALCULATIONS (course & grade data still comes from dashboardData) ---

  const activeCoursesCount = dashboardData?.courses?.length || 0;

  const totalStudentsCount = useMemo(() => {
    // ... no change to this calculation
    if (!dashboardData?.courses) return 0;
    const studentIds = new Set();
    dashboardData.courses.forEach(course => {
      if (course.attendance) {
        Object.values(course.attendance).forEach(sessionStudentIds => {
          sessionStudentIds.forEach(id => studentIds.add(id));
        });
      }
    });
    return studentIds.size;
  }, [dashboardData]);

  const pendingGradesCount = useMemo(() => {
    // ... no change to this calculation
    if (!dashboardData?.courses) return 0;
    let pendingCount = 0;
    dashboardData.courses.forEach(course => {
      course.assignments?.forEach(assignment => {
        const ungradedSubmissions = assignment.submissions?.filter(sub => !sub.isGraded).length || 0;
        pendingCount += ungradedSubmissions;
      });
    });
    return pendingCount;
  }, [dashboardData]);

  // 3. Upcoming lectures in next 7 days from meeting summaries
  const upcomingLecturesCount = useMemo(() => {
    if (!dashboardData?.courses) return 0;
    return dashboardData.courses.reduce(
      (sum, course) => sum + (course.meetingsNext7DaysCount || 0),
      0
    );
  }, [dashboardData?.courses]);

  // Time-of-day greeting
  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: "Good Morning", icon: Sunrise };
    if (hour >= 12 && hour < 17) return { text: "Good Afternoon", icon: Sun };
    if (hour >= 17 && hour < 21) return { text: "Good Evening", icon: Sunset };
    return { text: "Good Night", icon: Moon };
  }, []);

  const GreetingIcon = timeGreeting.icon;

  // 4. UPDATE loading and error states
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin h-8 w-8 border-4 border-primary dark:border-primary/80 border-t-transparent rounded-full mr-3"></div>
        <p className="text-xl text-gray-600 dark:text-gray-300">Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen w-full bg-gray-50 dark:bg-gray-900">
        <p className="text-xl text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  // Handle case where dashboardData might not have loaded yet
  if (!dashboardData) {
      return null;
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header Section - Gradient Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 px-8 py-8 shadow-lg">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 right-20 w-24 h-24 bg-white/5 rounded-full" />
        <div className="absolute top-4 left-[40%] w-16 h-16 bg-white/5 rounded-full" />
        <div className="absolute -bottom-6 left-[20%] w-20 h-20 bg-white/5 rounded-full" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Home className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Welcome back, {dashboardData.user.name}
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <GreetingIcon className="w-4 h-4 text-white/80" />
                <p className="text-white/80 text-sm font-medium">
                  {timeGreeting.text} — Here's what's happening in your classes today
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Active Courses - Green */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-tertiary/10 dark:border-gray-700 border-t-4 border-t-emerald-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-tertiary dark:text-gray-400 text-sm">Active Courses</p>
              <h3 className="text-3xl font-bold text-primary dark:text-white mt-1">
                {dashboardData?.user?.totalCourses}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
              <Book className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-tertiary dark:text-gray-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Across all periods</span>
          </div>
        </div>

        {/* Total Students - Blue */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-tertiary/10 dark:border-gray-700 border-t-4 border-t-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-tertiary dark:text-gray-400 text-sm">Total Students</p>
              <h3 className="text-3xl font-bold text-primary dark:text-white mt-1">
                {dashboardData?.user?.totalStudents}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-tertiary dark:text-gray-400">
            <span className="text-blue-600 dark:text-blue-400 font-medium">Unique students enrolled</span>
          </div>
        </div>

        {/* Pending Grades - Purple */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-tertiary/10 dark:border-gray-700 border-t-4 border-t-purple-500 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-tertiary dark:text-gray-400 text-sm">Pending Grades</p>
              <h3 className="text-3xl font-bold text-primary dark:text-white mt-1">
                {pendingGradesCount}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-tertiary dark:text-gray-400">
            <span className="text-purple-600 dark:text-purple-400 font-medium">Submissions to review</span>
          </div>
        </div>

        {/* Upcoming Lectures - Amber */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-tertiary/10 dark:border-gray-700 border-t-4 border-t-amber-500 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-tertiary dark:text-gray-400 text-sm">Upcoming Lectures</p>
              <h3 className="text-3xl font-bold text-primary dark:text-white mt-1">
                {upcomingLecturesCount}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
              <Video className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-tertiary dark:text-gray-400">
            <span className="text-amber-600 dark:text-amber-400 font-medium">Scheduled this week</span>
          </div>
        </div>
      </div>

      {/* Schedule Calendar section removed */}
    </div>
  );
};

export default TeacherDashboard2;
