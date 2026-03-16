import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useCourse } from "../../../../context/CourseContext";
import { getStudentTimeAttendance } from "../../../../services/vconf.service";
import {
  ClipboardCheck,
  Calendar,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  Video,
  Loader2,
} from "lucide-react";
import CoursePageBanner from "../../../../components/shared/CoursePageBanner";

/* ─────────── Animated SVG Donut Chart ─────────── */
const DonutChart = ({ percentage, size = 140, strokeWidth = 12 }) => {
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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
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
        <span className="text-3xl font-bold text-gray-800">{percentage}%</span>
        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
          Attendance
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
    <div
      className={`absolute -top-2 -right-2 w-8 h-8 rounded-full opacity-10 ${color}`}
    />
  </div>
);

/* ─────────── Section Header ─────────── */
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

/* ─────────── Percentage Badge ─────────── */
const PctBadge = ({ pct }) => {
  if (pct >= 75) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
        <CheckCircle className="w-3.5 h-3.5" />
        {pct}%
      </span>
    );
  }
  if (pct >= 50) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
        <Clock className="w-3.5 h-3.5" />
        {pct}%
      </span>
    );
  }
  if (pct > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold border border-orange-200">
        <Clock className="w-3.5 h-3.5" />
        {pct}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-500 text-xs font-semibold border border-red-200">
      <XCircle className="w-3.5 h-3.5" />
      Absent
    </span>
  );
};

/* ─────────── Format Helpers ─────────── */
const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
};

/* ═══════════════════════════════════════════════════════════════════ */

const StudentAttendance = () => {
  const { courseData } = useCourse();
  const { courseID } = useParams();

  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState(null);

  // Fetch time-based attendance from the dedicated API
  useEffect(() => {
    // Prefer courseData._id (ObjectId) over URL param (which may be a slug/shortCode)
    const cid = courseData?._id || courseID;
    if (!cid) return;

    setLoading(true);
    getStudentTimeAttendance(cid)
      .then((data) => setAttendanceData(data))
      .catch((err) => {
        console.error("Failed to fetch time-based attendance:", err);
        setAttendanceData(null);
      })
      .finally(() => setLoading(false));
  }, [courseID, courseData?._id]);

  // Derived stats
  const sessions = attendanceData?.sessions || [];
  const overallPct = attendanceData?.overallPct || 0;
  const totalSessions = attendanceData?.totalSessions || 0;
  const presentCount = sessions.filter((s) => s.attendancePct > 0).length;
  const absentCount = totalSessions - presentCount;

  // Loading state
  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto space-y-6">
        <CoursePageBanner
          icon={ClipboardCheck}
          title="My Attendance"
          subtitle="View your attendance records for this course"
          gradient="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500"
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-500">Loading attendance...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Banner */}
      <CoursePageBanner
        icon={ClipboardCheck}
        title="My Attendance"
        subtitle="View your attendance records for this course"
        gradient="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500"
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Calendar}
          label="Total Sessions"
          value={totalSessions}
          color="bg-blue-500"
          bgColor="bg-blue-50/80"
          borderColor="border-blue-100"
        />
        <StatCard
          icon={CheckCircle}
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
          label="Overall Rate"
          value={`${overallPct}%`}
          color={
            overallPct >= 75
              ? "bg-emerald-500"
              : overallPct >= 50
              ? "bg-amber-500"
              : "bg-red-500"
          }
          bgColor={
            overallPct >= 75
              ? "bg-emerald-50/80"
              : overallPct >= 50
              ? "bg-amber-50/80"
              : "bg-red-50/80"
          }
          borderColor={
            overallPct >= 75
              ? "border-emerald-100"
              : overallPct >= 50
              ? "border-amber-100"
              : "border-red-100"
          }
        />
      </div>

      {/* Donut + Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <SectionHeader
          icon={TrendingUp}
          title="Attendance Overview"
          gradient="bg-gradient-to-r from-emerald-500 to-green-600"
        />
        <div className="p-6 flex flex-col md:flex-row items-center justify-center gap-8">
          <DonutChart percentage={overallPct} />
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-gray-700 font-medium">Present: {presentCount} sessions</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
              <span className="text-gray-700 font-medium">Absent: {absentCount} sessions</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span className="text-gray-700 font-medium">Total: {totalSessions} sessions</span>
            </div>
            {overallPct < 75 && totalSessions > 0 && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                ⚠️ Your attendance is below 75%. Please ensure regular attendance.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Session-wise Attendance Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <SectionHeader
          icon={Calendar}
          title="Session History"
          gradient="bg-gradient-to-r from-sky-500 to-blue-600"
          count={totalSessions}
        />
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">No Sessions Yet</h3>
            <p className="text-gray-400 text-sm text-center max-w-md">
              No attendance sessions have been recorded for this course yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-50/50">
                  <th className="py-3.5 px-4 text-left font-semibold text-gray-400 text-xs uppercase tracking-wider">
                    #
                  </th>
                  <th className="py-3.5 px-4 text-left font-semibold text-gray-400 text-xs uppercase tracking-wider">
                    Date
                  </th>
                  <th className="py-3.5 px-4 text-left font-semibold text-gray-400 text-xs uppercase tracking-wider">
                    Time
                  </th>
                  <th className="py-3.5 px-4 text-center font-semibold text-gray-400 text-xs uppercase tracking-wider">
                    Type
                  </th>
                  <th className="py-3.5 px-4 text-center font-semibold text-gray-400 text-xs uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="py-3.5 px-4 text-center font-semibold text-gray-400 text-xs uppercase tracking-wider">
                    Attendance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sessions.map((session, index) => (
                  <tr
                    key={session.sessionKey}
                    className={`transition-all duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    } hover:bg-gray-50`}
                  >
                    <td className="py-3.5 px-4 text-gray-400 text-sm font-medium">
                      {sessions.length - index}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-gray-800 font-medium whitespace-nowrap">
                      {formatDate(session.date)}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-gray-600 whitespace-nowrap">
                      {formatTime(session.time)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex justify-center">
                        {session.type === "vconf" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-600 text-xs font-medium">
                            <Video className="w-3 h-3" />
                            Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-gray-500 text-xs font-medium">
                            <ClipboardCheck className="w-3 h-3" />
                            Manual
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center text-sm text-gray-600">
                      {session.type === "vconf" && session.meetingDurationSeconds > 0 ? (
                        <span>
                          {formatDuration(session.studentDurationSeconds)}{" "}
                          <span className="text-gray-400">/ {formatDuration(session.scheduledDurationSeconds || session.meetingDurationSeconds)}</span>
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex justify-center">
                        <PctBadge pct={session.attendancePct} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;
