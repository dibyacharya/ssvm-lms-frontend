import React, { useState, useEffect } from "react";
import { Download, Search, FileText, Calendar, User, Award, TrendingUp, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Edit3, Save, X, BookOpen, ClipboardList } from "lucide-react";
import { useParams } from "react-router-dom";
import { getCourseGradebook } from "../../../../services/assignment.service";
import {
  getCourseGrading,
  bulkUpdateStudentGrading,
  getContinuousAssessmentPlan,
  getCategoryScaledMarks,
  publishGrades,
  unpublishGrades
} from "../../../../services/course.service";
import { useCourse } from "../../../../context/CourseContext";
import LoadingSpinner from "../../../../utils/LoadingAnimation";
import { getPeriodLabel, getMidExamShort, getEndExamShort } from "../../../../utils/periodLabel";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

const SectionHeader = ({ icon: Icon, title, gradient, count }) => (
  <div className={`relative overflow-hidden px-6 py-4 ${gradient}`}>
    <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
    <div className="absolute -bottom-4 right-12 w-12 h-12 bg-white/5 rounded-full" />
    <div className="relative z-10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-900" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>
      </div>
      {count != null && (
        <span className="px-2.5 py-1 text-xs font-bold text-gray-900 bg-white/20 rounded-full backdrop-blur-sm">{count}</span>
      )}
    </div>
  </div>
);

