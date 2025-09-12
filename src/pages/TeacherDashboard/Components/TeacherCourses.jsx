import React, { useState, useEffect, useMemo } from "react";
import { MonitorPlay, Search, ChevronDown, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { getAllCourses } from "../../../services/course.service";
import { useMeeting } from "../../../context/MeetingContext"; // 1. Import the meeting context

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
  
  // 2. Get meetings data from the context
  const { meetings } = useMeeting();

  const image = [
    "https://thumbs.dreamstime.com/b/businessman-looking-dice-sketch-thoughtful-chalkboard-connected-game-probability-theory-73451825.jpg",
    "https://i.ytimg.com/vi/96bNsQgv10A/maxresdefault.jpg",
  ];
  
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

  const getSemesterInfo = (startDate) => {
    const date = new Date(startDate);
    const month = date.getMonth();
    const year = date.getFullYear();
    let season = (month >= 0 && month <= 4) ? "Spring" : "Fall";
    return { season, year: year.toString() };
  };

  const groupCoursesBySemester = (courses) => {
    if (!courses || courses.length === 0) return [];
    const semesterMap = {};

    courses.forEach((course) => {
      if (!course.semester || !course.semester.startDate) return;
      const { season, year } = getSemesterInfo(course.semester.startDate);
      const semesterId = `${season}-${year}`;

      if (!semesterMap[semesterId]) {
        semesterMap[semesterId] = {
          season,
          year,
          semesterId: course.semester._id,
          courses: [],
        };
      }

      semesterMap[semesterId].courses.push({
        ...course,
        // Correctly calculate student count
        students: course.students ? course.students.length : 0, 
        image: `https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=1200&h=600&fit=crop`,
      });
    });

    return Object.values(semesterMap).sort((a, b) => {
      if (b.year !== a.year) return parseInt(b.year) - parseInt(a.year);
      const seasonOrder = { Spring: 0, Fall: 2 };
      return seasonOrder[a.season] - seasonOrder[b.season];
    });
  };

  // 3. Helper function to find a live meeting for any course within a semester
  const findLiveMeetingForSemester = (semesterCourses, allMeetings) => {
    if (!allMeetings || !semesterCourses) return null;
    const now = new Date();
    for (const course of semesterCourses) {
        const liveMeeting = allMeetings.find(meeting => {
            const isForThisCourse = meeting.courseId === course._id;
            if (!isForThisCourse) return false;
            // This logic treats the API time as local time by removing the 'Z'
            const startTime = new Date(meeting.start.slice(0, -1));
            const endTime = new Date(meeting.end.slice(0, -1));
            return now >= startTime && now <= endTime;
        });
        if (liveMeeting) return liveMeeting; // Return the first one found
    }
    return null; // No live meetings found in this semester
  };


  const semesters = groupCoursesBySemester(coursesData.courses);

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
      <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 dark:text-red-400 text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg mx-auto max-w-xl border border-red-200 dark:border-red-800">
        <h3 className="text-lg font-bold mb-2">Error Loading Courses</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-white dark:bg-gray-800">
      <h1 className="text-3xl font-bold text-black dark:text-white mb-6">My Courses</h1>

      {/* Search and Filter */}
      <div className="flex flex-wrap gap-4 mb-8 w-full justify-between items-center">
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 w-full md:w-1/3 border border-gray-200 dark:border-gray-600">
          <Search className="h-5 w-5 text-primary dark:text-primary/90 mr-2" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none w-full text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative w-fit">
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="appearance-none bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 text-gray-700 dark:text-gray-200 pr-8 border border-gray-200 dark:border-gray-600"
            >
              <option value="All">All Semesters</option>
              <option value="Spring">Spring</option>
              <option value="Fall">Fall</option>
            </select>
            <ChevronDown className="absolute right-2 top-3 h-5 w-5 text-gray-500 dark:text-gray-400 pointer-events-none" />
          </div>
          <div className="relative w-fit">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="appearance-none bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 text-gray-700 dark:text-gray-200 pr-8 border border-gray-200 dark:border-gray-600"
            >
              <option value="All">All Years</option>
              {uniqueYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <Calendar className="absolute right-2 top-3 h-5 w-5 text-gray-500 dark:text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">No courses found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        filteredCourses.map((semester, index) => {
          // 4. For each semester, check if there's a live meeting
          const liveMeeting = findLiveMeetingForSemester(semester.courses, meetings);

          return (
            <div key={semester.semesterId || index} className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-3">
                  <span className="bg-white dark:bg-gray-700 text-primary dark:text-primary/90 border-primary dark:border-primary/70 border-2 px-6 py-2 rounded-full text-sm font-medium">
                    {semester.season}
                  </span>
                  <span className="bg-white dark:bg-gray-700 text-primary dark:text-primary/90 border-primary dark:border-primary/70 border-2 px-6 py-2 rounded-full text-sm font-medium">
                    {semester.year}
                  </span>
                </div>
                {/* 5. DYNAMIC BUTTON - Renders as a link if active, or a disabled button if not */}
                {liveMeeting ? (
                  <a
                    href={liveMeeting.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 dark:bg-red-500 text-white px-6 py-2 rounded-md text-sm hover:bg-red-700 dark:hover:bg-red-600 transition-colors flex items-center gap-2 animate-pulse"
                  >
                    <MonitorPlay className="h-5 w-5" />
                    Join Live 
                  </a>
                ) : (
                  <button
                    disabled
                    className="bg-gray-400 dark:bg-gray-600 text-white dark:text-gray-300 px-6 py-2 rounded-md text-sm flex items-center gap-2 cursor-not-allowed"
                  >
                    <MonitorPlay className="h-5 w-5" />
                    No Live Lecture
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {semester.courses.map((course, idx) => (
                  <Link key={course._id} to={`/teacher/course/${course._id}`}>
                    <div className="group bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-md dark:shadow-lg hover:shadow-lg dark:hover:shadow-xl transition-shadow duration-300 h-full border border-gray-200 dark:border-gray-600">
                      <div className="relative h-36 overflow-hidden">
                        <img
                          src={image[idx % image.length]}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-50 transition-opacity duration-300"></div>
                        <div className="absolute bottom-2 left-2 bg-primary dark:bg-primary/90 text-white text-xs font-medium px-2 py-1 rounded-md shadow-md">
                          {course.students} Students
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-1 group-hover:text-primary dark:group-hover:text-primary/90 transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                          {course.aboutCourse.length > 80 ? `${course.aboutCourse.substring(0, 80)}...` : course.aboutCourse}
                        </p>
                        <div className="mb-3">
                          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Schedule:</h4>
                          <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                            {course.schedule?.classDaysAndTimes.map(
                              (schedule, index) => (
                                <li key={index} className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-primary dark:text-primary/90" />
                                  <span>{schedule.day}: {schedule.time}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                            <MonitorPlay className="h-3 w-3 text-primary dark:text-primary/90" />
                            <span>{course.totalLectureCount} Lectures</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                            <Search className="h-3 w-3 text-primary dark:text-primary/90" />
                            <span>{course.assignments?.length || 0} Assignments</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  );
};

export default TeacherCourses;