import React from "react";
import { useCourse } from "../../../../context/CourseContext";
import { getMidExamLabel, getEndExamLabel } from "../../../../utils/periodLabel";
import {
  Calendar,
  Clock,
  CalendarCheck,
  BookOpen,
  AlertCircle,
  AlarmClock,
  FileClock,
  Users,
} from "lucide-react";

/** Gradient section header (matches CourseDescription pattern) */
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

const ClassList = () => {
  const { courseData } = useCourse();
  const periodType = courseData?.semester?.periodType || courseData?.periodType || "semester";
  const midExamLabel = getMidExamLabel(periodType);
  const endExamLabel = getEndExamLabel(periodType);

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDayColor = (day) => {
    const colors = {
      Monday: "bg-blue-50 text-blue-600 border-blue-200",
      Tuesday: "bg-purple-50 text-purple-600 border-purple-200",
      Wednesday: "bg-amber-50 text-amber-600 border-amber-200",
      Thursday: "bg-rose-50 text-rose-600 border-rose-200",
      Friday: "bg-cyan-50 text-cyan-600 border-cyan-200",
      Saturday: "bg-emerald-50 text-emerald-600 border-emerald-200",
      Sunday: "bg-orange-50 text-orange-600 border-orange-200",
    };
    return colors[day] || "bg-gray-50 text-gray-600 border-gray-200";
  };

  const schedule = courseData?.courseSchedule || {};
  const classDaysAndTimes = schedule.classDaysAndTimes || [];

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* ============ Hero Header ============ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-8 shadow-lg">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full" />
        <div className="relative z-10 flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
            <CalendarCheck className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Class Schedule</h1>
            <p className="text-blue-100 mt-1 text-sm">
              Class schedule and important dates for this course
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Important Dates */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full hover:shadow-md transition-shadow duration-300">
            <SectionHeader
              icon={CalendarCheck}
              title="Important Dates"
              gradient="bg-gradient-to-r from-amber-500 to-orange-500"
              count={4}
            />
            <div className="p-6 space-y-4">
              <div className="flex items-center p-4 rounded-xl border border-tertiary/10 bg-gray-50 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-200 cursor-default">
                <Calendar className="w-5 h-5 text-amber-500 mr-4 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-tertiary uppercase tracking-wider">Class Start Date</p>
                  <p className="text-primary font-medium mt-0.5">{formatDate(schedule.classStartDate)}</p>
                </div>
              </div>

              <div className="flex items-center p-4 rounded-xl border border-tertiary/10 bg-gray-50 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-200 cursor-default">
                <Calendar className="w-5 h-5 text-amber-500 mr-4 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-tertiary uppercase tracking-wider">Class End Date</p>
                  <p className="text-primary font-medium mt-0.5">{formatDate(schedule.classEndDate)}</p>
                </div>
              </div>

              <div className="flex items-center p-4 rounded-xl border border-tertiary/10 bg-gray-50 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-200 cursor-default">
                <BookOpen className="w-5 h-5 text-orange-500 mr-4 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-tertiary uppercase tracking-wider">{midExamLabel}</p>
                  <p className="text-primary font-medium mt-0.5">{formatDate(schedule.midSemesterExamDate)}</p>
                </div>
              </div>

              <div className="flex items-center p-4 rounded-xl border border-tertiary/10 bg-gray-50 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-200 cursor-default">
                <BookOpen className="w-5 h-5 text-orange-500 mr-4 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-tertiary uppercase tracking-wider">{endExamLabel}</p>
                  <p className="text-primary font-medium mt-0.5">{formatDate(schedule.endSemesterExamDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Class Days and Timing */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full hover:shadow-md transition-shadow duration-300">
            <SectionHeader
              icon={AlarmClock}
              title="Class Days and Timing"
              gradient="bg-gradient-to-r from-violet-500 to-purple-600"
              count={classDaysAndTimes.length > 0 ? classDaysAndTimes.length : null}
            />
            <div className="p-6">
              {classDaysAndTimes.length > 0 ? (
                <div className="space-y-3">
                  {classDaysAndTimes.map((entry, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-tertiary/10 hover:border-violet-200 hover:bg-violet-50/50 transition-all duration-200 cursor-default"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`px-3 py-1.5 rounded-lg border ${getDayColor(entry.day)}`}>
                          <span className="font-semibold text-sm">{entry.day}</span>
                        </div>
                        <div className="flex items-center text-primary">
                          <Clock className="w-4 h-4 mr-2 text-primary/70" />
                          <span className="font-medium">{entry.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileClock className="w-12 h-12 text-tertiary/30 mx-auto mb-4" />
                  <p className="text-tertiary/60 italic">
                    No class timings have been scheduled yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-blue-50 shadow-sm">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-blue-500" />
        <div className="flex items-start p-5 pl-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm shadow-indigo-200 mr-4 flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-primary font-semibold mb-1">Schedule Information</p>
            <p className="text-tertiary text-sm">
              Class schedule is managed by the admin through the timetable system. Contact the admin for any schedule changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassList;
