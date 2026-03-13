import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Loader2,
  BookOpen,
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
import { resolveCourseTheme } from "../../../utils/courseThemeResolver";
import { getCourseBannerProps } from "../../../utils/courseBannerHelper";
// Import your components
import CourseDescription from "./course/CourseDescription";
import DescriptionSyllabus from "./course/DescriptionSyllabus";
import ClassList from "./course/ClassList";
import StudentTable from "./course/StudentDetail";
import AllAssignments from "../../Assignment/teacher/AllAssignments";
import LectureReview from "./course/LectureReview";
import AttendanceHeatMap from "./course/AttendenceHeatMap";
import AttendanceTracker from "./course/AttendanceTracker";
import AttendanceStats from "./course/AttendanceStats";
import Gradebook from "./course/Gradebook";
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
import ContinuousAssessment from "./course/ContinuousAssessment";
import MOM from "./course/MOM";
import Handouts from "./course/Handouts";
import { useMeetingsV2 } from "../../../context/MeetingV2Context";

const CourseManagement = () => {
  // Get courseId from URL parameters
  const { courseID } = useParams();
  
  // Get stored section from localStorage for this course, default to "Home"
  const getStoredSection = (courseId) => {
    if (!courseId) return "Home";
    const storageKey = `course_${courseId}_selectedSection`;
    const stored = localStorage.getItem(storageKey);
    return stored || "Home";
  };

  const [selectedOption, setSelectedOption] = useState(() => getStoredSection(courseID));
  const [openDropdown, setOpenDropdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const assignmentContext = useMemo(() => {
    const searchParams = new URLSearchParams(location.search || "");
    return {
      assignmentId: searchParams.get("assignmentId") || "",
      batchId: searchParams.get("batchId") || "",
      semesterId: searchParams.get("semesterId") || "",
    };
  }, [location.search]);
  
  // Update selectedOption when courseID changes (e.g., navigating to different course)
  useEffect(() => {
    if (courseID) {
      const stored = getStoredSection(courseID);
      setSelectedOption(stored);
    }
  }, [courseID]);

  // Listen for section change events from child components
  useEffect(() => {
    const handleSectionChange = (event) => {
      if (event.detail && event.detail.section) {
        setSelectedOption(event.detail.section);
      }
    };

    window.addEventListener('sectionChange', handleSectionChange);
    return () => {
      window.removeEventListener('sectionChange', handleSectionChange);
    };
  }, []);

  // Save selectedOption to localStorage whenever it changes
  useEffect(() => {
    if (courseID && selectedOption) {
      const storageKey = `course_${courseID}_selectedSection`;
      localStorage.setItem(storageKey, selectedOption);
    }
  }, [selectedOption, courseID]);
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  // New meetings context (backend-driven)
  const { getMeetingsForCourse, fetchMeetingsForCourse } = useMeetingsV2();

  // Load meetings for this course from backend
  useEffect(() => {
    if (courseID) {
      fetchMeetingsForCourse(courseID).catch(() => {
        // errors are stored in context; UI can handle via other components if needed
      });
    }
  }, [courseID, fetchMeetingsForCourse]);

  const courseMeetings = getMeetingsForCourse(courseID) || [];

  // Keep current time updated for optional client-side checks, if needed elsewhere
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Find live meeting instance for this course based on backend-computed status
  // Live meeting detection — checks every 15s for meetings starting within 5 min
  const [liveMeeting, setLiveMeeting] = useState(null);
  const checkLiveMeeting = useCallback(() => {
    if (!courseID || !courseMeetings.length) { setLiveMeeting(null); return; }
    const now = new Date();
    const THRESHOLD_MS = 5 * 60 * 1000;

    const live = courseMeetings.find(
      (m) => m.course === courseID && m.status === "live"
    );
    if (live) { setLiveMeeting(live); return; }

    const upcoming = courseMeetings.find((m) => {
      if (m.course !== courseID || m.status !== "upcoming") return false;
      const diff = new Date(m.start) - now;
      return diff > 0 && diff <= THRESHOLD_MS;
    });
    setLiveMeeting(upcoming || null);
  }, [courseID, courseMeetings]);

  useEffect(() => {
    checkLiveMeeting();
    const timer = setInterval(checkLiveMeeting, 15_000);
    return () => clearInterval(timer);
  }, [checkLiveMeeting]);

  const { courseData, setCourseData, markSessionsAsSaved } = useCourse();

  // Create the handler function for the button - uses only VConf URLs (host URL for teachers)
  const handleJoinLiveClass = () => {
    const activeMeeting = liveMeeting;
    if (activeMeeting) {
      const joinUrl = activeMeeting.vconfHostUrl || activeMeeting.vconfJoinUrl;
      if (joinUrl) {
        window.open(joinUrl, '_blank', 'noopener,noreferrer');
      } else {
        alert("Video conference room is not ready yet. Please try again in a moment.");
      }
    } else {
      alert("There is no live class to join at the moment.");
    }
  };

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
        const response = await getCoursesById(courseId, assignmentContext);

        // Normalize syllabus shape to { modules: [] }
        const normalizedSyllabus = (() => {
          if (!response?.syllabus) return { modules: [] };
          
          let modules = [];
          if (Array.isArray(response.syllabus)) {
            modules = response.syllabus;
          } else if (Array.isArray(response.syllabus.modules)) {
            modules = response.syllabus.modules;
          }
          
          // Ensure each module has a topics array
          modules = modules.map(module => ({
            ...module,
            topics: Array.isArray(module.topics) ? module.topics : []
          }));
          
          return { modules };
        })();

        // Update the entire course data with what we got from API
        setCourseData({ ...response, syllabus: normalizedSyllabus });
        
        // Mark all sessions from backend as saved
        const savedSessionKeys = Object.keys(response.attendance?.sessions || {});
        if (savedSessionKeys.length > 0 && markSessionsAsSaved) {
          markSessionsAsSaved(savedSessionKeys);
        }
        
        console.log({ ...response });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching course data:", err);
        setError("Failed to load course data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, [courseID, assignmentContext, setCourseData]);

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
        { label: "Course Description", icon: <FileText className="w-5 h-5" /> },
        { label: "Syllabus", icon: <BookOpen className="w-5 h-5" /> },
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
          label: "Student List",
          icon: <Users className="w-5 h-5" />,
        },
      ],
    },
    assignment: {
      title: "Assessment",
      icon: <Activity className="w-5 h-5" />,
      items: [
        // { label: "Subjective", icon: <FileText className="w-5 h-5" /> },
        // { label: "Objective", icon: <Layout className="w-5 h-5" /> },
        { label: "Continuous Assessment Plan", icon: <BarChart2 className="w-5 h-5" /> },
        { label: "Continuous Assessment", icon: <Activity className="w-5 h-5" /> },
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
            {selectedOption === "Course Description" && <CourseDescription />}
            {selectedOption === "Student List" && <StudentTable />}
            {selectedOption === "Class Schedule" && <ClassList />}
            {selectedOption === "Subjective" && (
              <AllAssignments courseID={courseID} initialTab="subjective" hideTabs={true} />
            )}
            {selectedOption === "Objective" && (
              <AllAssignments courseID={courseID} initialTab="objective" hideTabs={true} />
            )}
            {selectedOption === "Activity" && (
              <AllActivities courseID={courseID} />
            )}
            {selectedOption === "Continuous Assessment" && (
              <ContinuousAssessment mode="assessment" />
            )}
            {selectedOption === "Home" && (
              <TeacherHome setSelectedOption={setSelectedOption} />
            )}
            {selectedOption === "Recorded Lectures" && <LectureReview />}
            {selectedOption === "Syllabus" && <DescriptionSyllabus />}
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
            {selectedOption === "Gradebook" && <Gradebook />}
            {selectedOption === "Continuous Assessment Plan" && <ContinuousAssessment mode="plan" />}
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
          <div className="absolute left-0 mt-1.5 w-fit min-w-[200px] max-w-[220px] bg-white dark:bg-gray-800 rounded-md shadow-md dark:shadow-lg border border-gray-200 dark:border-gray-600 p-1 z-50">
            <div className="flex flex-col gap-0.5">
              {items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setSelectedOption(item.label);
                    setOpenDropdown(null);
                  }}
                  className={`flex h-9 w-full items-center gap-1.5 px-2 py-1 rounded transition-colors ${
                    selectedOption === item.label
                      ? "bg-accent1/10 dark:bg-accent1/20 text-accent1 dark:text-accent1"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <div
                    className={`p-1 rounded flex-shrink-0 [&>svg]:w-4 [&>svg]:h-4 ${
                      selectedOption === item.label
                        ? "bg-accent1/20 dark:bg-accent1/30"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span className="font-medium text-xs leading-4 text-left whitespace-nowrap">
                    {item.label}
                  </span>
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

      {/* Course Header Banner — Unique gradient + subject symbols */}
      {(() => {
        const { grad, symbols, seed } = getCourseBannerProps(courseData);
        // Pick 12 symbols for the wider banner
        const picked = [];
        for (let i = 0; i < 12; i++) picked.push(symbols[(seed + i * 3) % symbols.length]);
        // Scatter positions for wide banner (viewBox 800×192)
        const positions = [];
        let sx = (seed * 7) % 800;
        let sy = (seed * 3) % 140;
        for (let i = 0; i < 12; i++) {
          sx = (sx + 197) % 760 + 20;
          sy = ((sy + 53 + (i * 17)) % 150) + 15;
          const size = 18 + ((seed + i * 7) % 16);
          const opacity = 0.08 + ((seed + i * 11) % 10) / 100;
          const rotate = ((seed + i * 23) % 40) - 20;
          positions.push({ x: sx, y: sy, size, opacity, rotate });
        }

        return (
          <div className="w-[90%] m-auto pt-4">
            <div className="relative rounded-2xl overflow-hidden mb-6 h-48 group">
              {/* Full SVG banner background */}
              <svg
                viewBox="0 0 800 192"
                preserveAspectRatio="xMidYMid slice"
                className="absolute inset-0 w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id={`cb-${seed}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={grad.from} />
                    <stop offset="50%" stopColor={grad.via} />
                    <stop offset="100%" stopColor={grad.to} />
                  </linearGradient>
                </defs>
                <rect width="800" height="192" fill={`url(#cb-${seed})`} />

                {/* Decorative background circles */}
                <circle cx={640 + (seed % 80)} cy={50 + (seed % 50)} r={80 + (seed % 30)} fill="white" opacity="0.06" />
                <circle cx={150 + (seed % 60)} cy={130 + (seed % 40)} r={60 + (seed % 25)} fill="white" opacity="0.05" />
                <circle cx={400 + (seed % 100)} cy={30 + (seed % 40)} r={45 + (seed % 20)} fill="white" opacity="0.04" />

                {/* Scattered subject symbols */}
                {picked.map((sym, i) => (
                  <text
                    key={i}
                    x={positions[i].x}
                    y={positions[i].y}
                    fontSize={positions[i].size}
                    fill="white"
                    opacity={positions[i].opacity}
                    fontFamily="system-ui, sans-serif"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${positions[i].rotate}, ${positions[i].x}, ${positions[i].y})`}
                  >
                    {sym}
                  </text>
                ))}

                {/* Large hero symbol */}
                <text
                  x={680 + (seed % 60)}
                  y={80 + (seed % 40)}
                  fontSize="56"
                  fill="white"
                  opacity="0.1"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={`rotate(${(seed % 30) - 15}, ${680 + (seed % 60)}, ${80 + (seed % 40)})`}
                >
                  {symbols[seed % symbols.length]}
                </text>
              </svg>

              {/* Shimmer on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />

              {/* Bottom gradient for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              {/* Content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between z-10">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                    {courseData.title}
                  </h1>
                  <p className="text-lg text-white/80 mt-1 drop-shadow">
                    {courseData.teacher?.name}
                  </p>
                </div>
                {liveMeeting ? (
                  <div className="ml-8">
                    <button
                      onClick={() => navigate(`/vconf/meeting/${liveMeeting._id}`)}
                      className="flex justify-center items-center gap-2 text-sm px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors animate-pulse border border-green-400 no-underline shadow-lg cursor-pointer"
                    >
                      <MdLiveTv />
                      {liveMeeting.status === "live" ? "Join Live Class" : "🔴 Class Starting Soon"}
                    </button>
                  </div>
                ) : (
                  <div className="ml-8">
                    <button
                      disabled
                      className="flex justify-center items-center gap-2 text-sm px-5 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl cursor-not-allowed border border-white/30 shadow-lg"
                    >
                      <MdLiveTv />
                      No Live Class Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm w-full border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 px-4 py-2 mr-6 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-6">
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
              {Object.keys(navigationOptions).map((key) => (
                <React.Fragment key={key}>
                  {renderDropdown(key)}
                </React.Fragment>
              ))}

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

              {/* Gradebook Button with underline effect */}
              <button
                onClick={() => setSelectedOption("Gradebook")}
                className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  selectedOption === "Gradebook"
                    ? "text-accent1 dark:text-accent1"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <BarChart2 className="w-5 h-5" />
                <span>Gradebook</span>
                {/* Add line below when selected */}
                {selectedOption === "Gradebook" && (
                  <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-full h-1 bg-accent1 dark:bg-accent1 rounded-full"></div>
                )}
              </button>

            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default CourseManagement;
