import React, { useState, useEffect } from "react";
import { useCourse } from "../../../../context/CourseContext";
import {
  Calendar,
  Clock,
  Circle,
  Edit,
  Check,
  ClipboardCheck,
  AlertCircle,
  Users,
  CheckCircle,
  XCircle,
  Save,
  Switch,
} from "lucide-react";
import SaveButton from "../../../../utils/CourseSaveButton";
import { useParams } from "react-router-dom";

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
  const [isEditingDateTime, setIsEditingDateTime] = useState(false);
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

  // Toggle edit mode for date/time
  const toggleEditDateTime = () => {
    setIsEditingDateTime(!isEditingDateTime);
  };

  // Save date/time changes
  const saveDateTime = () => {
    // Create attendance session with new date/time if it doesn't exist
    createAttendanceSession(currentDate, currentTime);
    setIsEditingDateTime(false);
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

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      <div className="flex justify-between items-center absolute -top-10 right-36">
        <SaveButton urlId={courseID} />
      </div>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Attendance Tracker
          </h1>
          <p className="text-tertiary mt-1">
            Track and manage student attendance records
          </p>
        </div>
      </div>

      {/* Session Control Panel */}
      <div className="bg-white rounded-2xl border border-tertiary/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-tertiary/10 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <ClipboardCheck className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-primary">
              Session Details
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {isEditingDateTime ? (
              <button
                onClick={saveDateTime}
                className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-all duration-200"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            ) : (
              <button
                onClick={toggleEditDateTime}
                className="flex items-center space-x-2 text-primary hover:bg-primary/10 px-3 py-2 rounded-lg transition-all duration-200"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Session</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Date & Time Section */}
            <div className="space-y-4">
              {isEditingDateTime ? (
                <div className="space-y-6">
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-tertiary">
                      Session Date
                    </label>
                    <div className="flex items-center p-4 rounded-xl border border-tertiary/20 bg-white hover:border-primary/30 transition-all duration-200">
                      <Calendar className="w-5 h-5 text-primary mr-3" />
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
                    <div className="flex items-center p-4 rounded-xl border border-tertiary/20 bg-white hover:border-primary/30 transition-all duration-200">
                      <Clock className="w-5 h-5 text-primary mr-3" />
                      <input
                        type="time"
                        value={currentTime}
                        onChange={handleTimeChange}
                        className="w-full bg-transparent focus:outline-none text-primary"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col p-5 bg-white rounded-xl border border-tertiary/10">
                    <span className="text-sm text-tertiary mb-2 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Date
                    </span>
                    <span className="text-lg font-medium text-primary">
                      {displayDate}
                    </span>
                  </div>

                  <div className="flex flex-col p-5 bg-white rounded-xl border border-tertiary/10">
                    <span className="text-sm text-tertiary mb-2 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Time
                    </span>
                    <span className="text-lg font-medium text-primary">
                      {currentTime.slice(0, 5)}
                      {parseInt(currentTime) >= 12 ? " PM" : " AM"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Attendance Summary & Controls */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {calculateAttendancePercentage()}%
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
                    className={`relative inline-flex h-8 w-[70px] items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                      attendanceToggle ? "bg-primary" : "bg-red-500"
                    }`}
                  >
                    <span className="sr-only">Toggle attendance</span>
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        attendanceToggle
                          ? "translate-x-[42px]"
                          : "translate-x-1"
                      }`}
                    />
                    <span
                      className={`absolute text-xs font-medium ${
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

              <div className="flex items-start mt-auto p-4 rounded-xl bg-primary/5 border border-primary/20">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
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
        <div className="p-6 border-b border-tertiary/10">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold text-primary">
              Student Attendance
            </h2>
          </div>
        </div>

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
                <th className="py-4 px-6 text-left font-medium text-tertiary">
                  Program
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
                  className="border-b border-tertiary/10 hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="py-4 px-6 text-primary">{index + 1}</td>
                  <td className="py-4 px-6 text-primary font-medium">
                    {student.rollNo}
                  </td>
                  <td className="py-4 px-6 text-primary">{student.name}</td>
                  <td className="py-4 px-6 text-tertiary">{student.program}</td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center">
                      <button
                        onClick={() => toggleAttendance(student.id)}
                        className={`flex items-center space-x-2 py-2 px-4 rounded-full transition-all duration-200 ${
                          isStudentPresent(student.id)
                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                            : "bg-red-50 text-red-500 hover:bg-red-100"
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
