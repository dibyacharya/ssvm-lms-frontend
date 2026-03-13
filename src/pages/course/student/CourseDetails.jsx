import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  ArrowLeft,
  ChevronDown,
  BookOpen,
  Video,
  FileText,
  BarChart2,
  Activity,
  Home,
  ClipboardList,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { getCoursesById } from "../../../services/course.service";
import { useCourse } from "../../../context/CourseContext";
import { useMeetingsV2 } from "../../../context/MeetingV2Context";
import { getCourseBannerProps } from "../../../utils/courseBannerHelper";
import LoadingSpinner from "../../../utils/LoadingAnimation";
import SyllabusAccordion from "../../../components/dashboard/utils/SyllabusComponent";
import CoursePageBanner from "../../../components/shared/CoursePageBanner";
import CourseDescription from "../teacher/course/CourseDescription";
import StudentClassSchedule from "./course/StudentClassSchedule";
import { TfiAnnouncement } from "react-icons/tfi";
import { FaSignOutAlt } from "react-icons/fa";
import StudentHome from "./course/StudentHome";
import StudentContentSection from "./course/Content/StudentContentSection";
import DiscussionForum from "../teacher/course/DiscussionForm";
import ContinuousAssessment from "../teacher/course/ContinuousAssessment";
import StudentAttendance from "./course/StudentAttendance";
import StudentCourseGradebook from "./course/StudentCourseGradebook";
import { useAuth } from "../../../context/AuthContext";
import { MdLiveTv } from "react-icons/md";
import LecturePanel from "../../lecture/LecturePanel";
import { VscCommentDiscussion } from "react-icons/vsc";
import ProfileDropdown from "../../../utils/ProfileDropDown";
import AllAnnouncements from "./course/AllAnnouncements";

const CourseDetails = () => {
  const [selectedOption, setSelectedOption] = useState("Home");
  const [openDropdown, setOpenDropdown] = useState(null);
  const { courseID } = useParams();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { courseData: course, setCourseData } = useCourse();
  const [loading, setLoading] = useState(true);
  const dropdownRefs = useRef({});

  // Navigation — matches teacher portal structure
  const navigationOptions = {
    course: {
      title: "Course",
      icon: <BookOpen className="w-5 h-5" />,
      items: [
        { label: "Course Description", icon: <FileText className="w-5 h-5" /> },
        { label: "Class Schedule", icon: <ClipboardList className="w-5 h-5" /> },
        { label: "Syllabus", icon: <BookOpen className="w-5 h-5" /> },
      ],
    },
    assessment: {
      title: "Assessment",
      icon: <Activity className="w-5 h-5" />,
      items: [
        { label: "Continuous Assessment Plan", icon: <BarChart2 className="w-5 h-5" /> },
        { label: "Continuous Assessment", icon: <Activity className="w-5 h-5" /> },
      ],
    },
    liveclass: {
      title: "Live Class",
      icon: <Video className="w-5 h-5" />,
      items: [
        { label: "Class Recordings", icon: <Video className="w-5 h-5" /> },
        { label: "Attendance", icon: <ClipboardList className="w-5 h-5" /> },
      ],
    },
  };

  // Get meetings data
  const { getMeetingsForCourse, fetchMeetingsForCourse } = useMeetingsV2();

  useEffect(() => {
    if (courseID) {
      fetchMeetingsForCourse(courseID).catch(() => {});
    }
  }, [courseID, fetchMeetingsForCourse]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await getCoursesById(courseID);
        const normalizedSyllabus = (() => {
          if (!response?.syllabus) return { modules: [] };
          let modules = [];
          if (Array.isArray(response.syllabus)) {
            modules = response.syllabus;
          } else if (Array.isArray(response.syllabus.modules)) {
            modules = response.syllabus.modules;
          }
          modules = modules.map((module) => ({
            ...module,
            topics: Array.isArray(module.topics) ? module.topics : [],
          }));
          return { modules };
        })();
        setCourseData({ ...response, syllabus: normalizedSyllabus });
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseID, setCourseData]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown) {
        const currentDropdownRef = dropdownRefs.current[openDropdown];
        if (currentDropdownRef && !currentDropdownRef.contains(event.target)) {
          setOpenDropdown(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  // Check for live meeting
  // Live meeting detection — checks every 15s for meetings starting within 5 min
  const [liveMeeting, setLiveMeeting] = useState(null);
  const checkLiveMeeting = useCallback(() => {
    const meetings = getMeetingsForCourse(courseID) || [];
    if (!courseID || !meetings.length) { setLiveMeeting(null); return; }
    const now = new Date();
    const THRESHOLD_MS = 5 * 60 * 1000;

    const live = meetings.find(
      (m) => m.course === courseID && m.status === "live"
    );
    if (live) { setLiveMeeting(live); return; }

    const upcoming = meetings.find((m) => {
      if (m.course !== courseID || m.status !== "upcoming") return false;
      const diff = new Date(m.start) - now;
      return diff > 0 && diff <= THRESHOLD_MS;
    });
    setLiveMeeting(upcoming || null);
  }, [courseID, getMeetingsForCourse]);

  useEffect(() => {
    checkLiveMeeting();
    const timer = setInterval(checkLiveMeeting, 15_000);
    return () => clearInterval(timer);
  }, [checkLiveMeeting]);

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  // Dropdown renderer — same as teacher portal
  const renderDropdown = (menuKey) => {
    if (!navigationOptions[menuKey]) return null;
    const { title, icon, items } = navigationOptions[menuKey];
    const isTabSelected =
      selectedOption === title ||
      (items && items.some((item) => selectedOption === item.label));

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
          {selectedOption === title && (
            <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-full h-1 bg-accent1 dark:bg-accent1 rounded-full"></div>
          )}
        </button>
      );
    }

    return (
      <div
        className="relative dropdown-container"
        ref={(el) => (dropdownRefs.current[menuKey] = el)}
      >
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
          {isTabSelected && (
            <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-full h-1 bg-accent1 dark:bg-accent1 rounded-full"></div>
          )}
        </button>

        {openDropdown === menuKey && (
          <div className="absolute left-0 mt-1.5 w-fit min-w-[200px] max-w-[260px] bg-white dark:bg-gray-800 rounded-md shadow-md dark:shadow-lg border border-gray-200 dark:border-gray-600 p-1 z-50">
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

  const renderContent = () => {
    switch (selectedOption) {
      case "Home":
        return <StudentHome setSelectedOption={setSelectedOption} />;
      case "Course Description":
        return <CourseDescription />;
      case "Class Schedule":
        return <StudentClassSchedule />;
      case "Syllabus":
        return (
          <div className="max-w-[1600px] mx-auto mt-4">
            <CoursePageBanner
              icon={BookOpen}
              title="Course Syllabus"
              subtitle="Detailed syllabus and module breakdown"
              gradient="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-500"
            />
            <div className="p-10">
              <SyllabusAccordion course={course} />
            </div>
          </div>
        );
      case "Continuous Assessment Plan":
        return <ContinuousAssessment mode="plan" readOnly />;
      case "Continuous Assessment":
        return <ContinuousAssessment mode="assessment" readOnly />;
      case "Class Recordings":
        return <LecturePanel />;
      case "Attendance":
        return <StudentAttendance />;
      case "E-Learning":
        return <StudentContentSection />;
      case "Gradebook":
        return <StudentCourseGradebook />;
      case "Discussion":
        return <DiscussionForum />;
      case "Announcements":
        return <AllAnnouncements />;
      default:
        return (
          <div className="text-gray-900 dark:text-white">
            Welcome to the Home Section
          </div>
        );
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!course)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-900 dark:text-white text-xl">
          Course not found
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end items-center h-16">
            <div className="flex items-center space-x-4 relative z-[1000]">
              {/* Discussion Icon */}
              <abbr title="Discussion">
                <button
                  className="p-2 rounded-full hover:bg-primary/20 dark:hover:bg-blue-500/20 transition-colors text-primary/70 dark:text-blue-400/70 hover:text-primary dark:hover:text-blue-400"
                  onClick={() => setSelectedOption("Discussion")}
                >
                  <VscCommentDiscussion size={20} />
                </button>
              </abbr>
              {/* Announcements Icon */}
              <abbr title="Announcements">
                <button
                  className="p-2 rounded-full hover:bg-primary/20 dark:hover:bg-blue-500/20 transition-colors text-primary/70 dark:text-blue-400/70 hover:text-primary dark:hover:text-blue-400"
                  onClick={() => setSelectedOption("Announcements")}
                >
                  <TfiAnnouncement size={18} />
                </button>
              </abbr>
              <ProfileDropdown role={"student"} />
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

      {/* Course Header Banner — Same as teacher portal (SVG gradient + symbols) */}
      {(() => {
        const { grad, symbols, seed } = getCourseBannerProps(course);
        const picked = [];
        for (let i = 0; i < 12; i++)
          picked.push(symbols[(seed + i * 3) % symbols.length]);
        const positions = [];
        let sx = (seed * 7) % 800;
        let sy = (seed * 3) % 140;
        for (let i = 0; i < 12; i++) {
          sx = ((sx + 197) % 760) + 20;
          sy = (((sy + 53 + i * 17) % 150) + 15);
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
                  <linearGradient
                    id={`cb-${seed}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={grad.from} />
                    <stop offset="50%" stopColor={grad.via} />
                    <stop offset="100%" stopColor={grad.to} />
                  </linearGradient>
                </defs>
                <rect width="800" height="192" fill={`url(#cb-${seed})`} />
                {/* Decorative circles */}
                <circle
                  cx={640 + (seed % 80)}
                  cy={50 + (seed % 50)}
                  r={80 + (seed % 30)}
                  fill="white"
                  opacity="0.06"
                />
                <circle
                  cx={150 + (seed % 60)}
                  cy={130 + (seed % 40)}
                  r={60 + (seed % 25)}
                  fill="white"
                  opacity="0.05"
                />
                <circle
                  cx={400 + (seed % 100)}
                  cy={30 + (seed % 40)}
                  r={45 + (seed % 20)}
                  fill="white"
                  opacity="0.04"
                />
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
                    {course.title}
                  </h1>
                  <p className="text-lg text-white/80 mt-1 drop-shadow">
                    {course.teacher?.name}
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

      {/* Navigation Bar — matches teacher portal */}
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
              {/* Home Button */}
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
                {selectedOption === "Home" && (
                  <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-full h-1 bg-accent1 dark:bg-accent1 rounded-full"></div>
                )}
              </button>

              {/* Dropdown Menus: Course, Assessment, Live Class */}
              {Object.keys(navigationOptions).map((key) => (
                <React.Fragment key={key}>
                  {renderDropdown(key)}
                </React.Fragment>
              ))}

              {/* E-Learning Button */}
              <button
                onClick={() => setSelectedOption("E-Learning")}
                className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  selectedOption === "E-Learning"
                    ? "text-accent1 dark:text-accent1"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>E-Learning</span>
                {selectedOption === "E-Learning" && (
                  <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-full h-1 bg-accent1 dark:bg-accent1 rounded-full"></div>
                )}
              </button>

              {/* Gradebook Button */}
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

export default CourseDetails;
