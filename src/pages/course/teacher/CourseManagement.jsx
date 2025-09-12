import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Loader2,
  BookOpen,
  Calendar,
  Users,
  ClipboardList,
  Video,
  FileText,
  BarChart2,
  Clock,
  Layout,
  Activity,
  CheckCircle,
  Monitor,
  Home,
} from "lucide-react";
import { useMemo } from "react";

import { MdLiveTv } from "react-icons/md";
import { VscCommentDiscussion, VscLiveShare } from "react-icons/vsc";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { getCoursesById } from "../../../services/course.service";
import { useCourse } from "../../../context/CourseContext";
import { TfiAnnouncement } from "react-icons/tfi";
import { Si1Panel } from "react-icons/si";
// Import your components
import CourseBrief from "./course/CourseBrief";
import WeeklyPlanManager from "./course/WeeklyPlanner";
import StudentTable from "./course/StudentDetail";
import AllAssignments from "../../Assignment/teacher/AllAssignments";
import LectureReview from "./course/LectureReview";
import SyllabusManager from "./course/Syllabus";
import CourseSchedule from "./course/CourseSchedule";
import AttendanceHeatMap from "./course/AttendenceHeatMap";
import AttendanceTracker from "./course/AttendanceTracker";
import AttendanceStats from "./course/AttendanceStats";
import StudentGradingTable from "./course/GradeSheet";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import TeacherHome from "./course/TeacherHome";
import AnnouncementManagement from "./course/AnnouncementManagement";
import ContentSection from "./course/Content/Content";
import SelfQuiz from "./course/Test/SelfQuiz";
import QuizCreator from "./course/Test/QuizCreator";
import DiscussionForum from "./course/DiscussionForm";
import { useAuth } from "../../../context/AuthContext";
import ProfileDropdown from "../../../utils/ProfileDropDown";
import AllActivities from "../../Activity/teacher/AllActivities";
import BlogCreator from "./course/Blog/BlogCreator";
import { useMeeting } from "../../../context/MeetingContext";

