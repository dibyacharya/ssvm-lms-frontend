import React, { useState, useEffect } from "react";
import {
  Edit,
  Video,
  Check,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import VideoEditor from "../../../EditLecture/EditLecture";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useParams } from "react-router-dom";
// import { updateLecture } from "../../../../services/lecture.service";
import LoadingSpinner from "../../../../utils/LoadingAnimation";
import { useCourse } from "../../../../context/CourseContext";

const LectureReview = () => {
  const { courseID } = useParams();
  const { courseData: course } = useCourse();
  const [reviewedLectures, setReviewedLectures] = useState(new Set());
  const [showIssueForm, setShowIssueForm] = useState(null);
  const [issueText, setIssueText] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [expandedModules, setExpandedModules] = useState({});

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [editedLecture, setEditedLecture] = useState({
    title: "",
    content: "",
    visibility: "",
  });

  useEffect(() => {
    // Expand all modules by default
    // UPDATED: Changed course.modules to course.syllabus.modules
    if (course?.syllabus?.modules) {
      const initialExpanded = {};
      // UPDATED: Changed course.modules to course.syllabus.modules
      course.syllabus.modules.forEach((module) => {
        if (module.lectures && module.lectures.length > 0) {
          initialExpanded[module._id] = true;
        }
      });
      setExpandedModules(initialExpanded);
    }
  }, [course]);

  const handleMarkAsReviewed = (lectureId) => {
    setReviewedLectures((prev) => {
      const newSet = new Set(prev);
      newSet.add(lectureId);
      return newSet;
    });
    setSuccessMessage("Lecture marked as reviewed!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleSendIssue = (lectureId) => {
    if (issueText.trim()) {
      console.log(`Issue submitted for lecture ${lectureId}:`, issueText);
      setIssueText("");
      setShowIssueForm(null);
      setSuccessMessage("Issue reported successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const openDetailsModal = (lecture) => {
    setCurrentLecture(lecture);
    setEditedLecture({
      title: lecture.title,
      content: lecture.content,
      visibility: lecture.visibility || "public",
    });
    setShowDetailsModal(true);
  };

  const openVideoModal = (lecture) => {
    setCurrentLecture(lecture);
    setShowVideoModal(true);
  };

  const handleSaveDetails = async () => {
    console.log("Saving lecture details:", editedLecture);
    setShowDetailsModal(false);
    // Show toast message instead of actual update
    setSuccessMessage("Lecture update feature will be implemented soon!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  // UPDATED: Adjusted loading check for the new data structure
  if (!course || !course.syllabus || !course.syllabus.modules) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="text-lg text-gray-600">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // UPDATED: Changed course.modules to course.syllabus.modules
  const modulesWithLectures = course.syllabus.modules.filter(
    (module) => module.lectures && module.lectures.length > 0
  );

  if (modulesWithLectures.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200 text-center">
          <p className="text-gray-600">No lectures found for this course.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white relative -top-6 w-full mx-auto p-4 min-h-screen">
      <div className="text-3xl font-bold py-6 text-gray-800">
        Recorded Lectures
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
          <p className="text-green-800 font-medium flex items-center">
            <Check className="mr-2 h-5 w-5" />
            {successMessage}
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* UPDATED: Changed course.modules to course.syllabus.modules */}
        {course.syllabus.modules.map((module) => {
          const hasLectures = module.lectures && module.lectures.length > 0;
          if (!hasLectures) return null;

          return (
            <div key={module._id} className="bg-gray-50 rounded-lg p-4">
              <button
                onClick={() => toggleModule(module._id)}
                className="w-full flex items-center justify-between mb-4 hover:bg-gray-100 p-2 rounded transition-colors"
              >
                <h3 className="text-xl font-semibold text-gray-800">
                  Module {module.moduleNumber}: {module.moduleTitle}
                </h3>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-2">
                    ({module.lectures.length} lectures)
                  </span>
                  {expandedModules[module._id] ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                </div>
              </button>

              {expandedModules[module._id] && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {module.lectures.map((lecture, index) => (
                    <LectureCard
                      key={lecture._id}
                      lecture={lecture}
                      index={lecture.lectureOrder - 1}
                      isReviewed={
                        lecture.isReviewed || reviewedLectures.has(lecture._id)
                      }
                      onReview={() => handleMarkAsReviewed(lecture._id)}
                      onEditDetails={() => openDetailsModal(lecture)}
                      onEditVideo={() => openVideoModal(lecture)}
                      onReportIssue={() => setShowIssueForm(lecture._id)}
                      showIssueForm={showIssueForm === lecture._id}
                      issueText={issueText}
                      onIssueTextChange={setIssueText}
                      onSendIssue={() => handleSendIssue(lecture._id)}
                      onCancelIssue={() => {
                        setShowIssueForm(null);
                        setIssueText("");
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Details Edit Modal */}
      {showDetailsModal && currentLecture && (
        <div className="fixed top-0 bg-black bg-opacity-50 flex items-center justify-center left-0 min-h-screen min-w-full z-[100]">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative z-100">
            <button
              onClick={() => setShowDetailsModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-100"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-6">Edit Lecture Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editedLecture.title}
                  onChange={(e) =>
                    setEditedLecture({
                      ...editedLecture,
                      title: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editedLecture.content}
                  onChange={(e) =>
                    setEditedLecture({
                      ...editedLecture,
                      content: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility
                </label>
                <select
                  value={editedLecture.visibility}
                  onChange={(e) =>
                    setEditedLecture({
                      ...editedLecture,
                      visibility: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDetails}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Edit Modal */}
      {showVideoModal && currentLecture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ">
          <div className="rounded-lg shadow-xl w-full max-w-7xl p-4 absolute top-2 ">
            <VideoEditor
              videoUrl={currentLecture.videoUrl}
              setShowVideoModal={setShowVideoModal}
              courseId={courseID}
              lectureId={currentLecture._id}
              lectureReviewed={currentLecture.isReviewed}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// No changes needed for LectureCard as it receives props correctly.
const LectureCard = ({
  lecture,
  index,
  isReviewed,
  onReview,
  onEditDetails,
  onEditVideo,
  onReportIssue,
  showIssueForm,
  issueText,
  onIssueTextChange,
  onSendIssue,
  onCancelIssue,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full mb-2">
              Lecture {index + 1}
            </span>
            {isReviewed && (
              <span className="inline-block ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Reviewed
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {new Date(lecture.updatedAt).toLocaleDateString()}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {lecture.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {lecture.content || "No description available."}
        </p>

        <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={onEditDetails}
            className="px-3 py-2 flex items-center text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Details
          </button>

          <button
            onClick={onEditVideo}
            className="px-3 py-2 flex items-center text-sm rounded-md border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            <Video className="mr-2 h-4 w-4" />
            Edit Video
          </button>
          {lecture.visibility === "public" ? (
            <abbr title="students can see it">
              <FaEye size={24} fill="green" />
            </abbr>
          ) : (
            <abbr title="students can't see it">
              <FaEyeSlash size={24} fill="red" />
            </abbr>
          )}
        </div>
      </div>
    </div>
  );
};

export default LectureReview;