import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getStudentAssessmentPlan,
  getStudentContinuousAssessmentPlan,
  getStudentOwnGrades,
} from "../../../../services/course.service";
import LoadingSpinner from "../../../../utils/LoadingAnimation";
import CoursePageBanner from "../../../../components/shared/CoursePageBanner";
import {
  Award,
  BarChart3,
  BookOpen,
  FileText,
  Calculator,
  Target,
  TrendingUp,
} from "lucide-react";

/* ─────────── Section Header ─────────── */
const SectionHeader = ({ icon: Icon, title, gradient, count }) => (
  <div className={`relative overflow-hidden px-6 py-4 ${gradient}`}>
    <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
    <div className="absolute -bottom-4 right-12 w-12 h-12 bg-white/5 rounded-full" />
    <div className="relative z-10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
      </div>
      {count != null && (
        <span className="px-2.5 py-1 text-xs font-bold text-white bg-white/20 rounded-full backdrop-blur-sm">
          {count}
        </span>
      )}
    </div>
  </div>
);

/* ─────────── Stat Card ─────────── */
const StatCard = ({ icon: Icon, label, value, color, bgColor, borderColor }) => (
  <div
    className={`relative overflow-hidden rounded-xl border ${borderColor} ${bgColor} p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
  >
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
    </div>
    <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full opacity-10 ${color}`} />
  </div>
);

const getGradeColor = (grade) => {
  if (!grade) return "text-gray-400";
  const g = grade.toUpperCase();
  if (g === "O" || g === "E" || g === "A") return "text-emerald-600";
  if (g === "B") return "text-blue-600";
  if (g === "C") return "text-amber-600";
  if (g === "D") return "text-orange-600";
  return "text-red-600";
};

const getGradeBg = (grade) => {
  if (!grade) return "bg-gray-50 border-gray-200";
  const g = grade.toUpperCase();
  if (g === "O" || g === "E" || g === "A") return "bg-emerald-50 border-emerald-200";
  if (g === "B") return "bg-blue-50 border-blue-200";
  if (g === "C") return "bg-amber-50 border-amber-200";
  if (g === "D") return "bg-orange-50 border-orange-200";
  return "bg-red-50 border-red-200";
};

