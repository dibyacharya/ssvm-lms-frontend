import React, { useState, useEffect } from "react";
import { Edit3, Save, X, BarChart3 } from "lucide-react";
import { useParams } from "react-router-dom";

const AssessmentPlan = () => {
  const { courseID } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [assessmentPlan, setAssessmentPlan] = useState({
    endTermExam: 50,
    midTermExam: 30,
    continuousAssessment: 20
  });
  const [tempPlan, setTempPlan] = useState(assessmentPlan);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(`assessmentPlan_${courseID}`);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setAssessmentPlan(parsedData);
      setTempPlan(parsedData);
    }
  }, [courseID]);

  // Save data to localStorage
  const saveToLocalStorage = (data) => {
    localStorage.setItem(`assessmentPlan_${courseID}`, JSON.stringify(data));
  };

  const handleEdit = () => {
    setTempPlan({ ...assessmentPlan });
    setIsEditing(true);
  };

  const handleSave = () => {
    setAssessmentPlan(tempPlan);
    saveToLocalStorage(tempPlan);
    setIsEditing(false);
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

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Assessment Plan</h3>
          </div>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Edit
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Total Marks Box */}
        <div className="mb-6">
          <div className="bg-gray-100 rounded-xl p-6 text-center">
            <div className="text-sm text-gray-600 mb-2">Total Marks</div>
            <div className="text-4xl font-bold text-gray-800">{totalMarks}</div>
          </div>
        </div>

        {/* Assessment Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* End-Term Exam */}
          <div className="bg-gray-100 rounded-xl p-4 text-center">
            <div className="text-sm text-gray-600 mb-2">End-Term Exam</div>
            {isEditing ? (
              <input
                type="number"
                value={tempPlan.endTermExam}
                onChange={(e) => handleChange('endTermExam', e.target.value)}
                className="w-full text-2xl font-bold text-center bg-transparent border-none outline-none text-gray-800"
                min="0"
                max="100"
              />
            ) : (
              <div className="text-2xl font-bold text-gray-800">{assessmentPlan.endTermExam}</div>
            )}
          </div>

          {/* Mid-Term Exam */}
          <div className="bg-gray-100 rounded-xl p-4 text-center">
            <div className="text-sm text-gray-600 mb-2">Mid-Term Exam</div>
            {isEditing ? (
              <input
                type="number"
                value={tempPlan.midTermExam}
                onChange={(e) => handleChange('midTermExam', e.target.value)}
                className="w-full text-2xl font-bold text-center bg-transparent border-none outline-none text-gray-800"
                min="0"
                max="100"
              />
            ) : (
              <div className="text-2xl font-bold text-gray-800">{assessmentPlan.midTermExam}</div>
            )}
          </div>

          {/* Continuous Assessment */}
          <div className="bg-gray-100 rounded-xl p-4 text-center">
            <div className="text-sm text-gray-600 mb-2">Continuous Assessment</div>
            {isEditing ? (
              <input
                type="number"
                value={tempPlan.continuousAssessment}
                onChange={(e) => handleChange('continuousAssessment', e.target.value)}
                className="w-full text-2xl font-bold text-center bg-transparent border-none outline-none text-gray-800"
                min="0"
                max="100"
              />
            ) : (
              <div className="text-2xl font-bold text-gray-800">{assessmentPlan.continuousAssessment}</div>
            )}
          </div>
        </div>

        {/* Validation Messages */}
        {isEditing && (
          <div className="mt-4">
            {totalMarks !== 100 && (
              <div className={`p-3 rounded-lg text-sm ${
                totalMarks < 100 
                  ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {totalMarks < 100 
                  ? `Total should be 100. Currently ${totalMarks}. Add ${100 - totalMarks} more marks.`
                  : `Total exceeds 100. Currently ${totalMarks}. Reduce by ${totalMarks - 100} marks.`
                }
              </div>
            )}
            {totalMarks === 100 && (
              <div className="p-3 rounded-lg text-sm bg-green-50 text-green-800 border border-green-200">
                Perfect! Total marks equal 100.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentPlan;
