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
import { CalendarDays } from "lucide-react";

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

  // Current hour for the "now" indicator line
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const nowLinePercent =
    currentHour >= 8 && currentHour <= 18
      ? ((currentHour - 8) / 10) * 100
      : null;

  return (
    <div className="bg-white dark:bg-white rounded-xl shadow-md border border-gray-200 dark:border-gray-200 overflow-hidden">
      {/* Header row with day names */}
      <div className="grid grid-cols-[56px_repeat(6,1fr)] border-b border-gray-200 dark:border-gray-200 bg-gray-50 dark:bg-gray-50/40">
        {/* Time column header */}
        <div className="px-1 py-3 text-[10px] font-semibold text-gray-400 dark:text-gray-500 text-center border-r border-gray-200 dark:border-gray-200 uppercase tracking-wider">
          Time
        </div>
        {displayDays.map((date) => {
          const dk = formatDateKey(date);
          const dayKey = getDayOfWeekKey(date);
          const isToday = dk === todayKey;
          return (
            <div
              key={dk}
              className={`px-1 py-3 text-center border-r border-gray-200 dark:border-gray-200 last:border-r-0 relative transition-colors ${
                isToday
                  ? "bg-blue-50 dark:bg-blue-900/25"
                  : ""
              }`}
            >
              {/* Today pill indicator */}
              {isToday && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[3px] rounded-b-full bg-blue-500" />
              )}
              <p
                className={`text-xs font-bold tracking-wide ${
                  isToday
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-700"
                }`}
              >
                {getDayShortLabel(dayKey)}
              </p>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <p
                  className={`text-[10px] font-medium ${
                    isToday
                      ? "text-blue-500 dark:text-blue-400"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {formatDateDisplay(date)}
                </p>
                {isToday && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-blue-500 text-gray-900 px-1.5 py-0.5 rounded-full leading-none">
                    TODAY
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid body */}
      <div className="grid grid-cols-[56px_repeat(6,1fr)]" style={{ minHeight: "460px" }}>
        {/* Time labels column */}
        <div className="border-r border-gray-200 dark:border-gray-200 relative bg-gray-50/50 dark:bg-gray-50/20">
          {HOUR_SLOTS.map((hour) => (
            <div
              key={hour}
              className="border-b border-gray-100 dark:border-gray-200/50 flex items-start justify-center"
              style={{ height: `${100 / 10}%` }}
            >
              <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 pt-1 leading-none tabular-nums">
                {hour <= 12 ? hour : hour - 12}
                <span className="text-[8px] ml-[1px]">{hour < 12 ? "AM" : "PM"}</span>
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
              className={`border-r border-gray-200 dark:border-gray-200 last:border-r-0 relative transition-colors ${
                isToday
                  ? "bg-blue-50/60 dark:bg-blue-900/10"
                  : "hover:bg-gray-50/50 dark:hover:bg-white/50"
              }`}
            >
              {/* Today's left & right accent borders */}
              {isToday && (
                <>
                  <div className="absolute inset-y-0 left-0 w-[2px] bg-blue-400/40 z-[5]" />
                  <div className="absolute inset-y-0 right-0 w-[2px] bg-blue-400/40 z-[5]" />
                </>
              )}

              {/* Hour grid lines */}
              {HOUR_SLOTS.map((hour) => (
                <div
                  key={hour}
                  className={`border-b ${
                    isToday
                      ? "border-blue-100 dark:border-blue-900/30"
                      : "border-gray-100 dark:border-gray-200/50"
                  }`}
                  style={{ height: `${100 / 10}%` }}
                />
              ))}

              {/* "Now" indicator line (only for today) */}
              {isToday && nowLinePercent !== null && (
                <div
                  className="absolute left-0 right-0 z-20 flex items-center"
                  style={{ top: `${nowLinePercent}%` }}
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shadow-sm shadow-red-500/50" />
                  <div className="flex-1 h-[2px] bg-red-500/70 shadow-sm shadow-red-500/30" />
                </div>
              )}

              {/* Entry blocks positioned absolutely */}
              {dayEntries.map((entry) => {
                const style = getEntryStyle(entry);
                const color = getCourseColor(entry.courseCode);
                const isCancelled = entry.status === "cancelled";

                return (
                  <button
                    key={entry.instanceId}
                    onClick={() => onEntryClick?.(entry)}
                    className={`absolute left-1 right-1 rounded-lg px-1.5 py-1 text-left overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.03] hover:z-30 border ${
                      color.bg
                    } ${color.border} ${
                      isCancelled ? "opacity-40 line-through" : "shadow-sm"
                    }`}
                    style={{
                      top: style.top,
                      height: style.height,
                      minHeight: "24px",
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

              {/* Empty state for today if no classes */}
              {isToday && dayEntries.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center opacity-40">
                    <CalendarDays className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                    <p className="text-[10px] text-blue-500 font-medium">No classes today</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyTimetableGrid;
