import { useState, useEffect, useMemo } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from "react-accessible-accordion";
import "react-accessible-accordion/dist/fancy-example.css";
import {
  Book,
  CheckSquare,
  Calendar,
  Bell,
  GraduationCap,
  ChevronDown,
  Lock,
  Layers,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  BookOpen,
  Target,
} from "lucide-react";
import { getAllStudentCourses } from "../../../services/course.service";
import { getMyProfile } from "../../../services/profile.service";
import LoadingSpinner from "../../../utils/LoadingAnimation";
import { getPeriodLabel } from "../../../utils/periodLabel";
import DashboardBanner from "./DashboardBanner";
import EIDCard from "../../../components/shared/EIDCard";
import TodaysClasses from "../../../components/dashboard/TodaysClasses";

import DashboardSemesterContent from "./DashBoardSemContent";

// Gradient color palette for semester cards — cycles through these
const CARD_GRADIENTS = [
  { bg: "from-blue-500 to-cyan-400", light: "bg-blue-50 dark:bg-blue-900/20", accent: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-700", ring: "ring-blue-400" },
  { bg: "from-violet-500 to-purple-400", light: "bg-violet-50 dark:bg-violet-900/20", accent: "text-violet-600 dark:text-violet-400", border: "border-violet-200 dark:border-violet-700", ring: "ring-violet-400" },
  { bg: "from-emerald-500 to-teal-400", light: "bg-emerald-50 dark:bg-emerald-900/20", accent: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-700", ring: "ring-emerald-400" },
  { bg: "from-amber-500 to-orange-400", light: "bg-amber-50 dark:bg-amber-900/20", accent: "text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-700", ring: "ring-amber-400" },
  { bg: "from-pink-500 to-rose-400", light: "bg-pink-50 dark:bg-pink-900/20", accent: "text-pink-600 dark:text-pink-400", border: "border-pink-200 dark:border-pink-700", ring: "ring-pink-400" },
  { bg: "from-indigo-500 to-blue-400", light: "bg-indigo-50 dark:bg-indigo-900/20", accent: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-200 dark:border-indigo-700", ring: "ring-indigo-400" },
  { bg: "from-teal-500 to-green-400", light: "bg-teal-50 dark:bg-teal-900/20", accent: "text-teal-600 dark:text-teal-400", border: "border-teal-200 dark:border-teal-700", ring: "ring-teal-400" },
  { bg: "from-red-500 to-pink-400", light: "bg-red-50 dark:bg-red-900/20", accent: "text-red-600 dark:text-red-400", border: "border-red-200 dark:border-red-700", ring: "ring-red-400" },
];

export default function DashboardSemester({ setActiveSection }) {
  const [showNotification, setShowNotification] = useState(false);
  const [semesterTabs, setSemesterTabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [defaultExpanded, setDefaultExpanded] = useState([]);
  const [periodLabel, setPeriodLabel] = useState(getPeriodLabel());
  const [coursesData, setCoursesData] = useState(null);
  const [profileData, setProfileData] = useState(null);

  // Fetch profile for e-ID card (online program students)
  useEffect(() => {
    getMyProfile()
      .then((data) => setProfileData(data))
      .catch(() => {});
  }, []);

  // Check if student is in an online program
  const isOnlineProgram =
    profileData?.linked?.program?.modeOfDelivery?.toLowerCase().includes("online") || false;

  // Time-of-day greeting
  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: "Good Morning", icon: Sunrise };
    if (hour >= 12 && hour < 17) return { text: "Good Afternoon", icon: Sun };
    if (hour >= 17 && hour < 21) return { text: "Good Evening", icon: Sunset };
    return { text: "Good Night", icon: Moon };
  }, []);

  // Today's date
  const todayDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getAllStudentCourses();
        setCoursesData(data);

        // Detect period type: prefer user-level (from program), fallback to course-level
        const detectedPeriodType = data.user?.periodType
          || data.courses?.find(c => c.periodType || c.semester?.periodType)?.periodType
          || data.courses?.find(c => c.semester?.periodType)?.semester?.periodType
          || "semester";
        const label = getPeriodLabel(detectedPeriodType);
        setPeriodLabel(label);

        // Extract unique semNumbers from courses
        const semNumbersWithCourses = [...new Set(data.courses
          .map(course => course.semNumber || course.semester?.semNumber)
          .filter(semNum => semNum != null)
        )].sort((a, b) => a - b);

        // Count courses per semester
        const coursesPerSem = {};
        data.courses.forEach(course => {
          const semNum = course.semNumber || course.semester?.semNumber;
          if (semNum != null) {
            coursesPerSem[semNum] = (coursesPerSem[semNum] || 0) + 1;
          }
        });

        // Use totalSemesters from student's program (returned by API)
        // Fall back to hardcoded defaults only if API doesn't provide it
        const programTotal = data.user?.totalSemesters;
        const fallbackMax = { semester: 8, term: 12, month: 12, week: 52, days: 30 };
        const maxDefault = programTotal || fallbackMax[detectedPeriodType] || 8;
        const maxSemNumber = semNumbersWithCourses.length > 0
          ? Math.max(...semNumbersWithCourses, maxDefault)
          : maxDefault;

        // Create tabs with dynamic period label
        const tabs = [];
        for (let i = 1; i <= maxSemNumber; i++) {
          const hasCourses = semNumbersWithCourses.includes(i);
          tabs.push({
            semNumber: i,
            name: `${label} ${i}`,
            accessible: hasCourses,
            courseCount: coursesPerSem[i] || 0,
          });
        }

        setSemesterTabs(tabs);

        // Set default expanded to first available period
        if (semNumbersWithCourses.length > 0) {
          setDefaultExpanded([`semester-${semNumbersWithCourses[0]}`]);
        } else {
          setDefaultExpanded([]);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Stats summary
  const stats = useMemo(() => {
    if (!coursesData) return { totalCourses: 0, activeSemesters: 0 };
    const activeSemesters = semesterTabs.filter(s => s.accessible).length;
    return {
      totalCourses: coursesData.courses?.length || 0,
      activeSemesters,
    };
  }, [coursesData, semesterTabs]);

  if (loading) {
    return (
      <div className="mx-auto p-6 max-w-7xl">
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6 max-w-7xl space-y-6">
      {/* Hero Banner */}
      <DashboardBanner
        icon={GraduationCap}
        title={`${timeGreeting.text}${coursesData?.user?.name ? `, ${coursesData.user.name}` : ""}!`}
        subtitle={`Welcome to your Student Dashboard • ${todayDate}`}
        gradient="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500"
        rightContent={
          <div className="flex items-center gap-3">
            {/* Quick Stats */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-xl">
              <BookOpen className="w-4 h-4 text-white/80" />
              <span className="text-white/90 text-sm font-medium">{stats.totalCourses} Courses</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-xl">
              <Layers className="w-4 h-4 text-white/80" />
              <span className="text-white/90 text-sm font-medium">{stats.activeSemesters} Active {periodLabel}s</span>
            </div>
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotification(!showNotification)}
              className="relative p-2.5 bg-white/15 backdrop-blur-sm rounded-xl hover:bg-white/25 transition-colors"
            >
              <Bell className="h-5 w-5 text-white" />
              <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-400 rounded-full ring-2 ring-white/20"></span>
            </button>
          </div>
        }
      />

      {/* e-ID Card for Online Program Students */}
      {isOnlineProgram && profileData && (
        <EIDCard
          name={profileData.user?.name || ""}
          program={profileData.academicSummary?.program || ""}
          programDuration={profileData.linked?.program?.duration || ""}
          enrollmentNo={profileData.academicSummary?.enrollmentNo || ""}
          admissionBatch={profileData.academicSummary?.batch || ""}
          photoUrl={profileData.profilePhotoUrl || ""}
        />
      )}

      {/* Today's Classes */}
      <TodaysClasses />

      {/* Notification Dropdown */}
      {showNotification && (
        <div className="absolute right-10 mt-0 w-80 bg-white dark:bg-gray-700 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-600 p-4 z-50">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-colors">
              <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Book className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  New course material available
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section Label */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-gray-300 dark:from-gray-600 to-transparent"></div>
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Your {periodLabel}s
        </span>
        <div className="h-px flex-1 bg-gradient-to-l from-gray-300 dark:from-gray-600 to-transparent"></div>
      </div>

      {/* Semester Accordion */}
      <Accordion allowZeroExpanded preExpanded={defaultExpanded}>
        {semesterTabs.map((semester, index) => {
          const colorScheme = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
          const isAccessible = semester.accessible;

          return (
            <AccordionItem
              key={`semester-${semester.semNumber}`}
              uuid={`semester-${semester.semNumber}`}
              disabled={!isAccessible}
              className="mb-3"
            >
              <AccordionItemHeading>
                <AccordionItemButton
                  className={
                    isAccessible
                      ? `group relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl border ${colorScheme.border} p-0 cursor-pointer hover:shadow-lg hover:ring-2 hover:${colorScheme.ring} transition-all duration-300`
                      : "relative overflow-hidden bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-0 cursor-not-allowed opacity-60"
                  }
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Number Badge with gradient */}
                    <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${isAccessible ? colorScheme.bg : "from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700"} flex items-center justify-center shadow-md flex-shrink-0`}>
                      <span className="text-xl font-bold text-white">{semester.semNumber}</span>
                      {!isAccessible && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-400 dark:bg-gray-500 rounded-full flex items-center justify-center">
                          <Lock className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Semester Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-lg font-bold ${isAccessible ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
                        {semester.name}
                      </h3>
                      <p className={`text-sm ${isAccessible ? "text-gray-500 dark:text-gray-400" : "text-gray-400 dark:text-gray-600"}`}>
                        {isAccessible
                          ? `${semester.courseCount} course${semester.courseCount !== 1 ? "s" : ""} enrolled`
                          : "No courses available"
                        }
                      </p>
                    </div>

                    {/* Right side: status + chevron */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {isAccessible && (
                        <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${colorScheme.light} ${colorScheme.accent}`}>
                          <Target className="w-3 h-3" />
                          Active
                        </span>
                      )}
                      {isAccessible && (
                        <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-300 group-[[aria-expanded=true]]:rotate-180" />
                      )}
                    </div>
                  </div>

                  {/* Bottom accent bar for accessible semesters */}
                  {isAccessible && (
                    <div className={`h-1 w-full bg-gradient-to-r ${colorScheme.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  )}
                </AccordionItemButton>
              </AccordionItemHeading>
              {isAccessible && (
                <AccordionItemPanel className="pt-2">
                  <DashboardSemesterContent
                    setActiveSection={setActiveSection}
                    semNumber={semester.semNumber}
                  />
                </AccordionItemPanel>
              )}
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
