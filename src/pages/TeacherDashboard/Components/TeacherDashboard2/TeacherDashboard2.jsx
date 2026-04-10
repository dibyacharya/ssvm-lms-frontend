import React, { useState, useEffect, useMemo } from "react";
import {
  Book,
  CheckSquare,
  Users,
  Video,
  ChevronRight,
} from "lucide-react";

import { getAllCourses } from "../../../../services/course.service";
import TodaysClasses from "../../../../components/dashboard/TodaysClasses";

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

  const upcomingLecturesCount = useMemo(() => {
    if (!dashboardData?.courses) return 0;
    return dashboardData.courses.reduce(
      (sum, course) => sum + (course.meetingsNext7DaysCount || 0),
      0
    );
  }, [dashboardData?.courses]);

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mr-3"></div>
        <p className="text-xl" style={{ color: "#475569" }}>Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen w-full bg-gray-50">
        <p className="text-xl text-red-600">{error}</p>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const statCards = [
    {
      label: "Active Courses",
      value: dashboardData?.user?.totalCourses,
      subtitle: "Across all periods",
      icon: Book,
      borderColor: "border-l-blue-500",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      accentColor: "text-blue-600",
    },
    {
      label: "Total Students",
      value: dashboardData?.user?.totalStudents,
      subtitle: "Unique students enrolled",
      icon: Users,
      borderColor: "border-l-blue-500",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      accentColor: "text-blue-600",
    },
    {
      label: "Pending Grades",
      value: pendingGradesCount,
      subtitle: "Submissions to review",
      icon: CheckSquare,
      borderColor: "border-l-green-500",
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      accentColor: "text-green-600",
    },
    {
      label: "Upcoming Lectures",
      value: upcomingLecturesCount,
      subtitle: "Scheduled this week",
      icon: Video,
      borderColor: "border-l-amber-500",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      accentColor: "text-amber-600",
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Clean Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1E293B" }}>
            Dashboard
          </h1>
          <div className="flex items-center gap-1 mt-1 text-sm" style={{ color: "#94A3B8" }}>
            <span>Home</span>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: "#475569" }}>Dashboard</span>
          </div>
          <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
            Welcome back, {dashboardData.user.name}
          </p>
        </div>
        <div className="text-sm font-medium" style={{ color: "#475569" }}>
          {todayDate}
        </div>
      </div>

      {/* Stat Cards - Admin style with left border accent */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 ${card.borderColor} p-5 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: "#94A3B8" }}>
                    {card.label}
                  </p>
                  <h3 className="text-2xl font-bold mt-1" style={{ color: "#1E293B" }}>
                    {card.value}
                  </h3>
                </div>
                <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
              <p className={`mt-3 text-xs font-medium ${card.accentColor}`}>
                {card.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {/* Today's Classes */}
      <TodaysClasses />
    </div>
  );
};

export default TeacherDashboard2;
