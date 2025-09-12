import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  ArrowLeft,
  ChevronDown,
  BookOpen,
  Users,
  Video,
  FileText,
  BarChart2,
  MonitorPlay,
  Activity,
  Home,
  Book,
} from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getCoursesById } from "../../../services/course.service";
import { useCourse } from "../../../context/CourseContext";
import { useMeeting } from "../../../context/MeetingContext"; 
import LoadingSpinner from "../../../utils/LoadingAnimation";
import MentorInfo from "../../../components/dashboard/utils/MentorInfo";
import CourseInfo from "../../../components/dashboard/utils/CourseInfo";
import WeeklyPlanTable from "../../../components/dashboard/utils/WeeklyInfo";
import SyllabusAccordion from "../../../components/dashboard/utils/SyllabusComponent";
import LectureContent from "../../../components/dashboard/utils/RecordedComponent";
import AssignmentsList from "../../../components/dashboard/utils/AssignmentComponent/AssignmentList";
import CourseDetailsComponents from "../../../components/dashboard/utils/CourseDetailsComponent";
import { TfiAnnouncement } from "react-icons/tfi";
import { FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { IoIosHome } from "react-icons/io";
import StudentHome from "./course/StudentHome";
import StudentContentSection from "./course/Content/StudentContentSection";
import SelfQuiz from "../teacher/course/Test/SelfQuiz";
import DiscussionForum from "../teacher/course/DiscussionForm";
import { useAuth } from "../../../context/AuthContext";
import { MdLiveTv } from "react-icons/md";
import LecturePanel from "../../lecture/LecturePanel";
import StudentAssignmentSection from "../../Assignment/student/ShowAssignment";
import { VscCommentDiscussion } from "react-icons/vsc";
import ProfileDropdown from "../../../utils/ProfileDropDown";
import AllAnnouncements from "./course/AllAnnouncements.jsx/AllAnnouncements";
import StudentActivitySection from "../../Activity/student/StudentActivitySection";
import { Si1Panel } from "react-icons/si";


const navigationOptions = {
  home: {
    title: "Home",
    icon: <IoIosHome className="w-5 h-5" />,
  },
  courses: {
    title: "Course",
    icon: <BookOpen className="w-5 h-5" />,
  },
  content: {
    title: "Content",
    icon: <MonitorPlay className="w-5 h-5" />,
    items: [
      { label: "Class Rec.", icon: <Video className="w-5 h-5" /> },
      { label: "E-Learning", icon: <FileText className="w-5 h-5" /> },
    ],
  },
  assessment: {
    title: "Assessment",
    icon: <BarChart2 className="w-5 h-5" />,
    items: [
      { label: "Graded", icon: <FileText className="w-5 h-5" /> },
      { label: "Self Assessment", icon: <FileText className="w-5 h-5" /> },
      { label: "Activity", icon: <Activity className="w-5 h-5" /> },
    ],
  },
  assignment: {
    title: "Discussion",
    icon: <FileText className="w-5 h-5" />,
  },
};

const CourseDetails = () => {
  const [selectedOption, setSelectedOption] = useState("Home");
  const [openDropdown, setOpenDropdown] = useState(null);
  const { courseID } = useParams();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { courseData: course, setCourseData } = useCourse();
  const [loading, setLoading] = useState(true);
  const dropdownRefs = useRef({});

  // 2. Get meetings data from the context
  const { meetings } = useMeeting();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await getCoursesById(courseID);
        setCourseData(response);
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseID, setCourseData]);

  // Add click outside listener
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  // 3. Check for a currently live meeting for THIS specific course
  const liveMeeting = useMemo(() => {
    if (!meetings || !courseID) return null;

    const now = new Date(); // Get current time

    // Find a meeting that belongs to the current course and is within its time frame
    return meetings.find(meeting => {
      const isForThisCourse = meeting.courseId === courseID;
      if (!isForThisCourse) return false;

      const startTime = new Date(meeting.start);
      const endTime = new Date(meeting.end);
      
      return now >= startTime && now <= endTime;
    });
  }, [meetings, courseID]); // This will re-check whenever meetings data changes


  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

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

  const renderContent = () => {
    switch (selectedOption) {
      case "Home": return <StudentHome setSelectedOption={setSelectedOption} />;
      case "Course": return (
          <div className="max-w-[1600px] mx-auto mt-4">
            <div className="text-3xl pl-10 font-bold text-gray-900 dark:text-white">Explore Course</div>
            <div className="p-10 flex flex-col gap-2">
              <div className="flex gap-4 ">
                <div className="flex flex-col w-[50%]">
                  <MentorInfo />
                  <SyllabusAccordion course={course} />
                </div>
                <CourseInfo course={course} />
              </div>
              <WeeklyPlanTable course={course} />
            </div>
          </div>
        );
      case "Discussion": return <DiscussionForum />;
      case "Class Rec.": return <LecturePanel />;
      case "E-Learning": return <StudentContentSection />;
      case "Graded": return <StudentAssignmentSection courseID={courseID} selectedID="0" />;
      case "Self Assessment": return <SelfQuiz />;
      case "Activity": return <StudentActivitySection courseID={courseID} selectedID="0" />;
      case "Assignments": return <AssignmentsList />;
      case "Announcements": return <AllAnnouncements />;
      default: return <div className="text-gray-900 dark:text-white">Welcome to the Home Section</div>;
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!course) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-gray-900 dark:text-white text-xl">Course not found</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50  dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end items-center h-16">
            <div className="flex items-center space-x-4 relative z-[1000]">
              <abbr title="Announcements">
                <button className="p-2 rounded-full hover:bg-primary/20 dark:hover:bg-blue-500/20 transition-colors text-primary/70 dark:text-blue-400/70 hover:text-primary dark:hover:text-blue-400">
                  <TfiAnnouncement
                    onClick={() => setSelectedOption("Announcements")}
                  />
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
      {/* <Link to={"/its"} className="fixed h-16 w-16 bg-white dark:bg-gray-800 border-black dark:border-gray-600 border-2 rounded top-[60%] z-100 flex flex-col items-center justify-center"><Si1Panel className=" h-8 w-8 text-gray-900 dark:text-white" /> <span className="text-gray-900 dark:text-white">ITS</span></Link> */}
      
      {/* Course Banner */}
   <div className="w-[90%] m-auto pt-4">
  {/* Header Section */}
  <div className="flex items-center justify-between mb-6">
    <div className="flex-1">
      <h1 className="text-4xl font-bold text-primary dark:text-blue-400">
       {course.title}
      </h1>
      <p className="text-xl text-primary/60 dark:text-blue-400/70 mt-2">
          {course.teacher?.name }
      </p>
    </div>
    
    {/* Live Class Button */}
    <div className="ml-8">
      <button
        disabled
        className="flex justify-center items-center gap-2 text-lg px-6 py-2 bg-gray-400 dark:bg-gray-600 text-white dark:text-gray-300 rounded-lg cursor-not-allowed"
      >
        <MdLiveTv />
        No Live Class Now
      </button>
    </div>
  </div>

  {/* Tab Navigation */}
 
</div>

      {/* Navigation */}
      <nav className="absolute shadow-sm top-0 bg-red-400 dark:bg-red-500 w-full z-40">
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
              {Object.keys(navigationOptions).map((key) => renderDropdown(key))}
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