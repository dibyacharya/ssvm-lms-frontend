import React, { useState, useEffect } from "react";
import { Download, Search, FileText, Calendar, User, Award, TrendingUp, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Edit3, Save, X } from "lucide-react";
import { useParams } from "react-router-dom";
import { getCourseGradebook } from "../../../../services/assignment.service";
import {
  getCourseGrading,
  bulkUpdateStudentGrading,
  getContinuousAssessmentPlan,
  publishGrades,
  unpublishGrades
} from "../../../../services/course.service";
import { useCourse } from "../../../../context/CourseContext";
import LoadingSpinner from "../../../../utils/LoadingAnimation";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

const Gradebook = () => {
  const { courseID } = useParams();
  const { courseData } = useCourse();
  const [gradebookData, setGradebookData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("assignments"); // "assignments" or "semester"
  const [expandedContinuous, setExpandedContinuous] = useState(false); // Single global expand state
  const [isEditingSemester, setIsEditingSemester] = useState(false);
  const [semesterMarks, setSemesterMarks] = useState({});
  const [continuousAssessmentData, setContinuousAssessmentData] = useState([]);
  const [isPublished, setIsPublished] = useState(false);

  // Get current semester from courseData
  const currentSemester = courseData?.semNumber || courseData?.semester?.semNumber || courseData?.semester?.semNumber || "N/A";

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
      graded: { bg: "bg-green-100", text: "text-green-800", label: "Graded" },
      submitted: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Submitted" },
      not_submitted: { bg: "bg-red-100", text: "text-red-800", label: "Not Submitted" },
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
          Semester: `Semester ${currentSemester}`,
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (!gradebookData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">No gradebook data available</p>
      </div>
    );
  }

  return (
    <div className="relative -top-6 z-10 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {gradebookData.course?.title || "Course Gradebook"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {gradebookData.course?.courseCode || ""} • Semester {currentSemester}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => exportToExcel(activeSection)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                Export to Excel
              </button>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveSection("assignments")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeSection === "assignments"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              <FileText className="w-5 h-5 inline-block mr-2" />
              Assignment Marks
            </button>
            <button
              onClick={() => setActiveSection("semester")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeSection === "semester"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              <Award className="w-5 h-5 inline-block mr-2" />
              Course Grading
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        {classStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{classStats.totalStudents}</p>
                </div>
                <User className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Average Percentage</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {classStats.averagePercentage.toFixed(2)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Assignments</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{classStats.totalAssignments}</p>
                </div>
                <FileText className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Points</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{classStats.totalMaxScore}</p>
                </div>
                <Award className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {/* Assignment Marks Section */}
        {activeSection === "assignments" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="sticky left-0 z-10 px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Sl.No
                    </th>
                    <th className="sticky left-12 z-10 px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Roll No
                    </th>
                    <th className="sticky left-32 z-10 px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    {gradebookData.assignments?.map((assignment) => (
                      <th
                        key={assignment.id}
                        className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                        title={assignment.title}
                      >
                        <div className="max-w-[120px]">
                          <div className="truncate">{assignment.title}</div>
                          <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                            ({assignment.totalPoints} pts)
                          </div>
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider bg-green-50 dark:bg-green-900/20">
                      Total Score
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider bg-green-50 dark:bg-green-900/20">
                      Max Score
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider bg-blue-50 dark:bg-blue-900/20">
                      Percentage
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Graded
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5 + (gradebookData.assignments?.length || 0) + 4} className="px-4 py-8 text-center text-gray-500">
                        No students found
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, index) => (
                      <tr key={student.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="sticky left-0 z-10 px-4 py-3 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white">
                          {index + 1}
                        </td>
                        <td className="sticky left-12 z-10 px-4 py-3 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white font-medium">
                          {student.rollNo || "—"}
                        </td>
                        <td className="sticky left-32 z-10 px-4 py-3 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white font-medium">
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
                                      ? "text-gray-900 dark:text-white"
                                      : "text-gray-400 dark:text-gray-500"
                                  }`}
                                >
                                  {gradeValue !== null && gradeValue !== undefined ? gradeValue : "—"}
                                </span>
                                {isLate && (
                                  <span className="text-xs text-red-600 dark:text-red-400">Late</span>
                                )}
                                <div className="text-xs">{getStatusBadge(status)}</div>
                              </div>
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white bg-green-50 dark:bg-green-900/20">
                          {student.totalScore || 0}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white bg-green-50 dark:bg-green-900/20">
                          {student.maxScore || 0}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20">
                          {student.percentage?.toFixed(2) || "0.00"}%
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    Course Grading (WILP Program)
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    End Term, Mid Term, and Continuous Evaluation marks
                  </p>
                </div>
                {!isEditingSemester ? (
                  <button
                    onClick={() => setIsEditingSemester(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                      className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
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
                          toast.success("Semester marks saved successfully!");
                        } catch (error) {
                          console.error("Error saving semester marks:", error);
                          toast.error(error.response?.data?.error || "Failed to save semester marks");
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
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
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="sticky left-0 z-10 px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Sl.No
                    </th>
                    <th className="sticky left-12 z-10 px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Roll No
                    </th>
                    <th className="sticky left-32 z-10 px-4 py-3 bg-gray-50 dark:bg-gray-700 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    {/* Conditionally show End Term and Mid Term - hide when expanded */}
                    {!expandedContinuous && (
                      <>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider bg-red-50 dark:bg-red-900/20">
                          End Term
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider bg-yellow-50 dark:bg-yellow-900/20">
                          Mid Term
                        </th>
                      </>
                    )}
                     {/* Show continuous evaluation categories as columns when expanded */}
                     {expandedContinuous && continuousAssessmentData.length > 0 ? (
                       <>
                         {continuousAssessmentData.map((category) => (
                           <th key={category.id || category._id} className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider bg-blue-50 dark:bg-blue-900/20">
                             <div className="flex flex-col items-center">
                               <span className="text-xs">{category.category}</span>
                               <span className="text-xs text-gray-500 dark:text-gray-400">({category.totalMarks})</span>
                             </div>
                           </th>
                         ))}
                         {/* Continuous Evaluation Total column when expanded */}
                         <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider bg-blue-50 dark:bg-blue-900/20">
                           <div className="flex items-center justify-center gap-2">
                             <span>Continuous Evaluation</span>
                             <button
                               onClick={() => setExpandedContinuous(false)}
                               className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                               title="Collapse"
                             >
                               <ChevronLeft className="w-4 h-4" />
                             </button>
                           </div>
                         </th>
                       </>
                     ) : (
                       <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider bg-blue-50 dark:bg-blue-900/20">
                         <div className="flex items-center justify-center gap-2">
                           <span>Continuous Evaluation</span>
                           {continuousAssessmentData.length > 0 && (
                             <button
                               onClick={() => setExpandedContinuous(true)}
                               className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
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
                       <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider bg-green-50 dark:bg-green-900/20">
                         Total
                       </th>
                     )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
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
                        <tr key={student.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="sticky left-0 z-10 px-4 py-3 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white">
                            {index + 1}
                          </td>
                          <td className="sticky left-12 z-10 px-4 py-3 bg-white dark:bg-gray-800 text-sm font-medium text-gray-900 dark:text-white">
                            {student.rollNo || "—"}
                          </td>
                          <td className="sticky left-32 z-10 px-4 py-3 bg-white dark:bg-gray-800 text-sm font-medium text-gray-900 dark:text-white">
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
                                   className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center dark:bg-gray-700 dark:text-white bg-white"
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
                                   className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center dark:bg-gray-700 dark:text-white bg-white"
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
                                   <td key={categoryId} className="px-4 py-3 text-center text-sm bg-blue-50 dark:bg-blue-900/20">
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
                                       className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center dark:bg-gray-700 dark:text-white bg-white"
                                       min="0"
                                       max={category.totalMarks}
                                       disabled={!isEditingSemester}
                                     />
                                   </td>
                                 );
                               })}
                               {/* Continuous Evaluation Total column when expanded - read-only */}
                               <td className="px-4 py-3 text-center text-sm bg-blue-50 dark:bg-blue-900/20">
                                 <span className="font-semibold text-gray-900 dark:text-white">
                                   {continuousTotal.toFixed(2)}
                                 </span>
                               </td>
                             </>
                           ) : (
                             <td className="px-4 py-3 text-center text-sm bg-blue-50 dark:bg-blue-900/20">
                               <span className="font-semibold text-gray-900 dark:text-white">
                                 {continuousTotal.toFixed(2)}
                               </span>
                             </td>
                           )}
                           {/* Total column - only show when not expanded */}
                           {!expandedContinuous && (
                             <td className="px-4 py-3 text-center text-sm font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20">
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

