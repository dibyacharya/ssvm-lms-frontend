import React, { useState, useEffect } from "react";
import { BarChart3, Calculator, Target, Edit3 } from "lucide-react";
import { useParams } from "react-router-dom";

const AssessmentMarksSummary = () => {
  const { courseID } = useParams();
  const [assessmentData, setAssessmentData] = useState([]);
  const [totalMarks, setTotalMarks] = useState(0);

  // Load assessment data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(`continuousAssessment_${courseID}`);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setAssessmentData(parsedData);
      
      // Calculate total marks
      const total = parsedData.reduce((sum, category) => {
        return sum + (category.totalMarks || 0);
      }, 0);
      setTotalMarks(total);
    }
  }, [courseID]);

  const remainingMarks = 100 - totalMarks;

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
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">{totalMarks}%</div>
              <div className="text-sm text-gray-600">Total Allocated</div>
            </div>
            {remainingMarks > 0 && (
              <div className="text-sm text-red-600 font-medium">
                {remainingMarks}% remaining
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {assessmentData.length > 0 ? (
          <div className="space-y-4">
            {/* Assessment Categories List */}
            <div className="space-y-3">
              {assessmentData.map((category, index) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{category.category}</div>
                      <div className="text-sm text-gray-600">
                        {category.number} × {category.eachMarks} marks ({category.calculationMethod})
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-800">{category.totalMarks}%</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Assessment Progress</span>
                <span>{totalMarks}/100%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(totalMarks, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Status Messages */}
            {remainingMarks > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <Target className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800 text-sm">
                    Complete your assessment plan by allocating {remainingMarks}% more marks.
                  </span>
                </div>
              </div>
            )}

            {totalMarks > 100 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <Calculator className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-red-800 text-sm">
                    Total marks exceed 100%. Please adjust your assessment plan.
                  </span>
                </div>
              </div>
            )}

            {totalMarks === 100 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <Target className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 text-sm font-medium">
                    Assessment plan is complete! All marks have been allocated.
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No assessment plan created yet</p>
            <p className="text-sm text-gray-400">
              Go to Assessment → Continuous Assessment to create your assessment plan
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentMarksSummary;
