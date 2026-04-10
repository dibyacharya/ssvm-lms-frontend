import React, { useState, useEffect } from "react";
import { getAllStudentCourses } from "../../../services/course.service";
import {
  getStudentAssessmentPlan,
  getStudentContinuousAssessmentPlan,
  getStudentOwnGrades,
} from "../../../services/course.service";
import LoadingSpinner from "../../../utils/LoadingAnimation";
import { getEndExamLabel, getMidExamLabel } from "../../../utils/periodLabel";
import { BookOpen, Award, FileText } from "lucide-react";
import DashboardBanner from "./DashboardBanner";

const StudentGradebook = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [courseGrades, setCourseGrades] = useState({});

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getAllStudentCourses();
      setCourses(data.courses || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseGrades = async (courseId) => {
    // If already fetched, don't fetch again
    if (courseGrades[courseId]) {
      return;
    }

    try {
      const [assessmentPlan, continuousPlan, grades] = await Promise.all([
        getStudentAssessmentPlan(courseId),
        getStudentContinuousAssessmentPlan(courseId),
        getStudentOwnGrades(courseId),
      ]);

      setCourseGrades((prev) => ({
        ...prev,
        [courseId]: {
          assessmentPlan,
          continuousPlan,
          grades,
        },
      }));
    } catch (error) {
      console.error(`Error fetching grades for course ${courseId}:`, error);
      setCourseGrades((prev) => ({
        ...prev,
        [courseId]: {
          error: "Failed to load grades. Please try again later.",
        },
      }));
    }
  };

  const handleCourseToggle = (courseId) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(courseId);
      fetchCourseGrades(courseId);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return "text-blue-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    if (percentage >= 60) return "text-blue-600";
    return "text-red-600";
  };

  const calculatePercentage = (totalMarks) => {
    return totalMarks ? totalMarks.toFixed(2) : "0.00";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <DashboardBanner
          icon={Award}
          title="Gradebook"
          subtitle="View your published grades for all enrolled courses"
          gradient="bg-gradient-to-r from-blue-600 via-blue-600 to-fuchsia-500"
        />

        {/* Courses List */}
        {courses.length === 0 ? (
          <div className="bg-white dark:bg-white rounded-lg shadow-md p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-600 mb-2">
              No courses enrolled
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              You are not enrolled in any courses yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => {
              const courseData = courseGrades[course._id];
              const isExpanded = expandedCourse === course._id;
              const isLoading = isExpanded && !courseData;
              const coursePeriodType = course.periodType || course.semester?.periodType || "semester";
              const coursePeriodLabel = coursePeriodType.charAt(0).toUpperCase() + coursePeriodType.slice(1);
              const courseEndExamLabel = getEndExamLabel(coursePeriodType);
              const courseMidExamLabel = getMidExamLabel(coursePeriodType);

              return (
                <div
                  key={course._id}
                  className="bg-white dark:bg-white rounded-lg shadow-md overflow-hidden"
                >
                  {/* Course Header */}
                  <button
                    onClick={() => handleCourseToggle(course._id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 text-left">
                      <div className="bg-accent1/10 dark:bg-accent2/20 p-3 rounded-lg">
                        <BookOpen className="h-6 w-6 text-accent1" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-900">
                          {course.courseName || course.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {course.courseCode || course.code} • {coursePeriodLabel}{" "}
                          {course.semNumber || course.semester?.semNumber || "N/A"}
                          {course.creditPoints ? (
                            <span className="ml-2">
                              • CREDITS: {course.creditPoints.lecture || 0}-{course.creditPoints.tutorial || 0}-{course.creditPoints.practical || 0}-{course.creditPoints.totalCredits || 0}
                            </span>
                          ) : null}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {courseData?.grades && (
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                          Published
                        </span>
                      )}
                      <svg
                        className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>

                  {/* Course Grades Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-200 p-6">
                      {isLoading ? (
                        <div className="flex justify-center py-8">
                          <LoadingSpinner />
                        </div>
                      ) : courseData?.error ? (
                        <div className="text-center py-8">
                          <p className="text-red-500 dark:text-red-600">
                            {courseData.error}
                          </p>
                        </div>
                      ) : !courseData?.grades ? (
                        <div className="text-center py-12">
                          <FileText className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                          <p className="text-xl text-gray-600 dark:text-gray-600 mb-2">
                            Grades Not Published Yet
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            Your grades for this course have not been published by
                            your instructor. Please check back later.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Assessment Plan Overview */}
                          {courseData.assessmentPlan && (
                            <div className="bg-gray-50 dark:bg-gray-50/50 rounded-lg p-4">
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-600 mb-3">
                                Assessment Weightage
                              </h4>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {courseData.assessmentPlan.endTermExam}%
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    {courseEndExamLabel}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {courseData.assessmentPlan.midTermExam}%
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    {courseMidExamLabel}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {courseData.assessmentPlan.continuousAssessment}%
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    Continuous Assessment
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Grades Breakdown */}
                          <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-900">
                              Your Grades
                            </h4>

                            {/* End Term */}
                            {courseData.assessmentPlan && (
                              <div className="border border-gray-200 dark:border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-900">
                                      {courseEndExamLabel}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      Weightage: {courseData.assessmentPlan.endTermExam}%
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p
                                      className={`text-2xl font-bold ${getGradeColor(
                                        (courseData.grades.grading.endTerm /
                                          courseData.assessmentPlan.endTermExam) *
                                          100
                                      )}`}
                                    >
                                      {courseData.grades.grading.endTerm || 0}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      / {courseData.assessmentPlan.endTermExam}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Mid Term */}
                            {courseData.assessmentPlan && (
                              <div className="border border-gray-200 dark:border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-900">
                                      {courseMidExamLabel}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      Weightage: {courseData.assessmentPlan.midTermExam}%
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p
                                      className={`text-2xl font-bold ${getGradeColor(
                                        (courseData.grades.grading.midTerm /
                                          courseData.assessmentPlan.midTermExam) *
                                          100
                                      )}`}
                                    >
                                      {courseData.grades.grading.midTerm || 0}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      / {courseData.assessmentPlan.midTermExam}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Continuous Evaluation */}
                            {courseData.continuousPlan?.categories &&
                              courseData.continuousPlan.categories.length > 0 && (
                                <div className="border border-gray-200 dark:border-gray-200 rounded-lg p-4">
                                  <p className="font-medium text-gray-900 dark:text-gray-900 mb-3">
                                    Continuous Assessment
                                  </p>
                                  <div className="space-y-2">
                                    {courseData.continuousPlan.categories.map(
                                      (category) => {
                                        const categoryMarks =
                                          courseData.grades.grading
                                            .continuousEvaluation?.[category._id] ||
                                          0;
                                        const percentage =
                                          category.totalMarks > 0
                                            ? (categoryMarks /
                                                category.totalMarks) *
                                              100
                                            : 0;

                                        return (
                                          <div
                                            key={category._id}
                                            className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-200 last:border-0"
                                          >
                                            <div className="flex-1">
                                              <p className="text-sm font-medium text-gray-900 dark:text-gray-900">
                                                {category.category}
                                              </p>
                                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                                {category.number} items ×{" "}
                                                {category.eachMarks} marks ={" "}
                                                {category.totalMarks} total
                                                {category.calculationMethod ===
                                                  "best-n" &&
                                                  category.n &&
                                                  ` (Best ${category.n})`}
                                              </p>
                                            </div>
                                            <div className="text-right ml-4">
                                              <p
                                                className={`text-lg font-bold ${getGradeColor(
                                                  percentage
                                                )}`}
                                              >
                                                {categoryMarks}
                                              </p>
                                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                                / {category.totalMarks}
                                              </p>
                                            </div>
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Total Marks */}
                            <div className="bg-gradient-to-r from-accent1/10 to-accent2/10 dark:from-accent1/20 dark:to-accent2/20 rounded-lg p-6 border-2 border-accent1/30">
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-900">
                                    Total Marks
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Published on:{" "}
                                    {formatDate(
                                      courseData.grades.grading.publishedAt
                                    )}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p
                                    className={`text-4xl font-bold ${getGradeColor(
                                      parseFloat(
                                        calculatePercentage(
                                          courseData.grades.grading.totalMarks
                                        )
                                      )
                                    )}`}
                                  >
                                    {calculatePercentage(
                                      courseData.grades.grading.totalMarks
                                    )}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    out of 100
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentGradebook;

