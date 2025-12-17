import React, { useState, useEffect, useMemo } from "react";
import {
  Book,
  CheckSquare,
  Users,
  Video,
  TrendingUp,
  Bell,
  Calendar,
} from "lucide-react";

import { getAllCourses } from "../../../../services/course.service";
import ScheduleCalendar from "./ScheduleCalendar";

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

  // Today's meetings for schedule/calendar, flattened across courses
  const todayEvents = useMemo(() => {
    if (!dashboardData?.courses) return [];

    return dashboardData.courses.flatMap((course) =>
      (course.todayMeetings || []).map((m) => ({
        _id: m.meetingId,
        start: m.start,
        end: m.end,
        subject: m.title,
        roomNumber: m.roomNumber,
        link: m.link,
        color: m.color,
        courseTitle: course.title,
        courseCode: course.courseCode,
      }))
    );
  }, [dashboardData?.courses]);


  // 4. UPDATE loading and error states
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full bg-white dark:bg-gray-800">
        <div className="animate-spin h-8 w-8 border-4 border-primary dark:border-primary/80 border-t-transparent rounded-full mr-3"></div>
        <p className="text-xl text-gray-600 dark:text-gray-300">Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen w-full bg-white dark:bg-gray-800">
        <p className="text-xl text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  // Handle case where dashboardData might not have loaded yet
  if (!dashboardData) {
      return null;
  }

  return (
    <div className="space-y-6 px-[15vh] py-2 mx-auto w-full bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-sf">
            Welcome back, {dashboardData.user.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Here's what's happening in your classes today.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Active Courses */}
        <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-6 rounded-lg shadow-sm dark:shadow-lg transition-all hover:shadow-md dark:hover:shadow-xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-primary dark:text-primary/90">
              <Book className="h-6 w-6" />
            </div>
            <h2 className="font-semibold text-gray-800 dark:text-gray-200">
              Active Courses
            </h2>
          </div>
          <p className="text-4xl font-bold text-gray-800 dark:text-white">
            {dashboardData?.user?.totalCourses}
          </p>
          <div className="mt-4 flex items-center space-x-2 text-primary dark:text-primary/90">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Across all semesters</span>
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-6 rounded-lg shadow-sm dark:shadow-lg transition-all hover:shadow-md dark:hover:shadow-xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-primary dark:text-primary/90">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="font-semibold text-gray-800 dark:text-gray-200">
              Total Students
            </h2>
          </div>
          <p className="text-4xl font-bold text-gray-800 dark:text-white">
            {dashboardData?.user?.totalStudents}
          </p>
          <div className="mt-4 flex items-center space-x-2 text-primary dark:text-primary/90">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Unique students enrolled</span>
          </div>
        </div>

        {/* Pending Grades */}
        <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-6 rounded-lg shadow-sm dark:shadow-lg cursor-pointer transition-all hover:shadow-md dark:hover:shadow-xl  ">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-primary dark:text-primary/90">
              <CheckSquare className="h-6 w-6" />
            </div>
            <h2 className="font-semibold text-gray-800 dark:text-gray-200">
              Pending Grades
            </h2>
          </div>
          <p className="text-4xl font-bold text-gray-800 dark:text-white">
            {pendingGradesCount}
          </p>
          <div className="mt-4 flex items-center space-x-2 text-primary dark:text-primary/90">
            <Bell className="h-4 w-4" />
            <span className="text-sm">Submissions to review</span>
          </div>
        </div>

        {/* Upcoming Lectures */}
        <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-6 rounded-lg shadow-sm dark:shadow-lg cursor-pointer transition-all hover:shadow-md dark:hover:shadow-xl ">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-primary dark:text-primary/90">
              <Video className="h-6 w-6" />
            </div>
            <h2 className="font-semibold text-gray-800 dark:text-gray-200">
              Upcoming Lectures
            </h2>
          </div>
          <p className="text-4xl font-bold text-gray-800 dark:text-white">
            {upcomingLecturesCount}
          </p>
          <div className="mt-4 flex items-center space-x-2 text-primary dark:text-primary/90">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">Scheduled this semester</span>
          </div>
        </div>
      </div>

      {/* 5. Scheduled meetings & mini calendar using today's meeting instances */}
      <ScheduleCalendar events={todayEvents} />
    </div>
  );
};

export default TeacherDashboard2;