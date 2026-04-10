import React, { useMemo } from "react";
import {
  X,
  Clock,
  MapPin,
  User,
  BookOpen,
  Video,
  Monitor,
  Building,
  AlertCircle,
  CheckCircle2,
  Timer,
  Ban,
} from "lucide-react";
import { formatTime, getCourseColor } from "../../utils/timetableUtils";

/**
 * Determine class status relative to current time.
 * Returns: "upcoming" | "starting_soon" | "live" | "ended" | "cancelled"
 *
 * starting_soon = within 5 minutes before start time
 * live          = between start and end time
 */
const getClassStatus = (entry) => {
  if (entry.status === "cancelled") return "cancelled";

  const now = new Date();
  const start = new Date(entry.instanceStart);
  const end = new Date(entry.instanceEnd);

  // Class has ended
  if (now > end) return "ended";

  // Class is currently live
  if (now >= start && now <= end) return "live";

  // Starting within 5 minutes — join button enables 5 min before class
  const fiveMinBefore = new Date(start.getTime() - 5 * 60 * 1000);
  if (now >= fiveMinBefore && now < start) return "starting_soon";

  return "upcoming";
};

const STATUS_CONFIG = {
  live: {
    label: "Live Now",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    classes:
      "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
    pulse: true,
  },
  starting_soon: {
    label: "Starting Soon",
    icon: <Timer className="w-3.5 h-3.5" />,
    classes:
      "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
    pulse: false,
  },
  upcoming: {
    label: "Upcoming",
    icon: <Clock className="w-3.5 h-3.5" />,
    classes:
      "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
    pulse: false,
  },
  ended: {
    label: "Ended",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    classes:
      "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-300",
    pulse: false,
  },
  cancelled: {
    label: "Cancelled",
    icon: <Ban className="w-3.5 h-3.5" />,
    classes:
      "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-600 border border-red-200 dark:border-red-800",
    pulse: false,
  },
};

const ClassDetailModal = ({ entry, onClose }) => {
  if (!entry) return null;

  const color = getCourseColor(entry.courseCode);
  const startTime = formatTime(new Date(entry.instanceStart));
  const endTime = formatTime(new Date(entry.instanceEnd));

  const classStatus = useMemo(() => getClassStatus(entry), [entry]);
  const statusConfig = STATUS_CONFIG[classStatus];

  // Can join: only when class is live or starting soon (within 5 min)
  const canJoin =
    entry.vconfJoinUrl &&
    (entry.mode || "").toLowerCase() !== "offline" &&
    (entry.mode || "").toLowerCase() !== "physical" &&
    (classStatus === "live" || classStatus === "starting_soon");

  // Has virtual link but can't join yet (upcoming)
  const hasVirtualLink =
    entry.vconfJoinUrl &&
    (entry.mode || "").toLowerCase() !== "offline" &&
    (entry.mode || "").toLowerCase() !== "physical";

  const startDate = new Date(entry.instanceStart);
  const dateStr = startDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Time until class starts (for upcoming classes)
  const getTimeUntilStart = () => {
    const now = new Date();
    const start = new Date(entry.instanceStart);
    const diffMs = start - now;
    if (diffMs <= 0) return null;

    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHr = Math.floor(diffMin / 60);
    const remainMin = diffMin % 60;

    if (diffHr > 24) {
      const days = Math.floor(diffHr / 24);
      return `Starts in ${days} day${days > 1 ? "s" : ""}`;
    }
    if (diffHr > 0) {
      return `Starts in ${diffHr}h ${remainMin}m`;
    }
    return `Starts in ${diffMin} minute${diffMin !== 1 ? "s" : ""}`;
  };

  const getModeIcon = () => {
    const mode = (entry.mode || "").toLowerCase();
    if (mode === "online" || mode === "virtual")
      return <Video className="w-4 h-4" />;
    if (mode === "offline" || mode === "physical")
      return <Building className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const getModeLabel = () => {
    const mode = (entry.mode || "").toLowerCase();
    if (mode === "online" || mode === "virtual") return "Online";
    if (mode === "offline" || mode === "physical") return "Offline";
    if (mode === "hybrid") return "Hybrid";
    return mode || "N/A";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-50/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Colored header */}
        <div className={`px-5 py-3 ${color.bg} border-b ${color.border}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <BookOpen className={`w-4 h-4 ${color.text}`} />
                <span
                  className={`text-sm font-bold ${color.text} uppercase tracking-wide`}
                >
                  {entry.courseCode}
                </span>
                {/* Status badge */}
                <span
                  className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${statusConfig.classes}`}
                >
                  {statusConfig.pulse && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                    </span>
                  )}
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
              </div>
              <h3
                className={`text-base font-semibold mt-1 ${
                  classStatus === "cancelled"
                    ? "line-through text-gray-500"
                    : "text-gray-900 dark:text-gray-900"
                }`}
              >
                {entry.courseTitle}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/30 dark:hover:bg-black/20 transition-colors ml-2"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          {/* Date */}
          <p className="text-sm text-gray-600 dark:text-gray-400">{dateStr}</p>

          {/* Time */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-900">
                {startTime} – {endTime}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
            </div>
          </div>

          {/* Teacher */}
          {entry.teacherName && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-900">
                  {entry.teacherName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Instructor
                </p>
              </div>
            </div>
          )}

          {/* Mode */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              {getModeIcon()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-900">
                {getModeLabel()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Mode</p>
            </div>
          </div>

          {/* Room */}
          {entry.roomNumber && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-orange-900/30 flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-900">
                  {entry.roomNumber}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Room
                </p>
              </div>
            </div>
          )}

          {/* Virtual Class Join Section */}
          {hasVirtualLink && (
            <div className="pt-2 space-y-2">
              {canJoin ? (
                /* Class is live or starting soon — show active join button */
                <a
                  href={entry.vconfJoinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent1 hover:bg-accent1/90 text-gray-900 rounded-lg font-medium text-sm transition-colors shadow-sm"
                >
                  <Video className="w-4 h-4" />
                  {classStatus === "live"
                    ? "Join Live Class"
                    : "Join Virtual Class"}
                </a>
              ) : classStatus === "upcoming" ? (
                /* Class is upcoming — show disabled state with countdown */
                <div className="space-y-2">
                  <button
                    disabled
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg font-medium text-sm cursor-not-allowed"
                  >
                    <Video className="w-4 h-4" />
                    Join Virtual Class
                  </button>
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    <Timer className="w-3 h-3 inline-block mr-1 -mt-0.5" />
                    {getTimeUntilStart() ||
                      "Join will be available 10 minutes before class starts"}
                  </p>
                </div>
              ) : classStatus === "ended" ? (
                /* Class has ended */
                <div className="text-center">
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    This class has ended. Virtual meeting is no longer available.
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {/* Source badge */}
          <div className="pt-1">
            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Source:{" "}
              {entry.source === "weeklySchedule"
                ? "Weekly Schedule"
                : "Scheduled Class"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassDetailModal;
