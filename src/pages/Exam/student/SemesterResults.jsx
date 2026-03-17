import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaGraduationCap, FaSpinner, FaArrowLeft, FaChevronDown,
  FaChevronUp, FaDownload, FaTrophy, FaExclamationTriangle,
  FaCheckCircle, FaTimesCircle,
} from "react-icons/fa";
import { getMyResults } from "../../../services/result.service";

const GRADE_COLORS = {
  O: "text-emerald-700 bg-emerald-50",
  E: "text-green-700 bg-green-50",
  A: "text-blue-700 bg-blue-50",
  B: "text-indigo-700 bg-indigo-50",
  C: "text-amber-700 bg-amber-50",
  D: "text-orange-700 bg-orange-50",
  F: "text-red-700 bg-red-50",
};

const SemesterResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyResults();
      setResults(res.results || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const handlePrint = () => { window.print(); };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <FaSpinner className="animate-spin text-3xl text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100">
          <FaArrowLeft className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Results</h1>
          <p className="text-sm text-gray-500">Semester-wise consolidated results</p>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <FaGraduationCap className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No published results available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result) => (
            <div key={result._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Result Header */}
              <div
                className="p-5 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(expandedId === result._id ? null : result._id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <FaGraduationCap className="text-2xl text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {result.semester?.name || `Semester ${result.semester?.number}`}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {result.program?.name} | {result.batch?.name} {result.academicYear && `| ${result.academicYear}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-3xl font-bold text-indigo-700">{result.sgpa}</p>
                      <p className="text-xs text-gray-500">SGPA</p>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-sm text-green-700 font-medium">{result.totalCoursesPassed}P</span>
                      <span className="text-sm text-red-600 font-medium">{result.totalCoursesFailed}F</span>
                    </div>
                    {expandedId === result._id ? (
                      <FaChevronUp className="text-gray-400" />
                    ) : (
                      <FaChevronDown className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Course Results */}
              {expandedId === result._id && (
                <div className="border-t border-gray-100 p-5 space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="bg-indigo-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">SGPA</p>
                      <p className="text-xl font-bold text-indigo-700">{result.sgpa}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Overall %</p>
                      <p className="text-xl font-bold text-blue-700">{result.overallPercentage}%</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Credits</p>
                      <p className="text-xl font-bold text-green-700">{result.totalCredits}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Credit Points</p>
                      <p className="text-xl font-bold text-emerald-700">{result.totalCreditPoints}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500">Courses</p>
                      <p className="text-xl font-bold text-purple-700">{result.totalCoursesAttempted}</p>
                    </div>
                  </div>

                  {/* Course Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-600">
                          <th className="text-left py-2.5 font-medium">Course</th>
                          <th className="text-center py-2.5 font-medium">Credits</th>
                          <th className="text-center py-2.5 font-medium">Mid</th>
                          <th className="text-center py-2.5 font-medium">End</th>
                          <th className="text-center py-2.5 font-medium">Total</th>
                          <th className="text-center py-2.5 font-medium">%</th>
                          <th className="text-center py-2.5 font-medium">Grade</th>
                          <th className="text-center py-2.5 font-medium">GP</th>
                          <th className="text-center py-2.5 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.courseResults?.map((cr, i) => (
                          <tr key={i} className="border-b border-gray-50">
                            <td className="py-2.5">
                              <span className="font-semibold text-gray-900">{cr.courseCode}</span>
                              <span className="text-gray-500 ml-1.5 text-xs">{cr.courseName}</span>
                            </td>
                            <td className="py-2.5 text-center">{cr.credits}</td>
                            <td className="py-2.5 text-center">{cr.midTermMarks ?? "-"}</td>
                            <td className="py-2.5 text-center">{cr.endTermMarks ?? "-"}</td>
                            <td className="py-2.5 text-center font-medium">{cr.totalMarks ?? "-"}</td>
                            <td className="py-2.5 text-center">{cr.percentage != null ? `${cr.percentage}%` : "-"}</td>
                            <td className="py-2.5 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded font-bold text-sm ${GRADE_COLORS[cr.grade] || "text-gray-600 bg-gray-50"}`}>
                                {cr.grade || "-"}
                              </span>
                            </td>
                            <td className="py-2.5 text-center font-medium">{cr.gradePoint}</td>
                            <td className="py-2.5 text-center">
                              {cr.status === "pass" ? (
                                <FaCheckCircle className="text-green-600 inline" />
                              ) : cr.status === "fail" ? (
                                <FaTimesCircle className="text-red-600 inline" />
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {result.remarks && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 flex items-start gap-2">
                      <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
                      {result.remarks}
                    </div>
                  )}

                  <div className="flex justify-end print:hidden">
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      <FaDownload /> Print Result
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SemesterResults;
