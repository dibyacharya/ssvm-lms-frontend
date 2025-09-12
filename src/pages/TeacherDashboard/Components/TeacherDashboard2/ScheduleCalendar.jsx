import React, { useMemo } from "react";
import { Video, Calendar as CalendarIcon } from "lucide-react";
import moment from "moment";

const ScheduleCalendar = ({ events = [] }) => {
  // --- DATA PROCESSING ---

  // Filters and sorts events for the current day
  const todaysEvents = useMemo(() => {
    const today = moment();
    return events
      .filter((event) => moment(event.start).isSame(today, "day"))
      .sort((a, b) => new Date(a.start) - new Date(b.start)); // Sort by time
  }, [events]);

  // Creates a set of dates with events for highlighting the calendar
  const eventDays = useMemo(() => {
    return new Set(events.map((event) => moment(event.start).format("YYYY-MM-DD")));
  }, [events]);

  // --- CALENDAR LOGIC ---

  const today = moment();
  const currentMonth = today.format("MMMM YYYY");
  const firstDayOfMonth = today.clone().startOf("month");
  const daysInMonth = today.daysInMonth();

  // Creates the grid array for the mini-calendar display
  const calendarGrid = useMemo(() => {
    const grid = [];
    // Add blank spaces for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth.day(); i++) {
      grid.push(null);
    }
    // Add the actual days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      grid.push(i);
    }
    return grid;
  }, [firstDayOfMonth, daysInMonth]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Today's Schedule Section (Now Clickable with Time Range) */}
      <div className="md:col-span-1 bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-gray-600">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Today's Schedule</h2>
        {todaysEvents.length > 0 ? (
          <div className="space-y-4">
            {todaysEvents.map((event) => (
              <a
                key={event._id}
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-primary/5 dark:bg-primary/10 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all border border-primary/10 dark:border-primary/20"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-lg">
                    <Video className="h-5 w-5 text-primary dark:text-primary/90" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                      {event.subject}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {event.roomNumber || "Online"}
                    </p>
                  </div>
                </div>
                <span className="text-primary/80 dark:text-primary/90 font-medium whitespace-nowrap text-sm">
                  {`${moment(event.start).format("h:mm A")} - ${moment(
                    event.end
                  ).format("h:mm A")}`}
                </span>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-500" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">No meetings scheduled for today.</p>
          </div>
        )}
      </div>

      {/* Calendar Section */}
      <div className="md:col-span-1 bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Calendar</h2>
          <span className="text-gray-600 dark:text-gray-300">{currentMonth}</span>
        </div>
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
          <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="py-2">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-sm bg-white dark:bg-gray-700">
            {calendarGrid.map((day, i) => {
              if (!day) return <div key={`blank-${i}`} />;

              const dateStr = today.clone().date(day).format("YYYY-MM-DD");
              const isToday = today.date() === day;
              const hasEvent = eventDays.has(dateStr);

              return (
                <div
                  key={day}
                  className={`py-2 text-center relative ${
                    isToday 
                      ? "bg-primary dark:bg-primary/90 text-white font-bold rounded-lg" 
                      : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                  }`}
                >
                  {day}
                  {hasEvent && !isToday && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 bg-primary dark:bg-primary/90 rounded-full"></span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Announcement Section */}
      <div className="md:col-span-1 bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-gray-600">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
          Welcome to DhammaNexus !
        </h2>
        <div className="w-full h-[300px]">
          <iframe
            className="rounded-lg w-full h-[300px] border border-gray-200 dark:border-gray-600"
            src="https://www.youtube.com/embed/vfDcYz7zJio"
            title="YouTube video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCalendar;