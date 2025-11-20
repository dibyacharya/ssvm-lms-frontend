import React, { useState, useEffect } from "react";
import { Download, Search, FileText, Calendar, User, Award, TrendingUp } from "lucide-react";
import { useParams } from "react-router-dom";
import { getCourseGradebook } from "../../../../services/assignment.service";
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
      filename = `${gradebookData.course?.title || "Course"}_Semester_${currentSemester}_Marks.xlsx`;
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
              Semester Marks
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
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                Semester {currentSemester} Summary
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Overall performance for all graded assignments in this semester
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Sl.No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Roll No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
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
                      Graded Assignments
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Total Assignments
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                        No students found
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, index) => (
                      <tr key={student.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{index + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {student.rollNo || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {student.name || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{student.email || "—"}</td>
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
                          {student.gradedCount || 0}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">
                          {student.totalAssignments || 0}
                        </td>
                      </tr>
                    ))
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

