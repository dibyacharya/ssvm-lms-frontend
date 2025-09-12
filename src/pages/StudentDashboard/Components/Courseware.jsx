import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Book, PlayCircle, Clock, Calendar } from "lucide-react";
import { getAllStudentCourses } from "../../../services/course.service";
import LoadingSpinner from "../../../utils/LoadingAnimation";

const semesters = [
  { name: "Semester 1", accessible: true },
  { name: "Semester 2", accessible: false },
  { name: "Semester 3", accessible: false },
  { name: "Semester 4", accessible: false },
  { name: "Semester 5", accessible: false },
  { name: "Semester 6", accessible: false },
];

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

const courseImages = [
  "https://thumbs.dreamstime.com/b/businessman-looking-dice-sketch-thoughtful-chalkboard-connected-game-probability-theory-73451825.jpg",
  "https://i.ytimg.com/vi/96bNsQgv10A/maxresdefault.jpg",
  "https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=2070&auto=format&fit=crop"
];

const DEFAULT_COURSE_IMAGE =
  "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const Courseware = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [availableSemesters, setAvailableSemesters] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getAllStudentCourses();
        
        // Assign course images
        courseImages.forEach((img, index) => {
          if (data.courses[index]) {
            data.courses[index].coverImage = img;
          }
        });
        
        // Extract unique semesters from courses
        const uniqueSemesters = [...new Set(data.courses.map(course => course.semester.name))];
        setAvailableSemesters(uniqueSemesters);
        
        setCourses(data.courses || []);
        setUserInfo(data.user);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProgressColor = (lectureCount) => {
    if (lectureCount >= 4) return "bg-green-500";
    if (lectureCount >= 2) return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-100 dark:border-gray-700">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {userInfo?.name || 'Student'}!
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Continue your learning journey with {userInfo?.totalCourses || 0} enrolled courses
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Courses</div>
                <div className="text-2xl font-bold text-accent1 dark:text-blue-400">{userInfo?.totalCourses || 0}</div>
              </div>
            </div>
            
            {/* Semester Navigation */}
            <ul className="flex space-x-2 overflow-x-auto pb-2">
              {semesters.map((semester, index) => (
                <li key={index}>
                  <button
                    onClick={() => semester.accessible && setActiveTab(index)}
                    className={`px-6 py-3 rounded-xl transition-all duration-200 text-sm font-medium whitespace-nowrap ${
                      activeTab === index
                        ? "bg-accent1 dark:bg-accent1  text-white shadow-lg shadow-green-600/25 dark:shadow-green-500/25"
                        : semester.accessible
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md dark:hover:shadow-lg"
                        : "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={!semester.accessible}
                  >
                    {semester.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {semesters[activeTab].name} Courses
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {courses.length} {courses.length === 1 ? 'course' : 'courses'} available
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-16">
                <LoadingSpinner />
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-16">
                <Book className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">No courses available</p>
                <p className="text-gray-500 dark:text-gray-400">Check back later for new courses in this semester.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, index) => (
                  <Link
                    key={course._id}
                    to={`/student/course/${course._id}`}
                    className="group bg-white dark:bg-gray-700 rounded-2xl shadow-lg hover:shadow-2xl dark:hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-600 hover:border-blue-200 dark:hover:border-blue-400 transform hover:-translate-y-1"
                  >
                    {/* Course Image */}
                    <div className="relative overflow-hidden">
                      <img
                        src={course.coverImage || DEFAULT_COURSE_IMAGE}
                        alt={course.title}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-4 right-4">
                        <span className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 dark:text-gray-200">
                          {course.semester.name}
                        </span>
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <Book className="h-5 w-5 text-accent1 dark:text-blue-400 mr-2 flex-shrink-0" />
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-accent1 dark:group-hover:text-blue-400 transition-colors">
                            {course.title}
                          </h3>
                        </div>
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                        {course.aboutCourse}
                      </p>

                      {/* Course Stats */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <PlayCircle className="h-4 w-4 mr-1" />
                            <span>{course.lectureCount} lectures</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{calculateSemesterWeeks(course.semester.startDate,course.semester.endDate)} weeks</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                     

                        {/* Semester Dates */}
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-600">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>
                            {formatDate(course.semester.startDate)} - {formatDate(course.semester.endDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courseware;