import React from "react";
import { assignments, courses, submissions } from "../data/mockData";
import { Plus, FileText, CheckCircle, Clock } from "lucide-react";

const TeacherAssignments = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Create Assignment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {assignments.map((assignment) => {
            const course = courses.find((c) => c.id === assignment.courseId);
            const assignmentSubmissions = submissions.filter(
              (s) => s.assignmentId === assignment.id
            );
            const pendingCount = 32 - assignmentSubmissions.length; // Mock total students

            return (
              <div
                key={assignment.id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <FileText className="h-6 w-6 text-indigo-600 mt-1" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {assignment.title}
                      </h2>
                      <p className="text-gray-600 mt-1">
                        {assignment.description}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Course: {course?.title}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">
                        Due: {assignment.dueDate}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {assignment.totalPoints} points
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-gray-600">
                        {assignmentSubmissions.length} Submitted
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <span className="text-sm text-gray-600">
                        {pendingCount} Pending
                      </span>
                    </div>
                  </div>
                  <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                    View Submissions
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Assignment Overview</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Graded</span>
                </div>
                <span className="font-medium">24</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span>Pending</span>
                </div>
                <span className="font-medium">8</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Submissions</h2>
            <div className="space-y-4">
              {submissions.slice(0, 5).map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">John Doe</p>
                    <p className="text-sm text-gray-500">
                      {submission.submissionDate}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {submission.grade}/100
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAssignments;
