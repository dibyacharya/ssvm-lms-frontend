import React, { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle,
  Upload,
  FileText,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { useCourse } from "../../../context/CourseContext";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAllCourseAssignments,
  submitAssignment,
} from "../../../services/assignment.service";
import toast from "react-hot-toast";
import LoadingSpinner from "../../../utils/LoadingAnimation";

const StudentAssignmentSection = ({ courseID, selectedID }) => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const { courseData  } = useCourse();
  const navigate = useNavigate();
  

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      console.log(courseID);
      const data = await getAllCourseAssignments({ courseID });

      setAssignments(data.assignments);

      // Set the first assignment as selected by default if available
      if (data && data.assignments.length > 0) {
        console.log(data.assignments[selectedID]);
        setSelectedAssignment(data.assignments[selectedID]);
      }
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("Failed to load assignments. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseID) {
      fetchAssignments();
    }
  }, [courseID]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !selectedAssignment) return;

    try {
      // Create FormData object
      const formData = new FormData();

      // Add the file with key 'submissionFile' as shown in the Postman screenshot
      formData.append("submissionFile", selectedFile);

      // Call the submitAssignment function
      const response = await submitAssignment(selectedAssignment._id, formData);

      console.log("Assignment submitted successfully:", response);

      // Show success message
      toast.success("Assignment submitted successfully!");

      // Refresh assignments if needed
      fetchAssignments();
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast.success(`Failed to submit assignment: ${error.message}`);
    }
  };

  const getCurrentSubmission = () => {
    if (!selectedAssignment || !courseData?.student?.id) return null;

    return selectedAssignment.submissions.find(
      (submission) => submission.student === courseData.student.id
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-96 bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  if (error) return <div className="text-red-500 dark:text-red-400 p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">{error}</div>;
  if (!assignments || assignments.length === 0)
    return <div className="p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-600">No assignments found.</div>;

  const submission = getCurrentSubmission();

  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-50 dark:bg-gray-800 p-4 border-r border-gray-200 dark:border-gray-600 min-h-screen">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Assignments</h2>
        <div className="space-y-2">
          {assignments.map((assignment) => {
            const hasSubmitted = assignment.submissions.some(
              (sub) => sub.student === courseData?.student?.id
            );

            return (
              <div
                key={assignment._id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedAssignment?._id === assignment._id
                    ? "bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 dark:border-green-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-700"
                }`}
                onClick={() => setSelectedAssignment(assignment)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900 dark:text-white">{assignment.title}</h3>
                  {hasSubmitted && (
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full border border-green-200 dark:border-green-700">
                      Submitted
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Due: {formatDate(assignment.dueDate)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      {selectedAssignment && (
        <div className="w-3/4 bg-gray-50 dark:bg-gray-900">
          <div className="space-y-6 max-w-7xl m-auto py-6 px-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 border border-gray-200 dark:border-gray-600">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {selectedAssignment.title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Course: {courseData?.title || "Loading course..."}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Due: {formatDate(selectedAssignment.dueDate)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {selectedAssignment.totalPoints} points
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 border border-gray-200 dark:border-gray-600">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Assignment Details
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300">{selectedAssignment.description}</p>
                    <h3 className="text-lg font-semibold mt-4 text-gray-900 dark:text-white">
                      Requirements:
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                      <li>Complete all questions in the provided worksheet</li>
                      <li>Show your work for calculations</li>
                      <li>Include your name and student ID</li>
                    </ul>
                  </div>

                  {selectedAssignment.attachments &&
                    selectedAssignment.attachments.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attachments:</h3>
                        <div className="mt-2 space-y-2">
                          {selectedAssignment.attachments.map((attachment) => (
                            <a
                              key={attachment._id}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
                            >
                              <FileText className="h-4 w-4" />
                              <span>{attachment.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {submission ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Your Submission
                      </h2>
                      <span className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                        <CheckCircle className="h-5 w-5" />
                        <span>Submitted</span>
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                        <a
                          href={submission.submissionFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
                        >
                          <FileText className="h-5 w-5" />
                          <span>View Your Submission</span>
                        </a>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Submitted on: {formatDate(submission.submissionDate)}
                        </p>
                      </div>
                      {submission.feedback && (
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Feedback
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mt-2">
                            {submission.feedback}
                          </p>
                        </div>
                      )}
                      {submission.grade && (
                        <div className="mt-4">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {submission.grade}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            /{selectedAssignment.totalPoints}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 border border-gray-200 dark:border-gray-600">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                      Submit Assignment
                    </h2>
                    {new Date(selectedAssignment.dueDate) - new Date() > 0 ||
                    selectedAssignment.isActive ? (
                      <div className="space-y-4">
                        <div
                          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors bg-gray-50 dark:bg-gray-700"
                          onClick={() =>
                            document.getElementById("file-upload").click()
                          }
                        >
                          <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-300">
                            {selectedFile
                              ? `Selected: ${selectedFile.name}`
                              : "Drag and drop your files here, or click to select files"}
                          </p>
                          <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                          <button
                            className="mt-4 bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-400 transition-colors"
                            onClick={() =>
                              document.getElementById("file-upload").click()
                            }
                          >
                            Select Files
                          </button>
                        </div>
                        <button
                          className={`w-full px-4 py-2 rounded-lg transition-colors ${
                            selectedFile
                              ? "bg-green-600 dark:bg-green-500 text-white hover:bg-green-700 dark:hover:bg-green-400"
                              : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          }`}
                          onClick={handleSubmit}
                          disabled={!selectedFile}
                        >
                          Submit Assignment
                        </button>
                      </div>
                    ) : (
                      <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6 text-center space-y-3">
                        <Clock className="h-8 w-8 text-amber-500 dark:text-amber-400 mx-auto" />
                        <h3 className="text-lg font-medium text-amber-800 dark:text-amber-300">
                          Submission Unavailable
                        </h3>
                        <p className="text-amber-700 dark:text-amber-400">
                          {new Date(selectedAssignment.dueDate) - new Date() < 0
                            ? "This assignment has passed its due date and is no longer accepting submissions."
                            : "This assignment is not currently accepting submissions."}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 border border-gray-200 dark:border-gray-600">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Assignment Status
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Status</span>
                      {new Date(selectedAssignment.dueDate) - new Date() > 0 ||
                      selectedAssignment.isActive ||
                      submission ? (
                        <span
                          className={`px-3 py-1 rounded-full text-sm border ${
                            submission
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700"
                              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700"
                          }`}
                        >
                          {submission ? "Submitted" : "Pending"}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-sm bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700">
                          Not Submitted
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Due Date</span>
                      <span className="text-gray-900 dark:text-white">
                        {formatDate(selectedAssignment.dueDate)}
                      </span>
                    </div>
                    {submission && submission.grade && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Grade</span>
                        <span className="text-gray-900 dark:text-white">
                          {submission.grade}/{selectedAssignment.totalPoints}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 border border-gray-200 dark:border-gray-600">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Resources</h2>
                  <div className="space-y-3">
                    <a
                      href="#"
                      className="flex items-center space-x-3 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                    >
                      <FileText className="h-5 w-5" />
                      <span>Assignment Guidelines</span>
                    </a>
                    <a
                      href="#"
                      className="flex items-center space-x-3 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                    >
                      <FileText className="h-5 w-5" />
                      <span>Grading Rubric</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignmentSection;