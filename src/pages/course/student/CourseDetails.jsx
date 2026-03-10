import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  ArrowLeft,
  ChevronDown,
  BookOpen,
  Users,
  Video,
  FileText,
  BarChart2,
  Activity,
  Home,
  Book,
} from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getCoursesById } from "../../../services/course.service";
import { useCourse } from "../../../context/CourseContext";
import { useMeetingsV2 } from "../../../context/MeetingV2Context";
import { resolveCourseTheme } from "../../../utils/courseThemeResolver";
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
import AllAnnouncements from "./course/AllAnnouncements";
import StudentActivitySection from "../../Activity/student/StudentActivitySection";
import { Si1Panel } from "react-icons/si";
import MOM from "../teacher/course/MOM";
import StudentHandouts from "./course/StudentHandouts";
import CoursePageBanner from "../../../components/shared/CoursePageBanner";


const navigationOptions = {
  home: {
    title: "Home",
    icon: <IoIosHome className="w-5 h-5" />,
  },
  courses: {
    title: "Course",
    icon: <BookOpen className="w-5 h-5" />,
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const dropdownRefs = useRef({});

  // 2. Get meetings data from the new backend-driven context
  const { getMeetingsForCourse, fetchMeetingsForCourse } = useMeetingsV2();

  // Load meetings for this course
  useEffect(() => {
    if (courseID) {
      fetchMeetingsForCourse(courseID).catch(() => {
        // error is stored in context; component can choose to show a toast if needed
      });
    }
  }, [courseID, fetchMeetingsForCourse]);

  const courseMeetings = getMeetingsForCourse(courseID) || [];

  // Update current time every minute (used for other time-based UI if needed)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

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
          
          // Ensure each module has a topics array
          modules = modules.map(module => ({
            ...module,
            topics: Array.isArray(module.topics) ? module.topics : []
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

  // 3. Check for a currently live meeting for THIS specific course using backend status
  const liveMeeting = useMemo(() => {
    if (!courseID || !courseMeetings.length) return null;
    return courseMeetings.find(
      (meeting) =>
        meeting.course === courseID &&
        meeting.status === "live"
    );
  }, [courseID, courseMeetings]);

  // Handler for joining live class - uses only VConf join URL
  const handleJoinLiveClass = () => {
    const activeMeeting = liveMeeting;
    if (activeMeeting) {
      const joinUrl = activeMeeting.vconfJoinUrl;
      if (joinUrl) {
        window.open(joinUrl, '_blank', 'noopener,noreferrer');
      } else {
        alert("Video conference room is not ready yet. Please try again in a moment.");
      }
    } else {
      alert("There is no live class to join at the moment.");
    }
  };


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
                <span className="font-medium text-xs leading-4 text-left whitespace-nowrap">{item.label}</span>
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
            <CoursePageBanner
              icon={BookOpen}
              title="Explore Course"
              subtitle="Syllabus, mentor details, and course information"
              gradient="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-500"
            />
            <div className="p-10 flex flex-col gap-2">
              <div className="flex gap-4 ">
                <div className="flex flex-col w-[50%]">
                  <MentorInfo teacher={course?.teacher} />
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
      case "Self Assessment": return (
          <div>
            <CoursePageBanner
              icon={FileText}
              title="Self Assessment"
              subtitle="Test your knowledge with self-assessment quizzes"
              gradient="bg-gradient-to-r from-lime-600 via-green-600 to-emerald-500"
            />
            <div className="min-h-[300px] flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-semibold text-primary dark:text-blue-400 mb-2">Coming Soon</div>
                <div className="text-tertiary dark:text-gray-300">Self-assessment quizzes will be available here shortly.</div>
              </div>
            </div>
          </div>
        );
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
      {(() => {
        const theme = resolveCourseTheme(course);
        return (
          <div className="w-[90%] m-auto pt-4">
            <div className="relative rounded-2xl overflow-hidden mb-6" style={{ background: theme.gradientCSS }}>
              <img
                src={theme.bannerUrl}
                alt=""
                className="w-full h-48 object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
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
                    <a
                      href={liveMeeting.vconfJoinUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (!liveMeeting.vconfJoinUrl) {
                          e.preventDefault();
                          alert("Video conference room is not ready yet. Please try again in a moment.");
                        }
                      }}
                      className="relative z-[900] flex justify-center items-center gap-2 text-sm px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors animate-pulse border border-green-400 no-underline"
                    >
                      <MdLiveTv />
                      Join Live Class
                    </a>
                  </div>
                ) : (
                  <div className="ml-8">
                    <button
                      disabled
                      className="flex justify-center items-center gap-2 text-sm px-5 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg cursor-not-allowed border border-white/30"
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

      {/* Navigation */}
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
              {["home", "courses"].map((key) => (
                <React.Fragment key={key}>
                  {renderDropdown(key)}
                </React.Fragment>
              ))}

              {/* Class Rec. Button with underline effect */}
              <button
                onClick={() => setSelectedOption("Class Rec.")}
                className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  selectedOption === "Class Rec."
                    ? "text-accent1 dark:text-accent1"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <Video className="w-5 h-5" />
                <span>Class Rec.</span>
                {selectedOption === "Class Rec." && (
                  <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-full h-1 bg-accent1 dark:bg-accent1 rounded-full"></div>
                )}
              </button>

              {/* E-Learning Button with underline effect */}
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

              {["assessment", "assignment"].map((key) => (
                <React.Fragment key={key}>
                  {renderDropdown(key)}
                </React.Fragment>
              ))}
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
 
