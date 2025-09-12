import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  ChevronLeft,
  PlayCircle,
  Book,
  Calendar,
  Clock,
  X,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  HelpCircle,
  BookOpen,
  Target,
  Maximize,
  Minimize
} from "lucide-react";
import AutoResizeTextbox from "./utils/searcbox";
import { useCourse } from "../../context/CourseContext";
import CompactNotesApp from "./utils/NotesApp";

// Key takeaways data
const keyTakeaways = [
  "Risk and Return go hand in hand. Higher the risk, the higher the Return. Lower the risk, lower the returns.",
  "Investments help you stay ahead of inflation and build wealth over time through compound growth.",
  "Diversification across different asset classes helps reduce overall portfolio risk while maintaining growth potential.",
  "Market intermediaries like brokers, exchanges, and clearing houses facilitate smooth trading operations.",
  "Understanding market fundamentals is crucial before making any investment decisions in the stock market.",
];

// Helper function to convert video URLs to embed URLs (if needed)
const getVideoComponent = (videoUrl) => {
  console.log(videoUrl);
  return (
    <video
      src={videoUrl} // Direct src instead of source element
      className="w-full h-full rounded-lg shadow-lg dark:shadow-xl"
      controls
      controlsList="nodownload"
    >
      Your browser does not support the video tag.
    </video>
  );
};

