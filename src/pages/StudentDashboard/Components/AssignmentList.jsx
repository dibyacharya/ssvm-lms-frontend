import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCourses } from "../../../services/course.service";
import {
  FileText,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Users,
  BookOpen,
} from "lucide-react";

const AssignmentList = () => {
  const [coursesData, setCoursesData] = useState(null);
  const [expandedCourses, setExpandedCourses] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const response = await getAllCourses();
      setCoursesData(response);
      
      // Auto-expand first course if available
      if (response.courses && response.courses.length > 0) {
        setExpandedCourses(new Set([response.courses[0]._id]));
      }
      
      setLoading(false);
    } catch (err) {
      console.log(err);
      // Handle error (toast notification, etc.)
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const toggleCourse = (courseId) => {
    setExpandedCourses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSubmissionStatus = (assignment) => {
    const hasSubmissions = assignment.submissions && assignment.submissions.length > 0;
    const gradedSubmission = assignment.submissions?.find(sub => sub.status === 'graded');
    
    return {
      submitted: hasSubmissions,
      submissionDate: hasSubmissions ? assignment.submissions[0].submissionDate : null,
      grade: gradedSubmission?.grade || null,
      feedback: gradedSubmission?.feedback || null
    };
  };

  const handleAssignmentClick = (courseId, assignmentId) => {
    navigate(`/student/assignment/${courseId}/${assignmentId}`);
  };

  const SubmissionStatus = ({ assignment }) => {
    const status = getSubmissionStatus(assignment);
    
    return (
      <div className="flex items-center space-x-2 mt-2">
        {status.submitted ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600">
              Submitted {status.submissionDate && `on ${formatDate(status.submissionDate)}`}
            </span>
            {status.grade && (
              <span className="text-sm text-blue-600 ml-2">
                Grade: {status.grade}/{assignment.totalPoints}
              </span>
            )}
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Not submitted</span>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!coursesData || !coursesData.courses) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">All Assignments</h1>
        <p className="text-gray-500">No courses available.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Assignments</h1>
        <p className="text-gray-600">
          Welcome back, {coursesData.user.name} • {coursesData.courses.length} courses
        </p>
      </div>

      <div className="space-y-4">
        {coursesData.courses.map((course) => {
          const activeAssignments = course.assignments.filter(assignment => assignment.isActive);
          const hasAssignments = activeAssignments.length > 0;

          return (
            <div key={course._id} className="border rounded-lg overflow-hidden shadow-sm">
              <button
                onClick={() => toggleCourse(course._id)}
                className="w-full bg-white px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                  <div className="text-left">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {course.title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {course.semester.name} • {activeAssignments.length} assignments
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right text-sm text-gray-500">
                    <p>Classes: {formatDate(course.schedule.classStartDate)} - {formatDate(course.schedule.classEndDate)}</p>
                    <p>Lectures: {course.lectureCount}</p>
                  </div>
                  {expandedCourses.has(course._id) ? (
                    <ChevronUp className="h-6 w-6 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-gray-400" />
                  )}
                </div>
              </button>

              {expandedCourses.has(course._id) && (
                <div className="border-t bg-gray-50">
                  {!hasAssignments ? (
                    <p className="p-6 text-gray-500 text-center">No active assignments</p>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {activeAssignments.map((assignment) => (
                        <div
                          key={assignment._id}
                          className="p-6 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handleAssignmentClick(course._id, assignment._id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <FileText className="h-6 w-6 text-indigo-600 mt-1 flex-shrink-0" />
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600">
                                  {assignment.title}
                                </h3>
                                <p className="text-gray-600 mt-1 line-clamp-2">
                                  {assignment.description}
                                </p>
                                <SubmissionStatus assignment={assignment} />
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5 text-gray-600" />
                                <span
                                  className={`text-sm font-medium ${
                                    isOverdue(assignment.dueDate) &&
                                    !getSubmissionStatus(assignment).submitted
                                      ? "text-red-600"
                                      : "text-gray-900"
                                  }`}
                                >
                                  Due: {formatDate(assignment.dueDate)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {assignment.totalPoints} points
                              </p>
                              {assignment.submissions && assignment.submissions.length > 0 && (
                                <div className="flex items-center space-x-1 text-blue-600 mt-2">
                                  <Users className="h-4 w-4" />
                                  <span className="text-sm">
                                    {assignment.submissions.length} submission(s)
                                  </span>
                                </div>
                              )}
                              {isOverdue(assignment.dueDate) &&
                                !getSubmissionStatus(assignment).submitted && (
                                  <div className="flex items-center space-x-1 text-red-600 mt-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-sm">Overdue</span>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssignmentList;