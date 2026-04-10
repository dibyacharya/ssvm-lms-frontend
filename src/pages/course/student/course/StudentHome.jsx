import React, { useEffect, useState } from "react";
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
  PlusCircle,
  ExternalLink,
  ArrowRight,
  Layers,
} from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { getAllCourseAnnouncements } from "../../../../services/announcement.service";
import { useCourse } from "../../../../context/CourseContext";
import { useParams } from "react-router-dom";
import AssignmentsList from "../../../../components/dashboard/utils/AssignmentComponent/AssignmentList";
import { useUtilityContext } from "../../../../context/UtilityContext";
import { resolveModuleTheme } from "../../../../utils/lmsAssetResolver";
import LmsAssetImage from "../../../../components/common/LmsAssetImage";
import CoursePageBanner from "../../../../components/shared/CoursePageBanner";

const StudentHome = ({ setSelectedOption }) => {
  const { user } = useAuth();
  const { courseData } = useCourse();
  const { courseID } = useParams();
  const { setCurrentModuleIndex } = useUtilityContext();
  // Dummy data for elements not present in the courseData object
  const upcomingEvents = [
   
  ];
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Dynamic Data Calculations ---

  // 1. Calculate total lectures by summing up lectureCount from each module
  const totalLectures =
    courseData?.syllabus?.modules?.reduce(
      (acc, module) => acc + (module.lectureCount || 0),
      0
    ) || 0;
    
  // 2. Calculate total topics from the weekly plan
  const totalTopics = 
    courseData?.weeklyPlan?.reduce(
      (acc, week) => acc + (week.topics?.length || 0),
      0
    ) || 0;

  // 3. Calculate course progress percentage based on semester dates
  const calculateCourseProgress = () => {
    if (!courseData?.semester?.startDate || !courseData?.semester?.endDate) {
      return 0; // Return 0 if dates are not available
    }
    const today = new Date();
    const startDate = new Date(courseData.semester.startDate);
    const endDate = new Date(courseData.semester.endDate);

    // If the course is over, progress is 100%
    if (today >= endDate) {
      return 100;
    }
    // If the course hasn't started, progress is 0%
    if (today <= startDate) {
      return 0;
    }
    
    // Calculate progress
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedDuration = today.getTime() - startDate.getTime();

    // Avoid division by zero
    if (totalDuration <= 0) {
      return 0;
    }

    const progress = Math.round((elapsedDuration / totalDuration) * 100);
    return progress;
  };
  
  const courseProgress = calculateCourseProgress();
  const completedTopics = Math.round((totalTopics * courseProgress) / 100);


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

  useEffect(() => {
    if(courseID) {
      fetchAnnouncements();
    }
  }, [courseID]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 p-6">
      {/* Header Banner */}
      <CoursePageBanner
        icon={Home}
        title="Home"
        subtitle={`Welcome back, ${user?.name || "Student"}`}
        gradient="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500"
      />

      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students Card (Static) */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Students</p>
              <h3 className="text-3xl font-bold text-primary-600 mt-1">{courseData?.stats?.totalStudentsEnrolled}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            {/* <span className="text-primary-600 font-medium">5</span> */}
            <span className="mx-1">study buddies in this group</span>
          </div>
        </div>
        
        {/* Course Progress Card (Dynamic) */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Course Progress</p>
              <h3 className="text-3xl font-bold text-primary-600 mt-1">
                {courseProgress}%
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <BarChart2 className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span>{courseProgress === 0 ? "Course just started" : courseProgress === 100 ? "Course completed" : `${completedTopics} of ${totalTopics} topics covered`}</span>
          </div>
        </div>

        {/* Total Lectures Card (Dynamic) */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Lectures</p>
              <h3 className="text-3xl font-bold text-primary-600 mt-1">
                {totalLectures}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span>
              Across {courseData?.syllabus?.modules?.length || 0} modules
            </span>
          </div>
        </div>

        {/* Upcoming Events Card (Static) */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Upcoming</p>
              <h3 className="text-3xl font-bold text-primary-600 mt-1">0</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
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
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Course Modules
                </h2>
              </div>
              <button
                className="text-primary-600 hover:text-primary-600 text-sm font-medium flex items-center transition-colors"
                onClick={() => setSelectedOption("E-Learning")}
              >
                View All Modules
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
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
                        setSelectedOption("E-Learning");
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
                          View Content
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center text-gray-500 p-8">
                  <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p>No course modules available.</p>
                </div>
              )}
            </div>
          </div>

          {/* Assignments Section */}
          <AssignmentsList setSelectedOption={setSelectedOption} />
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-8">
          {/* Announcements Section */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Megaphone className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Announcements
                </h2>
              </div>
            </div>

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
                    <p className="mt-3 text-gray-600 line-clamp-3">
                      {announcement.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white/5">
              <button
                className="w-full py-2 text-primary-600 hover:text-primary-600 text-sm font-medium flex items-center justify-center transition-colors"
                onClick={() => {
                  setSelectedOption("Announcements");
                }}
              >
                View All Announcements
                <ExternalLink className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
          {/* Calendar Section */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Calendar className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Upcoming Events
                </h2>
              </div>
              <div className="text-sm text-gray-500 font-medium">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex flex-col items-center justify-center">
                      <span className="text-primary-600 font-bold text-lg">
                        {event.date.split(" ")[1].replace(",", "")}
                      </span>
                      <span className="text-gray-500 text-xs">
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
              ))}
            </div>

            {upcomingEvents.length === 0 && (
              <div className="p-8 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming events</p>
              </div>
            )}

            <div className="p-4 border-t border-gray-200 bg-white/5">
              <button className="w-full py-2 text-primary-600 hover:text-primary-600 text-sm font-medium flex items-center justify-center transition-colors">
                View Calendar
                <ExternalLink className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;