import { Users, Video, FileText, Calendar, Clock } from "lucide-react";

export default function CourseDetailsComponents({ course }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-600">
      <h2 className="text-2xl font-semibold text-green-700 mb-4">
        Course Information
      </h2>

      <div className="grid grid-cols-1  gap-4">
        {/* Course Schedule */}
        <div className="space-y-3 w-full">
          <h3 className="text-lg font-medium text-green-700  ">Schedule</h3>
          <div className="flex items-center space-x-3   ">
            <Calendar className="h-5 w-5 text-green-600" />
            <span>
              Start Date: {formatDate(course.courseSchedule.classStartDate)}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-green-600" />
            <span>
              End Date: {formatDate(course.courseSchedule.classEndDate)}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-green-600" />
            <span>
              Mid-Sem Exam:{" "}
              {formatDate(course.courseSchedule.midSemesterExamDate)}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-green-600" />
            <span>
              End-Sem Exam:{" "}
              {formatDate(course.courseSchedule.endSemesterExamDate)}
            </span>
          </div>

          {course.courseSchedule.classDaysAndTimes?.length > 0 && (
            <div className="mt-2">
              <h4 className="text-green-700 font-medium text-lg">
                Class Days & Timings:
              </h4>
              {course.courseSchedule.classDaysAndTimes.map((session, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-green-600" />
                  <span>
                    {session.day}: {session.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
