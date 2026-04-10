import React from "react";
import { useCourse } from "../../../../context/CourseContext";
import {
  Calendar,
  Clock,
  CalendarCheck,
  BookOpen,
  AlarmClock,
  FileClock,
} from "lucide-react";
import { getMidExamLabel, getEndExamLabel } from "../../../../utils/periodLabel";

const StudentClassSchedule = () => {
  const { courseData } = useCourse();

  const periodType =
    courseData?.semester?.periodType || courseData?.periodType || "semester";
  const midExamLabel = getMidExamLabel(periodType);
  const endExamLabel = getEndExamLabel(periodType);

  const schedule = courseData?.courseSchedule || {};
  const classDaysAndTimes = schedule?.classDaysAndTimes || [];

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Day color mapping — same as teacher's CourseSchedule
  const getDayColor = (day) => {
    const colors = {
      Monday: "bg-primary-50 text-gray-900-400 border-primary-500/20",
      Tuesday: "bg-primary-50 text-gray-900-400 border-primary-500/20",
      Wednesday: "bg-amber-50 text-amber-600 border-amber-500/20",
      Thursday: "bg-rose-500/10 text-rose-600 border-rose-500/20",
      Friday: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
      Saturday: "bg-primary-50 text-gray-900-400 border-primary-500/20",
      Sunday: "bg-blue-500/10 text-accent-600 border-blue-500/20",
    };
    return colors[day] || "bg-white/5 text-gray-500 border-gray-200";
  };

  const dateItems = [
    {
      label: "Class Starts From",
      value: schedule.classStartDate,
      icon: <Calendar className="w-5 h-5 text-gray-900-400" />,
      accent: "bg-primary-50 border-primary-500/20",
    },
    {
      label: "Class Ends On",
      value: schedule.classEndDate,
      icon: <Calendar className="w-5 h-5 text-red-600" />,
      accent: "bg-red-50 border-red-500/20",
    },
    {
      label: `${midExamLabel} Date`,
      value: schedule.midSemesterExamDate,
      icon: <BookOpen className="w-5 h-5 text-gray-900-400" />,
      accent: "bg-primary-50 border-primary-500/20",
    },
    {
      label: `${endExamLabel} Date`,
      value: schedule.endSemesterExamDate,
      icon: <BookOpen className="w-5 h-5 text-gray-900-400" />,
      accent: "bg-primary-50 border-primary-500/20",
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Class Schedule</h1>
          <p className="text-gray-500 mt-1">
            Important dates and class timings
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-8">
        {/* Important Dates Section */}
        <div className="col-span-12 lg:col-span-6">
          <div className="glass-card rounded-2xl overflow-hidden h-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <CalendarCheck className="w-6 h-6 text-gray-900-400" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Important Dates
                </h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {dateItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center p-4 rounded-xl border ${item.accent} transition-all duration-200`}
                >
                  <div className="flex-shrink-0 mr-4">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                      {formatDate(item.value)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Class Days and Timing Section */}
        <div className="col-span-12 lg:col-span-6">
          <div className="glass-card rounded-2xl overflow-hidden h-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlarmClock className="w-6 h-6 text-gray-900-400" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Class Days and Timing
                  </h2>
                </div>
                {classDaysAndTimes.length > 0 && (
                  <span className="px-2.5 py-1 text-xs font-bold text-gray-900 bg-primary/10 rounded-full">
                    {classDaysAndTimes.length}{" "}
                    {classDaysAndTimes.length === 1 ? "class" : "classes"}
                  </span>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {classDaysAndTimes.length > 0 ? (
                  classDaysAndTimes.map((schedule, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-gray-200 hover:border-primary-500/20 hover:shadow-card transition-all duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`px-3 py-1.5 rounded-lg border font-semibold text-sm ${getDayColor(
                            schedule.day
                          )}`}
                        >
                          {schedule.day}
                        </div>
                        <div className="flex items-center text-gray-900">
                          <Clock className="w-4 h-4 mr-2 text-primary-600/70" />
                          <span className="font-medium">{schedule.time}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileClock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 italic">
                      No class timings have been set yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentClassSchedule;
