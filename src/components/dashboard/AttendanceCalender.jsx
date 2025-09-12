import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  CheckCircle,
  XCircle,
  CalendarX,
  CalendarCheck2,
  UserRoundCheck,
  CalendarDays,
  BookOpen,
} from "lucide-react";
import "tailwindcss/tailwind.css";

const localizer = momentLocalizer(moment);

const events = [
  {
    title: "Math Class",
    start: new Date(2025, 1, 12, 10, 0),
    end: new Date(2025, 1, 12, 11, 45),
    status: "attended",
  },
  {
    title: "Maths Class",
    start: new Date(2025, 1, 14, 10, 0),
    end: new Date(2025, 1, 14, 11, 45),
    status: "attended",
  },
  {
    title: "Science Class",
    start: new Date(2025, 1, 14, 14, 0),
    end: new Date(2025, 1, 14, 16, 0),
    status: "missed",
  },
  {
    title: "Holiday",
    start: new Date(2025, 1, 15, 0, 0),
    end: new Date(2025, 1, 15, 23, 59),
    status: "holiday",
  },
  {
    title: "Assignment Submission",
    start: new Date(2025, 1, 16),
    end: new Date(2025, 1, 16),
    status: "assignment",
  },
  {
    title: "Upcoming Physics Class",
    start: new Date(2025, 1, 18, 9, 0),
    end: new Date(2025, 1, 18, 10, 0),
    status: "upcoming",
  },
  {
    title: "English Class",
    start: new Date(2025, 1, 20, 11, 0),
    end: new Date(2025, 1, 20, 12, 0),
    status: "attended",
  },
];

const getEventStyle = (event) => {
  let style = {
    borderRadius: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    border: "none",
    width: "100%",
    margin: "",
  };

  switch (event.status) {
    case "attended":
      style.backgroundColor = "#4CcF50bb"; // Modern green

      break;
    case "missed":
      style.backgroundColor = "#FF3B30dd"; // Modern red
      break;
    case "holiday":
      style.backgroundColor = "#A1A1AAaa"; // Modern grey
      break;
    case "assignment":
      style.backgroundColor = "#F59E0B99"; // Modern orange
      break;
    case "upcoming":
      style.backgroundColor = "#3B82F6"; // Modern blue
      break;
    default:
      style.backgroundColor = "#6B7280";
      style.minHeight = "10px";
  }
  return { style };
};

const analyticsData = {
  total: 20,
  attended: 12,
  missed: 5,
  upcoming: 3,
};

const CalendarComponent = () => {
  const analyticsData = {
    attended: 24,
    missed: 6,
    upcoming: 10,
    total: 40,
  };
  return (
    <div className="container mx-auto p-4 ">
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 ">
        <div className="p-4 border rounded-lg shadow-lg bg-white order-2">
          <h1 className="text-4xl font-bold  mb-4">
            Class & Attendance Tracker
          </h1>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            eventPropGetter={getEventStyle}
          />
        </div>
        <div className="p-8 border rounded-2xl bg-gradient-to-br from-white to-gray-100 shadow-md w-full max-w-7xl mx-auto">
          <h2 className="text-4xl font-semibold text-center mb-8 text-gray-900 flex items-center justify-between gap-4">
            <span className="flex items-center gap-4 text-gray-700">
              <UserRoundCheck size={40} className="text-blue-600" /> Attendance
              Stats
            </span>
            <span className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-lg font-bold shadow-md">
              60%
            </span>
          </h2>

          <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-6 text-center">
            <div className="p-6 rounded-xl shadow-md flex flex-col justify-center bg-gradient-to-br from-green-100 to-green-50">
              <p className="flex gap-2 justify-center ">
                <CheckCircle size={36} className="text-green-600  mb-2" />
                <p className="text-2xl font-bold text-green-700">
                  {analyticsData.attended}
                </p>
              </p>
              <p className="text-gray-600">Attended</p>
            </div>
            <div className="p-6 rounded-xl shadow-md flex flex-col justify-center bg-gradient-to-br from-red-100 to-red-50">
              <p className="flex gap-2 justify-center ">
                <XCircle size={36} className="text-red-600  mb-2" />
                <p className="text-2xl font-bold text-red-700">
                  {analyticsData.missed}
                </p>
              </p>
              <p className="text-gray-600">Missed</p>
            </div>
            <div className="p-6 rounded-xl shadow-md flex flex-col justify-center bg-gradient-to-br from-blue-100 to-blue-50">
              <p className="flex gap-2 justify-center ">
                <CalendarDays size={36} className="text-blue-600  mb-2" />
                <p className="text-2xl font-bold text-blue-700">
                  {analyticsData.upcoming}
                </p>
              </p>
              <p className="text-gray-600">Upcoming</p>
            </div>
            <div className="p-6 rounded-xl shadow-md flex flex-col justify-center bg-gradient-to-br from-gray-200 to-gray-100">
              <p className="flex gap-2 justify-center ">
                <BookOpen size={36} className="text-gray-800  mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.total}
                </p>
              </p>
              <p className="text-gray-600">Total Classes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;
