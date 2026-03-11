import React, { useMemo } from "react";
import {
  getDayOfWeekKey,
  getDayShortLabel,
  formatDateDisplay,
  formatDateKey,
  formatTime,
  getCourseColor,
} from "../../utils/timetableUtils";
import LoadingSpinner from "../../utils/LoadingAnimation";

// Time slots from 8 AM to 6 PM (hour labels on the left)
const HOUR_SLOTS = Array.from({ length: 11 }, (_, i) => i + 8); // 8..18

const WeeklyTimetableGrid = ({ entries = [], weekDates = [], onEntryClick, loading }) => {
  // Only show Mon–Sat (first 6 days)
  const displayDays = weekDates.slice(0, 6);

  const todayKey = formatDateKey(new Date());

  // Group entries by day key for fast lookup
  const entriesByDay = useMemo(() => {
    const map = {};
    for (const entry of entries) {
      const d = new Date(entry.instanceStart);
      const dk = formatDateKey(d);
      if (!map[dk]) map[dk] = [];
      map[dk].push(entry);
    }
    return map;
  }, [entries]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  // Compute where to position an entry block
  const getEntryStyle = (entry) => {
    const start = new Date(entry.instanceStart);
    const end = new Date(entry.instanceEnd);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const gridStart = 8; // 8 AM
    const topPercent = ((startHour - gridStart) / 10) * 100; // 10 hours total (8-18)
    const heightPercent = ((endHour - startHour) / 10) * 100;
    return {
      top: `${Math.max(0, topPercent)}%`,
      height: `${Math.max(2, heightPercent)}%`,
    };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header row with day names */}
      <div className="grid grid-cols-[50px_repeat(6,1fr)] border-b border-gray-200 dark:border-gray-700">
        {/* Time column header */}
        <div className="px-1 py-2 text-[10px] font-medium text-gray-500 dark:text-gray-400 text-center border-r border-gray-200 dark:border-gray-700">
          Time
        </div>
        {displayDays.map((date) => {
          const dk = formatDateKey(date);
          const dayKey = getDayOfWeekKey(date);
          const isToday = dk === todayKey;
          return (
            <div
              key={dk}
              className={`px-1 py-2 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0 ${
                isToday
                  ? "bg-accent1/10 dark:bg-accent1/20"
                  : ""
              }`}
            >
              <p
                className={`text-xs font-semibold ${
                  isToday
                    ? "text-accent1"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {getDayShortLabel(dayKey)}
              </p>
              <p
                className={`text-[10px] ${
                  isToday
                    ? "text-accent1/80"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {formatDateDisplay(date)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Time grid body */}
      <div className="grid grid-cols-[50px_repeat(6,1fr)]" style={{ minHeight: "420px" }}>
        {/* Time labels column */}
        <div className="border-r border-gray-200 dark:border-gray-700 relative">
          {HOUR_SLOTS.map((hour) => (
            <div
              key={hour}
              className="border-b border-gray-100 dark:border-gray-700/50 flex items-start justify-center"
              style={{ height: `${100 / 10}%` }}
            >
              <span className="text-[10px] text-gray-500 dark:text-gray-400 pt-0.5 leading-none">
                {hour <= 12 ? hour : hour - 12}
                {hour < 12 ? "am" : "pm"}
              </span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {displayDays.map((date) => {
          const dk = formatDateKey(date);
          const isToday = dk === todayKey;
          const dayEntries = entriesByDay[dk] || [];

          return (
            <div
              key={dk}
              className={`border-r border-gray-200 dark:border-gray-700 last:border-r-0 relative ${
                isToday ? "bg-accent1/5 dark:bg-accent1/10" : ""
              }`}
            >
              {/* Hour grid lines */}
              {HOUR_SLOTS.map((hour) => (
                <div
                  key={hour}
                  className="border-b border-gray-100 dark:border-gray-700/50"
                  style={{ height: `${100 / 10}%` }}
                />
              ))}

              {/* Entry blocks positioned absolutely */}
              {dayEntries.map((entry) => {
                const style = getEntryStyle(entry);
                const color = getCourseColor(entry.courseCode);
                const isCancelled = entry.status === "cancelled";

                return (
                  <button
                    key={entry.instanceId}
                    onClick={() => onEntryClick?.(entry)}
                    className={`absolute left-0.5 right-0.5 rounded px-1 py-0.5 text-left overflow-hidden cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] border ${
                      color.bg
                    } ${color.border} ${
                      isCancelled ? "opacity-50 line-through" : ""
                    }`}
                    style={{
                      top: style.top,
                      height: style.height,
                      minHeight: "22px",
                      zIndex: 10,
                    }}
                    title={`${entry.courseCode} - ${entry.courseTitle}\n${formatTime(new Date(entry.instanceStart))} - ${formatTime(new Date(entry.instanceEnd))}`}
                  >
                    <p
                      className={`text-[10px] font-bold leading-none truncate ${color.text}`}
                    >
                      {entry.courseCode}
                    </p>
                    <p className="text-[9px] text-gray-600 dark:text-gray-400 leading-none truncate mt-0.5">
                      {formatTime(new Date(entry.instanceStart))} –{" "}
                      {formatTime(new Date(entry.instanceEnd))}
                    </p>
                    {entry.roomNumber && (
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 leading-none truncate mt-0.5">
                        📍 {entry.roomNumber}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyTimetableGrid;
