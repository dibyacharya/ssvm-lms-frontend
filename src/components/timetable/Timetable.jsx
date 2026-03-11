import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  Grid3X3,
  Clock,
  MapPin,
  BookOpen,
  Video,
} from "lucide-react";
import DashboardBanner from "../../pages/StudentDashboard/Components/DashboardBanner";
import WeeklyTimetableGrid from "./WeeklyTimetableGrid";
import ClassDetailModal from "./ClassDetailModal";
import { getMyTimetable } from "../../services/timetable.service";
import {
  getWeekStartMonday,
  getWeekDates,
  formatDateDisplay,
  formatDateKey,
  formatTime,
  getDayLabel,
  getDayOfWeekKey,
  getCourseColor,
} from "../../utils/timetableUtils";
import LoadingSpinner from "../../utils/LoadingAnimation";

/** Determine class status relative to current time */
const getListClassStatus = (entry) => {
  if (entry.status === "cancelled") return "cancelled";
  const now = new Date();
  const start = new Date(entry.instanceStart);
  const end = new Date(entry.instanceEnd);
  if (now > end) return "ended";
  if (now >= start && now <= end) return "live";
  const tenMinBefore = new Date(start.getTime() - 10 * 60 * 1000);
  if (now >= tenMinBefore && now < start) return "starting_soon";
  return "upcoming";
};

