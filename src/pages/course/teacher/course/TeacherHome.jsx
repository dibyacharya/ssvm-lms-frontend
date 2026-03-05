import React, { useEffect, useState, useMemo } from "react";
import {
  Circle,
  Home,
  Book,
  Bell,
  FileText,
  Calendar,
  ChevronRight,
  CheckCircle,
  Clock,
  BarChart2,
  User,
  Users,
  BookOpen,
  Megaphone,
  ExternalLink,
  ArrowRight,
  Layers,
  Sun,
  Moon,
  Sunrise,
  Sunset,
} from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { getAllCourseAnnouncements } from "../../../../services/announcement.service";
import { getAllCourseAssignments } from "../../../../services/assignment.service";
import { useCourse } from "../../../../context/CourseContext";
import { useParams } from "react-router-dom";
import { useUtilityContext } from "../../../../context/UtilityContext";
import { resolveModuleTheme } from "../../../../utils/lmsAssetResolver";
import LmsAssetImage from "../../../../components/common/LmsAssetImage";

const SectionHeader = ({ icon: Icon, title, gradient, count }) => (
  <div className={`relative overflow-hidden px-6 py-4 ${gradient}`}>
    <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
    <div className="absolute -bottom-4 right-12 w-12 h-12 bg-white/5 rounded-full" />
    <div className="relative z-10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
      </div>
      {count != null && (
        <span className="px-2.5 py-1 text-xs font-bold text-white bg-white/20 rounded-full backdrop-blur-sm">{count}</span>
      )}
    </div>
  </div>
);