const CourseManagement = () => {
  const [selectedOption, setSelectedOption] = useState("Home");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Get courseId from URL parameters
  const { courseID } = useParams();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  // Get context to update it

  // Get meetings data from the context
  const { meetings } = useMeeting();

  // Check for a currently live meeting for THIS specific course
// This logic makes the button active based on the exact time in the API string
  const liveMeeting = useMemo(() => {
    if (!meetings || !courseID) return null;
    
    const now = new Date();

    return meetings.find(meeting => {
      const isForThisCourse = meeting.courseId === courseID;
      if (!isForThisCourse) return false;

      // This logic strips the 'Z' (UTC marker) from the API's time string.
      // It forces JavaScript to read "13:01" as "1:01 PM" in your local time.
      const startTime = new Date(meeting.start.slice(0, -1));
      const endTime = new Date(meeting.end.slice(0, -1));
      
      // The button will now be active if the current time is between the local start and end times.
      return now >= startTime && now <= endTime;
    });
  }, [meetings, courseID]);

  // Create the handler function for the button
  const handleJoinLiveClass = () => {
    if (liveMeeting) {
      window.open(liveMeeting.link, '_blank', 'noopener,noreferrer');
    } else {
      alert("There is no live class to join at the moment.");
    }
  };
  const { courseData, setCourseData } = useCourse();

  // Function to extract course ID from URL path
  const extractCourseIdFromPath = () => {
    const pathParts = location.pathname.split("/");
    return pathParts[pathParts.length - 1];
  };

  // Fetch course data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      // Extract course ID from URL
      const courseId = courseID || extractCourseIdFromPath();

      if (!courseId) {
        setLoading(false);
        setError("No course ID found in the URL");
        return;
      }

      try {
        setLoading(true);
        const response = await getCoursesById(courseId);

        // Update the entire course data with what we got from API
        setCourseData(response);
        console.log({ ...response });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching course data:", err);
        setError("Failed to load course data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, [courseID, setCourseData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  // Navigate options with icons
  const navigationOptions = {
    course: {
      title: "Course",
      icon: <BookOpen className="w-5 h-5" />,
      items: [
        { label: "Course Brief", icon: <FileText className="w-5 h-5" /> },
        { label: "Syllabus", icon: <BookOpen className="w-5 h-5" /> },
        { label: "Weekly Plan", icon: <Calendar className="w-5 h-5" /> },
        { label: "Class Schedule", icon: <Clock className="w-5 h-5" /> },
      ],
    },
    attendance: {
      title: "Students",
      icon: <Users className="w-5 h-5" />,
      items: [
        {
          label: "Mark Attendance",
          icon: <ClipboardList className="w-5 h-5" />,
        },
        { label: "Heat Map", icon: <BarChart2 className="w-5 h-5" /> },
        { label: "Status Sheet", icon: <Layout className="w-5 h-5" /> },
        {
          label: "Class List",
          icon: <Users className="w-5 h-5" />,
        },
      ],
    },
    assignment: {
      title: "Assignment",
      icon: <Activity className="w-5 h-5" />,
      items: [
        { label: "Subjective", icon: <FileText className="w-5 h-5" /> },
        { label: "Objective", icon: <Layout className="w-5 h-5" /> },
        { label: "Practical Activity", icon: <Activity className="w-5 h-5" /> },
      ],
    },
  };

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <span className="ml-2 text-lg">Loading course data...</span>
      </div>
    );
  }

  // Show error state if there was a problem
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-50 p-6 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm relative">
        <div className="">
          <div className="min-h-96">
            {selectedOption === "Course Brief" && <CourseBrief />}
            {selectedOption === "Weekly Plan" && <WeeklyPlanManager />}
            {selectedOption === "Class List" && <StudentTable />}
            {selectedOption === "Subjective" && (
              <AllAssignments courseID={courseID} />
            )}
            {selectedOption === "Objective" && <QuizCreator />}
            {selectedOption === "Practical Activity" && (
              <AllActivities courseID={courseID} />
            )}
            {selectedOption === "Home" && (
              <TeacherHome setSelectedOption={setSelectedOption} />
            )}
            {selectedOption === "Recorded Lectures" && <LectureReview />}
            {selectedOption === "Syllabus" && <SyllabusManager />}
            {selectedOption === "Class Schedule" && <CourseSchedule />}
            {selectedOption === "Heat Map" && <AttendanceHeatMap />}
            {selectedOption === "Mark Attendance" && <AttendanceTracker />}
            {selectedOption === "Status Sheet" && <AttendanceStats />}
            {selectedOption === "Content" && (
              <ContentSection setSelectedOption={setSelectedOption} />
            )}
            {selectedOption === "Self Test" && <SelfQuiz />}
            {selectedOption === "Create Quiz" && <QuizCreator />}
            {selectedOption === "Announcements" && (
              <AnnouncementManagement courseID={courseID} />
            )}
            {selectedOption === "Grade Sheet" && <StudentGradingTable />}
            {selectedOption === "Discussion" && <DiscussionForum />}
          </div>
        </div>
      </div>
    );
  };

  // Updated renderDropdown function with underline effect
  const renderDropdown = (menuKey) => {
    if (!navigationOptions[menuKey]) return null;
    const { title, icon, items } = navigationOptions[menuKey];

    // Check if this tab or any of its sub-items are selected
    const isTabSelected = selectedOption === title || (items && items.some(item => selectedOption === item.label));

    if (!items || items.length === 0) {
      return (
        <button
          onClick={() => setSelectedOption(title)}
          className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
            selectedOption === title
              ? "text-accent1 dark:text-accent1"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {icon}
          <span>{title}</span>
          {/* Add line below when selected */}
          {selectedOption === title && (
            <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-full h-1 bg-accent1 dark:bg-accent1 rounded-full"></div>
          )}
        </button>
      );
    }

    return (
      <div className="relative dropdown-container">
        <button
          onClick={() => toggleDropdown(menuKey)}
          className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
            openDropdown === menuKey || isTabSelected
              ? "bg-gray-100 dark:bg-gray-700 text-accent1 dark:text-accent1"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {icon}
          <span>{title}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              openDropdown === menuKey ? "rotate-180" : ""
            }`}
          />
          {/* Add line below when this tab or any sub-item is selected */}
          {isTabSelected && (
            <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-full h-1 bg-accent1 dark:bg-accent1 rounded-full"></div>
          )}
        </button>

        {openDropdown === menuKey && (
          <div className="absolute left-0 mt-2 w-[440px] bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-600 py-4 z-50">
            <div className="grid grid-cols-2 gap-4 px-4">
              {items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setSelectedOption(item.label);
                    setOpenDropdown(null);
                  }}
                  className={`flex items-center space-x-3 p-4 rounded-lg transition-colors ${
                    selectedOption === item.label
                      ? "bg-accent1/10 dark:bg-accent1/20 text-accent1 dark:text-accent1"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      selectedOption === item.label
                        ? "bg-accent1/20 dark:bg-accent1/30"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span className="font-medium text-left">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Header with Logo, Profile and Logout */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end items-center h-16">
            {/* Profile and Logout on Right */}
            <div className="flex items-center space-x-4 relative z-[1000]">
              <abbr title="Discussions">
                <button className="p-2 rounded-full hover:bg-primary/20 dark:hover:bg-blue-500/20 transition-colors text-primary/70 dark:text-blue-400/70 hover:text-primary dark:hover:text-blue-400">
                  <VscCommentDiscussion
                    onClick={() => setSelectedOption("Discussion")}
                  />
                </button>
              </abbr>
              <abbr title="Announcements">
                <button className="p-2 rounded-full hover:bg-primary/20 dark:hover:bg-blue-500/20 transition-colors text-primary/70 dark:text-blue-400/70 hover:text-primary dark:hover:text-blue-400">
                  <TfiAnnouncement
                    onClick={() => setSelectedOption("Announcements")}
                  />
                </button>
              </abbr>
              <ProfileDropdown role={"teacher"} />
              <abbr title="Logout">
                <button
                  className="p-2 rounded-full hover:bg-red/40 dark:hover:bg-red-500/20 transition-colors text-red-600 dark:text-red-400"
                  onClick={() => handleLogout()}
                >
                  <FaSignOutAlt size={22} />
                </button>
              </abbr>
            </div>
          </div>
        </div>
      </header>

      {/* Live Class Buttons */}
      {liveMeeting && (
        <button
          onClick={handleJoinLiveClass}
          className=" absolute top-20 flex justify-center items-center gap-2  right-8 text-lg px-6 py-2 bg-primary/80 text-white rounded-lg hover:bg-primary transition-colors z-50"
        >
          <MdLiveTv />
          Join Live Class
        </button>
      )}
    

      {/* Course Header Banner */}
      <div className="w-[90%] m-auto pt-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-primary dark:text-blue-400">
              {courseData.title}
            </h1>
            <p className="text-xl text-primary/60 dark:text-blue-400/70 mt-2">
              {courseData.teacher?.name}
            </p>
          </div>
          
          {/* Live Class Button */}
         {!liveMeeting && <div className="ml-8">
            <button
              disabled
              className="flex justify-center items-center gap-2 text-lg px-6 py-2 bg-gray-400 dark:bg-gray-600 text-white dark:text-gray-300 rounded-lg cursor-not-allowed"
            >
              <MdLiveTv />
              No Live Class Now
            </button>
          </div>}
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="absolute shadow-sm top-0  bg-red-400 dark:bg-red-500 w-full z-40">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-6 top-3 z-10 border border-black dark:border-gray-600 flex items-center space-x-2 px-4 py-2 bg-white/20 dark:bg-gray-800/20 rounded-lg text-white hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white hover:shadow-md transition-all"
        >
          <ArrowLeft className="h-5 w-5 text-black dark:text-white" />
          <span className="text-black dark:text-white">Back</span>
        </button>
        
        <div className="absolute top-40 left-6 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex mx-auto items-center space-x-6">
              {/* Home Button with underline effect */}
              <button
                onClick={() => setSelectedOption("Home")}
                className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  selectedOption === "Home"
                    ? "text-accent1 dark:text-accent1"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
                {/* Add line below when selected */}
                {selectedOption === "Home" && (
                  <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-full h-1 bg-accent1 dark:bg-accent1 rounded-full"></div>
                )}
              </button>

              {/* Dropdown Menus */}
              {Object.keys(navigationOptions).map((key) => renderDropdown(key))}

              {/* Recordings Button with underline effect */}
              <button
                onClick={() => setSelectedOption("Recorded Lectures")}
                className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  selectedOption === "Recorded Lectures"
                    ? "text-accent1 dark:text-accent1"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <Video className="w-5 h-5" />
                <span>Class Rec.</span>
                {/* Add line below when selected */}
                {selectedOption === "Recorded Lectures" && (
                  <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-full h-1 bg-accent1 dark:bg-accent1 rounded-full"></div>
                )}
              </button>

              {/* Content Button with underline effect */}
              <button
                onClick={() => setSelectedOption("Content")}
                className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  selectedOption === "Content"
                    ? "text-accent1 dark:text-accent1"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>E-Learning</span>
                {/* Add line below when selected */}
                {selectedOption === "Content" && (
                  <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-full h-1 bg-accent1 dark:bg-accent1 rounded-full"></div>
                )}
              </button>

              {/* Grades Button with underline effect */}
              <button
                onClick={() => setSelectedOption("Grade Sheet")}
                className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  selectedOption === "Grade Sheet"
                    ? "text-accent1 dark:text-accent1"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <BarChart2 className="w-5 h-5" />
                <span>Grades</span>
                {/* Add line below when selected */}
                {selectedOption === "Grade Sheet" && (
                  <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-full h-1 bg-accent1 dark:bg-accent1 rounded-full"></div>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 relative mt-20">
        {renderContent()}
      </main>
    </div>
  );
};

export default CourseManagement;