const Timetable = () => {
  const [currentMonday, setCurrentMonday] = useState(() =>
    getWeekStartMonday(new Date())
  );
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [viewMode, setViewMode] = useState("week"); // "week" | "list"

  const weekDates = useMemo(
    () => getWeekDates(currentMonday),
    [currentMonday]
  );

  const weekEnd = useMemo(() => {
    const sunday = new Date(currentMonday);
    sunday.setDate(sunday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return sunday;
  }, [currentMonday]);

  const fetchTimetable = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyTimetable(
        currentMonday.toISOString(),
        weekEnd.toISOString()
      );
      setEntries(data.entries || []);
    } catch (error) {
      console.error("Error fetching timetable:", error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [currentMonday, weekEnd]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  const goToPrevWeek = () => {
    setCurrentMonday((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const goToNextWeek = () => {
    setCurrentMonday((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const goToToday = () => {
    setCurrentMonday(getWeekStartMonday(new Date()));
  };

  const isCurrentWeek =
    formatDateKey(currentMonday) ===
    formatDateKey(getWeekStartMonday(new Date()));

  // Week label
  const weekLabel = `${formatDateDisplay(weekDates[0])} – ${formatDateDisplay(
    weekDates[5]
  )}, ${weekDates[0]?.getFullYear()}`;

  // Group entries by day for list view
  const entriesByDay = useMemo(() => {
    const map = {};
    // Initialize Mon-Sat
    for (let i = 0; i < 6; i++) {
      const dk = formatDateKey(weekDates[i]);
      map[dk] = { date: weekDates[i], entries: [] };
    }
    for (const entry of entries) {
      const dk = formatDateKey(new Date(entry.instanceStart));
      if (map[dk]) {
        map[dk].entries.push(entry);
      }
    }
    // Sort entries within each day
    for (const dk in map) {
      map[dk].entries.sort(
        (a, b) => new Date(a.instanceStart) - new Date(b.instanceStart)
      );
    }
    return map;
  }, [entries, weekDates]);

  // Course legend
  const uniqueCourses = useMemo(() => {
    const seen = new Map();
    for (const entry of entries) {
      if (!seen.has(entry.courseCode)) {
        seen.set(entry.courseCode, {
          courseCode: entry.courseCode,
          courseTitle: entry.courseTitle,
        });
      }
    }
    return Array.from(seen.values());
  }, [entries]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <DashboardBanner
          icon={CalendarIcon}
          title="Timetable"
          subtitle="Your weekly class schedule"
          gradient="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-500"
        />

        {/* Controls Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Week Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevWeek}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Previous week"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              <button
                onClick={goToToday}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isCurrentWeek
                    ? "bg-accent1 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Today
              </button>

              <button
                onClick={goToNextWeek}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Next week"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              <span className="text-sm font-semibold text-gray-900 dark:text-white ml-2">
                {weekLabel}
              </span>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("week")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "week"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                Week
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
            </div>
          </div>
        </div>

        {/* Course Legend */}
        {uniqueCourses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {uniqueCourses.map((course) => {
              const color = getCourseColor(course.courseCode);
              return (
                <div
                  key={course.courseCode}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color.bg} ${color.text} border ${color.border}`}
                >
                  <span className={`w-2 h-2 rounded-full ${color.dot}`} />
                  {course.courseCode}
                </div>
              );
            })}
          </div>
        )}

        {/* Content */}
        {viewMode === "week" ? (
          <WeeklyTimetableGrid
            entries={entries}
            weekDates={weekDates}
            onEntryClick={setSelectedEntry}
            loading={loading}
          />
        ) : (
          /* List View */
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner />
              </div>
            ) : entries.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                <CalendarIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                  No classes scheduled
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  There are no classes scheduled for this week.
                </p>
              </div>
            ) : (
              Object.entries(entriesByDay).map(([dk, dayData]) => {
                const dayKey = getDayOfWeekKey(dayData.date);
                const todayKey = formatDateKey(new Date());
                const isToday = dk === todayKey;

                return (
                  <div
                    key={dk}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border overflow-hidden ${
                      isToday
                        ? "border-accent1/50 dark:border-accent1/30"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {/* Day Header */}
                    <div
                      className={`px-5 py-3 border-b ${
                        isToday
                          ? "bg-accent1/10 dark:bg-accent1/20 border-accent1/20"
                          : "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              isToday
                                ? "text-accent1"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {getDayLabel(dayKey)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDateDisplay(dayData.date)}
                          </span>
                          {isToday && (
                            <span className="text-[10px] bg-accent1 text-white px-1.5 py-0.5 rounded-full font-medium">
                              Today
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {dayData.entries.length} class
                          {dayData.entries.length !== 1 ? "es" : ""}
                        </span>
                      </div>
                    </div>

                    {/* Entries */}
                    {dayData.entries.length === 0 ? (
                      <div className="px-5 py-4 text-sm text-gray-400 dark:text-gray-500 italic">
                        No classes
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {dayData.entries.map((entry) => {
                          const color = getCourseColor(entry.courseCode);
                          const isCancelled = entry.status === "cancelled";
                          const listStatus = getListClassStatus(entry);

                          return (
                            <button
                              key={entry.instanceId}
                              onClick={() => setSelectedEntry(entry)}
                              className={`w-full px-5 py-3 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left ${
                                listStatus === "live"
                                  ? "bg-green-50/50 dark:bg-green-900/10"
                                  : ""
                              }`}
                            >
                              {/* Color dot or live pulse */}
                              <div className="relative flex-shrink-0">
                                {listStatus === "live" ? (
                                  <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
                                  </span>
                                ) : (
                                  <div
                                    className={`w-3 h-3 rounded-full ${color.dot}`}
                                  />
                                )}
                              </div>

                              {/* Time */}
                              <div className="w-28 flex-shrink-0">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-gray-400" />
                                  <span
                                    className={`text-sm font-medium ${
                                      isCancelled
                                        ? "line-through text-gray-400"
                                        : listStatus === "ended"
                                        ? "text-gray-400 dark:text-gray-500"
                                        : "text-gray-900 dark:text-white"
                                    }`}
                                  >
                                    {formatTime(new Date(entry.instanceStart))}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                                  {formatTime(new Date(entry.instanceEnd))}
                                </span>
                              </div>

                              {/* Course info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-sm font-bold ${color.text}`}
                                  >
                                    {entry.courseCode}
                                  </span>
                                  {listStatus === "live" && (
                                    <span className="text-[10px] bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full font-medium">
                                      LIVE
                                    </span>
                                  )}
                                  {listStatus === "starting_soon" && (
                                    <span className="text-[10px] bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded-full font-medium">
                                      Soon
                                    </span>
                                  )}
                                  {isCancelled && (
                                    <span className="text-[10px] bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full">
                                      Cancelled
                                    </span>
                                  )}
                                  {listStatus === "ended" && !isCancelled && (
                                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                      Ended
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                  {entry.courseTitle}
                                </p>
                              </div>

                              {/* Room / Teacher / Virtual icon */}
                              <div className="flex items-center gap-3 flex-shrink-0">
                                {entry.vconfJoinUrl &&
                                  (listStatus === "live" ||
                                    listStatus === "starting_soon") && (
                                    <Video className="w-4 h-4 text-accent1 flex-shrink-0" />
                                  )}
                                {entry.roomNumber && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                    <MapPin className="w-3 h-3" />
                                    {entry.roomNumber}
                                  </div>
                                )}
                                {entry.teacherName && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                                    {entry.teacherName}
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Class Detail Modal */}
        {selectedEntry && (
          <ClassDetailModal
            entry={selectedEntry}
            onClose={() => setSelectedEntry(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Timetable;
