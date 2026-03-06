import React, { useState, useEffect } from "react";
import { useCourse } from "../../../../context/CourseContext";
import {
  Calendar,
  Clock,
  Circle,
  Check,
  ClipboardCheck,
  AlertCircle,
  Users,
  CheckCircle,
  XCircle,
  Switch,
} from "lucide-react";
import SaveButton from "../../../../utils/CourseSaveButton";
import { useParams } from "react-router-dom";

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

const AttendanceTracker = () => {
  // Get functions and data from context
  const {
    courseData,
    markStudentPresent,
    markStudentAbsent,
    getSessionAttendance,
    createAttendanceSession,
  } = useCourse();
  const { courseID } = useParams();
  // Format date helpers
  const formatDateForDisplay = (dateString) => {
    // Convert YYYY-MM-DD to DD/MM/YYYY
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const formatDateForInput = (dateString) => {
    // Convert from any format to YYYY-MM-DD for input field
    if (dateString.includes("/")) {
      const [day, month, year] = dateString.split("/");
      return `${year}-${month}-${day}`;
    }
    return dateString;
  };

  // Get current date and time
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatCurrentDateForDisplay = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  // State for date and time with current values
  const [currentDate, setCurrentDate] = useState(getCurrentDate());
  const [displayDate, setDisplayDate] = useState(
    formatCurrentDateForDisplay(getCurrentDate())
  );
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [attendanceToggle, setAttendanceToggle] = useState(false);

  // Initialize attendance session if it doesn't exist
  useEffect(() => {
    createAttendanceSession(currentDate, currentTime);
  }, [currentDate, currentTime, createAttendanceSession]);

  // Toggle attendance status for a student
  const toggleAttendance = (studentId) => {
    const currentAttendance = getSessionAttendance(currentDate, currentTime);

    if (currentAttendance.includes(studentId)) {
      markStudentAbsent(currentDate, currentTime, studentId);
    } else {
      markStudentPresent(currentDate, currentTime, studentId);
    }
  };

  // Check if a student is present
  const isStudentPresent = (studentId) => {
    const currentAttendance = getSessionAttendance(currentDate, currentTime);
    return currentAttendance.includes(studentId);
  };

  // Handle date change
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setCurrentDate(newDate);
    setDisplayDate(formatDateForDisplay(newDate));
  };

  // Handle time change
  const handleTimeChange = (e) => {
    setCurrentTime(e.target.value);
  };

  // Toggle between marking all present or all absent
  const toggleAllAttendance = () => {
    if (attendanceToggle) {
      // Currently all are present, mark all absent
      courseData.students.forEach((student) => {
        markStudentAbsent(currentDate, currentTime, student.id);
      });
    } else {
      // Currently all are absent, mark all present
      courseData.students.forEach((student) => {
        markStudentPresent(currentDate, currentTime, student.id);
      });
    }
    setAttendanceToggle(!attendanceToggle);
  };

  // Calculate attendance percentage for this session
  const calculateAttendancePercentage = () => {
    const totalStudents = courseData.students.length;
    const presentStudents = getSessionAttendance(
      currentDate,
      currentTime
    ).length;
    return totalStudents > 0
      ? Math.round((presentStudents / totalStudents) * 100)
      : 0;
  };

  const attendancePct = calculateAttendancePercentage();

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* Header Section - Gradient Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-green-500 shadow-lg">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 right-20 w-24 h-24 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/5 rounded-full" />
        <div className="relative z-10 px-8 py-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <ClipboardCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  Attendance Tracker
                </h1>
                <p className="text-emerald-100 mt-1">
                  Track and manage student attendance records
                </p>
              </div>
            </div>
            <SaveButton urlId={courseID} />
          </div>
        </div>
      </div>

      {/* Session Control Panel */}
      <div className="bg-white rounded-2xl border border-tertiary/10 shadow-sm overflow-hidden">
        <SectionHeader
          icon={ClipboardCheck}
          title="Session Details"
          gradient="bg-gradient-to-r from-sky-500 to-blue-600"
        />

        <div className="p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Date & Time Section */}
            <div className="space-y-4">
              <div className="space-y-6">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-tertiary">
                    Session Date
                  </label>
                  <div className="flex items-center p-4 rounded-xl border border-tertiary/20 bg-white hover:border-sky-400 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-200 transition-all duration-200">
                    <Calendar className="w-5 h-5 text-sky-500 mr-3" />
                    <input
                      type="date"
                      value={formatDateForInput(currentDate)}
                      onChange={handleDateChange}
                      className="w-full bg-transparent focus:outline-none text-primary"
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-tertiary">
                    Session Time
                  </label>
                  <div className="flex items-center p-4 rounded-xl border border-tertiary/20 bg-white hover:border-sky-400 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-200 transition-all duration-200">
                    <Clock className="w-5 h-5 text-sky-500 mr-3" />
                    <input
                      type="time"
                      value={currentTime}
                      onChange={handleTimeChange}
                      className="w-full bg-transparent focus:outline-none text-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Summary & Controls */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-200">
                    {attendancePct}%
                  </div>
                  <div>
                    <div className="text-primary font-medium">
                      Attendance Rate
                    </div>
                    <div className="text-tertiary text-sm">
                      {getSessionAttendance(currentDate, currentTime).length} of{" "}
                      {courseData.students.length} present
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-sm text-tertiary mb-2">
                    Mark All Students
                  </span>
                  <button
                    onClick={toggleAllAttendance}
                    className={`relative inline-flex h-8 w-[70px] items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      attendanceToggle
                        ? "bg-emerald-500 focus:ring-emerald-400 shadow-md shadow-emerald-200"
                        : "bg-red-500 focus:ring-red-400 shadow-md shadow-red-200"
                    }`}
                  >
                    <span className="sr-only">Toggle attendance</span>
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
                        attendanceToggle
                          ? "translate-x-[42px]"
                          : "translate-x-1"
                      }`}
                    />
                    <span
                      className={`absolute text-xs font-medium transition-opacity duration-200 ${
                        attendanceToggle
                          ? "left-2 text-primary-foreground"
                          : "right-2 text-white"
                      }`}
                    >
                      {attendanceToggle ? "" : ""}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-start mt-auto p-4 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 border-l-4 border-sky-500">
                <AlertCircle className="w-5 h-5 text-sky-600 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-tertiary text-sm">
                  Tap on a student's status button to toggle between present and
                  absent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-tertiary/10 shadow-sm overflow-hidden">
        <SectionHeader
          icon={Users}
          title="Student Attendance"
          gradient="bg-gradient-to-r from-emerald-500 to-green-600"
          count={courseData.students.length}
        />

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-tertiary/10">
                <th className="py-4 px-6 text-left font-medium text-tertiary">
                  #
                </th>
                <th className="py-4 px-6 text-left font-medium text-tertiary">
                  Roll No.
                </th>
                <th className="py-4 px-6 text-left font-medium text-tertiary">
                  Name
                </th>
                <th className="py-4 px-6 text-center font-medium text-tertiary">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {courseData.students.map((student, index) => (
                <tr
                  key={student.id}
                  className="border-b border-tertiary/10 hover:bg-emerald-50/50 transition-colors duration-200"
                >
                  <td className="py-4 px-6 text-primary">{index + 1}</td>
                  <td className="py-4 px-6 text-primary font-medium">
                    {student.rollNo || "\u2014"}
                  </td>
                  <td className="py-4 px-6 text-primary">{student.name}</td>

                  <td className="py-4 px-6">
                    <div className="flex justify-center">
                      <button
                        onClick={() => toggleAttendance(student.id)}
                        className={`flex items-center space-x-2 py-2 px-4 rounded-full transition-all duration-300 ease-in-out ${
                          isStudentPresent(student.id)
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-sm shadow-emerald-100"
                            : "bg-red-50 text-red-500 hover:bg-red-100 shadow-sm shadow-red-100"
                        }`}
                      >
                        {isStudentPresent(student.id) ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Present</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            <span>Absent</span>
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;