export default function LecturePanel() {
  const [selectedLecture, setSelectedLecture] = useState(null);
  const { courseID } = useParams();
  const { courseData: course } = useCourse();
  const [expandedModules, setExpandedModules] = useState({});
  const [focusMode, setFocusMode] = useState(false);
  
  console.log(course);

  useEffect(() => {
    // Set first lecture of first module as selected
    if (course?.syllabus?.modules) {
      const firstModuleWithLectures = course.syllabus.modules.find(
        (module) => module.lectures && module.lectures.length > 0
      );
      if (firstModuleWithLectures) {
        setSelectedLecture(firstModuleWithLectures.lectures[0]);
        // Expand the module that has the selected lecture
        setExpandedModules({ [firstModuleWithLectures._id]: true });
      }
    }
  }, [course]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const options = { year: "numeric", month: "long", day: "numeric" };
      return date.toLocaleDateString("en-US", options);
    } catch (error) {
      return dateString;
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleLectureSelect = (lecture) => {
    console.log("Selecting lecture:", lecture.title, lecture._id);
    setSelectedLecture(lecture);
  };

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
  };

  // Quick action handlers
  const handleQuickAction = (action) => {
    let question = "";
    switch (action) {
      case "summarize":
        question = `Summarize the key points from the lecture: "${selectedLecture?.title}"`;
        break;
      case "practice":
        question = `Give me practice questions based on the lecture: "${selectedLecture?.title}"`;
        break;
      case "explain":
        question = `Explain the current concept from the lecture: "${selectedLecture?.title}" in simple terms`;
        break;
      default:
        question = "";
    }
    
    // Send question to AI Tutor textbox
    if (window.aiTutorTextbox && window.aiTutorTextbox.handleQuickQuestion) {
      window.aiTutorTextbox.handleQuickQuestion(question);
    }
  };

  if (!course || !course.syllabus || !course.syllabus.modules) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent1 dark:border-accent1"></div>
      </div>
    );
  }

  const modulesWithLectures = course.syllabus.modules.filter(
    (module) => module.lectures && module.lectures.length > 0
  );

  if (modulesWithLectures.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-gray-600">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">No Lectures Available</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            There are currently no lectures for this course.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Focus Mode Toggle */}
        <div className="flex items-center justify-between mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
             Lecture Panel
            </h1>
          
          </div>
          <button
            onClick={toggleFocusMode}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              focusMode
                ? 'bg-accent2 dark:bg-accent1 border-accent1 dark:border-accent1 text-accent1 dark:text-accent1'
                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            {focusMode ? <Minimize size={16} /> : <Maximize size={16} />}
            <span className="text-sm font-medium">
              {focusMode ? 'Exit Focus' : 'Focus Mode'}
            </span>
          </button>
        </div>

        {focusMode ? (
          /* Focus Mode Layout */
          <div className="space-y-4">
            {/* Main Content - Full Width */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 border border-gray-200 dark:border-gray-600">
              {selectedLecture ? (
                <div>
                  {selectedLecture.videoUrl && (
                    <div className="aspect-video w-full mb-6 rounded-lg overflow-hidden shadow-lg dark:shadow-xl">
                      {getVideoComponent(selectedLecture.videoUrl)}
                    </div>
                  )}

                  {/* Key Takeaways */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Key takeaways from this chapter
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {keyTakeaways.map((takeaway, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 text-accent1 dark:text-accent1 rounded-full flex items-center justify-center text-sm font-medium mt-0.5 border border-accent1 dark:border-accent1">
                            {index + 1}
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            {takeaway}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Lecture Content
                      </h3>
                    </div>
                    <div className="prose max-w-none pl-7">
                      <p className="text-gray-700 dark:text-gray-300">{selectedLecture.content}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-xl text-gray-600 dark:text-gray-400">
                    Select a lecture to view details
                  </p>
                </div>
              )}
            </div>

            {/* Compact Notes in Focus Mode */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-gray-600">
              <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Quick Notes</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Take notes while watching
                </p>
              </div>
              <div className="h-48 overflow-hidden">
                <CompactNotesApp />
              </div>
            </div>
          </div>
        ) : (
          /* Normal Grid Layout */
          <div className="grid grid-cols-12 gap-4 h-[calc(100vh-140px)]">
            
            {/* Left Panel - Course Modules (3 columns) */}
            <div className="col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-4 overflow-y-auto border border-gray-200 dark:border-gray-600">
             

              <h3 className="font-bold text-md mb-4 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2">
                Course Modules
              </h3>

              <div className="space-y-2">
                {course.syllabus.modules.map((module) => (
                  <div key={module._id} className="border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                    <button
                      onClick={() => toggleModule(module._id)}
                      className="w-full p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-gray-900 dark:text-white"
                    >
                      <div className="flex flex-col text-left">
                        <span className="font-medium text-sm">
                          Module {module.moduleNumber}: {module.moduleTitle}
                        </span>
                        {module.lectures && module.lectures.length > 0 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({module.lectures.length} lectures)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        {expandedModules[module._id] ? (
                          <ChevronDown size={16} className="text-gray-600 dark:text-gray-300" />
                        ) : (
                          <ChevronRight size={16} className="text-gray-600 dark:text-gray-300" />
                        )}
                      </div>
                    </button>

                    {expandedModules[module._id] &&
                      module.lectures &&
                      module.lectures.length > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-600">
                          {module.lectures.map((lecture) => (
                            <button
                              key={lecture._id}
                              onClick={() => handleLectureSelect(lecture)}
                              className={`w-full text-left p-3 pl-6 transition-all duration-200 flex items-start border-b border-gray-100 dark:border-gray-600 last:border-b-0 ${
                                selectedLecture?._id === lecture._id
                                  ? " dark:bg-accent1 dark:text-white dark:bg-opacity-20 text-accent1 dark:text-accent1 border-l-4 border-l-accent1"
                                  : "hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                              }`}
                            >
                              <div className="mr-3 mt-1">
                                <PlayCircle
                                  size={16}
                                  className={
                                    selectedLecture?._id === lecture._id
                                      ? "text-accent1 dark:text-white"
                                      : "text-gray-400 dark:text-gray-500"
                                  }
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-sm">
                                  {lecture.lectureOrder}. {lecture.title}
                                </h3>
                                <p
                                  className={`text-xs mt-1 ${
                                    selectedLecture?._id === lecture._id
                                      ? "text-accent1 dark:text-accent1"
                                      : "text-gray-500 dark:text-gray-400"
                                  }`}
                                >
                                  Lecture {lecture.lectureOrder} • {formatDate(lecture.createdAt)}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>

            {/* Center Panel - Lecture Content (6 columns) */}
            <div className="col-span-6 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 overflow-y-auto border border-gray-200 dark:border-gray-600">
              {selectedLecture ? (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      {selectedLecture.title}
                    </h2>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-1" />
                        {formatDate(selectedLecture.createdAt)}
                      </div>
                      <div className="flex items-center">
                        <Clock size={16} className="mr-1" />
                        Last updated: {formatDate(selectedLecture.updatedAt)}
                      </div>
                    </div>
                  </div>

                  {selectedLecture.videoUrl && (
                    <div className="aspect-video w-full mb-6 rounded-lg overflow-hidden shadow-lg dark:shadow-xl">
                      {getVideoComponent(selectedLecture.videoUrl)}
                    </div>
                  )}

                  {/* Key Takeaways */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Key takeaways from this chapter
                    </h3>
                    <div className="space-y-3">
                      {keyTakeaways.map((takeaway, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 dark:text-white  bg-opacity-10 dark:bg-accent1 dark:bg-opacity-20 text-accent1 dark:text-accent1 rounded-full flex items-center justify-center text-sm font-medium mt-0.5 border border-accent1 border-opacity-30 dark:border-accent1 dark:border-opacity-40">
                            {index + 1}
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            {takeaway}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg mb-6 p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Lecture Content
                      </h3>
                    </div>
                    <div className="prose max-w-none pl-7">
                      <p className="text-gray-700 dark:text-gray-300">{selectedLecture.content}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xl text-gray-600 dark:text-gray-400">
                    Select a lecture to view details
                  </p>
                </div>
              )}
            </div>

            {/* Right Panel - AI Tutor (3 columns) */}
            <div className="col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-4 border border-gray-200 dark:border-gray-600 flex flex-col">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Tutor</h3>
                  <ChevronRight size={20} className="text-gray-400 dark:text-gray-500" />
                </div>
                <div className="mt-2">
                  <div className="flex items-center text-sm text-accent1 dark:text-accent1 mb-1">
                    <div className="w-2 h-2 bg-accent1 rounded-full mr-2"></div>
                    Context: {selectedLecture?.title || "Tree Traversal Methods"}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Timestamp: 5:23 • Confidence: 95%
                  </p>
                </div>
              </div>

              <div className="flex-1 mb-4">
                <div className=" dark:bg-accent1 dark:bg-opacity-10 rounded-lg p-4 border border-accent1 border-opacity-20 dark:border-accent1 dark:border-opacity-30">
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-1">
                      <MessageSquare size={16} className="text-accent1 dark:text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        Hello! I'm here to help you understand {selectedLecture?.title || "the topic at hand."}. What would you like to know?
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Actions:</h4>
                <div className="space-y-2">
                  <button 
                    onClick={() => handleQuickAction("summarize")}
                    className="w-full text-left p-3 rounded-lg bg-orange-50 dark:bg-orange-900 dark:bg-opacity-10 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900 dark:hover:bg-opacity-20 transition-colors"
                  >
                    <div className="flex items-center">
                      <BookOpen size={16} className="text-orange-600 dark:text-orange-400 mr-2" />
                      <span className="text-sm text-orange-700 dark:text-orange-300">Summarize this lecture</span>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => handleQuickAction("practice")}
                    className="w-full text-left p-3 rounded-lg bg-red-50 dark:bg-red-900 dark:bg-opacity-10 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900 dark:hover:bg-opacity-20 transition-colors"
                  >
                    <div className="flex items-center">
                      <Target size={16} className="text-red-600 dark:text-red-400 mr-2" />
                      <span className="text-sm text-red-700 dark:text-red-300">Give me practice questions</span>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => handleQuickAction("explain")}
                    className="w-full text-left p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900 dark:bg-opacity-10 border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 dark:hover:bg-cyan-900 dark:hover:bg-opacity-20 transition-colors"
                  >
                    <div className="flex items-center">
                      <HelpCircle size={16} className="text-cyan-600 dark:text-cyan-400 mr-2" />
                      <span className="text-sm text-cyan-700 dark:text-cyan-300">Explain current concept</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* AI Chat Integration */}
              <div className="flex-1">
                <AutoResizeTextbox selectedLecture={selectedLecture} />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Panel - Interactive Notes (only in normal mode) */}
        {!focusMode && (
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg border border-gray-200 dark:border-gray-600">
            <div className="p-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Interactive Notes</h3>
                <div className="flex items-center space-x-2">
                  <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Book size={16} className="text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Calendar size={16} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Start taking notes linked to video timestamps
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Click anywhere to begin
              </p>
            </div>
            <div className="h-64 overflow-hidden">
              <CompactNotesApp />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}