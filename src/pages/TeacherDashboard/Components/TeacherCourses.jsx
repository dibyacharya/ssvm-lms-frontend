import React, { useState, useEffect, useMemo } from "react";
import { MonitorPlay, Search, ChevronDown, Calendar, BookOpen, Users, ClipboardList, GraduationCap, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getAllCourses } from "../../../services/course.service";
import { useMeetingsV2 } from "../../../context/MeetingV2Context";
import { resolveCourseTheme } from "../../../utils/courseThemeResolver";
import { getPeriodLabel } from "../../../utils/periodLabel";
import { getCourseBannerProps } from "../../../utils/courseBannerHelper";
import CourseBannerSVG from "../../../components/shared/CourseBannerSVG";

const TeacherCourses = () => {
  const [coursesData, setCoursesData] = useState({
    teacher: {},
    courses: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSemester, setFilterSemester] = useState("All");
  const [filterYear, setFilterYear] = useState("All");

  const { getMeetingsForCourse, fetchMeetingsForCourse } = useMeetingsV2();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getAllCourses();
        setCoursesData(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load courses. Please try again later.");
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (coursesData.courses && coursesData.courses.length > 0) {
      const uniqueCourseIds = [...new Set((coursesData?.courses || []).map(c => c._id).filter(Boolean))];
      uniqueCourseIds.forEach(courseId => {
        fetchMeetingsForCourse(courseId).catch(() => {});
      });
    }
  }, [coursesData.courses, fetchMeetingsForCourse]);

  const getSemesterInfo = (course) => {
    const startDate = course.semester?.startDate;
    if (!startDate) return { season: "Unknown", year: "Unknown", periodLabel: getPeriodLabel(course.semester?.periodType) };

    const date = new Date(startDate);
    const month = date.getMonth();
    const year = date.getFullYear();
    const periodType = course.semester?.periodType || "semester";
    const label = getPeriodLabel(periodType);
    const semNumber = course.semester?.semNumber;

    if (periodType !== "semester") {
      const season = semNumber ? `${label} ${semNumber}` : `${label}`;
      return { season, year: year.toString(), periodLabel: label };
    }

    let season = (month >= 0 && month <= 4) ? "Spring" : "Fall";
    return { season, year: year.toString(), periodLabel: label };
  };

  const groupCoursesBySemester = (courses) => {
    if (!courses || courses.length === 0) return [];
    const semesterMap = {};

    courses.forEach((course) => {
      if (!course.semester || !course.semester.startDate) return;
      const { season, year, periodLabel: pLabel } = getSemesterInfo(course);
      const semesterId = `${season}-${year}`;

      if (!semesterMap[semesterId]) {
        semesterMap[semesterId] = {
          season,
          year,
          periodLabel: pLabel,
          semesterId: course.semester._id,
          courses: [],
        };
      }

      semesterMap[semesterId].courses.push({
        ...course,
        students: course.students ? course.students.length : 0,
      });
    });

    return Object.values(semesterMap).sort((a, b) => {
      if (b.year !== a.year) return parseInt(b.year) - parseInt(a.year);
      return a.season.localeCompare(b.season);
    });
  };

  const findLiveMeetingForSemester = (semesterCourses) => {
    if (!semesterCourses) return null;

    for (const course of semesterCourses) {
      if (!course?._id) continue;
      const courseMeetings = getMeetingsForCourse(course._id) || [];
      const liveMeeting = courseMeetings.find(
        (meeting) =>
          meeting.course === course._id &&
          meeting.status === "live"
      );
      if (liveMeeting) return liveMeeting;
    }

    return null;
  };


  const semesters = groupCoursesBySemester(coursesData.courses);
  const uniqueSeasons = [...new Set(semesters.map((s) => s.season))];

  const filteredSemesters = semesters.filter((semester) => {
    const semesterMatch = filterSemester === "All" || semester.season === filterSemester;
    const yearMatch = filterYear === "All" || semester.year === filterYear;
    return semesterMatch && yearMatch;
  });

  const filteredCourses = filteredSemesters.map((semester) => ({
    ...semester,
    courses: semester.courses.filter((course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  }));

  const uniqueYears = [...new Set(semesters.map((semester) => semester.year))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8 bg-gray-50">
        <div className="text-red-600 text-center p-8 bg-red-50 rounded-lg mx-auto max-w-xl border border-red-200 shadow-sm">
          <h3 className="text-lg font-bold mb-2">Error Loading Courses</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6 bg-gray-50">
      {/* Clean Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1E293B" }}>
            My Courses
          </h1>
          <div className="flex items-center gap-1 mt-1 text-sm" style={{ color: "#94A3B8" }}>
            <span>Home</span>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: "#475569" }}>My Courses</span>
          </div>
          <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
            Manage and track your courses
          </p>
        </div>
      </div>

      {/* Search and Filter Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 w-full justify-between items-center">
          <div className="flex items-center bg-white border border-gray-300 rounded-lg px-4 py-2.5 w-full md:w-1/3 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-400 transition-all">
            <Search className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: "#94A3B8" }} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none w-full text-sm placeholder-gray-400"
              style={{ color: "#475569" }}
            />
          </div>
          <div className="flex gap-3">
            <div className="relative w-fit">
              <select
                value={filterSemester}
                onChange={(e) => setFilterSemester(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm pr-9 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                style={{ color: "#475569" }}
              >
                <option value="All">All Periods</option>
                {uniqueSeasons.map((season) => (
                  <option key={season} value={season}>
                    {season}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-3 h-4 w-4 pointer-events-none" style={{ color: "#94A3B8" }} />
            </div>
            <div className="relative w-fit">
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm pr-9 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                style={{ color: "#475569" }}
              >
                <option value="All">All Years</option>
                {uniqueYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <Calendar className="absolute right-2.5 top-3 h-4 w-4 pointer-events-none" style={{ color: "#94A3B8" }} />
            </div>
          </div>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <h3 className="text-xl font-semibold mb-2" style={{ color: "#1E293B" }}>No courses found</h3>
          <p style={{ color: "#94A3B8" }}>Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        filteredCourses.map((semester, index) => {
          const activeMeeting = findLiveMeetingForSemester(semester.courses);

          return (
            <div key={semester.semesterId || index} className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-3">
                  <span className="bg-blue-50 text-blue-700 ring-1 ring-blue-200 px-5 py-2 rounded-full text-sm font-medium">
                    {semester.season}
                  </span>
                  <span className="bg-blue-50 text-blue-700 ring-1 ring-blue-200 px-5 py-2 rounded-full text-sm font-medium">
                    {semester.year}
                  </span>
                </div>
                {activeMeeting ? (
                  <a
                    href={activeMeeting.vconfHostUrl || activeMeeting.vconfJoinUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (!activeMeeting.vconfHostUrl && !activeMeeting.vconfJoinUrl) {
                        e.preventDefault();
                        alert("Video conference room is not ready yet. Please try again in a moment.");
                      }
                    }}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center gap-2 animate-pulse shadow-sm"
                  >
                    <MonitorPlay className="h-5 w-5" />
                    Join Live
                  </a>
                ) : (
                  <button
                    disabled
                    className="bg-gray-200 text-gray-500 px-6 py-2 rounded-lg text-sm flex items-center gap-2 cursor-not-allowed"
                  >
                    <MonitorPlay className="h-5 w-5" />
                    No Live Lecture
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {semester.courses.map((course, idx) => {
                  const query = new URLSearchParams();
                  if (course.assignmentId) query.set("assignmentId", course.assignmentId);
                  if (course.batchId) query.set("batchId", course.batchId);
                  if (course.semesterId) query.set("semesterId", course.semesterId);
                  const search = query.toString();
                  const linkTarget = search
                    ? `/teacher/course/${course._id}?${search}`
                    : `/teacher/course/${course._id}`;
                  const cardKey =
                    course.assignmentId ||
                    `${course._id}-${course.batchId || "na"}-${course.semesterId || "na"}-${idx}`;

                  const { grad, symbols, seed } = getCourseBannerProps(course, idx);
                  return (
                  <Link key={cardKey} to={linkTarget}>
                    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                      {/* Unique SVG Banner with Subject Symbols */}
                      <div className="relative h-36 overflow-hidden">
                        <CourseBannerSVG grad={grad} symbols={symbols} seed={seed} />
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                          <h3 className="text-white font-bold text-base leading-tight drop-shadow-lg line-clamp-2">
                            {course.title}
                          </h3>
                          <p className="text-white/80 text-xs mt-0.5 font-medium drop-shadow">
                            {course.cohortLabel || course.batchName || ""}
                          </p>
                        </div>
                        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-semibold pl-2 pr-2.5 py-1 rounded-full border border-white/30 shadow-lg">
                          <Users className="w-3 h-3" />
                          {course?.studentCount ?? 0}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 space-y-3">
                        <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: "#94A3B8" }}>
                          {(course.aboutCourse || "").length > 90
                            ? `${course.aboutCourse.substring(0, 90)}...`
                            : course.aboutCourse || "No description available"}
                        </p>

                        {course.schedule?.classDaysAndTimes?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {course.schedule.classDaysAndTimes.slice(0, 3).map(
                              (schedule, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-gray-100 font-medium"
                                  style={{ color: "#475569" }}
                                >
                                  <Calendar className="h-2.5 w-2.5 flex-shrink-0" />
                                  {schedule.day}
                                </span>
                              )
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-1 text-xs" style={{ color: "#94A3B8" }}>
                            <MonitorPlay className="h-3.5 w-3.5 text-blue-500" />
                            <span className="font-medium">{course.totalLectureCount || 0}</span>
                            <span>Lectures</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs" style={{ color: "#94A3B8" }}>
                            <ClipboardList className="h-3.5 w-3.5 text-blue-500" />
                            <span className="font-medium">{course.assignments?.length || 0}</span>
                            <span>Assignments</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                  );
                })}
              </div>
            </div>
          )
        })
      )}
    </div>
  );
};

export default TeacherCourses;
