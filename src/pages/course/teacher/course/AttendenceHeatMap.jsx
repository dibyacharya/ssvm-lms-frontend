import React, { useState, useEffect } from "react";
import Tooltip from "@uiw/react-tooltip";
import HeatMap from "@uiw/react-heat-map";
import { useCourse } from "../../../../context/CourseContext";
import {
  Calendar,
  Circle,
  BarChart2,
  AlertCircle,
  Info,
  HelpCircle,
  CalendarDays,
} from "lucide-react";
import SaveButton from "../../../../utils/CourseSaveButton";
import { useParams } from "react-router-dom";

const AttendanceHeatMap = () => {
  const { courseData } = useCourse();
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { courseID } = useParams();

  // Get semester start and end dates - handling ISO format dates like "2025-03-01T00:00:00.000Z"
  const semesterStartDate = courseData?.courseSchedule?.classStartDate
    ? new Date(courseData?.courseSchedule?.classStartDate)
    : null;
  const semesterEndDate = courseData?.courseSchedule?.classEndDate
    ? new Date(courseData?.courseSchedule?.classEndDate)
    : null;

  // Custom function to determine color based on percentage
  const getColorForPercentage = (percentage) => {
    if (percentage === 0) return "#f3f4f6"; // Gray for no data
    if (percentage < 26) return "#ef4444"; // Red for 1-25%
    if (percentage < 51) return "#facc15"; // Yellow for 26-50%
    if (percentage < 76) return "#84cc16"; // Light green for 51-75%
    return "#1aa100"; // Primary green for 76-100%
  };

  useEffect(() => {
    // Process attendance data from context
    const processAttendanceData = () => {
      setIsLoading(true);

      if (
        !courseData ||
        !courseData.attendance ||
        !courseData.attendance.sessions ||
        !courseData.students ||
        !semesterStartDate ||
        !semesterEndDate
      ) {
        setIsLoading(false);
        return [];
      }

      const heatMapData = [];
      const sessions = courseData.attendance.sessions;
      const totalStudents = courseData.students.length;

      // Group sessions by date
      const sessionsByDate = {};

      Object.entries(sessions).forEach(([sessionKey, studentIds]) => {
        // Session key format: "YYYY-MM-DD_HH:MM"
        const [dateStr] = sessionKey.split("_");

        if (!sessionsByDate[dateStr]) {
          sessionsByDate[dateStr] = {
            totalSessions: 0,
            totalAttendance: 0,
          };
        }

        // Increment session count for this date
        sessionsByDate[dateStr].totalSessions += 1;

        // Add students present in this session
        sessionsByDate[dateStr].totalAttendance += studentIds.length;
      });

      // Calculate percentage for each date
      Object.entries(sessionsByDate).forEach(([dateStr, data]) => {
        // Format date as YYYY/MM/DD for heat map
        const [year, month, day] = dateStr.split("-");
        const formattedDate = `${year}/${month}/${day}`;

        // Calculate maximum possible attendance for the day
        const maxPossibleAttendance = totalStudents * data.totalSessions;

        // Calculate percentage (avoid division by zero)
        const percentage =
          maxPossibleAttendance > 0
            ? Math.round((data.totalAttendance / maxPossibleAttendance) * 100)
            : 0;

        // Get color based on percentage
        const color = getColorForPercentage(percentage);

        // Add to heat map data
        heatMapData.push({
          date: formattedDate,
          count: percentage,
          color: color,
          raw: {
            attended: data.totalAttendance,
            possible: maxPossibleAttendance,
            sessions: data.totalSessions,
          },
        });
      });

      // Update state
      setAttendanceData(heatMapData);
      setIsLoading(false);
    };

    processAttendanceData();
  }, [courseData, semesterStartDate, semesterEndDate]);

  // Calculate overall attendance percentage
  const calculateOverallAttendance = () => {
    if (attendanceData.length === 0) return 0;

    const totalAttended = attendanceData.reduce(
      (sum, day) => sum + (day.raw?.attended || 0),
      0
    );
    const totalPossible = attendanceData.reduce(
      (sum, day) => sum + (day.raw?.possible || 0),
      0
    );

    return totalPossible > 0
      ? Math.round((totalAttended / totalPossible) * 100)
      : 0;
  };

  // Return appropriate component based on state
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-primary/20 mb-4"></div>
            <div className="h-4 w-32 bg-primary/20 rounded"></div>
          </div>
        </div>
      );
    }

    if (!semesterStartDate || !semesterEndDate) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <Calendar className="w-16 h-16 text-tertiary/30 mb-4" />
          <h3 className="text-xl font-semibold text-primary mb-2">
            Semester Dates Not Set
          </h3>
          <p className="text-tertiary max-w-md">
            Please set semester start and end dates in the Course Schedule
            section to view the attendance heat map.
          </p>
        </div>
      );
    }

    if (attendanceData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <CalendarDays className="w-16 h-16 text-tertiary/30 mb-4" />
          <h3 className="text-xl font-semibold text-primary mb-2">
            No Attendance Data
          </h3>
          <p className="text-tertiary max-w-md">
            Start recording attendance to generate your heat map. Each day will
            show the attendance percentage.
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-tertiary/10">
            <div className="flex items-center justify-between">
              <h3 className="text-tertiary font-medium">Overall Attendance</h3>
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  calculateOverallAttendance() >= 75
                    ? "bg-primary/10 text-primary"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {calculateOverallAttendance() >= 75 ? "Good" : "Poor"}
              </div>
            </div>
            <div className="mt-4 flex items-end">
              <span className="text-3xl font-bold text-primary">
                {calculateOverallAttendance()}%
              </span>
              <span className="text-tertiary ml-2 mb-1">average</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-tertiary/10">
            <h3 className="text-tertiary font-medium mb-2">Total Sessions</h3>
            <div className="text-3xl font-bold text-primary">
              {attendanceData.reduce(
                (sum, day) => sum + (day.raw?.sessions || 0),
                0
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-tertiary/10">
            <h3 className="text-tertiary font-medium mb-2">Days Recorded</h3>
            <div className="text-3xl font-bold text-primary">
              {attendanceData.length}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-tertiary/10">
            <h3 className="text-tertiary font-medium mb-2">Students</h3>
            <div className="text-3xl font-bold text-primary">
              {courseData.students.length}
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap justify-between gap-4 p-5 bg-gray-50 rounded-xl">
          <div className="flex items-center">
            <span className="block w-4 h-4 rounded-sm bg-[#ef4444] mr-2"></span>
            <span className="text-sm text-tertiary">Low (1-25%)</span>
          </div>
          <div className="flex items-center">
            <span className="block w-4 h-4 rounded-sm bg-[#facc15] mr-2"></span>
            <span className="text-sm text-tertiary">Medium (26-50%)</span>
          </div>
          <div className="flex items-center">
            <span className="block w-4 h-4 rounded-sm bg-[#84cc16] mr-2"></span>
            <span className="text-sm text-tertiary">High (51-75%)</span>
          </div>
          <div className="flex items-center">
            <span className="block w-4 h-4 rounded-sm bg-[#1aa100] mr-2"></span>
            <span className="text-sm text-tertiary">Full (76-100%)</span>
          </div>
        </div>

        <div className="bg-white rounded-xl  relative shadow-sm p-6 border border-tertiary/10 overflow-x-auto">
          <div className="min-w-[750px]">
            <HeatMap
              value={attendanceData}
              width={"100%"}
              height={210}
              rectSize={24}
              space={8}
              rectProps={{
                rx: 2, // Rounded corners
              }}
              startDate={new Date(semesterStartDate.getTime() - 86400000 * 7)} // Start one week earlier for better visual
              endDate={new Date(semesterEndDate.getTime() + 86400000 * 7)} // End one week later for better visual
              legendCellSize={0}
              // Set a very high max value to ensure our exact percentages are used
              max={100}
              // Define a simplified color scheme that will be overridden by our custom rendering
              panelColors={{
                0: "#f3f4f6",
                100: "#1aa100",
              }}
              rectRender={(props, data) => {
                if (data.count === undefined) {
                  return <rect {...props} />;
                }

                // Use our pre-calculated color from data
                const fillColor =
                  data.color || getColorForPercentage(data.count);
                const newProps = { ...props, fill: fillColor };

                return (
                  <Tooltip
                    placement="top"
                    trigger="hover"
                    content={
                      <div className="bg-secondary text-white p-2 rounded shadow-lg text-xs">
                        <div className="font-bold mb-1">
                          {new Date(data.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div>Attendance: {data.count}%</div>
                        <div>
                          Present: {data.raw?.attended || 0}/
                          {data.raw?.possible || 0}
                        </div>
                        <div>Sessions: {data.raw?.sessions || 0}</div>
                      </div>
                    }
                    className="heat-map-tooltip"
                    visibleArrow={true}
                    isOpen={false}
                    style={{
                      zIndex: 1000,
                      position: "absolute",
                    }}
                    portalProps={{
                      style: {
                        position: "relative",
                      },
                    }}
                  >
                    <rect {...newProps} />
                  </Tooltip>
                );
              }}
            />
          </div>
        </div>

        <div className="flex items-start p-5 rounded-xl bg-primary/5 border border-primary/20 mt-6">
          <HelpCircle className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-primary font-medium mb-1">
              How to read this chart
            </p>
            <p className="text-tertiary text-sm">
              Each square represents a day of attendance. Darker green indicates
              higher attendance rate. Hover over a square to see detailed
              information about that day's attendance.
            </p>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      <div className="flex justify-between items-center absolute -top-10 right-36">
        <SaveButton urlId={courseID} />
      </div>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Attendance Heat Map
          </h1>
          <p className="text-tertiary mt-1">
            Visual representation of attendance patterns over time
          </p>
        </div>
      </div>

      {/* Custom CSS for tooltip positioning */}
      <style jsx>{`
        :global(.heat-map-tooltip) {
          position: absolute !important;
          top: 20px;
        }
      `}</style>

      {renderContent()}
    </div>
  );
};

export default AttendanceHeatMap;
