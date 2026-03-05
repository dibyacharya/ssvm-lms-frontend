import React, { useState } from "react";
import { useCourse } from "../../../../context/CourseContext";
import {
  Circle,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Users,
  AlertCircle,
  Check,
  X,
  Calendar,
  Percent,
} from "lucide-react";

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
        <span className="px-2.5 py-1 text-xs font-bold text-white bg-white/20 rounded-full backdrop-blur-sm">{count}</span>
      )}
    </div>
  </div>
);

const AttendanceStats = () => {
  // Get data from the course context
  const { courseData, savedSessions } = useCourse();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const sessionsPerPage = 5;

  // Extract only saved sessions (from backend) in order
  const allSessions = Object.keys(courseData.attendance.sessions || {});
  const sessionDates = allSessions
    .filter(sessionKey => savedSessions.has(sessionKey))
    .sort();

  // Calculate pagination
  const totalPages = Math.ceil(sessionDates.length / sessionsPerPage);
  const startIndex = currentPage * sessionsPerPage;
  const paginatedDates = sessionDates.slice(
    startIndex,
    startIndex + sessionsPerPage
  );

  // Format dates for display (from "2025-02-10_18:00" to "10 Feb 18:00")
  const formatDate = (dateStr) => {
    const [datePart, timePart] = dateStr.split("_");
    const date = new Date(datePart);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    return `${day} ${month} ${timePart}`;
  };

  // Calculate attendance percentage for each student
  const calculateAttendance = (studentId) => {
    let presentCount = 0;

    sessionDates.forEach((date) => {
      if (courseData.attendance.sessions[date].includes(studentId)) {
        presentCount++;
      }
    });

    return sessionDates.length > 0
      ? Math.round((presentCount / sessionDates.length) * 100)
      : 0;
  };

  // Get status color based on attendance percentage
  const getStatusColor = (percentage) => {
    if (percentage >= 75) return "text-primary";
    if (percentage >= 50) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* Header Section - Gradient Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 shadow-lg">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 right-20 w-24 h-24 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/5 rounded-full" />
        <div className="relative z-10 px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FileSpreadsheet className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Attendance Status Sheet
              </h1>
              <p className="text-blue-100 mt-1">
                Detailed attendance records for all students and sessions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-tertiary/10 border-t-4 border-t-blue-500">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-tertiary font-medium">Total Sessions</h3>
              <p className="text-2xl font-bold text-primary">
                {sessionDates.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-tertiary/10 border-t-4 border-t-emerald-500">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <Users className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-tertiary font-medium">Total Students</h3>
              <p className="text-2xl font-bold text-primary">
                {courseData.students?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-tertiary/10 border-t-4 border-t-amber-500">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
              <Percent className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-tertiary font-medium">Class Average</h3>
              <p className="text-2xl font-bold text-primary">
                {courseData.students && courseData.students.length > 0
                  ? Math.round(
                      courseData.students.reduce(
                        (sum, student) => sum + calculateAttendance(student.id),
                        0
                      ) / courseData.students.length
                    )
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      {sessionDates.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-tertiary/10 p-12 text-center">
          <FileSpreadsheet className="w-16 h-16 text-tertiary/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-primary mb-2">
            No Attendance Records
          </h3>
          <p className="text-tertiary mb-4 max-w-md mx-auto">
            Start recording attendance to see detailed statistics. You can mark
            attendance from the "Mark Attendance" section.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden">
          <SectionHeader
            icon={FileSpreadsheet}
            title="Attendance Records"
            gradient="bg-gradient-to-r from-violet-500 to-purple-600"
            count={sessionDates.length}
          />

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-slate-100 border-b border-tertiary/10">
                  <th className="p-3 font-medium text-tertiary text-left">
                    Sl. No.
                  </th>
                  <th className="p-3 font-medium text-tertiary text-left">
                    Roll No.
                  </th>
                  <th className="p-3 font-medium text-tertiary text-left">
                    Student Name
                  </th>
                  <th className="p-3 font-medium text-tertiary text-center">
                    <div className="flex items-center justify-center">
                      <Percent className="w-4 h-4 mr-1" />
                      <span>Attendance</span>
                    </div>
                  </th>
                  {paginatedDates.map((date) => (
                    <th
                      key={date}
                      className="p-3 font-medium text-tertiary text-center whitespace-nowrap"
                    >
                      {formatDate(date)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courseData.students &&
                  courseData.students.map((student, index) => {
                    const attendancePercentage = calculateAttendance(
                      student.id
                    );
                    const statusColor = getStatusColor(attendancePercentage);

                    return (
                      <tr
                        key={student.id}
                        className="border-b border-tertiary/10 hover:bg-blue-50/50 transition-colors duration-200"
                      >
                        <td className="p-3 text-primary">{index + 1}</td>
                        <td className="p-3 text-primary font-medium">
                          {student?.rollNo || "\u2014"}
                        </td>
                        <td className="p-3 text-primary font-medium">
                          {student?.name}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center">
                            <div className={`font-bold ${statusColor}`}>
                              {attendancePercentage}%
                            </div>
                          </div>
                        </td>
                        {paginatedDates.map((date) => {
                          const isPresent = courseData.attendance.sessions[
                            date
                          ].includes(student.id);
                          return (
                            <td key={date} className="p-2 text-center">
                              <div className="flex justify-center">
                                {isPresent ? (
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <Check className="w-5 h-5" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                    <X className="w-5 h-5" />
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-6 flex justify-between items-center border-t border-tertiary/10">
              <span className="text-sm text-tertiary">
                Showing page {currentPage + 1} of {totalPages}
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentPage === 0}
                  className={`p-2 rounded-lg border transition-all duration-200 ${
                    currentPage === 0
                      ? "border-tertiary/20 text-tertiary/40 cursor-not-allowed"
                      : "border-tertiary/20 text-tertiary hover:bg-gray-50 hover:border-tertiary/30"
                  }`}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center space-x-1">
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx)}
                      className={`w-8 h-8 rounded-lg transition-all duration-200 ${
                        currentPage === idx
                          ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md shadow-purple-200"
                          : "text-tertiary hover:bg-gray-50"
                      }`}
                      aria-label={`Go to page ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                  }
                  disabled={currentPage === totalPages - 1}
                  className={`p-2 rounded-lg border transition-all duration-200 ${
                    currentPage === totalPages - 1
                      ? "border-tertiary/20 text-tertiary/40 cursor-not-allowed"
                      : "border-tertiary/20 text-tertiary hover:bg-gray-50 hover:border-tertiary/30"
                  }`}
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="flex items-start p-5 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-indigo-500 mt-6">
        <AlertCircle className="w-5 h-5 text-indigo-600 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <p className="text-primary font-medium mb-1">
            About Attendance Status
          </p>
          <p className="text-tertiary text-sm">
            Students with attendance below 75% may not be eligible for exams.
            The attendance percentage is calculated based on all sessions
            conducted so far.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AttendanceStats;
