import React, { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle,
  Upload,
  FileText,
  Clock,
  ArrowLeft,
  Link as LinkIcon,
} from "lucide-react";
import { useCourse } from "../../../context/CourseContext";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAllCourseActivities,
  submitActivity,
} from "../../../services/activity.service";
import toast from "react-hot-toast";
import LoadingSpinner from "../../../utils/LoadingAnimation";

const StudentActivitySection = ({ courseID, selectedID }) => {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const { courseData } = useCourse();
  const navigate = useNavigate();

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      console.log(courseID);
      const data = await getAllCourseActivities({ courseID });

      setActivities(data.activities);

      // Set the first activity as selected by default if available
      if (data && data.activities.length > 0) {
        console.log(data.activities[selectedID]);
        setSelectedActivity(data.activities[selectedID]);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError("Failed to load activities. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseID) {
      fetchActivities();
    }
  }, [courseID]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !selectedActivity) return;

    try {
      // Create FormData object
      const formData = new FormData();

      // Add the file with key 'submissionFile' as shown in the Postman screenshot
      formData.append("submissionFile", selectedFile);

      // Call the submitActivity function
      const response = await submitActivity(selectedActivity._id, formData);

      console.log("Activity submitted successfully:", response);

      // Show success message
      toast.success("Activity submitted successfully!");

      // Refresh activities if needed
      fetchActivities();
    } catch (error) {
      console.error("Error submitting activity:", error);
      toast.success(`Failed to submit activity: ${error.message}`);
    }
  };

  const getCurrentSubmission = () => {
    if (!selectedActivity || !courseData?.student?.id) return null;

    return selectedActivity.submissions.find(
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
  if (!activities || activities.length === 0)
    return <div className="p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-600">No activities found.</div>;

  const submission = getCurrentSubmission();

  return (
    <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-50 dark:bg-gray-800 p-4 border-r border-gray-200 dark:border-gray-600 min-h-screen">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Activities</h2>
        <div className="space-y-2">
          {activities.map((activity) => {
            const hasSubmitted = activity.submissions.some(
              (sub) => sub.student === courseData?.student?.id
            );

            return (
              <div
                key={activity._id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedActivity?._id === activity._id
                    ? "bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 dark:border-green-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-700"
                }`}
                onClick={() => setSelectedActivity(activity)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900 dark:text-white">{activity.title}</h3>
                  {hasSubmitted && (
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full border border-green-200 dark:border-green-700">
                      Submitted
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Due: {formatDate(activity.dueDate)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      {selectedActivity && (
        <div className="w-3/4 bg-gray-50 dark:bg-gray-900">
          <div className="space-y-6 max-w-7xl m-auto py-6 px-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 border border-gray-200 dark:border-gray-600">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {selectedActivity.title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Course: {courseData?.title || "Loading course..."}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Due: {formatDate(selectedActivity.dueDate)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {selectedActivity.totalPoints} points
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 border border-gray-200 dark:border-gray-600">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Activity Details
                  </h2>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300">{selectedActivity.description}</p>
                    <h3 className="text-lg font-semibold mt-4 text-gray-900 dark:text-white">
                      Requirements:
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                      <li>Complete all tasks as described in the activity</li>
                      <li>Submit your work in the requested format</li>
                      <li>Include your name and student ID</li>
                    </ul>
                  </div>

                  {/* Attachments Section */}
                  {selectedActivity.attachments &&
                    selectedActivity.attachments.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attachments:</h3>
                        <div className="mt-2 space-y-2">
                          {selectedActivity.attachments.map((attachment) => (
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

                  {/* Links Section - New for Activity */}
                  {selectedActivity.links &&
                    selectedActivity.links.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          External Links:
                        </h3>
                        <div className="mt-2 space-y-2">
                          {selectedActivity.links.map((link, index) => (
                            <a
                              key={index}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                            >
                              <LinkIcon className="h-4 w-4" />
                              <span>{link.name}</span>
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
                            /{selectedActivity.totalPoints}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 border border-gray-200 dark:border-gray-600">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                      Submit Activity
                    </h2>
                    {new Date(selectedActivity.dueDate) - new Date() > 0 ||
                    selectedActivity.isActive ? (
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
                          Submit Activity
                        </button>
                      </div>
                    ) : (
                      <div className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6 text-center space-y-3">
                        <Clock className="h-8 w-8 text-amber-500 dark:text-amber-400 mx-auto" />
                        <h3 className="text-lg font-medium text-amber-800 dark:text-amber-300">
                          Submission Unavailable
                        </h3>
                        <p className="text-amber-700 dark:text-amber-400">
                          {new Date(selectedActivity.dueDate) - new Date() < 0
                            ? "This activity has passed its due date and is no longer accepting submissions."
                            : "This activity is not currently accepting submissions."}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 border border-gray-200 dark:border-gray-600">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Activity Status
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Status</span>
                      {new Date(selectedActivity.dueDate) - new Date() > 0 ||
                      selectedActivity.isActive ||
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
                        {formatDate(selectedActivity.dueDate)}
                      </span>
                    </div>
                    {submission && submission.grade && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Grade</span>
                        <span className="text-gray-900 dark:text-white">
                          {submission.grade}/{selectedActivity.totalPoints}
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
                      <span>Activity Guidelines</span>
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

export default StudentActivitySection;