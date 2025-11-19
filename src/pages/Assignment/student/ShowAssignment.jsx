import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  CheckCircle,
  Upload,
  FileText,
  ArrowLeft,
  CheckCircle2,
  Send,
  Paperclip,
  Maximize,
  X,
} from "lucide-react";
import { useCourse } from "../../../context/CourseContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  getAllCourseAssignments,
  submitAssignment,
} from "../../../services/assignment.service";
import toast from "react-hot-toast";
import LoadingSpinner from "../../../utils/LoadingAnimation";

const StudentAssignmentSection = ({ courseID, selectedID }) => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [subjectiveAnswers, setSubjectiveAnswers] = useState({});
  const [objectiveAnswers, setObjectiveAnswers] = useState({});
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' or 'attachments'
  const [selectedAttachmentIndex, setSelectedAttachmentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { courseData } = useCourse();
  const navigate = useNavigate();

  // Fetch assignments from API
  const fetchAssignments = async () => {
    if (!courseID) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getAllCourseAssignments({ courseID });
      const courseAssignments = response.assignments || [];
      setAssignments(courseAssignments);
      
      // Find selected assignment
      if (courseAssignments.length > 0) {
        let found = null;
        if (selectedID) {
          // Try to find by ID first
          found = courseAssignments.find(a => a._id === selectedID);
        }
        // If not found by ID, use first assignment
        if (!found) {
          found = courseAssignments[0];
        }
        
        if (found) {
          setSelectedAssignment(found);
          // Load submission from assignment object
          loadSubmissionFromAssignment(found);
        }
      }
    } catch (err) {
      console.error("Error fetching assignments:", err);
      const errorMessage = err.response?.data?.message || "Failed to load assignments.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load submission from assignment object (studentSubmission field from API)
  const loadSubmissionFromAssignment = (assignment) => {
    if (!assignment) return;
    
    // The API returns studentSubmission field for students
    const submissionData = assignment.studentSubmission || null;
    setSubmission(submissionData);
    
    // Load answers from submission if it exists
    if (submissionData?.answers) {
      setSubjectiveAnswers(submissionData.answers.subjective || {});
      setObjectiveAnswers(submissionData.answers.objective || {});
    } else {
      // Clear answers if no submission
      setSubjectiveAnswers({});
      setObjectiveAnswers({});
    }
  };

  useEffect(() => {
    if (courseID) {
      fetchAssignments();
    }
  }, [courseID, selectedID]);

  // Reset selected attachment index and set default tab when assignment changes
  useEffect(() => {
    if (selectedAssignment) {
      setSelectedAttachmentIndex(0);
      const assignmentQuestions = selectedAssignment.questions || [];
      const assignmentAttachments = selectedAssignment.attachments || [];
      const hasQuestions = assignmentQuestions.length > 0;
      const hasAttachments = assignmentAttachments.length > 0;
      
      // Set default tab: questions if available, otherwise attachments if available
      if (hasQuestions) {
        setActiveTab('questions');
      } else if (hasAttachments) {
        setActiveTab('attachments');
      } else {
        setActiveTab('questions');
      }
    }
  }, [selectedAssignment?._id]);

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle subjective answer change
  const handleSubjectiveAnswerChange = (questionId, answer) => {
    setSubjectiveAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Handle objective answer change
  const handleObjectiveAnswerChange = (questionId, answer) => {
    setObjectiveAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Handle assignment selection
  const handleAssignmentSelect = (assignment, index) => {
    setSelectedAssignment(assignment);
    setSubjectiveAnswers({});
    setObjectiveAnswers({});
    setSelectedFile(null);
    // Load submission from assignment object
    loadSubmissionFromAssignment(assignment);
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!selectedAssignment) {
      toast.error("Please select an assignment");
      return;
    }

    const questions = selectedAssignment.questions || [];
    const subjectiveQuestions = questions.filter(q => q.type === 'subjective');
    const objectiveQuestions = questions.filter(q => q.type === 'objective');

    // Validate subjective questions
    if (subjectiveQuestions.length > 0) {
      const hasTextAnswers = Object.keys(subjectiveAnswers).some(
        key => subjectiveAnswers[key]?.trim()
      );
      if (!hasTextAnswers && !selectedFile) {
        toast.error("Please provide answers for subjective questions (text or PDF)");
        return;
      }
    }

    // Validate objective questions
    if (objectiveQuestions.length > 0) {
      const allAnswered = objectiveQuestions.every(q => {
        const qId = q._id || q.id;
        return objectiveAnswers[qId];
      });
      if (!allAnswered) {
        toast.error("Please answer all objective questions");
        return;
      }
    }

    try {
      setIsLoading(true);
      
      // Create FormData for submission
      const formData = new FormData();
      
      // Check if there are any answers to send
      const hasSubjectiveAnswers = Object.keys(subjectiveAnswers).length > 0 && 
        Object.values(subjectiveAnswers).some(answer => answer?.trim());
      const hasObjectiveAnswers = Object.keys(objectiveAnswers).length > 0;
      
      // Only add answers if there are actual answers (not empty objects)
      if (hasSubjectiveAnswers || hasObjectiveAnswers) {
        formData.append('answers', JSON.stringify({
          subjective: subjectiveAnswers,
          objective: objectiveAnswers
        }));
      }
      
      // Add file if selected - ensure it's a valid File object
      if (selectedFile && selectedFile instanceof File) {
        formData.append('submissionFile', selectedFile);
        console.log('Adding file to FormData:', {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type
        });
      } else if (selectedFile) {
        console.warn('Selected file is not a valid File object:', selectedFile);
        toast.error('Invalid file selected. Please choose a file again.');
        setIsLoading(false);
        return;
      }

      // Validate that we have either answers or a file
      if (!hasSubjectiveAnswers && !hasObjectiveAnswers && !selectedFile) {
        toast.error('Please provide answers or upload a file');
        setIsLoading(false);
        return;
      }

      // Log FormData contents for debugging
      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: File - ${pair[1].name} (${pair[1].size} bytes, type: ${pair[1].type})`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      // Submit to API
      const response = await submitAssignment(selectedAssignment._id, formData);
      
      // Refresh assignments to get updated submission data
      await fetchAssignments();
      
      // Clear file selection
      setSelectedFile(null);
      
      // Success message is handled in the service
    } catch (error) {
      // Error is already handled in the service with toast
      console.error("Error submitting assignment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96 bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-red-500 dark:text-red-400 p-4 bg-white dark:bg-gray-800 rounded-lg">
        {error}
      </div>
    );
  }

  // No assignments
  if (!assignments || assignments.length === 0) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg">
        No assignments found.
      </div>
    );
  }

  // No selected assignment
  if (!selectedAssignment) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg">
        Please select an assignment.
      </div>
    );
  }

  // Separate questions by type
  const questions = selectedAssignment.questions || [];
  const subjectiveQuestions = questions.filter(q => q.type === 'subjective');
  const objectiveQuestions = questions.filter(q => q.type === 'objective');
  
  // Get attachments from assignment
  const attachments = selectedAssignment.attachments || [];
  const hasAttachments = attachments.length > 0;
  
  // Helper function to get file type from attachment
  const getFileType = (attachment) => {
    if (!attachment.type && !attachment.name) return 'unknown';
    const type = attachment.type?.toLowerCase() || '';
    const name = attachment.name?.toLowerCase() || '';
    
    if (type.includes('pdf') || name.endsWith('.pdf')) return 'pdf';
    if (type.includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(name)) return 'image';
    if (type.includes('powerpoint') || type.includes('presentation') || name.endsWith('.ppt') || name.endsWith('.pptx')) return 'ppt';
    if (type.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) return 'doc';
    return 'other';
  };
  
  // Helper function to get file URL
  const getFileUrl = (attachment) => {
    return attachment.url || attachment.fileUrl || '';
  };

  // Render attachment viewer content
  const renderAttachmentViewer = (attachment, showFullscreenButton = false) => {
    if (!attachment) return null;
    
    const fileType = getFileType(attachment);
    const fileUrl = getFileUrl(attachment);
    const fileName = attachment.name || `Attachment ${selectedAttachmentIndex + 1}`;

    if (fileType === 'pdf') {
      return (
        <div className="relative w-full h-full">
          {showFullscreenButton && (
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute top-4 right-4 z-10 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Fullscreen"
            >
              <Maximize className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
          )}
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=1`}
            className="w-full h-full border-0"
            title={fileName}
          />
        </div>
      );
    } else if (fileType === 'image') {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-900 p-4 relative">
          {showFullscreenButton && (
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute top-4 right-4 z-10 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Fullscreen"
            >
              <Maximize className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
          )}
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
          />
        </div>
      );
    } else if (fileType === 'ppt' || fileType === 'pptx') {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-100 dark:bg-gray-900 p-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-orange-500 text-white text-sm flex items-center justify-center w-10 h-10 rounded">
                PPT
              </div>
              <h3 className="ml-3 font-semibold text-lg text-gray-900 dark:text-white">
                {fileName}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              PowerPoint presentations cannot be previewed directly. You can download the file to view it.
            </p>
            <div className="flex justify-center">
              <a
                href={fileUrl}
                download={fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
              >
                <FileText className="h-5 w-5" />
                Download Presentation
              </a>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-100 dark:bg-gray-900 p-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gray-500 text-white text-sm flex items-center justify-center w-10 h-10 rounded">
                FILE
              </div>
              <h3 className="ml-3 font-semibold text-lg text-gray-900 dark:text-white">
                {fileName}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This file type cannot be previewed. You can download it to view.
            </p>
            <div className="flex justify-center">
              <a
                href={fileUrl}
                download={fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
              >
                <FileText className="h-5 w-5" />
                Download File
              </a>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Sidebar - Assignment List */}
      <div className="w-1/4 bg-white dark:bg-gray-800 p-4 border-r border-gray-200 dark:border-gray-700 min-h-screen">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Assignments</h2>
        </div>
        <div className="space-y-2">
          {assignments.map((assignment, index) => {
            // Check if student has submitted (using studentSubmission field from API)
            const hasSubmitted = assignment.studentSubmission !== null && assignment.studentSubmission !== undefined;
            const isSelected = selectedAssignment?._id === assignment._id;

            return (
              <div
                key={assignment._id}
                onClick={() => handleAssignmentSelect(assignment, index)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-700"
                }`}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                    {assignment.title}
                  </h3>
                  {hasSubmitted && (
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatDate(assignment.dueDate)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Assignment Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {selectedAssignment.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  {courseData?.title || "Course"}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                  {selectedAssignment.description}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm">{formatDate(selectedAssignment.dueDate)}</span>
                </div>
                {selectedAssignment.isUngraded ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                      Ungraded
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {selectedAssignment.totalPoints} points
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submission Status */}
          {submission && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Submitted</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                Submitted on: {formatDate(submission.submissionDate)}
              </p>
              {submission.objectiveScore !== undefined && submission.totalObjectivePoints > 0 && (
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  Score: {submission.objectiveScore}/{submission.totalObjectivePoints}
                </p>
              )}
              {submission.submissionFile && (
                <a
                  href={submission.submissionFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-flex items-center gap-1"
                >
                  <FileText className="h-4 w-4" />
                  View Submission File
                </a>
              )}
              {/* Show grade if available (only show if teacher has graded) */}
              {submission.grade !== null && submission.grade !== undefined && (
                <div className="mt-3 pt-3 border-t border-green-300 dark:border-green-700">
                  <div className="text-sm font-semibold text-green-800 dark:text-green-300 mb-1">Your Grade:</div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {submission.grade} / {selectedAssignment.totalPoints}
                  </div>
                </div>
              )}
              {/* Show pending message if subjective questions exist but not graded yet (only for graded assignments) */}
              {(submission.grade === null || submission.grade === undefined) && subjectiveQuestions.length > 0 && !selectedAssignment.isUngraded && (
                <div className="mt-3 pt-3 border-t border-green-300 dark:border-green-700">
                  <div className="text-sm text-green-800 dark:text-green-300">
                    Your submission is pending teacher review. You will see your grade once the teacher has graded your assignment.
                  </div>
                </div>
              )}
              {/* Show feedback if available */}
              {submission.feedback && (
                <div className="mt-3 pt-3 border-t border-green-300 dark:border-green-700">
                  <div className="text-sm font-semibold text-green-800 dark:text-green-300 mb-1">Teacher Feedback:</div>
                  <div className="text-sm text-green-700 dark:text-green-400 bg-white dark:bg-gray-800 p-2 rounded border border-green-200 dark:border-green-700">
                    {submission.feedback}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tabs Section - Only show if there are attachments */}
          {hasAttachments && questions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-1 px-4" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('questions')}
                    className={`px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'questions'
                        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Questions
                  </button>
                  <button
                    onClick={() => setActiveTab('attachments')}
                    className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                      activeTab === 'attachments'
                        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    <Paperclip className="h-4 w-4" />
                    Attachments ({attachments.length})
                  </button>
                </nav>
              </div>
            </div>
          )}

          {/* Questions Section */}
          {activeTab === 'questions' && (
            <>
              {questions.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    No questions available for this assignment.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
              {/* Subjective Questions */}
              {subjectiveQuestions.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Subjective Questions
                  </h2>
                  <div className="space-y-6">
                    {subjectiveQuestions.map((q, index) => {
                      const qId = q._id || q.id;
                      const answerValue = subjectiveAnswers[qId] || '';
                      return (
                        <div key={qId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded text-sm font-medium">
                              Question {index + 1}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {q.points || 0} points
                            </span>
                          </div>
                          <p className="text-gray-900 dark:text-white font-medium mb-3">
                            {q.question}
                          </p>
                          <textarea
                            value={answerValue}
                            onChange={(e) => handleSubjectiveAnswerChange(qId, e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            rows="6"
                            placeholder="Type your answer here..."
                            disabled={!!submission}
                          />
                          {submission && answerValue && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Your answer is saved
                            </p>
                          )}
                        </div>
                      );
                    })}

                    {/* PDF Upload Option for Subjective */}
                    {!submission && (
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                        <Upload className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500 mb-3" />
                        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                          Upload PDF Submission (Optional)
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          You can upload a PDF file with your answers instead of or in addition to text answers.
                        </p>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="hidden"
                          id="pdf-upload"
                        />
                        <label
                          htmlFor="pdf-upload"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 text-white rounded-lg cursor-pointer transition-colors"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {selectedFile ? selectedFile.name : "Choose PDF File"}
                        </label>
                        {selectedFile && (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                            ✓ PDF selected
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Objective Questions */}
              {objectiveQuestions.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Objective Questions (MCQ)
                  </h2>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <strong>Note:</strong> Your score will be automatically calculated after submission.
                    </p>
                  </div>
                  <div className="space-y-4">
                    {objectiveQuestions.map((q, index) => {
                      const qId = q._id || q.id;
                      const selectedAnswer = objectiveAnswers[qId];
                      const isCorrect = selectedAnswer === q.correctAnswer;
                      
                      return (
                        <div key={qId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded text-sm font-medium">
                              Question {index + 1}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {q.points || 0} points
                            </span>
                            {submission && selectedAnswer && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                isCorrect 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                              }`}>
                                {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-900 dark:text-white font-medium mb-3">
                            {q.question}
                          </p>
                          <div className="space-y-2">
                            {q.options?.map((option, optIndex) => {
                              const isSelected = selectedAnswer === option;
                              return (
                                <label
                                  key={optIndex}
                                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                    isSelected
                                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30'
                                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`question_${qId}`}
                                    value={option}
                                    checked={isSelected}
                                    onChange={() => handleObjectiveAnswerChange(qId, option)}
                                    disabled={!!submission}
                                    className="w-4 h-4 text-blue-600"
                                  />
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {String.fromCharCode(65 + optIndex)}.
                                  </span>
                                  <span className="flex-1 text-gray-900 dark:text-white">
                                    {option}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              {!submission && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <button
                    onClick={handleSubmit}
                    className="w-full px-6 py-3 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-400 flex items-center justify-center gap-2 font-medium transition-colors"
                  >
                    <Send className="h-5 w-5" />
                    Submit Assignment
                  </button>
                </div>
              )}
            </div>
          )}
            </>
          )}

          {/* Attachments Section */}
          {activeTab === 'attachments' && hasAttachments && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="flex flex-col h-[calc(100vh-300px)] min-h-[600px]">
                {/* Attachment List Sidebar */}
                {attachments.length > 1 && (
                  <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Select Attachment:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {attachments.map((attachment, index) => {
                        const fileType = getFileType(attachment);
                        const isSelected = selectedAttachmentIndex === index;
                        return (
                          <button
                            key={attachment._id || index}
                            onClick={() => setSelectedAttachmentIndex(index)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                              isSelected
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            <FileText className="h-4 w-4" />
                            <span className="max-w-[200px] truncate">
                              {attachment.name || `Attachment ${index + 1}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* PDF Viewer */}
                <div className="flex-1 relative">
                  {attachments[selectedAttachmentIndex] && renderAttachmentViewer(attachments[selectedAttachmentIndex], true)}
                </div>
              </div>
            </div>
          )}

          {/* Show attachments tab if no questions but has attachments */}
          {questions.length === 0 && hasAttachments && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="flex flex-col h-[calc(100vh-300px)] min-h-[600px]">
                {/* Attachment List Sidebar */}
                {attachments.length > 1 && (
                  <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Select Attachment:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {attachments.map((attachment, index) => {
                        const fileType = getFileType(attachment);
                        const isSelected = selectedAttachmentIndex === index;
                        return (
                          <button
                            key={attachment._id || index}
                            onClick={() => setSelectedAttachmentIndex(index)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                              isSelected
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            <FileText className="h-4 w-4" />
                            <span className="max-w-[200px] truncate">
                              {attachment.name || `Attachment ${index + 1}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* PDF Viewer */}
                <div className="flex-1 relative">
                  {attachments[selectedAttachmentIndex] && renderAttachmentViewer(attachments[selectedAttachmentIndex], true)}
                </div>
              </div>
            </div>
          )}

          {/* Fullscreen Modal */}
          {isFullscreen && attachments[selectedAttachmentIndex] && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold">
                    {attachments[selectedAttachmentIndex].name || `Attachment ${selectedAttachmentIndex + 1}`}
                  </h3>
                  {attachments.length > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedAttachmentIndex(Math.max(0, selectedAttachmentIndex - 1))}
                        disabled={selectedAttachmentIndex === 0}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="text-sm">
                        {selectedAttachmentIndex + 1} / {attachments.length}
                      </span>
                      <button
                        onClick={() => setSelectedAttachmentIndex(Math.min(attachments.length - 1, selectedAttachmentIndex + 1))}
                        disabled={selectedAttachmentIndex === attachments.length - 1}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Exit Fullscreen (Esc)"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Fullscreen Viewer */}
              <div className="flex-1 overflow-auto">
                {renderAttachmentViewer(attachments[selectedAttachmentIndex], false)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAssignmentSection;
