import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Calculator,
  BarChart3,
  Target,
  Save,
  X,
  Edit3,
} from "lucide-react";
import { useParams } from "react-router-dom";

const ContinuousAssessment = () => {
  const { courseID } = useParams();
  const [assessmentCategories, setAssessmentCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [totalMarks, setTotalMarks] = useState(0);
  const [assessmentPlan, setAssessmentPlan] = useState({
    endTermExam: 50,
    midTermExam: 30,
    continuousAssessment: 20
  });

  // Assessment category options
  const categoryOptions = [
    "General Assignment",
    "Quiz-based Assignment", 
    "Activity-Based Assignment",
    "Quiz Test",
    "Engagement in Lectures",
    "Presentation/viva",
    "Lab Report",
    "Project Report",
    "Mid-term Exam",
    "Final Exam",
    "Practical Exam",
    "Group Project",
    "Individual Project",
    "Case Study",
    "Research Paper"
  ];

  // Calculation method options
  const calculationOptions = [
    "Average of Best of n",
    "Average of all",
    "Average of the Best 'n'",
    "Sum of all",
    "Sum of the Best 'n'"
  ];

  // Load data from localStorage on component mount
  useEffect(() => {
    // Load assessment plan
    const savedPlan = localStorage.getItem(`assessmentPlan_${courseID}`);
    if (savedPlan) {
      setAssessmentPlan(JSON.parse(savedPlan));
    }

    // Load continuous assessment data
    const savedData = localStorage.getItem(`continuousAssessment_${courseID}`);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setAssessmentCategories(parsedData);
    } else {
      // Initialize with default data
      setAssessmentCategories([
        {
          id: 1,
          category: "General Assignment",
          number: 4,
          eachMarks: 10,
          calculationMethod: "Average of Best of n",
          n: 3,
          totalMarks: 10
        }
      ]);
    }
  }, [courseID]);

  // Calculate total marks whenever categories change
  useEffect(() => {
    const total = assessmentCategories.reduce((sum, category) => {
      return sum + (category.totalMarks || 0);
    }, 0);
    setTotalMarks(total);
  }, [assessmentCategories]);

  // Save data to localStorage
  const saveToLocalStorage = (data) => {
    localStorage.setItem(`continuousAssessment_${courseID}`, JSON.stringify(data));
  };

  const addNewCategory = () => {
    const newCategory = {
      id: Date.now(),
      category: "General Assignment",
      number: 1,
      eachMarks: 10,
      calculationMethod: "Average of Best of n",
      n: 1,
      totalMarks: 10
    };
    const updatedCategories = [...assessmentCategories, newCategory];
    setAssessmentCategories(updatedCategories);
    saveToLocalStorage(updatedCategories);
  };

  const updateCategory = (id, field, value) => {
    const updatedCategories = assessmentCategories.map(category => {
      if (category.id === id) {
        const updated = { ...category, [field]: value };
        
        // Recalculate total marks based on calculation method
        let totalMarks = 0;
        const num = parseInt(updated.number) || 0;
        const eachMarks = parseInt(updated.eachMarks) || 0;
        const n = parseInt(updated.n) || 0;

        switch (updated.calculationMethod) {
          case "Average of all":
            totalMarks = eachMarks;
            break;
          case "Sum of all":
            totalMarks = num * eachMarks;
            break;
          case "Average of Best of n":
          case "Average of the Best 'n'":
            totalMarks = Math.min(n, num) * eachMarks;
            break;
          case "Sum of the Best 'n'":
            totalMarks = Math.min(n, num) * eachMarks;
            break;
          default:
            totalMarks = eachMarks;
        }

        updated.totalMarks = totalMarks;
        return updated;
      }
      return category;
    });
    
    setAssessmentCategories(updatedCategories);
    saveToLocalStorage(updatedCategories);
  };

  const deleteCategory = (id) => {
    const updatedCategories = assessmentCategories.filter(category => category.id !== id);
    setAssessmentCategories(updatedCategories);
    saveToLocalStorage(updatedCategories);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reload from localStorage to cancel changes
    const savedData = localStorage.getItem(`continuousAssessment_${courseID}`);
    if (savedData) {
      setAssessmentCategories(JSON.parse(savedData));
    }
    setIsEditing(false);
  };

  const remainingMarks = assessmentPlan.continuousAssessment - totalMarks;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Continuous Assessments Plan</h2>
          <p className="text-gray-600 mt-1">Plan and configure assessment categories for your course</p>
        </div>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Plan
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-sm"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </button>
          </div>
        )}
      </div>

      {/* Assessment Configuration */}
      <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Continuous Assessment</h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600">
              Allocated: {totalMarks}/{assessmentPlan.continuousAssessment} marks
            </span>
            {remainingMarks > 0 && (
              <span className="text-sm text-red-600 font-medium">
                Add another {remainingMarks} marks
              </span>
            )}
            {remainingMarks < 0 && (
              <span className="text-sm text-red-600 font-medium">
                Reduce by {Math.abs(remainingMarks)} marks
              </span>
            )}
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 mb-4 pb-3 border-b-2 border-gray-300">
          <div className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Category</div>
          <div className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Number</div>
          <div className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Each of Marks</div>
          <div className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Marks Calculation Based on</div>
          <div className="font-semibold text-gray-700 text-sm uppercase tracking-wide">n</div>
          <div className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Total Marks</div>
        </div>

        {/* Assessment Rows */}
        {assessmentCategories.map((category, index) => (
          <div key={category.id} className="grid grid-cols-6 gap-4 mb-4 items-center py-2 hover:bg-gray-100 rounded-lg px-2 transition-colors">
            {/* Category Dropdown */}
            <div>
              {isEditing ? (
                <select
                  value={category.category}
                  onChange={(e) => updateCategory(category.id, 'category', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {categoryOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <span className="text-gray-800 font-medium text-sm">{category.category}</span>
              )}
            </div>

            {/* Number Input */}
            <div>
              {isEditing ? (
                <input
                  type="number"
                  value={category.number}
                  onChange={(e) => updateCategory(category.id, 'number', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  min="1"
                />
              ) : (
                <span className="text-gray-800 text-sm">{category.number}</span>
              )}
            </div>

            {/* Each of Marks Input */}
            <div>
              {isEditing ? (
                <input
                  type="number"
                  value={category.eachMarks}
                  onChange={(e) => updateCategory(category.id, 'eachMarks', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  min="1"
                />
              ) : (
                <span className="text-gray-800 text-sm">{category.eachMarks}</span>
              )}
            </div>

            {/* Calculation Method Dropdown */}
            <div>
              {isEditing ? (
                <select
                  value={category.calculationMethod}
                  onChange={(e) => updateCategory(category.id, 'calculationMethod', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {calculationOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <span className="text-gray-800 text-sm">{category.calculationMethod}</span>
              )}
            </div>

            {/* n Value Input */}
            <div>
              {isEditing ? (
                <input
                  type="number"
                  value={category.n}
                  onChange={(e) => updateCategory(category.id, 'n', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  min="1"
                />
              ) : (
                <span className="text-gray-800 text-sm">{category.n}</span>
              )}
            </div>

            {/* Total Marks Display */}
            <div className="flex items-center justify-between">
              <span className="text-gray-800 font-semibold text-sm">{category.totalMarks}</span>
              {isEditing && (
                <button
                  onClick={() => deleteCategory(category.id)}
                  className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Add More Category Button */}
        {isEditing && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={addNewCategory}
              className="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              + Add More Category
            </button>
          </div>
        )}
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calculator className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800">Continuous Assessment Summary</h4>
              <p className="text-gray-600">Total marks allocated: {totalMarks}/{assessmentPlan.continuousAssessment}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-800">{totalMarks}%</div>
            <div className="text-sm text-gray-600">of {assessmentPlan.continuousAssessment}% allocated</div>
          </div>
        </div>
        
        {remainingMarks > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <Target className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800 text-sm">
                You need to allocate {remainingMarks} more marks to complete the continuous assessment plan.
              </span>
            </div>
          </div>
        )}

        {remainingMarks < 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <BarChart3 className="w-5 h-5 text-red-600 mr-2" />
              <span className="text-red-800 text-sm">
                Total marks exceed the allocated {assessmentPlan.continuousAssessment}%. Please adjust your assessment plan.
              </span>
            </div>
          </div>
        )}

        {remainingMarks === 0 && totalMarks > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <Target className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800 text-sm font-medium">
                Perfect! All {assessmentPlan.continuousAssessment}% continuous assessment marks have been allocated.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContinuousAssessment;
