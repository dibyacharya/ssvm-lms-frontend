import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Book, PlayCircle, Clock, Calendar, BookOpen, ClipboardList } from "lucide-react";
import { getAllStudentCourses } from "../../../services/course.service";
import LoadingSpinner from "../../../utils/LoadingAnimation";
import { getPeriodLabel } from "../../../utils/periodLabel";
import { getCourseBannerProps } from "../../../utils/courseBannerHelper";
import CourseBannerSVG from "../../../components/shared/CourseBannerSVG";

function calculateSemesterWeeks(startDate, endDate) {
  // 1. Create Date objects from the input strings
  const start = new Date(startDate);
  const end = new Date(endDate);

  // 2. Calculate the difference in milliseconds
  const diffInMs = end.getTime() - start.getTime();

  // 3. Define the number of milliseconds in one week
  const msInOneWeek = 1000 * 60 * 60 * 24 * 7;

  // 4. Divide the total milliseconds by milliseconds in a week and round up
  const numberOfWeeks = Math.ceil(diffInMs / msInOneWeek);

  return numberOfWeeks;
}

// Course images now resolved via lmsAssetResolver (resolveCourseTheme)

const SectionHeader = ({ icon: Icon, title, gradient, count }) => (
  <div className={`relative overflow-hidden px-6 py-4 ${gradient}`}>
    <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
    <div className="absolute -bottom-4 right-12 w-12 h-12 bg-white/5 rounded-full" />
    <div className="relative z-10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-900" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>
      </div>
      {count != null && (
        <span className="px-2.5 py-1 text-xs font-bold text-gray-900 bg-white/20 rounded-full backdrop-blur-sm">{count}</span>
      )}
    </div>
  </div>
);

