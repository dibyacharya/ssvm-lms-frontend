import React, { useState, useEffect, useMemo } from "react";
import { useCourse } from "../../../../context/CourseContext";
import {
  Calendar,
  Clock,
  ClipboardCheck,
  AlertCircle,
  Users,
  CheckCircle,
  XCircle,
  UserX,
  UserCheck,
  TrendingUp,
  Phone,
  BookOpen,
  Wifi,
} from "lucide-react";
import SaveButton from "../../../../utils/CourseSaveButton";
import { useParams } from "react-router-dom";
import {
  getCourseBannerProps,
  scatterPositions,
} from "../../../../utils/courseBannerHelper";

/* ─────────── Animated SVG Donut Chart ─────────── */
const DonutChart = ({ percentage, size = 120, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color =
    percentage >= 75
      ? "#10b981"
      : percentage >= 50
      ? "#f59e0b"
      : "#ef4444";
  const bgColor =
    percentage >= 75
      ? "#d1fae5"
      : percentage >= 50
      ? "#fef3c7"
      : "#fee2e2";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Animated progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-800">{percentage}%</span>
        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
          Rate
        </span>
      </div>
    </div>
  );
};

/* ─────────── Stat Card ─────────── */
const StatCard = ({ icon: Icon, label, value, color, bgColor, borderColor }) => (
  <div
    className={`relative overflow-hidden rounded-xl border ${borderColor} ${bgColor} p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
  >
    <div className="flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
    </div>
    {/* Decorative dot */}
    <div
      className={`absolute -top-2 -right-2 w-8 h-8 rounded-full opacity-10 ${color}`}
    />
  </div>
);

/* ─────────── Section Header (enhanced) ─────────── */
const SectionHeader = ({ icon: Icon, title, gradient, count, rightContent }) => (
  <div className={`relative overflow-hidden px-6 py-4 ${gradient}`}>
    <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
    <div className="absolute -bottom-4 right-12 w-12 h-12 bg-white/5 rounded-full" />
    <div className="relative z-10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight">
          {title}
        </h2>
      </div>
      <div className="flex items-center gap-3">
        {count != null && (
          <span className="px-2.5 py-1 text-xs font-bold text-white bg-white/20 rounded-full backdrop-blur-sm">
            {count}
          </span>
        )}
        {rightContent}
      </div>
    </div>
  </div>
);

/* ─────────── Compact progress bar ─────────── */
const ProgressBar = ({ value = 0 }) => {
  const pct = Math.min(100, Math.max(0, Math.round(value)));
  const barColor =
    pct >= 75
      ? "bg-emerald-500"
      : pct >= 50
      ? "bg-amber-500"
      : "bg-red-500";
  const textColor =
    pct >= 75
      ? "text-emerald-600"
      : pct >= 50
      ? "text-amber-600"
      : "text-red-600";

  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`text-xs font-bold whitespace-nowrap ${textColor}`}
      >
        {pct}%
      </span>
    </div>
  );
};

/* ─────────── Avatar with initials ─────────── */
const StudentAvatar = ({ name, isPresent }) => {
  const initials = (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
        isPresent
          ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300"
          : "bg-gray-100 text-gray-500 ring-2 ring-gray-200"
      }`}
    >
      {initials}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════ */

const AttendanceTracker = () => {
  const {
    courseData,
    markStudentPresent,
    markStudentAbsent,
    getSessionAttendance,
    createAttendanceSession,
    getStudentAttendanceRate,
  } = useCourse();
  const { courseID } = useParams();

  const students = courseData?.students || [];
  const attendanceSessions = courseData?.attendance?.sessions || {};

  // Course-specific banner gradient
  const { grad, symbols, seed } = useMemo(
    () => getCourseBannerProps(courseData, 99),
    [courseData]
  );
  const bannerPositions = useMemo(
    () => scatterPositions(seed, 10, 900, 160),
    [seed]
  );

  const formatDateForInput = (dateString) => {
    if (dateString.includes("/")) {
      const [day, month, year] = dateString.split("/");
      return `${year}-${month}-${day}`;
    }
    return dateString;
  };

  const getCurrentDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  };
  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  };

  const [currentDate, setCurrentDate] = useState(getCurrentDate());
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  useEffect(() => {
    createAttendanceSession(currentDate, currentTime);
  }, [currentDate, currentTime, createAttendanceSession]);

  const allPresent = useMemo(() => {
    if (students.length === 0) return false;
    const sessionList = getSessionAttendance(currentDate, currentTime);
    return students.every((s) => sessionList.includes(s.id));
  }, [students, currentDate, currentTime, getSessionAttendance]);

  const toggleAttendance = (studentId) => {
    const currentAttendance = getSessionAttendance(currentDate, currentTime);
    if (currentAttendance.includes(studentId)) {
      markStudentAbsent(currentDate, currentTime, studentId);
    } else {
      markStudentPresent(currentDate, currentTime, studentId);
    }
  };

  const isStudentPresent = (studentId) => {
    const currentAttendance = getSessionAttendance(currentDate, currentTime);
    return currentAttendance.includes(studentId);
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    if (newDate) setCurrentDate(newDate);
  };
  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    if (newTime) setCurrentTime(newTime);
  };

  const toggleAllAttendance = () => {
    if (allPresent) {
      students.forEach((s) =>
        markStudentAbsent(currentDate, currentTime, s.id)
      );
    } else {
      students.forEach((s) =>
        markStudentPresent(currentDate, currentTime, s.id)
      );
    }
  };

  const presentCount = getSessionAttendance(currentDate, currentTime).length;
  const absentCount = students.length - presentCount;
  const attendancePct =
    students.length > 0
      ? Math.round((presentCount / students.length) * 100)
      : 0;

  const sortedSessionKeys = useMemo(
    () => Object.keys(attendanceSessions).sort(),
    [attendanceSessions]
  );

  const getLastSessionStatus = (studentId) => {
    const currentSessionKey = `${currentDate}_${currentTime}`;
    const previousKeys = sortedSessionKeys.filter(
      (key) => key < currentSessionKey
    );
    if (previousKeys.length === 0) return null;
    const lastKey = previousKeys[previousKeys.length - 1];
    const lastSession = attendanceSessions[lastKey] || [];
    return lastSession.includes(studentId) ? "Present" : "Absent";
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* ═══════ HERO BANNER with course-specific gradient + symbols ═══════ */}
      <div className="relative overflow-hidden rounded-2xl shadow-xl">
        <svg
          viewBox="0 0 900 160"
          className="w-full h-auto block"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="att-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={grad.from} />
              <stop offset="50%" stopColor={grad.via} />
              <stop offset="100%" stopColor={grad.to} />
            </linearGradient>
          </defs>
          <rect width="900" height="160" fill="url(#att-grad)" />
          {/* Decorative circles */}
          <circle cx="820" cy="-20" r="80" fill="white" opacity="0.07" />
          <circle cx="780" cy="140" r="50" fill="white" opacity="0.05" />
          <circle cx="100" cy="130" r="60" fill="white" opacity="0.06" />
          {/* Scattered symbols */}
          {bannerPositions.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={p.y}
              fontSize={p.size}
              fill="white"
              opacity={p.opacity + 0.03}
              transform={`rotate(${p.rotate}, ${p.x}, ${p.y})`}
              fontFamily="system-ui"
            >
              {symbols[i % symbols.length]}
            </text>
          ))}
          {/* Hero symbol */}
          <text
            x="830"
            y="110"
            fontSize="72"
            fill="white"
            opacity="0.12"
            textAnchor="middle"
            fontFamily="system-ui"
          >
            {symbols[0]}
          </text>
          {/* Bottom fade */}
          <rect
            y="120"
            width="900"
            height="40"
            fill="url(#att-grad)"
            opacity="0.3"
          />
        </svg>

        {/* Content overlay */}
        <div className="absolute inset-0 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/10">
              <ClipboardCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
                Attendance Tracker
              </h1>
              <p className="text-white/70 text-sm mt-0.5 font-medium">
                Track and manage student attendance records
              </p>
            </div>
          </div>
          <SaveButton urlId={courseID} />
        </div>
      </div>

      {/* ═══════ STAT CARDS ROW ═══════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Students"
          value={students.length}
          color="bg-blue-500"
          bgColor="bg-blue-50/80"
          borderColor="border-blue-100"
        />
        <StatCard
          icon={UserCheck}
          label="Present"
          value={presentCount}
          color="bg-emerald-500"
          bgColor="bg-emerald-50/80"
          borderColor="border-emerald-100"
        />
        <StatCard
          icon={XCircle}
          label="Absent"
          value={absentCount}
          color="bg-red-500"
          bgColor="bg-red-50/80"
          borderColor="border-red-100"
        />
        <StatCard
          icon={TrendingUp}
          label="Attendance Rate"
          value={`${attendancePct}%`}
          color={
            attendancePct >= 75
              ? "bg-emerald-500"
              : attendancePct >= 50
              ? "bg-amber-500"
              : "bg-red-500"
          }
          bgColor={
            attendancePct >= 75
              ? "bg-emerald-50/80"
              : attendancePct >= 50
              ? "bg-amber-50/80"
              : "bg-red-50/80"
          }
          borderColor={
            attendancePct >= 75
              ? "border-emerald-100"
              : attendancePct >= 50
              ? "border-amber-100"
              : "border-red-100"
          }
        />
      </div>

      {/* ═══════ SESSION CONTROL PANEL ═══════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <SectionHeader
          icon={ClipboardCheck}
          title="Session Details"
          gradient="bg-gradient-to-r from-sky-500 to-blue-600"
        />

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Date & Time inputs */}
            <div className="lg:col-span-1 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Session Date
                </label>
                <div className="flex items-center p-3.5 rounded-xl border border-gray-200 bg-white hover:border-sky-300 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 transition-all duration-200 shadow-sm">
                  <Calendar className="w-5 h-5 text-sky-500 mr-3 flex-shrink-0" />
                  <input
                    type="date"
                    value={formatDateForInput(currentDate)}
                    onChange={handleDateChange}
                    className="w-full bg-transparent focus:outline-none text-gray-800 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Session Time
                </label>
                <div className="flex items-center p-3.5 rounded-xl border border-gray-200 bg-white hover:border-sky-300 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 transition-all duration-200 shadow-sm">
                  <Clock className="w-5 h-5 text-sky-500 mr-3 flex-shrink-0" />
                  <input
                    type="time"
                    value={currentTime}
                    onChange={handleTimeChange}
                    className="w-full bg-transparent focus:outline-none text-gray-800 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Donut Chart */}
            <div className="flex items-center justify-center">
              <DonutChart percentage={attendancePct} size={130} strokeWidth={12} />
            </div>

            {/* Mark All + Info */}
            <div className="flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Mark All Students
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Toggle all {allPresent ? "absent" : "present"}
                  </p>
                </div>
                <button
                  onClick={toggleAllAttendance}
                  disabled={students.length === 0}
                  className={`relative inline-flex h-9 w-[72px] items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    allPresent
                      ? "bg-emerald-500 focus:ring-emerald-400 shadow-md shadow-emerald-200"
                      : "bg-red-400 focus:ring-red-300 shadow-md shadow-red-200"
                  } ${
                    students.length === 0
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  <span
                    className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
                      allPresent ? "translate-x-[40px]" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-start p-4 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100">
                <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-sky-600" />
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Tap on a student's status button to toggle between present and
                  absent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ STUDENT ATTENDANCE TABLE ═══════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <SectionHeader
          icon={Users}
          title="Student Attendance"
          gradient="bg-gradient-to-r from-emerald-500 to-green-600"
          count={students.length}
        />

        {students.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mb-5 shadow-inner">
              <UserX className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              No Students Found
            </h3>
            <p className="text-gray-400 text-sm text-center max-w-md leading-relaxed">
              There are no students enrolled in this course yet. Students will
              appear here once they are added.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-50/50">
                  <th className="py-3.5 px-4 text-left font-semibold text-gray-400 text-xs uppercase tracking-wider whitespace-nowrap">
                    #
                  </th>
                  <th className="py-3.5 px-4 text-left font-semibold text-gray-400 text-xs uppercase tracking-wider whitespace-nowrap">
                    Roll No.
                  </th>
                  <th className="py-3.5 px-4 text-left font-semibold text-gray-400 text-xs uppercase tracking-wider whitespace-nowrap">
                    Student
                  </th>
                  <th className="py-3.5 px-4 text-left font-semibold text-gray-400 text-xs uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5" />
                      Online
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-center font-semibold text-gray-400 text-xs uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="py-3.5 px-4 text-center font-semibold text-gray-400 text-xs uppercase tracking-wider whitespace-nowrap">
                    Last Session
                  </th>
                  <th className="py-3.5 px-4 text-left font-semibold text-gray-400 text-xs uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Attendance
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-center font-semibold text-gray-400 text-xs uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center gap-1.5 justify-center">
                      <BookOpen className="w-3.5 h-3.5" />
                      CA
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-left font-semibold text-gray-400 text-xs uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      Mobile
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((student, index) => {
                  const lastStatus = getLastSessionStatus(student.id);
                  const attendanceRate = getStudentAttendanceRate
                    ? getStudentAttendanceRate(student.id)
                    : 0;
                  const onlinePresence =
                    student.onlinePresence != null
                      ? student.onlinePresence
                      : null;
                  const caCompleted = student.caCompleted ?? null;
                  const caTotal = student.caTotal ?? null;
                  const mobile = student.mobile || student.phone || null;
                  const present = isStudentPresent(student.id);

                  return (
                    <tr
                      key={student.id}
                      className={`group transition-all duration-200 hover:bg-emerald-50/40 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                    >
                      {/* # */}
                      <td className="py-3.5 px-4 text-gray-400 text-sm font-medium">
                        {index + 1}
                      </td>

                      {/* Roll No. */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-bold font-mono">
                          {student.rollNo || "\u2014"}
                        </span>
                      </td>

                      {/* Student (avatar + name) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <StudentAvatar
                            name={student.name}
                            isPresent={present}
                          />
                          <span className="text-sm font-medium text-gray-800 group-hover:text-gray-900">
                            {student.name}
                          </span>
                        </div>
                      </td>

                      {/* Online Presence */}
                      <td className="py-3.5 px-4 text-sm">
                        {onlinePresence != null ? (
                          <ProgressBar value={onlinePresence} />
                        ) : (
                          <span className="text-gray-300 text-sm">{"\u2014"}</span>
                        )}
                      </td>

                      {/* Status (toggle) */}
                      <td className="py-3.5 px-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => toggleAttendance(student.id)}
                            className={`flex items-center gap-1.5 py-1.5 px-4 rounded-full transition-all duration-300 ease-in-out text-xs font-semibold ${
                              present
                                ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-200"
                                : "bg-red-50 text-red-500 hover:bg-red-100 border border-red-200"
                            }`}
                          >
                            {present ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Present</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Absent</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Last Status */}
                      <td className="py-3.5 px-4 text-center">
                        {lastStatus === "Present" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Present
                          </span>
                        ) : lastStatus === "Absent" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-500 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            Absent
                          </span>
                        ) : (
                          <span className="text-gray-300 text-sm">
                            {"\u2014"}
                          </span>
                        )}
                      </td>

                      {/* Attendance % */}
                      <td className="py-3.5 px-4 text-sm">
                        <ProgressBar value={attendanceRate} />
                      </td>

                      {/* CA Assignment */}
                      <td className="py-3.5 px-4 text-center text-sm whitespace-nowrap">
                        {caCompleted != null && caTotal != null ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-violet-50 text-violet-700 text-xs font-semibold border border-violet-100">
                            {caCompleted}/{caTotal}
                          </span>
                        ) : (
                          <span className="text-gray-300">{"\u2014"}</span>
                        )}
                      </td>

                      {/* Mobile Number */}
                      <td className="py-3.5 px-4 text-sm whitespace-nowrap">
                        {mobile ? (
                          <span className="text-gray-600 font-mono text-xs">
                            {mobile}
                          </span>
                        ) : (
                          <span className="text-gray-300 font-mono text-xs">
                            XXXXXXXXXX
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceTracker;