const StudentCourseGradebook = () => {
  const { courseID } = useParams();
  const [loading, setLoading] = useState(true);
  const [assessmentPlan, setAssessmentPlan] = useState(null);
  const [continuousPlan, setContinuousPlan] = useState(null);
  const [grades, setGrades] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [ap, cp, gr] = await Promise.all([
          getStudentAssessmentPlan(courseID),
          getStudentContinuousAssessmentPlan(courseID),
          getStudentOwnGrades(courseID),
        ]);
        setAssessmentPlan(ap);
        setContinuousPlan(cp);
        setGrades(gr);
      } catch (err) {
        console.error("Error fetching gradebook data:", err);
        setError("Failed to load gradebook data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    if (courseID) fetchData();
  }, [courseID]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="max-w-[1600px] mx-auto space-y-6">
        <CoursePageBanner
          icon={Award}
          title="Gradebook"
          subtitle="View your grades for this course"
          gradient="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500"
        />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  const grading = grades?.grading || {};
  const endTerm = grading.endTerm ?? null;
  const midTerm = grading.midTerm ?? null;
  const ca = grading.continuousAssessment ?? grading.ca ?? null;
  const totalMarks = grading.totalMarks ?? grading.total ?? null;
  const grade = grading.grade || grading.letterGrade || null;
  const caCategories = continuousPlan?.categories || continuousPlan?.plan || [];

  const apEndTerm = assessmentPlan?.endTermExam ?? assessmentPlan?.endTerm ?? 50;
  const apMidTerm = assessmentPlan?.midTermExam ?? assessmentPlan?.midTerm ?? 30;
  const apCA = assessmentPlan?.continuousAssessment ?? assessmentPlan?.ca ?? 20;

  const hasGrades = grades && (endTerm !== null || midTerm !== null || ca !== null || totalMarks !== null);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Banner */}
      <CoursePageBanner
        icon={Award}
        title="My Gradebook"
        subtitle="View your assessment plan and grades for this course"
        gradient="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500"
      />

      {/* Assessment Plan Weightage */}
      {assessmentPlan && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <SectionHeader
            icon={Target}
            title="Assessment Weightage"
            gradient="bg-gradient-to-r from-blue-500 to-indigo-600"
          />
          <div className="p-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-3xl font-bold text-blue-600">{apEndTerm}%</p>
                <p className="text-xs text-gray-600 mt-1 font-medium">End Term Exam</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-purple-50 border border-purple-100">
                <p className="text-3xl font-bold text-purple-600">{apMidTerm}%</p>
                <p className="text-xs text-gray-600 mt-1 font-medium">Mid Term Exam</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-green-50 border border-green-100">
                <p className="text-3xl font-bold text-green-600">{apCA}%</p>
                <p className="text-xs text-gray-600 mt-1 font-medium">Continuous Assessment</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CA Categories Breakdown */}
      {caCategories.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <SectionHeader
            icon={BarChart3}
            title="Continuous Assessment Categories"
            gradient="bg-gradient-to-r from-fuchsia-500 to-purple-600"
            count={caCategories.length}
          />
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-50/50">
                    <th className="py-3 px-4 text-left font-semibold text-gray-500 text-xs uppercase tracking-wider">Category</th>
                    <th className="py-3 px-4 text-center font-semibold text-gray-500 text-xs uppercase tracking-wider">Number</th>
                    <th className="py-3 px-4 text-center font-semibold text-gray-500 text-xs uppercase tracking-wider">Each Marks</th>
                    <th className="py-3 px-4 text-center font-semibold text-gray-500 text-xs uppercase tracking-wider">Calculation</th>
                    <th className="py-3 px-4 text-center font-semibold text-gray-500 text-xs uppercase tracking-wider">Total Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {caCategories.map((cat, idx) => (
                    <tr key={cat._id || idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"}>
                      <td className="py-3 px-4 text-sm font-medium text-gray-800">{cat.category || cat.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-center">{cat.number}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-center">{cat.eachMarks}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-center">{cat.calculationMethod || "—"}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-800 text-center">{cat.totalMarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Grades */}
      {!hasGrades ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <SectionHeader
            icon={Award}
            title="Your Grades"
            gradient="bg-gradient-to-r from-emerald-500 to-green-600"
          />
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">Grades Not Published Yet</h3>
            <p className="text-gray-400 text-sm text-center max-w-md">
              Your grades for this course have not been published by your instructor. Please check back later.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <SectionHeader
            icon={Award}
            title="Your Grades"
            gradient="bg-gradient-to-r from-emerald-500 to-green-600"
          />
          <div className="p-6 space-y-6">
            {/* Grade Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={BookOpen}
                label="End Term"
                value={endTerm != null ? endTerm : "—"}
                color="bg-blue-500"
                bgColor="bg-blue-50/80"
                borderColor="border-blue-100"
              />
              <StatCard
                icon={FileText}
                label="Mid Term"
                value={midTerm != null ? midTerm : "—"}
                color="bg-purple-500"
                bgColor="bg-purple-50/80"
                borderColor="border-purple-100"
              />
              <StatCard
                icon={Calculator}
                label="Continuous Assessment"
                value={ca != null ? ca : "—"}
                color="bg-green-500"
                bgColor="bg-green-50/80"
                borderColor="border-green-100"
              />
              <StatCard
                icon={TrendingUp}
                label="Total"
                value={totalMarks != null ? totalMarks : "—"}
                color="bg-amber-500"
                bgColor="bg-amber-50/80"
                borderColor="border-amber-100"
              />
            </div>

            {/* Final Grade Badge */}
            {grade && (
              <div className="flex flex-col items-center justify-center py-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Final Grade</p>
                <div className={`w-24 h-24 rounded-2xl border-2 flex items-center justify-center ${getGradeBg(grade)}`}>
                  <span className={`text-4xl font-extrabold ${getGradeColor(grade)}`}>{grade}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCourseGradebook;
