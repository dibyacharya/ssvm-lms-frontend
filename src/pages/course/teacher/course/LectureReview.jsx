import React, { useState, useEffect } from "react";
import {
  Edit,
  Video,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  BookOpen,
  FileText,
  Clock,
  User,
  Search,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import VideoEditor from "../../../EditLecture/EditLecture";
import { useParams } from "react-router-dom";
// import { updateLecture } from "../../../../services/lecture.service";
import LoadingSpinner from "../../../../utils/LoadingAnimation";
import { useCourse } from "../../../../context/CourseContext";
import {
  getHandouts,
  createHandout,
  updateHandout,
  deleteHandout,
} from "../../../../services/handout.service";

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
  const [showMOMModal, setShowMOMModal] = useState(false);
  const [showHandoutsModal, setShowHandoutsModal] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [editedLecture, setEditedLecture] = useState({
    title: "",
    content: "",
    visibility: "",
  });

  // Handouts state
  const [handouts, setHandouts] = useState([]);
  const [handoutForm, setHandoutForm] = useState({ title: "", content: "" });
  const [editingHandoutId, setEditingHandoutId] = useState(null);
  const [showHandoutForm, setShowHandoutForm] = useState(false);
  const [savingHandout, setSavingHandout] = useState(false);

  useEffect(() => {
    if (courseID) {
      getHandouts(courseID).then(setHandouts).catch(console.error);
    }
  }, [courseID]);

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

  const openMOMModal = (lecture) => {
    setCurrentLecture(lecture);
    setShowMOMModal(true);
  };

  const openHandoutsModal = () => {
    setShowHandoutsModal(true);
  };

  const handleCreateHandout = async () => {
    if (!handoutForm.title.trim()) return;
    try {
      setSavingHandout(true);
      const newHandout = await createHandout(courseID, handoutForm);
      setHandouts((prev) => [...prev, newHandout]);
      setHandoutForm({ title: "", content: "" });
      setShowHandoutForm(false);
      setSuccessMessage("Handout created!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to create handout:", err);
    } finally {
      setSavingHandout(false);
    }
  };

  const handleUpdateHandout = async () => {
    if (!handoutForm.title.trim() || !editingHandoutId) return;
    try {
      setSavingHandout(true);
      const updated = await updateHandout(editingHandoutId, handoutForm);
      setHandouts((prev) => prev.map((h) => (h._id === editingHandoutId ? updated : h)));
      setHandoutForm({ title: "", content: "" });
      setEditingHandoutId(null);
      setShowHandoutForm(false);
      setSuccessMessage("Handout updated!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to update handout:", err);
    } finally {
      setSavingHandout(false);
    }
  };

  const handleDeleteHandout = async (id) => {
    if (!window.confirm("Delete this handout?")) return;
    try {
      await deleteHandout(id);
      setHandouts((prev) => prev.filter((h) => h._id !== id));
      setSuccessMessage("Handout deleted!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to delete handout:", err);
    }
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
        <div className="p-8 bg-white rounded-xl shadow-md border border-gray-200 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
            <Video className="w-8 h-8 text-rose-400" />
          </div>
          <p className="text-gray-600 font-medium">
            No lectures found for this course.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white relative -top-6 w-full mx-auto p-4 min-h-screen">
      {/* Main Title Banner */}
      <div className="relative overflow-hidden rounded-xl mb-6 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 shadow-lg">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -bottom-6 right-20 w-20 h-20 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/5 rounded-full" />
        <div className="relative z-10 px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Video className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Recorded Lectures
              </h1>
              <p className="text-rose-100 text-sm mt-1">
                Review and manage all recorded lectures for this course
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg shadow-sm">
          <p className="text-emerald-800 font-medium flex items-center">
            <Check className="mr-2 h-5 w-5 text-emerald-500" />
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
            <div
              key={module._id}
              className="bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-100"
            >
              {/* Module Gradient Header */}
              <button
                onClick={() => toggleModule(module._id)}
                className="w-full text-left focus:outline-none"
              >
                <div className="relative overflow-hidden px-6 py-4 bg-gradient-to-r from-indigo-500 to-blue-600 cursor-pointer hover:from-indigo-600 hover:to-blue-700 transition-all duration-300">
                  <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
                  <div className="absolute -bottom-4 right-12 w-12 h-12 bg-white/5 rounded-full" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-lg font-bold text-white tracking-tight">
                        Module {module.moduleNumber}: {module.moduleTitle}
                      </h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 text-xs font-bold text-white bg-white/20 rounded-full backdrop-blur-sm">
                        {module.lectures.length}{" "}
                        {module.lectures.length === 1 ? "lecture" : "lectures"}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform duration-300">
                        {expandedModules[module._id] ? (
                          <ChevronDown className="w-5 h-5 text-white" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {expandedModules[module._id] && (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {module.lectures.map((lecture, index) => (
                      <LectureCard
                        key={lecture._id}
                        lecture={lecture}
                        index={lecture.lectureOrder - 1}
                        isReviewed={
                          lecture.isReviewed ||
                          reviewedLectures.has(lecture._id)
                        }
                        onReview={() => handleMarkAsReviewed(lecture._id)}
                        onEditDetails={() => openDetailsModal(lecture)}
                        onEditVideo={() => openVideoModal(lecture)}
                        onMOM={() => openMOMModal(lecture)}
                        onHandouts={() => openHandoutsModal()}
                        onCardClick={() => openVideoModal(lecture)}
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
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Details Edit Modal */}
      {showDetailsModal && currentLecture && (
        <div className="fixed top-0 bg-black bg-opacity-50 flex items-center justify-center left-0 min-h-screen min-w-full z-[100]">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative z-100">
            {/* Modal Gradient Header */}
            <div className="relative overflow-hidden px-6 py-4 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
              <div className="absolute -bottom-4 right-12 w-12 h-12 bg-white/5 rounded-full" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Edit className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Edit Lecture Details
                  </h2>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X size={18} className="text-white" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Lecture Info Summary */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Recorded:</span>
                  <span>{formatDateTime(currentLecture.createdAt)}</span>
                </div>
                {currentLecture.recordingDuration > 0 && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Video className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Duration:</span>
                      <span>{formatDuration(currentLecture.recordingDuration)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">Class Time:</span>
                      <span>
                        {new Date(currentLecture.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                        {" - "}
                        {getClassEndTime(currentLecture.createdAt, currentLecture.recordingDuration)}
                      </span>
                    </div>
                  </>
                )}
              </div>

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
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
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
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
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
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDetails}
                  className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Edit Modal */}
      {showVideoModal && currentLecture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ">
          <div className="rounded-lg shadow-xl w-full max-w-7xl p-4 absolute top-2 ">
            <VideoEditor
              videoUrl={(() => {
                const raw = currentLecture.videoUrl || currentLecture.recordingUrl;
                // Azure/external URLs need CORS proxy; local/blob URLs work directly
                if (raw && !raw.startsWith("blob:") && !raw.startsWith("/uploads/")) {
                  const backendUrl = window.RUNTIME_CONFIG?.BACKEND_URL || "http://localhost:5000";
                  return `${backendUrl}/api/lectures/stream/${currentLecture._id}`;
                }
                return raw;
              })()}
              setShowVideoModal={setShowVideoModal}
              courseId={courseID}
              lectureId={currentLecture._id}
              lectureReviewed={currentLecture.isReviewed}
            />
          </div>
        </div>
      )}

      {/* MOM (Transcript) Modal */}
      {showMOMModal && currentLecture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col border border-gray-200 dark:border-gray-600">
            <div className="relative overflow-hidden px-6 py-4 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 rounded-t-xl">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">MOM</h2>
                    <p className="text-purple-100 text-xs">{currentLecture.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMOMModal(false)}
                  className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X size={18} className="text-white" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {currentLecture.transcriptStatus === "processing" ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-3" />
                  <p>Transcript is being generated...</p>
                </div>
              ) : currentLecture.transcriptSegments && currentLecture.transcriptSegments.length > 0 ? (
                <div className="space-y-3">
                  {currentLecture.transcriptSegments.map((seg, idx) => (
                    <div key={idx} className="flex gap-3 group hover:bg-gray-50 rounded-lg p-2 transition-colors">
                      <span className="text-xs text-gray-400 font-mono min-w-[50px] pt-1 text-right">
                        {(() => { const m = Math.floor((seg.start || 0) / 60); const s = Math.floor((seg.start || 0) % 60); return `${m}:${s.toString().padStart(2, "0")}`; })()}
                      </span>
                      <div className="flex-1">
                        <span className="text-xs font-semibold text-purple-600 block mb-0.5 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {seg.speaker}
                        </span>
                        <p className="text-sm text-gray-700 leading-relaxed">{seg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : currentLecture.transcriptText ? (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{currentLecture.transcriptText}</p>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <FileText size={32} className="mb-3 opacity-50" />
                  <p className="font-medium">No transcript available</p>
                  <p className="text-sm mt-1">Transcript will appear after the class is recorded and processed.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Handouts Modal */}
      {showHandoutsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col border border-gray-200 dark:border-gray-600">
            <div className="relative overflow-hidden px-6 py-4 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 rounded-t-xl">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Handouts</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setShowHandoutForm(true); setEditingHandoutId(null); setHandoutForm({ title: "", content: "" }); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all text-sm border border-white/30"
                  >
                    <Plus className="w-4 h-4" /> New
                  </button>
                  <button
                    onClick={() => { setShowHandoutsModal(false); setShowHandoutForm(false); setEditingHandoutId(null); }}
                    className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <X size={18} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {/* Handout Create/Edit Form */}
              {showHandoutForm && (
                <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">{editingHandoutId ? "Edit Handout" : "New Handout"}</h4>
                  <input
                    type="text"
                    value={handoutForm.title}
                    onChange={(e) => setHandoutForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Title..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <textarea
                    value={handoutForm.content}
                    onChange={(e) => setHandoutForm((prev) => ({ ...prev, content: e.target.value }))}
                    rows={5}
                    placeholder="Write handout content..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-y"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setShowHandoutForm(false); setEditingHandoutId(null); }} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button
                      onClick={editingHandoutId ? handleUpdateHandout : handleCreateHandout}
                      disabled={savingHandout || !handoutForm.title.trim()}
                      className="px-4 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {savingHandout ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" /> : <Save className="w-3.5 h-3.5" />}
                      {editingHandoutId ? "Update" : "Create"}
                    </button>
                  </div>
                </div>
              )}

              {/* Handouts List */}
              {handouts.length === 0 && !showHandoutForm ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <BookOpen size={32} className="mb-3 opacity-50" />
                  <p className="font-medium">No handouts yet</p>
                  <p className="text-sm mt-1">Click "New" to create a handout.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {handouts.map((h, idx) => (
                    <div key={h._id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-6 h-6 rounded bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                            <h4 className="font-semibold text-gray-800">{h.title}</h4>
                          </div>
                          <p className="text-xs text-gray-400 mb-2">
                            {h.createdBy?.name || "Teacher"} &middot; {new Date(h.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                          {h.content && <p className="text-sm text-gray-600 whitespace-pre-wrap">{h.content}</p>}
                        </div>
                        <div className="flex items-center gap-1 ml-3">
                          <button
                            onClick={() => { setEditingHandoutId(h._id); setHandoutForm({ title: h.title, content: h.content || "" }); setShowHandoutForm(true); }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteHandout(h._id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getClassEndTime = (startDate, durationSec) => {
  if (!startDate || !durationSec) return null;
  const end = new Date(new Date(startDate).getTime() + durationSec * 1000);
  return end.toLocaleString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const LectureCard = ({
  lecture,
  index,
  isReviewed,
  onReview,
  onEditDetails,
  onEditVideo,
  onMOM,
  onHandouts,
  onCardClick,
  onReportIssue,
  showIssueForm,
  issueText,
  onIssueTextChange,
  onSendIssue,
  onCancelIssue,
}) => {
  const duration = formatDuration(lecture.recordingDuration);
  const classStart = lecture.createdAt;
  const classEndTime = getClassEndTime(lecture.createdAt, lecture.recordingDuration);

  return (
    <div
      onClick={onCardClick}
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg hover:border-rose-200 transition-all duration-300 cursor-pointer"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-block px-3 py-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-sm">
              Lecture {index + 1}
            </span>
            {isReviewed && (
              <span className="inline-block px-3 py-1 bg-gradient-to-r from-emerald-400 to-green-500 text-white text-xs font-bold rounded-full shadow-sm">
                Reviewed
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {formatDateTime(lecture.createdAt)}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {lecture.title}
        </h3>
        <p className="text-gray-600 mb-2 line-clamp-2">
          {lecture.content || "No description available."}
        </p>

        {/* Lecture Info */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
          {duration && (
            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
              <Video className="h-3 w-3" />
              Duration: {duration}
            </span>
          )}
          {classStart && lecture.recordingDuration > 0 && (
            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
              <Clock className="h-3 w-3" />
              {new Date(classStart).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
              {classEndTime && ` - ${classEndTime}`}
            </span>
          )}
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-center gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); onEditDetails(); }}
            className="px-2 py-1 flex items-center text-xs whitespace-nowrap rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            <Edit className="mr-1 h-3 w-3 flex-shrink-0" />
            Edit Lecture Details
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onEditVideo(); }}
            className="px-2 py-1 flex items-center text-xs whitespace-nowrap rounded-md border border-rose-300 text-rose-600 hover:bg-rose-50 hover:border-rose-400 transition-all duration-200"
          >
            <Video className="mr-1 h-3 w-3 flex-shrink-0" />
            Edit Video
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onHandouts(); }}
            className="px-2 py-1 flex items-center text-xs whitespace-nowrap rounded-md border border-emerald-300 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400 transition-all duration-200"
          >
            <BookOpen className="mr-1 h-3 w-3 flex-shrink-0" />
            Handouts
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onMOM(); }}
            className="px-2 py-1 flex items-center text-xs whitespace-nowrap rounded-md border border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-all duration-200"
          >
            <FileText className="mr-1 h-3 w-3" />
            MOM
          </button>
        </div>
      </div>
    </div>
  );
};

export default LectureReview;
