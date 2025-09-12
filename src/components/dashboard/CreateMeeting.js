import React, { useEffect, useState, useMemo } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  FaVideo,
  FaClock,
  FaUserTie,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaUsers,
} from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import { useMeeting } from "../../context/MeetingContext";

// Set up the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

// --- Child Components (Enhanced with Dark Mode) ---
const EventComponent = ({ event }) => (
  <div
    className="flex items-center h-full p-1 overflow-hidden"
    style={{
      backgroundColor: event.color,
      borderLeft: `4px solid ${event.color}`,
    }}
    data-tooltip-id={`tooltip-${event._id}`}
  >
    <span className="text-white text-sm font-medium truncate">
      {event.subject}
    </span>
  </div>
);

const SubjectMeeting = ({ meeting, onJoin }) => (
  <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 hover:shadow-md dark:hover:shadow-lg transition-shadow duration-300">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">{meeting.subject}</h2>
        <p className="text-gray-500 dark:text-gray-300 text-sm mt-1">{meeting.description}</p>
      </div>
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: meeting.color }}
      ></div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="flex items-center text-gray-600 dark:text-gray-300">
        <FaUserTie className="mr-2 text-gray-400 dark:text-gray-500" />
        <span>{meeting.instructor}</span>
      </div>
      <div className="flex items-center text-gray-600 dark:text-gray-300">
        <FaClock className="mr-2 text-gray-400 dark:text-gray-500" />
        <span>
          {moment(meeting.start).format("h:mm A")} -{" "}
          {moment(meeting.end).format("h:mm A")}
        </span>
      </div>
      <div className="flex items-center text-gray-600 dark:text-gray-300">
        <FaCalendarAlt className="mr-2 text-gray-400 dark:text-gray-500" />
        <span>{moment(meeting.date).format("dddd, MMMM D, YYYY")}</span>
      </div>
      <div className="flex items-center text-gray-600 dark:text-gray-300">
        <FaChalkboardTeacher className="mr-2 text-gray-400 dark:text-gray-500" />
        <span>{meeting.roomNumber}</span>
      </div>
      <div className="flex items-center text-gray-600 dark:text-gray-300">
        <FaUsers className="mr-2 text-gray-400 dark:text-gray-500" />
        <span>{meeting.participants} participants</span>
      </div>
    </div>
    <a
      href={meeting.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full bg-accent1 dark:bg-blue-600 hover:bg-emerald-700 dark:hover:bg-blue-500 text-white py-3 px-4 rounded-lg text-center font-medium transition-colors duration-300 mt-2"
      onClick={(e) => {
        e.preventDefault();
        onJoin(meeting);
      }}
    >
      <div className="flex items-center justify-center">
        <FaVideo className="mr-2" />
        Join Meeting
      </div>
    </a>
  </div>
);

