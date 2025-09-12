import React, { useState } from "react";
import { useCourse } from "../../../../context/CourseContext";
import {
  Plus,
  X,
  Calendar,
  Clock,
  Circle,
  CalendarDays,
  CalendarCheck,
  BookOpen,
  AlertCircle,
  AlarmClock,
  FileClock,
} from "lucide-react";
import SaveButton from "../../../../utils/CourseSaveButton";
import { useParams } from "react-router-dom";

const CourseSchedule = () => {
  const {
    courseData,
    updateCourseDate,
    addClassDayAndTime,
    updateClassDayAndTime,
    removeClassDayAndTime,
  } = useCourse();

  const [newDay, setNewDay] = useState("");
  const [newTime, setNewTime] = useState("");
  const [isAddingTime, setIsAddingTime] = useState(false);
  const { courseID } = useParams();
  // Format date strings for input date fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };

  const handleDateChange = (dateType, value) => {
    updateCourseDate(dateType, value);
  };

  const handleAddDayAndTime = () => {
    if (newDay && newTime) {
      addClassDayAndTime(newDay, newTime);
      setNewDay("");
      setNewTime("");
      setIsAddingTime(false);
    }
  };

  // Day color mapping
  const getDayColor = (day) => {
    const colors = {
      Monday: "bg-blue-50 text-blue-600",
      Tuesday: "bg-purple-50 text-purple-600",
      Wednesday: "bg-amber-50 text-amber-600",
      Thursday: "bg-rose-50 text-rose-600",
      Friday: "bg-cyan-50 text-cyan-600",
      Saturday: "bg-emerald-50 text-emerald-600",
      Sunday: "bg-orange-50 text-orange-600",
    };
    return colors[day] || "bg-gray-50 text-gray-600";
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      <div className="flex justify-between items-center absolute -top-10 right-36">
        <SaveButton urlId={courseID} />
      </div>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Course Schedule</h1>
          <p className="text-tertiary mt-1">
            Manage important dates and class timings
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-8">
        {/* Important Dates Section */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white rounded-2xl border border-tertiary/10 shadow-sm overflow-hidden h-full">
            <div className="p-6 border-b border-tertiary/10">
              <div className="flex items-center space-x-3">
                <CalendarCheck className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-primary">
                  Important Dates
                </h2>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-tertiary">
                  Class Starts From
                </label>
                <div className="flex items-center p-4 rounded-xl border border-tertiary/20 bg-gray-50 hover:border-primary/30 transition-all duration-200">
                  <Calendar className="w-5 h-5 text-primary mr-3" />
                  <input
                    type="date"
                    value={formatDateForInput(
                      courseData.courseSchedule.classStartDate
                    )}
                    onChange={(e) =>
                      handleDateChange("classStartDate", e.target.value)
                    }
                    className="w-full bg-transparent focus:outline-none text-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-tertiary">
                  Class Ends On
                </label>
                <div className="flex items-center p-4 rounded-xl border border-tertiary/20 bg-gray-50 hover:border-primary/30 transition-all duration-200">
                  <Calendar className="w-5 h-5 text-primary mr-3" />
                  <input
                    type="date"
                    value={formatDateForInput(
                      courseData.courseSchedule.classEndDate
                    )}
                    onChange={(e) =>
                      handleDateChange("classEndDate", e.target.value)
                    }
                    className="w-full bg-transparent focus:outline-none text-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-tertiary">
                  Mid-Semester Exam Date
                </label>
                <div className="flex items-center p-4 rounded-xl border border-tertiary/20 bg-gray-50 hover:border-primary/30 transition-all duration-200">
                  <BookOpen className="w-5 h-5 text-primary mr-3" />
                  <input
                    type="date"
                    value={formatDateForInput(
                      courseData.courseSchedule.midSemesterExamDate
                    )}
                    onChange={(e) =>
                      handleDateChange("midSemesterExamDate", e.target.value)
                    }
                    className="w-full bg-transparent focus:outline-none text-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-tertiary">
                  End Semester Exam Date
                </label>
                <div className="flex items-center p-4 rounded-xl border border-tertiary/20 bg-gray-50 hover:border-primary/30 transition-all duration-200">
                  <BookOpen className="w-5 h-5 text-primary mr-3" />
                  <input
                    type="date"
                    value={formatDateForInput(
                      courseData.courseSchedule.endSemesterExamDate
                    )}
                    onChange={(e) =>
                      handleDateChange("endSemesterExamDate", e.target.value)
                    }
                    className="w-full bg-transparent focus:outline-none text-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Class Schedule Section */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white rounded-2xl border border-tertiary/10 shadow-sm overflow-hidden h-full">
            <div className="p-6 border-b border-tertiary/10">
              <div className="flex items-center space-x-3">
                <AlarmClock className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-primary">
                  Class Days and Timing
                </h2>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {courseData.courseSchedule.classDaysAndTimes.length > 0 ? (
                  courseData.courseSchedule.classDaysAndTimes.map(
                    (schedule, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-xl 
                        bg-gray-50 border border-tertiary/10 hover:border-primary/20 
                        transition-colors duration-200 group"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`px-3 py-1 rounded-lg ${getDayColor(
                              schedule.day
                            )}`}
                          >
                            <span className="font-medium">{schedule.day}</span>
                          </div>
                          <div className="flex items-center text-primary">
                            <Clock className="w-4 h-4 mr-2 text-primary/70" />
                            <span>{schedule.time}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeClassDayAndTime(index)}
                          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 
                          rounded-full text-red-500 transition-all duration-200"
                          aria-label="Remove class time"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  )
                ) : (
                  <div className="text-center py-8">
                    <FileClock className="w-12 h-12 text-tertiary/30 mx-auto mb-4" />
                    <p className="text-tertiary/60 italic">
                      No class timings added yet. Add your first class timing
                      below.
                    </p>
                  </div>
                )}

                {isAddingTime ? (
                  <div className="p-5 bg-gray-50 rounded-xl border border-tertiary/20 space-y-4">
                    <h3 className="font-medium text-primary">
                      Add New Class Time
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-tertiary">
                          Day
                        </label>
                        <select
                          value={newDay}
                          onChange={(e) => setNewDay(e.target.value)}
                          className="w-full p-3 rounded-lg border border-tertiary/20 
                            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50
                            text-primary bg-white transition-all duration-200"
                        >
                          <option value="">Select Day</option>
                          <option value="Monday">Monday</option>
                          <option value="Tuesday">Tuesday</option>
                          <option value="Wednesday">Wednesday</option>
                          <option value="Thursday">Thursday</option>
                          <option value="Friday">Friday</option>
                          <option value="Saturday">Saturday</option>
                          <option value="Sunday">Sunday</option>
                        </select>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-tertiary">
                          Time
                        </label>
                        <input
                          type="text"
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          placeholder="e.g., 6 pm to 7.30 pm"
                          className="w-full p-3 rounded-lg border border-tertiary/20 
                            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50
                            text-primary placeholder-tertiary/50 transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-2">
                      <button
                        onClick={() => {
                          setIsAddingTime(false);
                          setNewDay("");
                          setNewTime("");
                        }}
                        className="px-4 py-2 bg-white text-tertiary rounded-lg border border-tertiary/20
                          hover:bg-tertiary/5 transition-all duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddDayAndTime}
                        className="px-4 py-2 bg-primary text-white rounded-lg 
                          hover:bg-primary/90 transition-all duration-200 font-medium shadow-sm"
                      >
                        Add Class Time
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingTime(true)}
                    className="flex items-center justify-center w-full p-4 border-2 border-dashed border-tertiary/30 rounded-xl
                      text-tertiary hover:border-primary hover:text-primary hover:bg-primary/5
                      transition-all duration-200 mt-4"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    <span>Add New Day and Time</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help Panel */}
      <div className="flex items-start p-5 rounded-xl bg-primary/5 border border-primary/20 mt-6">
        <AlertCircle className="w-6 h-6 text-primary mt-0.5 mr-4 flex-shrink-0" />
        <div>
          <p className="text-primary font-medium mb-1">Scheduling Tips</p>
          <p className="text-tertiary">
            Make sure to keep your class schedule up to date. Students will be
            notified automatically of any changes to these dates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CourseSchedule;