const Gradebook = () => {
  const { courseID } = useParams();
  const { courseData } = useCourse();
  const [gradebookData, setGradebookData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState(() => {
    const saved = localStorage.getItem(`gradebook_${courseID}_section`);
    return saved === "assignments" || saved === "semester" ? saved : "assignments";
  }); // "assignments" or "semester"

  // Persist activeSection in localStorage
  useEffect(() => {
    localStorage.setItem(`gradebook_${courseID}_section`, activeSection);
  }, [activeSection, courseID]);
  const [expandedContinuous, setExpandedContinuous] = useState(false); // Single global expand state
  const [isEditingSemester, setIsEditingSemester] = useState(false);
  const [semesterMarks, setSemesterMarks] = useState({});
  const [continuousAssessmentData, setContinuousAssessmentData] = useState([]);
  const [isPublished, setIsPublished] = useState(false);
  const [computingCategory, setComputingCategory] = useState(null); // categoryId being computed

  // Get current semester and period type from courseData
  const currentSemester = courseData?.semNumber || courseData?.semester?.semNumber || courseData?.semester?.semNumber || "N/A";
  const periodType = courseData?.semester?.periodType || courseData?.periodType || "semester";
  const periodLbl = getPeriodLabel(periodType);
  const midLabel = getMidExamShort(periodType);
  const endLabel = getEndExamShort(periodType);

  // Compute marks from linked assignments for a specific category
  const handleComputeFromAssignments = async (categoryId) => {
    try {
      setComputingCategory(categoryId);
      const result = await getCategoryScaledMarks(courseID, categoryId);

      if (result.success && result.studentMarks) {
        setSemesterMarks(prev => {
          const updated = { ...prev };
          result.studentMarks.forEach(({ studentId, categoryTotal }) => {
            if (updated[studentId]) {
              updated[studentId] = {
                ...updated[studentId],
                continuousEvaluation: {
                  ...(updated[studentId].continuousEvaluation || {}),
                  [categoryId]: Math.round(categoryTotal * 100) / 100
                }
              };
            }
          });
          return updated;
        });
        toast.success(`Marks computed for ${result.category} using "${result.calculationMethod}"`);
      }
    } catch (error) {
      console.error("Error computing marks from assignments:", error);
      toast.error(error.response?.data?.error || "Failed to compute marks from assignments");
    } finally {
      setComputingCategory(null);
    }
  };

  useEffect(() => {
    const fetchGradebook = async () => {
      if (!courseID) {
        setError("Course ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getCourseGradebook(courseID);
        setGradebookData(data);

        // Load continuous assessment data from backend
        try {
          const categories = await getContinuousAssessmentPlan(courseID);
          if (categories && categories.length > 0) {
            // Convert backend format to frontend format
            const formattedCategories = categories.map(cat => ({
              id: cat._id,
              _id: cat._id,
              category: cat.category,
              number: cat.number,
              eachMarks: cat.eachMarks,
              calculationMethod: cat.calculationMethod,
              n: cat.n,
              totalMarks: cat.totalMarks,
              selectedAssignments: cat.selectedAssignments || []
            }));
            setContinuousAssessmentData(formattedCategories);
          }
        } catch (error) {
          console.error("Error fetching continuous assessment plan:", error);
        }

        // Load semester marks from backend
        try {
          const gradings = await getCourseGrading(courseID);
          if (gradings && gradings.length > 0 && data?.students) {
            // Convert backend format to frontend format
            const marksMap = {};
            gradings.forEach(grading => {
              marksMap[grading.studentId] = {
                endTerm: grading.endTerm || 0,
                midTerm: grading.midTerm || 0,
                continuousEvaluation: grading.continuousEvaluation || {}
              };
            });

            // Merge with current students (in case new students were added)
            const mergedMarks = {};
            data.students.forEach(student => {
              mergedMarks[student.studentId] = marksMap[student.studentId] || {
                endTerm: 0,
                midTerm: 0,
                continuousEvaluation: {}
              };
            });
            setSemesterMarks(mergedMarks);

            // Check if grades are published
            setIsPublished(gradings[0]?.isPublished || false);
          } else if (data?.students) {
            // Initialize semester marks structure if no grades exist
            const initialMarks = {};
            data.students.forEach(student => {
              initialMarks[student.studentId] = {
                endTerm: 0,
                midTerm: 0,
                continuousEvaluation: {}
              };
            });
            setSemesterMarks(initialMarks);
          }
        } catch (error) {
          console.error("Error fetching course grading:", error);
          // Initialize empty marks if error
          if (data?.students) {
            const initialMarks = {};
            data.students.forEach(student => {
              initialMarks[student.studentId] = {
                endTerm: 0,
                midTerm: 0,
                continuousEvaluation: {}
              };
            });
            setSemesterMarks(initialMarks);
          }
        }
      } catch (err) {
        console.error("Error fetching gradebook:", err);
        setError(err.response?.data?.message || "Failed to load gradebook");
        toast.error("Failed to load gradebook data");
      } finally {
        setLoading(false);
      }
    };

    fetchGradebook();
  }, [courseID]);

  // Filter students based on search term
  const filteredStudents = gradebookData?.students?.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.name?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower) ||
      student.rollNo?.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      graded: { bg: "bg-primary-100", text: "text-primary-600", label: "Graded" },
      submitted: { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Submitted" },
      not_submitted: { bg: "bg-red-500/20", text: "text-red-600", label: "Not Submitted" },
    };
    const config = statusConfig[status] || statusConfig.not_submitted;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Export to Excel
  const exportToExcel = (section = "assignments") => {
    if (!gradebookData) return;

    let worksheet;
    let filename;

    if (section === "assignments") {
      // Export assignment marks
      const exportData = filteredStudents.map((student, index) => {
        const row = {
          "Sl.No": index + 1,
          "Roll No": student.rollNo || "—",
          Name: student.name || "—",
          Email: student.email || "—",
        };

        // Add assignment columns
        gradebookData.assignments.forEach((assignment) => {
          const grade = student.grades[assignment.id];
          row[assignment.title] = grade?.grade !== null && grade?.grade !== undefined ? grade.grade : "—";
          row[`${assignment.title} - Status`] = grade?.status || "not_submitted";
        });

        row["Total Score"] = student.totalScore || 0;
        row["Max Score"] = student.maxScore || 0;
        row["Percentage"] = student.percentage?.toFixed(2) || "0.00";
        row["Graded Count"] = student.gradedCount || 0;
        row["Total Assignments"] = student.totalAssignments || 0;

        return row;
      });

      worksheet = XLSX.utils.json_to_sheet(exportData);
      filename = `${gradebookData.course?.title || "Course"}_Assignment_Marks.xlsx`;
    } else {
      // Export semester marks
      const exportData = filteredStudents.map((student, index) => {
        return {
          "Sl.No": index + 1,
          "Roll No": student.rollNo || "—",
          Name: student.name || "—",
          Email: student.email || "—",
          "Total Score": student.totalScore || 0,
          "Max Score": student.maxScore || 0,
          Percentage: student.percentage?.toFixed(2) || "0.00",
          "Graded Assignments": student.gradedCount || 0,
          "Total Assignments": student.totalAssignments || 0,
          [periodLbl]: `${periodLbl} ${currentSemester}`,
        };
      });

      worksheet = XLSX.utils.json_to_sheet(exportData);
      filename = `${gradebookData.course?.title || "Course"}_Course_Grading.xlsx`;
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Gradebook");
    XLSX.writeFile(workbook, filename);
    toast.success("Gradebook exported successfully!");
  };

  // Calculate class statistics
  const classStats = gradebookData?.students
    ? {
        totalStudents: gradebookData.students.length,
        averagePercentage:
          gradebookData.students.reduce((sum, s) => sum + (s.percentage || 0), 0) /
          gradebookData.students.length || 0,
        totalAssignments: gradebookData.assignments?.length || 0,
        totalMaxScore: gradebookData.assignments?.reduce((sum, a) => sum + (a.totalPoints || 0), 0) || 0,
      }
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (!gradebookData) {
    return (
      <div className="glass-card rounded-xl p-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <BookOpen className="w-8 h-8 text-gray-900" />
          </div>
        </div>
        <p className="text-gray-600 text-lg font-medium">No gradebook data available</p>
        <p className="text-gray-400 text-sm mt-1">Grades will appear here once assignments are created and graded.</p>
      </div>
    );
  }

  return (
    <div className="relative -top-6 z-10 bg-gray-50 min-h-screen">
      <div className="p-6">
        {/* Header - Gradient Banner */}
        <div className="mb-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 px-8 py-6 mb-6 shadow-lg">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
            <div className="absolute -bottom-8 right-20 w-24 h-24 bg-white/5 rounded-full" />
            <div className="absolute top-4 left-1/2 w-32 h-32 bg-white/5 rounded-full" />
            <div className="relative z-10 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                  <Award className="w-7 h-7 text-gray-900" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {gradebookData.course?.title || "Course Gradebook"}
                  </h1>
                  <p className="text-blue-100 text-sm mt-0.5">
                    {gradebookData.course?.courseCode || ""} &bull; {periodLbl} {currentSemester}
                  </p>
                </div>
              </div>
              <button
                onClick={() => exportToExcel(activeSection)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-gray-900 rounded-xl hover:bg-white/30 transition-all duration-200 font-medium shadow-sm border border-white/20"
              >
                <Download className="w-5 h-5" />
                Export to Excel
              </button>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-1 border-b border-gray-200">
            <button
              onClick={() => setActiveSection("assignments")}
              className={`relative px-6 py-3.5 font-medium transition-all duration-200 ${
                activeSection === "assignments"
                  ? "text-primary-600"
                  : "text-gray-500 hover:text-gray-600 hover:bg-gray-50"
              } rounded-t-lg`}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Assignment Marks
              </span>
              {activeSection === "assignments" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveSection("semester")}
              className={`relative px-6 py-3.5 font-medium transition-all duration-200 ${
                activeSection === "semester"
                  ? "text-primary-600"
                  : "text-gray-500 hover:text-gray-600 hover:bg-gray-50"
              } rounded-t-lg`}
            >
              <span className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Course Grading
              </span>
              {activeSection === "semester" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-500 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        {classStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-blue-500 p-5 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{classStats.totalStudents}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-blue-500 p-5 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Average Percentage</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {classStats.averagePercentage.toFixed(2)}%
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-blue-500 p-5 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Assignments</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{classStats.totalAssignments}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-amber-500 p-5 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Points</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{classStats.totalMaxScore}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-accent-500/20 flex items-center justify-center">
                  <Award className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white/5 text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Assignment Marks Section */}
        {activeSection === "assignments" && (
          <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white/5">
                  <tr>
                    <th className="sticky left-0 z-10 px-4 py-3 bg-white/5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Sl.No
                    </th>
                    <th className="sticky left-12 z-10 px-4 py-3 bg-white/5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Roll No
                    </th>
                    <th className="sticky left-32 z-10 px-4 py-3 bg-white/5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    {gradebookData.assignments?.map((assignment) => (
                      <th
                        key={assignment.id}
                        className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
                        title={assignment.title}
                      >
                        <div className="max-w-[120px]">
                          <div className="truncate">{assignment.title}</div>
                          <div className="text-gray-400 text-xs mt-1">
                            ({assignment.totalPoints} pts)
                          </div>
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider bg-primary-50">
                      Total Score
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider bg-primary-50">
                      Max Score
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider bg-primary-50">
                      Percentage
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Graded
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/70 backdrop-blur-xl divide-y divide-gray-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5 + (gradebookData.assignments?.length || 0) + 4} className="px-4 py-8 text-center text-gray-500">
                        No students found
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, index) => (
                      <tr key={student.studentId} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="sticky left-0 z-10 px-4 py-3 bg-white/70 backdrop-blur-xl text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="sticky left-12 z-10 px-4 py-3 bg-white/70 backdrop-blur-xl text-sm text-gray-900 font-medium">
                          {student.rollNo || "—"}
                        </td>
                        <td className="sticky left-32 z-10 px-4 py-3 bg-white/70 backdrop-blur-xl text-sm text-gray-900 font-medium">
                          {student.name || "—"}
                        </td>
                        {gradebookData.assignments?.map((assignment) => {
                          const grade = student.grades[assignment.id];
                          const gradeValue = grade?.grade;
                          const status = grade?.status || "not_submitted";
                          const isLate = grade?.isLate || false;

                          return (
                            <td key={assignment.id} className="px-4 py-3 text-center text-sm">
                              <div className="flex flex-col items-center gap-1">
                                <span
                                  className={`font-medium ${
                                    gradeValue !== null && gradeValue !== undefined
                                      ? "text-gray-900"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {gradeValue !== null && gradeValue !== undefined ? gradeValue : "—"}
                                </span>
                                {isLate && (
                                  <span className="text-xs text-red-600">Late</span>
                                )}
                                <div className="text-xs">{getStatusBadge(status)}</div>
                              </div>
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900 bg-primary-50">
                          {student.totalScore || 0}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900 bg-primary-50">
                          {student.maxScore || 0}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-bold text-primary-600 bg-primary-50">
                          {student.percentage?.toFixed(2) || "0.00"}%
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900">
                          {student.gradedCount || 0}/{student.totalAssignments || 0}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Semester Marks Section */}
        {activeSection === "semester" && (
          <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Course Grading Section Header */}
            <SectionHeader
              icon={ClipboardList}
              title="Course Grading (WILP Program)"
              gradient="bg-gradient-to-r from-blue-500 to-blue-600"
            />
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-gray-500 text-sm">
                  {endLabel}, {midLabel}, and Continuous Evaluation marks
                </p>
                {!isEditingSemester ? (
                  <button
                    onClick={() => setIsEditingSemester(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-gray-900 rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Marks
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        // Reload from backend to cancel changes
                        try {
                          const gradings = await getCourseGrading(courseID);
                          if (gradings && gradings.length > 0 && gradebookData?.students) {
                            const marksMap = {};
                            gradings.forEach(grading => {
                              marksMap[grading.studentId] = {
                                endTerm: grading.endTerm || 0,
                                midTerm: grading.midTerm || 0,
                                continuousEvaluation: grading.continuousEvaluation || {}
                              };
                            });
                            const mergedMarks = {};
                            gradebookData.students.forEach(student => {
                              mergedMarks[student.studentId] = marksMap[student.studentId] || {
                                endTerm: 0,
                                midTerm: 0,
                                continuousEvaluation: {}
                              };
                            });
                            setSemesterMarks(mergedMarks);
                          }
                        } catch (error) {
                          console.error("Error reloading grades:", error);
                        }
                        setIsEditingSemester(false);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-surface-600 text-gray-900 rounded-xl hover:bg-surface-500 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          // Convert frontend format to backend format
                          const gradingsToSave = Object.entries(semesterMarks).map(([studentId, marks]) => ({
                            studentId,
                            endTerm: marks.endTerm || 0,
                            midTerm: marks.midTerm || 0,
                            continuousEvaluation: marks.continuousEvaluation || {}
                          }));

                          await bulkUpdateStudentGrading(courseID, gradingsToSave);
                          setIsEditingSemester(false);
                          toast.success(`${periodLbl} marks saved successfully!`);
                        } catch (error) {
                          console.error("Error saving marks:", error);
                          toast.error(error.response?.data?.error || `Failed to save ${periodLbl.toLowerCase()} marks`);
                        }
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-gray-900 rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    {!isPublished && (
                      <button
                        onClick={async () => {
                          if (!confirm('Publish all grades? Students will be able to see their grades.')) {
                            return;
                          }
                          try {
                            await publishGrades(courseID);
                            setIsPublished(true);
                            toast.success("Grades published successfully!");
                          } catch (error) {
                            console.error("Error publishing grades:", error);
                            toast.error(error.response?.data?.error || "Failed to publish grades");
                          }
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-gray-900 rounded-xl hover:bg-primary-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                      >
                        <Award className="w-4 h-4" />
                        Publish Grades
                      </button>
                    )}
                    {isPublished && (
                      <button
                        onClick={async () => {
                          if (!confirm('Unpublish all grades? Students will no longer be able to see their grades.')) {
                            return;
                          }
                          try {
                            await unpublishGrades(courseID);
                            setIsPublished(false);
                            toast.success("Grades unpublished successfully!");
                          } catch (error) {
                            console.error("Error unpublishing grades:", error);
                            toast.error(error.response?.data?.error || "Failed to unpublish grades");
                          }
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-gray-900 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                      >
                        <X className="w-4 h-4" />
                        Unpublish
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white/5">
                  <tr>
                    <th className="sticky left-0 z-10 px-4 py-3 bg-white/5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Sl.No
                    </th>
                    <th className="sticky left-12 z-10 px-4 py-3 bg-white/5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Roll No
                    </th>
                    <th className="sticky left-32 z-10 px-4 py-3 bg-white/5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    {/* Conditionally show End Term and Mid Term - hide when expanded */}
                    {!expandedContinuous && (
                      <>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider bg-red-50 dark:bg-red-900/20">
                          {endLabel}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider bg-yellow-50 dark:bg-yellow-900/20">
                          {midLabel}
                        </th>
                      </>
                    )}
                     {/* Show continuous evaluation categories as columns when expanded */}
                     {expandedContinuous && continuousAssessmentData.length > 0 ? (
                       <>
                         {continuousAssessmentData.map((category) => {
                           const catId = category.id || category._id;
                           const hasLinkedAssignments = category.selectedAssignments && category.selectedAssignments.length > 0;
                           return (
                           <th key={catId} className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider bg-primary-50">
                             <div className="flex flex-col items-center gap-1">
                               <span className="text-xs">{category.category}</span>
                               <span className="text-xs text-gray-400">({category.totalMarks})</span>
                               {isEditingSemester && hasLinkedAssignments && (
                                 <button
                                   onClick={() => handleComputeFromAssignments(catId)}
                                   disabled={computingCategory === catId}
                                   className="mt-1 px-2 py-0.5 text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
                                   title="Auto-compute marks from linked assignments"
                                 >
                                   {computingCategory === catId ? "Computing..." : "Compute"}
                                 </button>
                               )}
                             </div>
                           </th>
                           );
                         })}
                         {/* Continuous Evaluation Total column when expanded */}
                         <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider bg-primary-50">
                           <div className="flex items-center justify-center gap-2">
                             <span>Continuous Evaluation</span>
                             <button
                               onClick={() => setExpandedContinuous(false)}
                               className="text-primary-600 hover:text-blue-800 dark:hover:text-blue-300 transition-colors p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                               title="Collapse"
                             >
                               <ChevronLeft className="w-4 h-4" />
                             </button>
                           </div>
                         </th>
                       </>
                     ) : (
                       <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider bg-primary-50">
                         <div className="flex items-center justify-center gap-2">
                           <span>Continuous Evaluation</span>
                           {continuousAssessmentData.length > 0 && (
                             <button
                               onClick={() => setExpandedContinuous(true)}
                               className="text-primary-600 hover:text-blue-800 dark:hover:text-blue-300 transition-colors p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                               title="Expand"
                             >
                               <ChevronRight className="w-4 h-4" />
                             </button>
                           )}
                         </div>
                       </th>
                     )}
                     {/* Total column - only show when not expanded */}
                     {!expandedContinuous && (
                       <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider bg-primary-50">
                         Total
                       </th>
                     )}
                  </tr>
                </thead>
                <tbody className="bg-white/70 backdrop-blur-xl divide-y divide-gray-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={expandedContinuous ? 3 + continuousAssessmentData.length + 1 : 7} className="px-4 py-8 text-center text-gray-500">
                        No students found
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, index) => {
                      const studentMarks = semesterMarks[student.studentId] || {
                        endTerm: 0,
                        midTerm: 0,
                        continuousEvaluation: {}
                      };
                      const continuousTotal = Object.values(studentMarks.continuousEvaluation || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
                      const totalMarks = (parseFloat(studentMarks.endTerm) || 0) + (parseFloat(studentMarks.midTerm) || 0) + continuousTotal;

                      return (
                        <tr key={student.studentId} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="sticky left-0 z-10 px-4 py-3 bg-white/70 backdrop-blur-xl text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="sticky left-12 z-10 px-4 py-3 bg-white/70 backdrop-blur-xl text-sm font-medium text-gray-900">
                            {student.rollNo || "—"}
                          </td>
                          <td className="sticky left-32 z-10 px-4 py-3 bg-white/70 backdrop-blur-xl text-sm font-medium text-gray-900">
                            {student.name || "—"}
                          </td>
                           {/* Conditionally show End Term and Mid Term - hide when expanded */}
                           {!expandedContinuous && (
                             <>
                               <td className="px-4 py-3 text-center text-sm bg-red-50 dark:bg-red-900/20">
                                 <input
                                   type="number"
                                   value={studentMarks.endTerm || 0}
                                   onChange={(e) => {
                                     setSemesterMarks(prev => ({
                                       ...prev,
                                       [student.studentId]: {
                                         ...prev[student.studentId],
                                         endTerm: parseFloat(e.target.value) || 0
                                       }
                                     }));
                                   }}
                                   className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-center dark:bg-gray-700 dark:text-gray-900 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                                   min="0"
                                   disabled={!isEditingSemester}
                                 />
                               </td>
                               <td className="px-4 py-3 text-center text-sm bg-yellow-50 dark:bg-yellow-900/20">
                                 <input
                                   type="number"
                                   value={studentMarks.midTerm || 0}
                                   onChange={(e) => {
                                     setSemesterMarks(prev => ({
                                       ...prev,
                                       [student.studentId]: {
                                         ...prev[student.studentId],
                                         midTerm: parseFloat(e.target.value) || 0
                                       }
                                     }));
                                   }}
                                   className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-center dark:bg-gray-700 dark:text-gray-900 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                                   min="0"
                                   disabled={!isEditingSemester}
                                 />
                               </td>
                             </>
                           )}
                           {/* Show continuous evaluation categories as columns when expanded */}
                           {expandedContinuous && continuousAssessmentData.length > 0 ? (
                             <>
                               {continuousAssessmentData.map((category) => {
                                 const categoryId = category.id || category._id;
                                 return (
                                   <td key={categoryId} className="px-4 py-3 text-center text-sm bg-primary-50">
                                     <input
                                       type="number"
                                       value={studentMarks.continuousEvaluation?.[categoryId] || 0}
                                       onChange={(e) => {
                                         setSemesterMarks(prev => ({
                                           ...prev,
                                           [student.studentId]: {
                                             ...prev[student.studentId],
                                             continuousEvaluation: {
                                               ...(prev[student.studentId]?.continuousEvaluation || {}),
                                               [categoryId]: parseFloat(e.target.value) || 0
                                             }
                                           }
                                         }));
                                       }}
                                       className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-center dark:bg-gray-700 dark:text-gray-900 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                                       min="0"
                                       max={category.totalMarks}
                                       disabled={!isEditingSemester}
                                     />
                                   </td>
                                 );
                               })}
                               {/* Continuous Evaluation Total column when expanded - read-only */}
                               <td className="px-4 py-3 text-center text-sm bg-primary-50">
                                 <span className="font-semibold text-gray-900">
                                   {continuousTotal.toFixed(2)}
                                 </span>
                               </td>
                             </>
                           ) : (
                             <td className="px-4 py-3 text-center text-sm bg-primary-50">
                               <span className="font-semibold text-gray-900">
                                 {continuousTotal.toFixed(2)}
                               </span>
                             </td>
                           )}
                           {/* Total column - only show when not expanded */}
                           {!expandedContinuous && (
                             <td className="px-4 py-3 text-center text-sm font-bold text-primary-600 bg-primary-50">
                               {totalMarks.toFixed(2)}
                             </td>
                           )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gradebook;
