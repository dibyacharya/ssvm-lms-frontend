import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Book,
  CheckSquare,
  Calendar,
  Clock,
  UserCheck,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Layers,
} from "lucide-react";
// 1. Import the context hook
import { useMeeting } from "../../../context/MeetingContext";
import toast from "react-hot-toast";
import { getAllStudentCourses } from "../../../services/course.service";
import calculateAttendance from "../../../utils/Functions/CalculateStudentAttendencePercentage";
import AssignmentStatusChart from "./AssignmentStatusChart";

const DEFAULT_IMAGE = "https://img.freepik.com/free-vector/online-school-platform-abstract-concept-illustration-homeschooling-online-education-platform-digital-classes-virtual-courses-lms-school_335657-3486.jpg";

const DashboardSemesterContent = ({ setActiveSection, semNumber }) => {
  const navigate = useNavigate();
  // 2. Get meetings and their state from the context
  const { meetings, loading: meetingsLoading, error: meetingsError } = useMeeting();
  
  const [coursesData, setCoursesData] = useState({ courses: [], user: {} });
  const [allCoursesData, setAllCoursesData] = useState({ courses: [], user: {} });
  const [loading, setLoading] = useState(true);

  console.log("course meetings",meetings);

  const allAssignmentsCount = coursesData.courses?.reduce((total, course) => {
    const assignmentsInCourse = course.assignments?.length || 0;
    return total + assignmentsInCourse;
  }, 0) || 0;

  const pendingAssignmentsCount = coursesData.courses?.reduce((total, course) => {
    const pendingInCourse = course.assignments?.filter(assignment =>
      assignment.submissions.length === 0
    ).length || 0;
    return total + pendingInCourse;
  }, 0) || 0;

  // Function to get all assignments from all courses
  const getAllAssignments = () => {
    if (!coursesData.courses) return [];

    const assignments = [];
    coursesData.courses.forEach(course => {
      if (course.assignments && course.assignments.length > 0) {
        course.assignments.forEach(assignment => {
          assignments.push({
            ...assignment,
            courseName: course.title,
            courseId: course._id
          });
        });
      }
    });

    // Sort by due date (most recent first)
    return assignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  };

  // Function to determine assignment status based on submissions
  const getAssignmentStatus = (assignment, userId) => {
    if (!assignment.submissions || assignment.submissions.length === 0) {
      return "not_started";
    }

    const userSubmission = assignment.submissions.find(sub => sub.studentId === userId);
    if (userSubmission) {
      if (userSubmission.status === "graded") {
        return "submitted";
      } else {
        return "in_progress";
      }
    }

    return "not_started";
  };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Function to format time
  const formatTime = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
      });
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getAllStudentCourses();
      
        setAllCoursesData(data);
        
      } catch (err) {
        console.log(err);
        toast.error("Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter courses based on semNumber when it changes
  useEffect(() => {
    if (!allCoursesData.courses || allCoursesData.courses.length === 0) {
      return;
    }

    if (semNumber != null) {
      const filteredCourses = allCoursesData.courses.filter(course => {
        const courseSemNumber = course.semNumber || course.semester?.semNumber;
        return courseSemNumber === semNumber;
      });
      setCoursesData({
        ...allCoursesData,
        courses: filteredCourses
      });
    } else {
      setCoursesData(allCoursesData);
    }
  }, [semNumber, allCoursesData]);
  
  // Effect to handle meeting loading errors
  useEffect(() => {
    
    if (meetingsError) {
      toast.error("Failed to load meetings. Please try again later.");
    }
    
  }, [meetingsError]);


  // 4. Updated function to use meetings from context
  const getThisWeekMeetings = () => {
    if (!meetings || meetings.length === 0) return [];
    
    const now = new Date();
    // Set to the beginning of the current day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Set to the end of the day 6 days from now
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return meetings.filter(meeting => {
      const meetingStartDate = new Date(meeting.start);
      return meetingStartDate >= today && meetingStartDate <= endOfWeek;
    });
  };
  
  // Get upcoming events from meetings
  const upcomingEvents = meetings
    ? meetings
        .filter(m => new Date(m.start) > new Date())
        .sort((a, b) => new Date(a.start) - new Date(b.start))
        .slice(0, 3)
    : [];


  const getStatusStyle = (status) => {
    const styles = {
      submitted: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-700",
      in_progress: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-700",
      not_started: "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-300 dark:bg-gray-700/50 dark:border-gray-600",
    };
    return styles[status] || styles.not_started;
  };

  const getStatusLabel = (status) => {
    const labels = {
      submitted: "Submitted",
      in_progress: "In Progress",
      not_started: "Not Started",
    };
    return labels[status] || "Not Started";
  };

  // Handle assignment click
  const handleAssignmentClick = (assignment) => {
    navigate(`/student/assignment/${assignment.courseId}/${assignment._id}`);
  };

  // Combine loading states for the main loader
  if (loading || meetingsLoading) {
    return (
      <div className="flex items-center justify-center h-screen dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-accent1 border-opacity-50 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Get recent assignments (limit to first 4)
  const recentAssignments = getAllAssignments().slice(0, 4);

  return (
    <div className="p-6 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Welcome Section */}

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            id: "Courseware",
            title: "My Courses",
            icon: <BookOpen className="h-6 w-6 text-primary dark:text-blue-400" />,
            count: coursesData?.user?.totalCourses || 0,
            description: "Active Courses",
            bgClass: "bg-white dark:bg-gray-800",
            color: "text-primary dark:text-blue-400",
          },
          {
            id: "Assignment",
            title: "Assignments",
            icon: <CheckSquare className="h-6 w-6 text-primary dark:text-blue-400" />,
            count: pendingAssignmentsCount,
            description: "Pending Tasks",
            bgClass: "bg-white dark:bg-gray-800",
            color: "text-primary dark:text-blue-400",
          },
          {
            id: "LiveClass",
            title: "Live Classes",
            icon: <Calendar className="h-6 w-6 text-primary dark:text-blue-400" />,
            // 5. Count is now dynamic based on context data
            count: getThisWeekMeetings().length,
            description: "This Week",
            bgClass: "bg-white dark:bg-gray-800",
            color: "text-primary dark:text-blue-400",
          },
          {
            id: "MyStats",
            title: "Attendance",
            icon: <UserCheck className="h-6 w-6 text-primary dark:text-blue-400" />,
            count: `${Math.round(
              calculateAttendance(coursesData.user._id, coursesData.courses)
                .overall.attendancePercentage
            ) || "-"
              }%`,
            description: "Overall Rate",
            bgClass: "bg-white dark:bg-gray-800",
            color: "text-primary dark:text-blue-400",
          },
        ].map((item, index) => (
          <div
            key={index}
            className={`${item.bgClass} p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-all duration-200 cursor-pointer`}
            onClick={() => setActiveSection(item.id)}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 bg-gray-50 dark:bg-gray-700 rounded-lg ${item.color}`}>
                {item.icon}
              </div>
              <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                {item.title}
              </h2>
            </div>
            <p className={`text-3xl font-bold mb-1 ${item.color}`}>
              {item.count}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Courses Section */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <Book className="h-5 w-5 mr-2 text-primary dark:text-blue-400" />
              Recent Courses
            </h2>
            <button
              className="text-accent1/80 hover:text-accent1 dark:text-blue-400 dark:hover:text-blue-300 flex items-center text-sm font-medium"
              onClick={() => setActiveSection("Courseware")}
            >
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coursesData.courses?.slice(0, 4).map((course) => (
              <Link
                key={course.id}
                to={`/student/course/${course._id}`}
                className="group relative flex flex-col justify-between rounded-lg border border-gray-100 dark:border-gray-600 hover:border-2 hover:border-accent1/30 dark:hover:border-blue-400/50 shadow-accent1 hover:shadow-md dark:hover:shadow-lg transition-all duration-200 overflow-hidden bg-white dark:bg-gray-700"
                onClick={() => {
                  course.available
                    ? navigate(`/student/course/${course._id}`)
                    : null;
                }}
              >
                {/* Course Image */}
                <div className="relative h-40 w-full">
                  <img
                    src={course.coverImage || DEFAULT_IMAGE}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </div>

                {/* Course Details */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-3">
                    {course.aboutCourse}
                  </p>
                </div>

                {/* Course Footer */}
                <div className="p-3 bg-gray-50 dark:bg-gray-600 border-t border-gray-100 dark:border-gray-600">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="flex items-center">
                      <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full truncate max-w-[120px] sm:max-w-[150px]">
                        {course.semester?.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs">
                      <div className="flex items-center space-x-1">
                        <CheckSquare className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">{course.assignmentCount}</span>
                        <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">Assignments</span>
                        <span className="text-gray-500 dark:text-gray-400 sm:hidden">Assign.</span>
                      </div>
                      <div className="w-px h-3 bg-gray-300 dark:bg-gray-500"></div>
                      <div className="flex items-center space-x-1">
                        <Book className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">{course.lectureCount}</span>
                        <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">Lectures</span>
                        <span className="text-gray-500 dark:text-gray-400 sm:hidden">Lect.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Assignment Summary Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 h-fit">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <Layers className="h-5 w-5 mr-2 text-primary dark:text-blue-400" />
              Assignment Status
            </h2>
          </div>

          <AssignmentStatusChart
            allAssignmentsCount={allAssignmentsCount}
            pendingAssignmentsCount={pendingAssignmentsCount}
            setActiveSection={setActiveSection}
          />
        </div>
      </div>

      {/* Upcoming Events Section - Now Dynamic */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary dark:text-blue-400" />
            Upcoming Live Classes
          </h2>
          <button
            className="text-accent1/80 hover:text-accent1 dark:text-blue-400 dark:hover:text-blue-300 flex items-center text-sm font-medium"
            onClick={() => setActiveSection("LiveClass")}
          >
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>

        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map((event) => (
              <div
                key={event._id}
                className="group flex flex-col bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 hover:border-accent1/60 dark:hover:border-blue-400/60 hover:shadow-md dark:hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer"
                onClick={() => window.open(event.link, '_blank')}
              >
                <div className="relative h-40">
                  {/* Using a generic placeholder image as none is provided in the data */}
                  <img
                    src={DEFAULT_IMAGE}
                    alt={event.subject}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-lg inline-flex items-center">
                      <Calendar className="h-3.5 w-3.5 text-primary dark:text-blue-400 mr-1.5" />
                      <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                        {formatDate(event.start)} · {formatTime(event.start)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-base font-medium text-gray-800 dark:text-white group-hover:text-primary dark:group-hover:text-blue-400 transition-colors mb-1">
                    {event.subject}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                    {event.description}
                  </p>
                </div>

                <div className="mt-auto border-t border-gray-100 dark:border-gray-600 p-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-accent1 dark:text-blue-400">
                    Join Class
                  </span>
                  <ArrowRight className="h-4 w-4 text-accent1 dark:text-blue-400" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">No Upcoming Classes</h3>
            <p className="text-gray-400 dark:text-gray-500">New classes scheduled by your teachers will appear here.</p>
          </div>
        )}
      </div>

      {/* Assignments Section - Now Dynamic */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
            <CheckSquare className="h-5 w-5 mr-2 text-primary dark:text-blue-400" />
            Recent Assignments
          </h2>
          <button
            className="text-accent1/80 hover:text-accent1 dark:text-blue-400 dark:hover:text-blue-300 flex items-center text-sm font-medium"
            onClick={() => setActiveSection("Assignment")}
          >
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>

        <div className="overflow-x-auto">
          {recentAssignments.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-600">
                  <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium text-sm">
                    Assignment
                  </th>
                  <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium text-sm">
                    Course
                  </th>
                  <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium text-sm">
                    Due Date
                  </th>
                  <th className="text-left py-3 px-4 text-gray-500 dark:text-gray-400 font-medium text-sm">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentAssignments.map((assignment) => {
                  const status = getAssignmentStatus(assignment, coursesData.user._id);
                  return (
                    <tr
                      key={assignment._id}
                      className="border-b border-gray-50 dark:border-gray-700 hover:bg-accent2/30 dark:hover:bg-gray-700/50 cursor-pointer"
                      onClick={() => handleAssignmentClick(assignment)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-md bg-primary/10 dark:bg-blue-500/20 flex items-center justify-center text-primary dark:text-blue-400 mr-3">
                            <CheckSquare className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-gray-800 dark:text-white">
                            {assignment.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                        {assignment.courseName}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-1.5" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {formatDate(assignment.dueDate)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusStyle(status)}`}
                        >
                          {getStatusLabel(status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <CheckSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">No Assignments Yet</h3>
              <p className="text-gray-400 dark:text-gray-500">Assignments will appear here when they are created.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardSemesterContent;