import React from "react";
import { useParams } from "react-router-dom";
import { assignments, courses, submissions } from "../data/mockData";
import { FileText, Calendar, Upload, CheckCircle } from "lucide-react";

const AssignmentDetail = () => {
  const { assignmentID } = useParams();
  const assignment = assignments.find((a) => a.id === assignmentID);
  const course = assignment
    ? courses.find((c) => c.id === assignment.courseId)
    : null;
  const submission = submissions.find((s) => s.assignmentId === assignmentID);

  if (!assignment || !course) return <div>Assignment not found</div>;

  return (
    <div className="space-y-6 max-w-7xl m-auto py-20">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {assignment.title}
            </h1>
            <p className="text-gray-600 mt-2">Course: {course.title}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">
                Due: {assignment.dueDate}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {assignment.totalPoints} points
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Assignment Details</h2>
            <div className="prose max-w-none">
              <p>{assignment.description}</p>
              <h3 className="text-lg font-semibold mt-4">Requirements:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Complete all questions in the provided worksheet</li>
                <li>Show your work for calculations</li>
                <li>Submit your answers in PDF format</li>
                <li>Include your name and student ID</li>
              </ul>
            </div>
          </div>

          {submission ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Your Submission</h2>
                <span className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>Submitted</span>
                </span>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600">{submission.content}</p>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900">Feedback</h3>
                  <p className="text-gray-600 mt-2">{submission.feedback}</p>
                  <div className="mt-4">
                    <span className="text-2xl font-bold text-gray-900">
                      {submission.grade}
                    </span>
                    <span className="text-gray-600">
                      /{assignment.totalPoints}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Submit Assignment</h2>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Drag and drop your files here, or click to select files
                  </p>
                  <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                    Select Files
                  </button>
                </div>
                <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                  Submit Assignment
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Assignment Status</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    submission
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {submission ? "Submitted" : "Pending"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Due Date</span>
                <span className="text-gray-900">{assignment.dueDate}</span>
              </div>
              {submission && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Grade</span>
                  <span className="text-gray-900">
                    {submission.grade}/{assignment.totalPoints}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Resources</h2>
            <div className="space-y-3">
              <a
                href="#"
                className="flex items-center space-x-3 text-indigo-600 hover:text-indigo-700"
              >
                <FileText className="h-5 w-5" />
                <span>Assignment Guidelines</span>
              </a>
              <a
                href="#"
                className="flex items-center space-x-3 text-indigo-600 hover:text-indigo-700"
              >
                <FileText className="h-5 w-5" />
                <span>Grading Rubric</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetail;