const Courseware = () => {
  const [activeSemNumber, setActiveSemNumber] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [semesterTabs, setSemesterTabs] = useState([]);
  const [pLabel, setPLabel] = useState(getPeriodLabel());

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getAllStudentCourses();

        // Extract unique semNumbers from courses
        const semNumbersWithCourses = [...new Set(data.courses
          .map(course => course.semNumber || course.semester?.semNumber)
          .filter(semNum => semNum != null)
        )].sort((a, b) => a - b);

        // Detect period type: prefer user-level (from program), fallback to course-level
        const detectedPeriodType = data.user?.periodType
          || data.courses?.find(c => c.periodType || c.semester?.periodType)?.periodType
          || data.courses?.find(c => c.semester?.periodType)?.semester?.periodType
          || "semester";
        const label = getPeriodLabel(detectedPeriodType);
        setPLabel(label);

        // Use totalSemesters from student's program (returned by API)
        // Fall back to hardcoded defaults only if API doesn't provide it
        const programTotal = data.user?.totalSemesters;
        const fallbackMax = { semester: 8, term: 12, month: 12, week: 52, days: 30 };
        const defaultMax = programTotal || fallbackMax[detectedPeriodType] || 8;

        // Find the maximum number (or use a default range)
        const maxSemNumber = semNumbersWithCourses.length > 0
          ? Math.max(...semNumbersWithCourses, defaultMax)
          : defaultMax;

        // Create tabs for all periods from 1 to maxSemNumber
        // All periods with courses will be marked as accessible and selectable
        const tabs = [];
        for (let i = 1; i <= maxSemNumber; i++) {
          const hasCourses = semNumbersWithCourses.includes(i);
          tabs.push({
            semNumber: i,
            name: `${label} ${i}`,
            accessible: hasCourses
          });
        }

        setSemesterTabs(tabs);
        setAllCourses(data.courses || []);
        setUserInfo(data.user);

        // Set default active tab to first available semester (one with courses)
        if (semNumbersWithCourses.length > 0) {
          setActiveSemNumber(semNumbersWithCourses[0]);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter courses based on active semNumber
  useEffect(() => {
    if (activeSemNumber !== null && semesterTabs.length > 0) {
      const filteredCourses = allCourses.filter(course => {
        const courseSemNumber = course.semNumber || course.semester?.semNumber;
        return courseSemNumber === activeSemNumber;
      });
      setCourses(filteredCourses);
    } else {
      setCourses([]);
    }
  }, [activeSemNumber, allCourses, semesterTabs]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProgressColor = (lectureCount) => {
    if (lectureCount >= 4) return "bg-blue-500";
    if (lectureCount >= 2) return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        {/* Header Section - Gradient Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 px-8 py-8 shadow-lg">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 right-20 w-24 h-24 bg-white/5 rounded-full" />
          <div className="absolute top-4 left-[40%] w-16 h-16 bg-white/5 rounded-full" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <BookOpen className="w-7 h-7 text-gray-900" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  Welcome back, {userInfo?.name || 'Student'}!
                </h1>
                <p className="text-gray-900/80 text-sm font-medium mt-1.5">
                  Continue your learning journey with {userInfo?.totalCourses || 0} enrolled courses
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-900/70">Total Courses</div>
              <div className="text-2xl font-bold text-gray-900">{userInfo?.totalCourses || 0}</div>
            </div>
          </div>
        </div>

        {/* Semester Navigation - Pill Buttons */}
        <div className="flex flex-wrap gap-2">
          {semesterTabs.map((semester) => (
            <button
              key={semester.semNumber}
              onClick={() => {
                if (semester.accessible) {
                  setActiveSemNumber(semester.semNumber);
                }
              }}
              className={`px-6 py-3 transition-all duration-200 text-sm font-medium whitespace-nowrap ${
                activeSemNumber === semester.semNumber
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-gray-900 shadow-md rounded-xl"
                  : semester.accessible
                  ? "bg-white dark:bg-white text-gray-700 dark:text-gray-700 rounded-xl border border-tertiary/10 hover:shadow-md"
                  : "bg-gray-100 dark:bg-white text-gray-400 dark:text-gray-500 rounded-xl opacity-60 cursor-not-allowed"
              }`}
              disabled={!semester.accessible}
              aria-label={`${semester.name}${!semester.accessible ? ' (No courses available)' : ''}`}
            >
              {semester.name}
            </button>
          ))}
        </div>

        {/* Course List Section - Wrapped in Card with SectionHeader */}
        <div className="bg-white dark:bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden">
          <SectionHeader
            icon={BookOpen}
            title={activeSemNumber !== null ? `${pLabel} ${activeSemNumber} Courses` : 'Courses'}
            gradient="bg-gradient-to-r from-blue-500 to-blue-700 rounded-t-2xl"
            count={courses.length}
          />

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <LoadingSpinner />
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-16">
                <Book className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-xl text-gray-600 dark:text-gray-600 mb-2">No courses available</p>
                <p className="text-gray-500 dark:text-gray-400">Check back later for new courses in this {pLabel.toLowerCase()}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, index) => {
                  const { grad, symbols, seed } = getCourseBannerProps(course, index);
                  return (
                    <Link
                      key={course._id}
                      to={`/student/course/${course._id}`}
                    >
                      <div className="group bg-white dark:bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200/60 dark:border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                        {/* SVG Banner with Subject Symbols */}
                        <div className="relative h-36 overflow-hidden">
                          <CourseBannerSVG grad={grad} symbols={symbols} seed={seed} />
                          {/* Shimmer overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out" />
                          {/* Bottom fade for text readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                          {/* Course title on banner */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                            <h3 className="text-gray-900 font-bold text-base leading-tight drop-shadow-lg line-clamp-2">
                              {course.title}
                            </h3>
                            <p className="text-gray-900/80 text-xs mt-0.5 font-medium drop-shadow">
                              {course.semester?.name || ""}
                            </p>
                          </div>
                          {/* Semester badge */}
                          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-gray-900 text-xs font-semibold px-2.5 py-1 rounded-full border border-white/30 shadow-lg">
                            <Calendar className="w-3 h-3" />
                            {calculateSemesterWeeks(course.semester.startDate, course.semester.endDate)}w
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 space-y-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                            {(course.aboutCourse || "").length > 90
                              ? `${course.aboutCourse.substring(0, 90)}...`
                              : course.aboutCourse || "No description available"}
                          </p>

                          {/* Stats row */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-200">
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <PlayCircle className="h-3.5 w-3.5 text-blue-500" />
                              <span className="font-medium">{course.lectureCount || 0}</span>
                              <span>Lectures</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <ClipboardList className="h-3.5 w-3.5 text-blue-500" />
                              <span className="font-medium">{course.assignmentCount || 0}</span>
                              <span>Assignments</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courseware;