const TeacherHome = ({ setSelectedOption }) => {
  const { user } = useAuth();
  const { courseData } = useCourse();
  const { courseID } = useParams();
  const { currentModuleIndex, setCurrentModuleIndex } = useUtilityContext();
  console.log(user, courseData);

  const upcomingEvents = [];
  const [announcements, setAnnouncements] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await getAllCourseAnnouncements({ courseID });
      setAnnouncements(response.announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      setAssignmentsLoading(true);
      const response = await getAllCourseAssignments({ courseID });
      setAssignments(response.assignments || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  useEffect(() => {
    if (courseID) {
      fetchAnnouncements();
      fetchAssignments();
    }
  }, [courseID]);

  // Calculate assignments that need grading
  const assignmentsNeedingGrading = assignments.reduce((count, assignment) => {
    const turnedIn = assignment.stats?.turnedIn || 0;
    const graded = assignment.stats?.graded || 0;
    return count + (turnedIn - graded);
  }, 0);

  // Time-of-day greeting
  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: "Good Morning", icon: Sunrise };
    if (hour >= 12 && hour < 17) return { text: "Good Afternoon", icon: Sun };
    if (hour >= 17 && hour < 21) return { text: "Good Evening", icon: Sunset };
    return { text: "Good Night", icon: Moon };
  }, []);

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get assignment status
  const getAssignmentStatus = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    if (dueDate < now) {
      return "past";
    }
    return assignment.isActive !== false ? "active" : "upcoming";
  };

  const GreetingIcon = timeGreeting.icon;

  return (
    <div className="max-w-[1600px] pt-12 relative -top-6 mx-auto space-y-8 p-6 bg-gray-50">
      {/* Header Section - Gradient Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 px-8 py-8 shadow-lg">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 right-20 w-24 h-24 bg-white/5 rounded-full" />
        <div className="absolute top-4 left-[40%] w-16 h-16 bg-white/5 rounded-full" />
        <div className="absolute -bottom-6 left-[20%] w-20 h-20 bg-white/5 rounded-full" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Home className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Welcome back, {user?.name}
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <GreetingIcon className="w-4 h-4 text-white/80" />
                <p className="text-white/80 text-sm font-medium">
                  {timeGreeting.text} — Let's make today productive
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-tertiary/10 border-t-4 border-t-emerald-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-tertiary text-sm">Total Students</p>
              <h3 className="text-3xl font-bold text-primary mt-1">
                {courseData?.students?.length || 0}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-tertiary">
            <span className="text-emerald-600 font-medium">92%</span>
            <span className="mx-1">active this week</span>
          </div>
        </div>

        {/* Course Progress */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-tertiary/10 border-t-4 border-t-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-tertiary text-sm">Course Progress</p>
              <h3 className="text-3xl font-bold text-primary mt-1">
                {courseData?.overallCompletion || 0}%
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <BarChart2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-tertiary">
            <span>
              {courseData?.reviewedLectureCount || 0} of{" "}
              {courseData?.totalLectureCount || 0} topics completed
            </span>
          </div>
        </div>

        {/* Assignments */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-tertiary/10 border-t-4 border-t-purple-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-tertiary text-sm">Assignments</p>
              <h3 className="text-3xl font-bold text-primary mt-1">
                {assignments.length}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-tertiary">
            <span className="text-amber-500 font-medium">{assignmentsNeedingGrading}</span>
            <span className="mx-1">need grading</span>
          </div>
        </div>

        {/* Upcoming */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-tertiary/10 border-t-4 border-t-amber-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-tertiary text-sm">Upcoming</p>
              <h3 className="text-3xl font-bold text-primary mt-1">
                {upcomingEvents.length}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-tertiary">
            <span>events this week</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Course Modules Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <SectionHeader
                  icon={BookOpen}
                  title="Course Modules"
                  gradient="bg-gradient-to-r from-sky-500 to-blue-600 rounded-t-2xl"
                  count={courseData?.syllabus?.modules?.length || null}
                />
              </div>
              <div className="pr-6">
                <button
                  className="text-sky-600 hover:text-sky-700 text-sm font-semibold flex items-center gap-1 transition-colors"
                  onClick={() => setSelectedOption("Content")}
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {courseData?.syllabus?.modules?.length > 0 ? (
                courseData.syllabus.modules.map((module, index) => {
                  const modTheme = resolveModuleTheme(module);
                  return (
                    <div
                      key={module._id}
                      className="group cursor-pointer rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 bg-white border border-gray-100"
                      style={{ borderLeft: `4px solid ${modTheme.accentColor}` }}
                      onClick={() => {
                        setSelectedOption("Content");
                        setCurrentModuleIndex(index);
                      }}
                    >
                      <div className="relative h-40 overflow-hidden" style={{ background: modTheme.gradientCSS }}>
                        <LmsAssetImage
                          src={modTheme.moduleThumbnailUrl}
                          alt={module.moduleTitle}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          gradientCSS={modTheme.gradientCSS}
                          accentColor={modTheme.accentColor}
                          containerClassName="h-full w-full"
                        />
                        {/* Module number badge */}
                        <div
                          className="absolute top-3 left-3 w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg"
                          style={{ backgroundColor: modTheme.accentColor }}
                        >
                          {index + 1}
                        </div>
                        {/* Lecture count badge */}
                        {module.lectureCount > 0 && (
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <Layers className="w-3 h-3 text-gray-600" />
                            <span className="text-xs font-semibold text-gray-700">{module.lectureCount} lectures</span>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4">
                          <h3 className="text-white font-semibold text-base leading-tight drop-shadow-sm">
                            {module.moduleTitle}
                          </h3>
                        </div>
                      </div>

                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: modTheme.accentColor }}
                          />
                          <span className="text-xs font-medium text-gray-500">Module {index + 1}</span>
                        </div>
                        <span
                          className="text-sm font-semibold flex items-center gap-1 transition-all duration-200 group-hover:gap-2"
                          style={{ color: modTheme.accentColor }}
                        >
                          Manage Content
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center text-tertiary p-8">
                  <Layers className="w-12 h-12 text-tertiary/30 mx-auto mb-3" />
                  <p>No course modules available.</p>
                </div>
              )}
            </div>
          </div>

          {/* Assignments Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden">
            <SectionHeader
              icon={FileText}
              title="Assignments"
              gradient="bg-gradient-to-r from-violet-500 to-purple-600 rounded-t-2xl"
              count={assignments.length || null}
            />

            <div className="divide-y divide-tertiary/10">
              {assignmentsLoading ? (
                <div className="p-6 text-center text-tertiary">Loading assignments...</div>
              ) : assignments.length > 0 ? (
                assignments.slice(0, 5).map((assignment) => {
                  const status = getAssignmentStatus(assignment);
                  const turnedIn = assignment.stats?.turnedIn || 0;
                  const assigned = assignment.stats?.assigned || assignment.stats?.total || courseData?.students?.length || 0;
                  const graded = assignment.stats?.graded || 0;
                  const submissionPercentage = assigned > 0 ? (turnedIn / assigned) * 100 : 0;

                  return (
                    <div
                      key={assignment._id}
                      className="p-6 hover:bg-violet-50/50 transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedOption("Long or Short Type");
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-primary">
                            {assignment.title}
                          </h3>
                          <div className="flex items-center mt-2 text-sm">
                            <Clock className="w-4 h-4 text-tertiary mr-1" />
                            <span className="text-tertiary">
                              Due: {formatDate(assignment.dueDate)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              status === "active"
                                ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 ring-1 ring-emerald-200"
                                : status === "past"
                                ? "bg-gradient-to-r from-gray-50 to-slate-100 text-gray-600 ring-1 ring-gray-200"
                                : "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 ring-1 ring-amber-200"
                            }`}
                          >
                            {status === "active" ? "Active" : status === "past" ? "Past Due" : "Upcoming"}
                          </div>
                          <div className="text-sm text-tertiary mt-2">
                            {turnedIn} of {assigned} submitted
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-violet-500 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${submissionPercentage}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-tertiary">
                  No assignments available.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-tertiary/10 bg-gray-50/50">
              <button
                className="w-full py-2 text-violet-600 hover:text-violet-700 text-sm font-semibold flex items-center justify-center gap-1 transition-colors"
                onClick={() => {
                  setSelectedOption("Long or Short Type");
                }}
              >
                View All Assignments
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-8">
          {/* Announcements Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden">
            <SectionHeader
              icon={Megaphone}
              title="Announcements"
              gradient="bg-gradient-to-r from-rose-500 to-pink-600 rounded-t-2xl"
              count={announcements.length || null}
            />

            <div className="divide-y divide-tertiary/10">
              {loading ? (
                <div className="p-6 text-center text-tertiary">Loading...</div>
              ) : announcements.length === 0 ? (
                <div className="p-6 text-center text-tertiary">
                  No announcements available.
                </div>
              ) : (
                announcements.map((announcement) => (
                  <div
                    key={announcement._id}
                    className="p-6 hover:bg-rose-50/50 transition-colors"
                  >
                    <h3 className="font-medium text-primary">
                      {announcement.title}
                    </h3>
                    <div className="text-sm text-tertiary mt-1">
                      {new Date(announcement.publishDate).toLocaleDateString()}{" "}
                      {new Date(announcement.publishDate).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                    {announcement.image?.imageUrl && (
                      <img
                        src={announcement.image.imageUrl}
                        alt={announcement.title}
                        className="mt-3 w-full h-[300px] object-cover rounded-lg"
                      />
                    )}
                    <p className="mt-3 text-tertiary line-clamp-3">
                      {announcement.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-tertiary/10 bg-gray-50/50">
              <button
                className="w-full py-2 text-rose-600 hover:text-rose-700 text-sm font-semibold flex items-center justify-center gap-1 transition-colors"
                onClick={() => {
                  setSelectedOption("Announcements");
                }}
              >
                View All Announcements
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar / Upcoming Events Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden">
            <SectionHeader
              icon={Calendar}
              title="Upcoming Events"
              gradient="bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-2xl"
              count={upcomingEvents.length || null}
            />

            <div className="divide-y divide-tertiary/10">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-6 hover:bg-amber-50/50 transition-colors"
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex flex-col items-center justify-center shadow-sm">
                        <span className="text-white font-bold text-lg leading-none">
                          {event.date.split(" ")[1].replace(",", "")}
                        </span>
                        <span className="text-white/80 text-xs font-medium">
                          {event.date.split(" ")[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-primary">
                          {event.title}
                        </h3>
                        <div className="flex items-center mt-1 text-sm text-tertiary">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{event.time}</span>
                        </div>
                        <div className="mt-1 text-sm text-tertiary">
                          {event.location}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Clock className="w-12 h-12 text-tertiary/30 mx-auto mb-3" />
                  <p className="text-tertiary">No upcoming events</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
        </div>
      </div>
    </div>
  );
};

export default TeacherHome;
