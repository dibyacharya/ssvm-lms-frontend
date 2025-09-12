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
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { getAllCourseAnnouncements } from "../../../../services/announcement.service";
import { useCourse } from "../../../../context/CourseContext";
import { useParams } from "react-router-dom";
import { useUtilityContext } from "../../../../context/UtilityContext";

const TeacherHome = ({ setSelectedOption }) => {
  const { user } = useAuth();
  const { courseData } = useCourse(); // This now holds the provided course data
  const { courseID } = useParams();
  const { currentModuleIndex, setCurrentModuleIndex } = useUtilityContext();
  console.log(user, courseData);

  // Dummy data (can be replaced with actual data from backend if available)
  const assignments = [
    {
      id: 1,
      title: "Descriptive Statistics Quiz",
      dueDate: "April 25, 2025",
      submissions: 12,
      totalStudents: 30,
      status: "active",
    },
    {
      id: 2,
      title: "Probability Assignment",
      dueDate: "May 2, 2025",
      submissions: 0,
      totalStudents: 30,
      status: "upcoming",
    },
    {
      id: 3,
      title: "Data Visualization Project",
      dueDate: "May 10, 2025",
      submissions: 0,
      totalStudents: 30,
      status: "upcoming",
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Statistics Lab Session",
      date: "April 23, 2025",
      time: "10:00 AM - 12:00 PM",
      location: "Room 304",
    },
    {
      id: 2,
      title: "Office Hours",
      date: "April 22, 2025",
      time: "2:00 PM - 4:00 PM",
      location: "Online (Zoom)",
    },
  ];
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

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
    fetchAnnouncements();
  }, []);

  return (
    <div className="max-w-[1600px] pt-12 relative -top-6 mx-auto space-y-8 p-6 bg-gray-50">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Home</h1>
          <p className="text-tertiary mt-1">Welcome back, {user?.name}</p>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-tertiary/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-tertiary text-sm">Total Students</p>
              <h3 className="text-3xl font-bold text-primary mt-1">
                {courseData?.students?.length || 0}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-tertiary">
            <span className="text-primary font-medium">92%</span>
            <span className="mx-1">active this week</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-tertiary/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-tertiary text-sm">Course Progress</p>
              <h3 className="text-3xl font-bold text-primary mt-1">
                {courseData?.overallCompletion || 0}%
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart2 className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-tertiary">
            <span>
              {courseData?.reviewedLectureCount || 0} of{" "}
              {courseData?.totalLectureCount || 0} topics completed
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-tertiary/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-tertiary text-sm">Assignments</p>
              <h3 className="text-3xl font-bold text-primary mt-1">
                {assignments.length}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-tertiary">
            <span className="text-amber-500 font-medium">2</span>
            <span className="mx-1">need grading</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-tertiary/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-tertiary text-sm">Upcoming</p>
              <h3 className="text-3xl font-bold text-primary mt-1">
                {upcomingEvents.length}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
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
            <div className="p-6 border-b border-tertiary/10 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-primary">
                  Course Modules
                </h2>
              </div>
              <button
                className="text-primary hover:text-primary/80 text-sm font-medium flex items-center"
                onClick={() => setSelectedOption("Content")}
              >
                View All Modules
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {courseData?.syllabus?.modules?.length > 0 ? (
                courseData.syllabus.modules.map((module, index) => (
                  <div
                    key={module._id}
                    className="border cursor-pointer border-tertiary/10 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300"
                  >
                    <div className="relative h-40 bg-gray-100 overflow-hidden">
                      <img
                        src={"/module.png"} // Placeholder image, consider using a module-specific image if available in data
                        alt={module.moduleTitle}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <div className="text-white font-medium">
                          {module.moduleTitle}
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="mt-4 flex justify-between">
                        <button
                          className="text-primary hover:text-primary/80 text-sm font-medium flex items-center"
                          onClick={() => {
                            setSelectedOption("Content");
                            setCurrentModuleIndex(index);
                          }}
                        >
                          Manage Content
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-tertiary p-4">
                  No course modules available.
                </div>
              )}
            </div>
          </div>

          {/* Assignments Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden">
            <div className="p-6 border-b border-tertiary/10 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-primary">
                  Assignments
                </h2>
              </div>
            </div>

            <div className="divide-y divide-tertiary/10">
              {assignments.length > 0 ? (
                assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-primary">
                          {assignment.title}
                        </h3>
                        <div className="flex items-center mt-2 text-sm">
                          <Clock className="w-4 h-4 text-tertiary mr-1" />
                          <span className="text-tertiary">
                            Due: {assignment.dueDate}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            assignment.status === "active"
                              ? "bg-primary/10 text-primary"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {assignment.status === "active" ? "Active" : "Upcoming"}
                        </div>
                        <div className="text-sm text-tertiary mt-2">
                          {assignment.submissions} of {assignment.totalStudents}{" "}
                          submitted
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${
                            (assignment.submissions / assignment.totalStudents) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-tertiary">
                  No assignments available.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-tertiary/10 bg-gray-50">
              <button
                className="w-full py-2 text-primary hover:text-primary/80 text-sm font-medium flex items-center justify-center"
                onClick={() => {
                  setSelectedOption("Long or Short Type");
                }}
              >
                View All Assignments
                <ExternalLink className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-8">
          {/* Announcements Section */}

          <div className="bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden">
            <div className="p-6 border-b border-tertiary/10 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Megaphone className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-primary">
                  Announcements
                </h2>
              </div>
            </div>

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
                    className="p-6 hover:bg-gray-50 transition-colors"
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

            <div className="p-4 border-t border-tertiary/10 bg-gray-50">
              <button
                className="w-full py-2 text-primary hover:text-primary/80 text-sm font-medium flex items-center justify-center  "
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
          <div className="bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden">
            <div className="p-6 border-b border-tertiary/10 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Calendar className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-primary">
                  Upcoming Events
                </h2>
              </div>
              <div className="text-sm text-tertiary font-medium">
                April 2025 {/* This might need to be dynamic if events span months */}
              </div>
            </div>

            <div className="divide-y divide-tertiary/10">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-primary font-bold text-lg">
                          {event.date.split(" ")[1].replace(",", "")}
                        </span>
                        <span className="text-tertiary text-xs">
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

            {/* <div className="p-4 border-t border-tertiary/10 bg-gray-50">
              <button className="w-full py-2 text-primary hover:text-primary/80 text-sm font-medium flex items-center justify-center">
                View Calendar
                <ExternalLink className="w-4 h-4 ml-1" />
              </button>
            </div> */}
          </div>

          {/* Quick Links */}
        </div>
      </div>
    </div>
  );
};

export default TeacherHome;