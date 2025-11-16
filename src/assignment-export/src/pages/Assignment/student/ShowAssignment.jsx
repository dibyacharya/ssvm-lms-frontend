import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  CheckCircle,
  Upload,
  FileText,
  ArrowLeft,
  CheckCircle2,
  Send,
} from "lucide-react";
import { useCourse } from "../../../context/CourseContext";
import { useNavigate } from "react-router-dom";
import { useAssignmentStore } from "../hooks/useAssignmentStore";
import toast from "react-hot-toast";
import LoadingSpinner from "../../../utils/LoadingAnimation";

const StudentAssignmentSection = ({ courseID, selectedID }) => {
  const { getAssignmentsByCourse, addSubmission, getCurrentStudentId } = useAssignmentStore();
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [subjectiveAnswers, setSubjectiveAnswers] = useState({});
  const [objectiveAnswers, setObjectiveAnswers] = useState({});
  const { courseData } = useCourse();
  const navigate = useNavigate();
  const currentStudentId = getCurrentStudentId();

  // Fetch assignments
  useEffect(() => {
    if (courseID) {
      setIsLoading(true);
      try {
        const courseAssignments = getAssignmentsByCourse(courseID);
        setAssignments(courseAssignments);
        
        if (courseAssignments && courseAssignments.length > 0) {
          // Use selectedID as index if provided, otherwise use 0
          const index = selectedID ? parseInt(selectedID) : 0;
          const found = courseAssignments[index] || courseAssignments[0];
          if (found) {
            setSelectedAssignment(found);
            // Load existing submission if any
            const existingSubmission = found.submissions?.find(
              sub => sub.student === currentStudentId
            );
            if (existingSubmission?.answers) {
              setSubjectiveAnswers(existingSubmission.answers.subjective || {});
              setObjectiveAnswers(existingSubmission.answers.objective || {});
            } else {
              // Clear answers if no submission
              setSubjectiveAnswers({});
              setObjectiveAnswers({});
            }
          }
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching assignments:", err);
        setError("Failed to load assignments.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [courseID, selectedID, getAssignmentsByCourse, currentStudentId]);

  // Get current submission - reactive to selectedAssignment changes
  const submission = useMemo(() => {
    if (!selectedAssignment || !currentStudentId) return null;
    return selectedAssignment.submissions?.find(
      sub => sub.student === currentStudentId
    ) || null;
  }, [selectedAssignment, currentStudentId]);

  // Load answers from submission when it changes (only on initial load or when submission status changes)
  const [hasLoadedSubmission, setHasLoadedSubmission] = useState(false);
  useEffect(() => {
    if (submission?.answers && !hasLoadedSubmission) {
      setSubjectiveAnswers(submission.answers.subjective || {});
      setObjectiveAnswers(submission.answers.objective || {});
      setHasLoadedSubmission(true);
    } else if (submission === null && selectedAssignment && !hasLoadedSubmission) {
      // Clear answers if no submission exists (only on initial load)
      setSubjectiveAnswers({});
      setObjectiveAnswers({});
      setHasLoadedSubmission(true);
    }
  }, [submission, selectedAssignment, hasLoadedSubmission]);

  // Reset hasLoadedSubmission when assignment changes
  useEffect(() => {
    setHasLoadedSubmission(false);
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
    // Load existing submission if any
    const existingSubmission = assignment.submissions?.find(
      sub => sub.student === currentStudentId
    );
    if (existingSubmission?.answers) {
      setSubjectiveAnswers(existingSubmission.answers.subjective || {});
      setObjectiveAnswers(existingSubmission.answers.objective || {});
    }
  };

  // Handle submit
  const handleSubmit = () => {
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

    // Calculate objective score
    let objectiveScore = 0;
    const totalObjectivePoints = objectiveQuestions.reduce((sum, q) => sum + (q.points || 0), 0);
    
    objectiveQuestions.forEach(q => {
      const qId = q._id || q.id;
      if (objectiveAnswers[qId] === q.correctAnswer) {
        objectiveScore += (q.points || 0);
      }
    });

    // Create submission
    const submissionData = {
      _id: `sub_${Date.now()}`,
      student: currentStudentId,
      submissionDate: new Date().toISOString(),
      answers: {
        subjective: subjectiveAnswers,
        objective: objectiveAnswers
      },
      submissionFile: selectedFile ? URL.createObjectURL(selectedFile) : null,
      status: 'submitted',
      objectiveScore: objectiveScore,
      totalObjectivePoints: totalObjectivePoints,
      grade: objectiveScore, // Auto-calculated score for objective questions
      feedback: null
    };

    // Save submission
    addSubmission(selectedAssignment._id, submissionData);
    
    toast.success(
      objectiveQuestions.length > 0 
        ? `Assignment submitted! Your score: ${objectiveScore}/${totalObjectivePoints}`
        : "Assignment submitted successfully!"
    );

    // Refresh assignments from localStorage
    setTimeout(() => {
      const updated = getAssignmentsByCourse(courseID);
      setAssignments(updated);
      const updatedAssignment = updated.find(a => a._id === selectedAssignment._id);
      if (updatedAssignment) {
        setSelectedAssignment(updatedAssignment);
        // Reset the loaded flag so submission data reloads
        setHasLoadedSubmission(false);
      }
    }, 100);
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

  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Sidebar - Assignment List */}
      <div className="w-1/4 bg-white dark:bg-gray-800 p-4 border-r border-gray-200 dark:border-gray-700 min-h-screen">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Assignments</h2>
        </div>
        <div className="space-y-2">
          {assignments.map((assignment, index) => {
            const hasSubmitted = assignment.submissions?.some(
              sub => sub.student === currentStudentId
            );
            const isSelected = selectedAssignment._id === assignment._id;

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
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {selectedAssignment.totalPoints} points
                </p>
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
              {/* Show grade if available */}
              {submission.grade !== null && submission.grade !== undefined && (
                <div className="mt-3 pt-3 border-t border-green-300 dark:border-green-700">
                  <div className="text-sm font-semibold text-green-800 dark:text-green-300 mb-1">Your Grade:</div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {submission.grade} / {selectedAssignment.totalPoints}
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

          {/* Questions Section */}
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
        </div>
      </div>
    </div>
  );
};

export default StudentAssignmentSection;
