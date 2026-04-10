import React, { useState, useEffect } from "react";
import {
  FileText,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Clock,
  Video,
  Search,
  User,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useCourse } from "../../../../context/CourseContext";
import LoadingSpinner from "../../../../utils/LoadingAnimation";

const MOM = () => {
  const { courseID } = useParams();
  const { courseData: course } = useCourse();
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedLectures, setExpandedLectures] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (course?.syllabus?.modules) {
      const initialExpanded = {};
      course.syllabus.modules.forEach((module) => {
        const hasTranscripts = module.lectures?.some(
          (l) => l.transcriptStatus === "ready" || l.transcriptStatus === "processing"
        );
        if (hasTranscripts) {
          initialExpanded[module._id] = true;
        }
      });
      setExpandedModules(initialExpanded);
    }
  }, [course]);

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const toggleLecture = (lectureId) => {
    setExpandedLectures((prev) => ({ ...prev, [lectureId]: !prev[lectureId] }));
  };

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  if (!course || !course.syllabus || !course.syllabus.modules) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  // Filter lectures that have transcripts
  const modulesWithTranscripts = course.syllabus.modules
    .map((module) => ({
      ...module,
      lectures: (module.lectures || []).filter(
        (l) =>
          l.vconfRoomId &&
          (l.transcriptStatus === "ready" ||
            l.transcriptStatus === "processing" ||
            l.transcriptText)
      ),
    }))
    .filter((module) => module.lectures.length > 0);

  // Search filter
  const filteredModules = searchQuery
    ? modulesWithTranscripts
        .map((module) => ({
          ...module,
          lectures: module.lectures.filter((l) => {
            const query = searchQuery.toLowerCase();
            const inTitle = l.title?.toLowerCase().includes(query);
            const inTranscript = l.transcriptText?.toLowerCase().includes(query);
            const inSegments = l.transcriptSegments?.some(
              (s) => s.text?.toLowerCase().includes(query) || s.speaker?.toLowerCase().includes(query)
            );
            return inTitle || inTranscript || inSegments;
          }),
        }))
        .filter((m) => m.lectures.length > 0)
    : modulesWithTranscripts;

  if (modulesWithTranscripts.length === 0) {
    return (
      <div className="bg-white dark:bg-white relative -top-6 w-full mx-auto p-4 min-h-[400px]">
        <div className="relative overflow-hidden rounded-xl mb-6 bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 shadow-lg">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -bottom-6 right-20 w-20 h-20 bg-white/5 rounded-full" />
          <div className="relative z-10 px-8 py-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <FileText className="w-7 h-7 text-gray-900" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  Minutes of Meeting
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                  Class transcripts and meeting notes
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center py-16">
          <div className="p-8 bg-white dark:bg-white rounded-xl shadow-md border border-gray-200 dark:border-gray-200 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-900/30 dark:to-violet-900/30 flex items-center justify-center">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              No class transcripts available yet.
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Transcripts will appear here after live classes are recorded.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white relative -top-6 w-full mx-auto p-4 min-h-[400px]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-xl mb-6 bg-gradient-to-r from-blue-500 via-blue-500 to-blue-500 shadow-lg">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -bottom-6 right-20 w-20 h-20 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/5 rounded-full" />
        <div className="relative z-10 px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FileText className="w-7 h-7 text-gray-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Minutes of Meeting
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                Class transcripts and meeting notes from recorded sessions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transcripts..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-300 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Modules with Transcripts */}
      <div className="space-y-6">
        {filteredModules.map((module) => (
          <div
            key={module._id}
            className="bg-gray-50 dark:bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-200"
          >
            {/* Module Header */}
            <button
              onClick={() => toggleModule(module._id)}
              className="w-full text-left focus:outline-none"
            >
              <div className="relative overflow-hidden px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 cursor-pointer hover:from-blue-600 hover:to-indigo-700 transition-all duration-300">
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-gray-900" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                      Module {module.moduleNumber}: {module.moduleTitle}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 text-xs font-bold text-gray-900 bg-white/20 rounded-full backdrop-blur-sm">
                      {module.lectures.length}{" "}
                      {module.lectures.length === 1 ? "transcript" : "transcripts"}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      {expandedModules[module._id] ? (
                        <ChevronDown className="w-5 h-5 text-gray-900" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-900" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </button>

            {expandedModules[module._id] && (
              <div className="p-4 space-y-4">
                {module.lectures.map((lecture) => (
                  <div
                    key={lecture._id}
                    className="bg-white dark:bg-white rounded-xl shadow-sm border border-gray-200 dark:border-gray-200 overflow-hidden"
                  >
                    {/* Lecture Header */}
                    <button
                      onClick={() => toggleLecture(lecture._id)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-gray-900">
                            {lecture.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(lecture.updatedAt || lecture.createdAt).toLocaleDateString(
                                "en-IN",
                                { day: "numeric", month: "short", year: "numeric" }
                              )}
                            </span>
                            {lecture.recordingDuration > 0 && (
                              <span className="flex items-center gap-1">
                                <Video className="w-3 h-3" />
                                {formatDuration(lecture.recordingDuration)}
                              </span>
                            )}
                            {lecture.transcriptStatus === "processing" && (
                              <span className="px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] font-medium">
                                Processing...
                              </span>
                            )}
                            {lecture.transcriptStatus === "ready" && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-medium">
                                Ready
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        {expandedLectures[lecture._id] ? (
                          <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-600" />
                        )}
                      </div>
                    </button>

                    {/* Transcript Content */}
                    {expandedLectures[lecture._id] && (
                      <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-200">
                        {lecture.transcriptStatus === "processing" ? (
                          <div className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-gray-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3" />
                            <p className="text-sm">Transcript is being generated...</p>
                          </div>
                        ) : lecture.transcriptSegments &&
                          lecture.transcriptSegments.length > 0 ? (
                          <div className="mt-4 space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {lecture.transcriptSegments.map((seg, idx) => (
                              <div
                                key={idx}
                                className="flex gap-3 group hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg p-2 transition-colors"
                              >
                                <span className="text-xs text-gray-400 dark:text-gray-500 font-mono min-w-[50px] pt-1 text-right">
                                  {formatTime(seg.start)}
                                </span>
                                <div className="flex-1">
                                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block mb-0.5 flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {seg.speaker}
                                  </span>
                                  <p className="text-sm text-gray-700 dark:text-gray-600 leading-relaxed">
                                    {seg.text}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : lecture.transcriptText ? (
                          <div className="mt-4 max-h-[500px] overflow-y-auto pr-2">
                            <p className="text-sm text-gray-700 dark:text-gray-600 leading-relaxed whitespace-pre-wrap">
                              {lecture.transcriptText}
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-gray-400">
                            <FileText className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm">No transcript available for this session.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {searchQuery && filteredModules.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
            <Search className="w-10 h-10 mb-3 opacity-50" />
            <p className="font-medium">No results found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MOM;