// --- Main Component ---
const CreateMeeting = () => {
  // Get meetings, loading status, and error state from the context
  const { meetings, loading, error } = useMeeting();
  console.log("meetings",meetings);
  

  // Local UI state for view, selected date, and modal
  const [view, setView] = useState("cards"); // 'calendar' or 'cards'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  // Process meetings from context into a format for the calendar
  // useMemo prevents reprocessing on every render, improving performance
  const processedMeetings = useMemo(() => {
    return meetings.map((meeting) => ({
      ...meeting,
      date: new Date(meeting.date),
      start: new Date(meeting.start),
      end: new Date(meeting.end),
    }));
  }, [meetings]);

  // Filter meetings for the selected date when in "List View"
  const filteredMeetings =
    view === "cards"
      ? processedMeetings.filter(
          (meeting) =>
            moment(meeting.start).format("YYYY-MM-DD") ===
            moment(selectedDate).format("YYYY-MM-DD")
        )
      : processedMeetings;

  const handleSelectEvent = (event) => {
    setSelectedMeeting(event);
  };

  const handleNavigate = (date) => {
    setSelectedDate(date);
  };

  const handleJoinMeeting = (meeting) => {
    window.open(meeting.link, "_blank");
  };

  // Format meetings for react-big-calendar's `events` prop
  const calendarEvents = processedMeetings.map((meeting) => ({
    ...meeting,
    title: meeting.subject,
  }));

  const calendarComponents = {
    event: EventComponent,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary dark:border-blue-400 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading meetings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 dark:text-red-400 bg-gray-50 dark:bg-gray-900">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header and View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Class Meetings Calendar
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Schedule and join your virtual classroom sessions
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-1 flex">
            <button
              className={`px-4 py-2 rounded transition-colors duration-200 ${
                view === "calendar"
                  ? "bg-accent1 dark:bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => setView("calendar")}
            >
              Calendar View
            </button>
            <button
              className={`px-4 py-2 rounded transition-colors duration-200 ${
                view === "cards"
                  ? "bg-accent1 dark:bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => setView("cards")}
            >
              List View
            </button>
          </div>
        </div>

        {/* Conditional Rendering based on view state */}
        {view === "calendar" ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-600">
            <div style={{ height: 600 }} className="calendar-container dark:calendar-dark">
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                views={["month", "week", "day"]}
                defaultView="day"
                selectable
                onSelectEvent={handleSelectEvent}
                onNavigate={handleNavigate}
                components={calendarComponents}
                eventPropGetter={(event) => ({
                  style: {
                    backgroundColor: event.color,
                  },
                })}
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-6 border border-gray-100 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200"
                  onClick={() =>
                    setSelectedDate(
                      moment(selectedDate).subtract(1, "days").toDate()
                    )
                  }
                >
                  &larr; Previous Day
                </button>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {moment(selectedDate).format("dddd, MMMM D, YYYY")}
                </h2>
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200"
                  onClick={() =>
                    setSelectedDate(
                      moment(selectedDate).add(1, "days").toDate()
                    )
                  }
                >
                  Next Day &rarr;
                </button>
              </div>
            </div>

            {filteredMeetings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMeetings.map((meeting) => (
                  <SubjectMeeting
                    key={meeting._id}
                    meeting={meeting}
                    onJoin={handleJoinMeeting}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-sm text-center border border-gray-100 dark:border-gray-600">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No meetings scheduled for this day.
                </p>
                <button
                  className="mt-4 bg-accent1 dark:bg-blue-600 hover:bg-emerald-700 dark:hover:bg-blue-500 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Return to Today
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tooltip for calendar events */}
      {processedMeetings.map((meeting) => (
        <Tooltip
          key={meeting._id}
          id={`tooltip-${meeting._id}`}
          place="top"
          style={{
            backgroundColor: 'var(--tooltip-bg)',
            color: 'var(--tooltip-text)',
            border: '1px solid var(--tooltip-border)',
            borderRadius: '8px',
            fontSize: '14px',
            maxWidth: '300px',
            zIndex: 1000
          }}
          content={
            <div className="p-2 max-w-xs">
              <div className="font-bold mb-1">{meeting.subject}</div>
              <div className="text-sm">{meeting.instructor}</div>
              <div className="text-sm">
                {moment(meeting.start).format("h:mm A")} -{" "}
                {moment(meeting.end).format("h:mm A")}
              </div>
              <div className="text-sm mt-1">{meeting.description}</div>
            </div>
          }
        />
      ))}

      {/* Modal for selected meeting details */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-600 shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {selectedMeeting.subject}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{selectedMeeting.description}</p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <FaUserTie className="mr-2 text-gray-400 dark:text-gray-500" />
                <span>{selectedMeeting.instructor}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <FaClock className="mr-2 text-gray-400 dark:text-gray-500" />
                <span>
                  {moment(selectedMeeting.start).format("h:mm A")} -{" "}
                  {moment(selectedMeeting.end).format("h:mm A")}
                </span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <FaChalkboardTeacher className="mr-2 text-gray-400 dark:text-gray-500" />
                <span>{selectedMeeting.roomNumber}</span>
              </div>
            </div>
            <div className="flex space-x-2 mt-6">
              <button
                className="flex-1 bg-accent1 dark:bg-blue-600 hover:bg-emerald-700 dark:hover:bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-200"
                onClick={() => window.open(selectedMeeting.link, "_blank")}
              >
                <FaVideo className="mr-2" />
                Join Meeting
              </button>
              <button
                className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg transition-colors duration-200"
                onClick={() => setSelectedMeeting(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Variables for Tooltip and Calendar Dark Mode */}
      <style jsx global>{`
        :root {
          --tooltip-bg: white;
          --tooltip-border: #e5e7eb;
          --tooltip-text: #374151;
        }
        
        .dark {
          --tooltip-bg: #374151;
          --tooltip-border: #4b5563;
          --tooltip-text: #f3f4f6;
        }
        
        /* Dark mode styles for react-big-calendar */
        .dark .calendar-dark .rbc-calendar {
          background-color: #374151;
          color: #f3f4f6;
        }
        
        .dark .calendar-dark .rbc-header {
          background-color: #4b5563;
          border-color: #6b7280;
          color: #f3f4f6;
        }
        
        .dark .calendar-dark .rbc-month-view,
        .dark .calendar-dark .rbc-time-view {
          background-color: #374151;
          border-color: #6b7280;
        }
        
        .dark .calendar-dark .rbc-day-bg {
          background-color: #374151;
          border-color: #6b7280;
        }
        
        .dark .calendar-dark .rbc-off-range-bg {
          background-color: #4b5563;
        }
        
        .dark .calendar-dark .rbc-today {
          background-color: #1f2937;
        }
        
        .dark .calendar-dark .rbc-toolbar {
          color: #f3f4f6;
        }
        
        .dark .calendar-dark .rbc-toolbar button {
          background-color: #4b5563;
          border-color: #6b7280;
          color: #f3f4f6;
        }
        
        .dark .calendar-dark .rbc-toolbar button:hover {
          background-color: #6b7280;
        }
        
        .dark .calendar-dark .rbc-toolbar button.rbc-active {
          background-color: #3b82f6;
          border-color: #3b82f6;
        }
        
        .dark .calendar-dark .rbc-time-slot {
          border-color: #6b7280;
        }
        
        .dark .calendar-dark .rbc-timeslot-group {
          border-color: #6b7280;
        }
        
        .dark .calendar-dark .rbc-time-header-content {
          background-color: #4b5563;
          border-color: #6b7280;
        }
        
        .dark .calendar-dark .rbc-time-content {
          border-color: #6b7280;
        }
        
        .dark .calendar-dark .rbc-allday-cell {
          background-color: #4b5563;
          border-color: #6b7280;
        }
        
        .dark .calendar-dark .rbc-row {
          border-color: #6b7280;
        }
        
        .dark .calendar-dark .rbc-date-cell {
          color: #f3f4f6;
        }
        
        .dark .calendar-dark .rbc-button-link {
          color: #93c5fd;
        }
        
        .dark .calendar-dark .rbc-show-more {
          color: #93c5fd;
        }
      `}</style>
    </div>
  );
};

export default CreateMeeting;