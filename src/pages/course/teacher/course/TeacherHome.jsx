import React, { useEffect, useState } from "react";
import {
  FileText,
  Calendar,
  ChevronRight,
  Clock,
  BarChart2,
  Users,
  BookOpen,
  Megaphone,
  ExternalLink,
  ArrowRight,
  Layers,
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

  return (
    <div className="max-w-[1600px] pt-12 relative -top-6 mx-auto space-y-8 p-6">
      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white rounded-lg p-5 border border-gray-200 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Total Students</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {courseData?.students?.length || 0}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-gray-500">
            <span className="text-blue-600 font-medium">92%</span>
            <span className="mx-1">active this week</span>
          </div>
        </div>

        {/* Course Progress */}
        <div className="bg-white rounded-lg p-5 border border-gray-200 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Course Progress</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {courseData?.overallCompletion || 0}%
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-gray-500">
            <span>
              {courseData?.reviewedLectureCount || 0} of{" "}
              {courseData?.totalLectureCount || 0} topics completed
            </span>
          </div>
        </div>

        {/* Assignments */}
        <div className="bg-white rounded-lg p-5 border border-gray-200 border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Assignments</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {assignments.length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-gray-500">
            <span className="text-amber-500 font-medium">{assignmentsNeedingGrading}</span>
            <span className="mx-1">need grading</span>
          </div>
        </div>

        {/* Upcoming */}
        <div className="bg-white rounded-lg p-5 border border-gray-200 border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Upcoming</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {upcomingEvents.length}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-gray-500">
            <span>events this week</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Course Modules Section */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <SectionHeader
                  icon={BookOpen}
                  title="Course Modules"
                  gradient="bg-gradient-to-r from-blue-400 to-blue-500 rounded-t-2xl"
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
                      className="group cursor-pointer rounded-xl overflow-hidden hover:shadow-card transition-all duration-300 bg-white/70 backdrop-blur-xl border border-gray-200"
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
                          className="absolute top-3 left-3 w-9 h-9 rounded-lg flex items-center justify-center text-gray-900 text-sm font-bold shadow-lg"
                          style={{ backgroundColor: modTheme.accentColor }}
                        >
                          {index + 1}
                        </div>
                        {/* Lecture count badge */}
                        {module.lectureCount > 0 && (
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <Layers className="w-3 h-3 text-gray-600" />
                            <span className="text-xs font-semibold text-gray-600">{module.lectureCount} lectures</span>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4">
                          <h3 className="text-gray-900 font-semibold text-base leading-tight drop-shadow-sm">
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
                <div className="col-span-full text-center text-gray-500 p-8">
                  <Layers className="w-12 h-12 text-gray-500/30 mx-auto mb-3" />
                  <p>No course modules available.</p>
                </div>
              )}
            </div>
          </div>

          {/* Assignments Section */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <SectionHeader
              icon={FileText}
              title="Assignments"
              gradient="bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl"
              count={assignments.length || null}
            />

            <div className="divide-y divide-gray-200">
              {assignmentsLoading ? (
                <div className="p-6 text-center text-gray-500">Loading assignments...</div>
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
                      className="p-6 hover:bg-gray-50 transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedOption("Long or Short Type");
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {assignment.title}
                          </h3>
                          <div className="flex items-center mt-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-500 mr-1" />
                            <span className="text-gray-500">
                              Due: {formatDate(assignment.dueDate)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              status === "active"
                                ? "bg-gradient-to-r from-blue-50 to-blue-50 text-blue-700 ring-1 ring-blue-200"
                                : status === "past"
                                ? "bg-gradient-to-r from-gray-50 to-slate-100 text-gray-600 ring-1 ring-gray-200"
                                : "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 ring-1 ring-amber-200"
                            }`}
                          >
                            {status === "active" ? "Active" : status === "past" ? "Past Due" : "Upcoming"}
                          </div>
                          <div className="text-sm text-gray-500 mt-2">
                            {turnedIn} of {assigned} submitted
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${submissionPercentage}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No assignments available.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white/5">
              <button
                className="w-full py-2 text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center justify-center gap-1 transition-colors"
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
          <div className="glass-card rounded-2xl overflow-hidden">
            <SectionHeader
              icon={Megaphone}
              title="Announcements"
              gradient="bg-gradient-to-r from-rose-500 to-pink-600 rounded-t-2xl"
              count={announcements.length || null}
            />

            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="p-6 text-center text-gray-500">Loading...</div>
              ) : announcements.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No announcements available.
                </div>
              ) : (
                announcements.map((announcement) => (
                  <div
                    key={announcement._id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900">
                      {announcement.title}
                    </h3>
                    <div className="text-sm text-gray-500 mt-1">
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
                    <p className="mt-3 text-gray-500 line-clamp-3">
                      {announcement.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white/5">
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
          <div className="glass-card rounded-2xl overflow-hidden">
            <SectionHeader
              icon={Calendar}
              title="Upcoming Events"
              gradient="bg-gradient-to-r from-amber-500 to-blue-500 rounded-t-2xl"
              count={upcomingEvents.length || null}
            />

            <div className="divide-y divide-gray-200">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-amber-400 to-blue-500 rounded-xl flex flex-col items-center justify-center shadow-sm">
                        <span className="text-gray-900 font-bold text-lg leading-none">
                          {event.date.split(" ")[1].replace(",", "")}
                        </span>
                        <span className="text-gray-900/80 text-xs font-medium">
                          {event.date.split(" ")[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {event.title}
                        </h3>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{event.time}</span>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          {event.location}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Clock className="w-12 h-12 text-gray-500/30 mx-auto mb-3" />
                  <p className="text-gray-500">No upcoming events</p>
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
