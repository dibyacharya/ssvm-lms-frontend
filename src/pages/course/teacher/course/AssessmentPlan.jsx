import React, { useState, useEffect } from "react";
import { Edit3, Save, X, BarChart3, AlertTriangle, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { useParams } from "react-router-dom";
import { getAssessmentPlan, saveAssessmentPlan } from "../../../../services/course.service";
import { useCourse } from "../../../../context/CourseContext";
import { getEndExamLabel, getMidExamLabel } from "../../../../utils/periodLabel";
import toast from "react-hot-toast";
import LoadingSpinner from "../../../../utils/LoadingAnimation";

const SectionHeader = ({ icon: Icon, title, gradient, children }) => (
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
      {children}
    </div>
  </div>
);

const AssessmentPlan = () => {
  const { courseID } = useParams();
  const { courseData } = useCourse();
  const periodType = courseData?.semester?.periodType || courseData?.periodType || "semester";
  const endExamLabel = getEndExamLabel(periodType);
  const midExamLabel = getMidExamLabel(periodType);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assessmentPlan, setAssessmentPlan] = useState({
    endTermExam: 50,
    midTermExam: 30,
    continuousAssessment: 20
  });
  const [tempPlan, setTempPlan] = useState(assessmentPlan);
  const [isLocked, setIsLocked] = useState(false);

  // Load data from backend on component mount
  useEffect(() => {
    const fetchAssessmentPlan = async () => {
      if (!courseID) return;

      try {
        setLoading(true);
        const data = await getAssessmentPlan(courseID);

        if (data) {
          setAssessmentPlan({
            endTermExam: data.endTermExam,
            midTermExam: data.midTermExam,
            continuousAssessment: data.continuousAssessment
          });
          setTempPlan({
            endTermExam: data.endTermExam,
            midTermExam: data.midTermExam,
            continuousAssessment: data.continuousAssessment
          });
          setIsLocked(data.isLocked || false);
        } else {
          // Use defaults if no plan exists
          const defaultPlan = {
            endTermExam: 50,
            midTermExam: 30,
            continuousAssessment: 20
          };
          setAssessmentPlan(defaultPlan);
          setTempPlan(defaultPlan);
        }
      } catch (error) {
        console.error("Error fetching assessment plan:", error);
        toast.error("Failed to load assessment plan");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentPlan();
  }, [courseID]);

  const handleEdit = () => {
    if (isLocked) {
      toast.error("Assessment plan is locked. Grades have been entered.");
      return;
    }
    setTempPlan({ ...assessmentPlan });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (isLocked) {
      toast.error("Assessment plan is locked. Grades have been entered.");
      return;
    }

    const total = tempPlan.endTermExam + tempPlan.midTermExam + tempPlan.continuousAssessment;
    if (total !== 100) {
      toast.error(`Total must equal 100. Currently ${total}.`);
      return;
    }

    try {
      await saveAssessmentPlan(courseID, tempPlan);
      setAssessmentPlan(tempPlan);
      setIsEditing(false);
      toast.success("Assessment plan saved successfully");
    } catch (error) {
      console.error("Error saving assessment plan:", error);
      toast.error(error.response?.data?.error || "Failed to save assessment plan");
    }
  };

  const handleCancel = () => {
    setTempPlan({ ...assessmentPlan });
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    setTempPlan(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const totalMarks = tempPlan.endTermExam + tempPlan.midTermExam + tempPlan.continuousAssessment;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 flex items-center justify-center min-h-[200px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Gradient Header */}
      <SectionHeader
        icon={BarChart3}
        title="Assessment Plan"
        gradient="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"
      >
        <div className="flex items-center gap-2">
          {isLocked && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
              <Lock className="w-3.5 h-3.5 text-amber-200" />
              <span className="text-xs font-semibold text-amber-100">Locked</span>
            </div>
          )}
          {!isEditing && !isLocked && (
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-3 py-1.5 text-sm bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors font-medium"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1.5" />
              Edit
            </button>
          )}
          {isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-3 py-1.5 text-sm bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors font-medium"
              >
                <X className="w-3.5 h-3.5 mr-1.5" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center px-3 py-1.5 text-sm bg-white text-indigo-700 rounded-lg hover:bg-white/90 transition-colors font-semibold shadow-sm"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save
              </button>
            </div>
          )}
        </div>
      </SectionHeader>

      {/* Locked Warning Banner */}
      {isLocked && (
        <div className="px-6 py-3 bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-700">
              Locked - Grades have been entered. The assessment plan cannot be modified.
            </span>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Total Marks Box */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-center shadow-lg shadow-indigo-200/50">
            <div className="text-sm text-indigo-100 mb-1 font-medium">Total Marks</div>
            <div className="text-5xl font-bold text-white">{totalMarks}</div>
            <div className="text-xs text-indigo-200 mt-1">out of 100</div>
          </div>
        </div>

        {/* Assessment Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* End-Term Exam */}
          <div className="bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 rounded-xl p-5 text-center transition-all duration-200 hover:shadow-md hover:border-rose-300">
            <div className="text-sm font-semibold mb-3 bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">
              {endExamLabel}
            </div>
            {isEditing && !isLocked ? (
              <input
                type="number"
                value={tempPlan.endTermExam}
                onChange={(e) => handleChange('endTermExam', e.target.value)}
                className="w-full text-3xl font-bold text-center bg-white/60 border border-rose-200 rounded-lg outline-none text-rose-700 focus:ring-2 focus:ring-rose-300 focus:border-rose-300 py-2 transition-all"
                min="0"
                max="100"
              />
            ) : (
              <div className="text-3xl font-bold text-rose-700">{assessmentPlan.endTermExam}</div>
            )}
          </div>

          {/* Mid-Term Exam */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-5 text-center transition-all duration-200 hover:shadow-md hover:border-amber-300">
            <div className="text-sm font-semibold mb-3 bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
              {midExamLabel}
            </div>
            {isEditing && !isLocked ? (
              <input
                type="number"
                value={tempPlan.midTermExam}
                onChange={(e) => handleChange('midTermExam', e.target.value)}
                className="w-full text-3xl font-bold text-center bg-white/60 border border-amber-200 rounded-lg outline-none text-amber-700 focus:ring-2 focus:ring-amber-300 focus:border-amber-300 py-2 transition-all"
                min="0"
                max="100"
              />
            ) : (
              <div className="text-3xl font-bold text-amber-700">{assessmentPlan.midTermExam}</div>
            )}
          </div>

          {/* Continuous Assessment */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 text-center transition-all duration-200 hover:shadow-md hover:border-blue-300">
            <div className="text-sm font-semibold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Continuous Assessment
            </div>
            {isEditing && !isLocked ? (
              <input
                type="number"
                value={tempPlan.continuousAssessment}
                onChange={(e) => handleChange('continuousAssessment', e.target.value)}
                className="w-full text-3xl font-bold text-center bg-white/60 border border-blue-200 rounded-lg outline-none text-blue-700 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 py-2 transition-all"
                min="0"
                max="100"
              />
            ) : (
              <div className="text-3xl font-bold text-blue-700">{assessmentPlan.continuousAssessment}</div>
            )}
          </div>
        </div>

        {/* Validation Messages */}
        {isEditing && !isLocked && (
          <div className="mt-4">
            {totalMarks !== 100 && (
              <div className={`flex items-center gap-2.5 p-3.5 rounded-lg text-sm ${
                totalMarks < 100
                  ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <AlertCircle className={`w-4 h-4 flex-shrink-0 ${
                  totalMarks < 100 ? 'text-yellow-500' : 'text-red-500'
                }`} />
                <span>
                  {totalMarks < 100
                    ? `Total should be 100. Currently ${totalMarks}. Add ${100 - totalMarks} more marks.`
                    : `Total exceeds 100. Currently ${totalMarks}. Reduce by ${totalMarks - 100} marks.`
                  }
                </span>
              </div>
            )}
            {totalMarks === 100 && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-lg text-sm bg-green-50 text-green-800 border border-green-200">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Perfect! Total marks equal 100.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentPlan;
