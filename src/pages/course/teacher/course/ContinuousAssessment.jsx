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
  CheckSquare,
  Square,
  ArrowLeft,
  FileText,
  Eye,
  CheckCircle,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllCourseAssignments } from "../../../../services/assignment.service";
import {
  getContinuousAssessmentPlan,
  createContinuousAssessmentCategory,
  updateContinuousAssessmentCategory,
  deleteContinuousAssessmentCategory,
  bulkUpdateContinuousAssessmentPlan,
  getAssessmentPlan,
} from "../../../../services/course.service";
import CreateAssignmentNew from "../../../Assignment/teacher/CreateAssignmentNew";
import toast from "react-hot-toast";
import LoadingSpinner from "../../../../utils/LoadingAnimation";

const ContinuousAssessment = () => {
  const { courseID } = useParams();
  const navigate = useNavigate();
  const [assessmentCategories, setAssessmentCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalMarks, setTotalMarks] = useState(0);
  const [assessmentPlan, setAssessmentPlan] = useState({
    endTermExam: 50,
    midTermExam: 30,
    continuousAssessment: 20
  });
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [selectedAssignments, setSelectedAssignments] = useState({});
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [createAssignmentType, setCreateAssignmentType] = useState('subjective');

  // Assessment category options (removed exam options)
  const categoryOptions = [
    "General Assignment",
    "Objective one", 
    "Activity-Based Assignment",
    "Quiz Test",
    "Engagement in Lectures",
    "Presentation/viva",
    "Lab Report",
    "Project Report",
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

  // Load data from backend on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!courseID) return;

      try {
        setLoading(true);
        
        // Fetch assessment plan
        const planData = await getAssessmentPlan(courseID);
        if (planData) {
          setAssessmentPlan({
            endTermExam: planData.endTermExam,
            midTermExam: planData.midTermExam,
            continuousAssessment: planData.continuousAssessment
          });
        }

        // Fetch continuous assessment categories
        const categories = await getContinuousAssessmentPlan(courseID);
        if (categories && categories.length > 0) {
          // Convert backend format to frontend format (use _id as id, handle selectedAssignments)
          const formattedCategories = categories.map(cat => ({
            id: cat._id,
            _id: cat._id,
            category: cat.category,
            number: cat.number,
            eachMarks: cat.eachMarks,
            calculationMethod: cat.calculationMethod,
            n: cat.n,
            totalMarks: cat.totalMarks,
            selectedAssignments: cat.selectedAssignments || [],
            assignmentDetails: cat.selectedAssignments || [] // Backend populates this
          }));
          setAssessmentCategories(formattedCategories);
        } else {
          // No categories exist yet - start with empty array
          setAssessmentCategories([]);
        }
      } catch (error) {
        console.error("Error fetching continuous assessment data:", error);
        toast.error("Failed to load continuous assessment plan");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseID]);

  // Calculate total marks whenever categories change
  useEffect(() => {
    const total = assessmentCategories.reduce((sum, category) => {
      return sum + (category.totalMarks || 0);
    }, 0);
    setTotalMarks(total);
  }, [assessmentCategories]);

  const addNewCategory = async () => {
    try {
      const newCategoryData = {
        category: "General Assignment",
        number: 1,
        eachMarks: 10,
        calculationMethod: "Average of Best of n",
        n: 1,
        totalMarks: 10,
        selectedAssignments: []
      };

      const created = await createContinuousAssessmentCategory(courseID, newCategoryData);
      
      // Add to local state
      const newCategory = {
        id: created._id || created.data?._id,
        _id: created._id || created.data?._id,
        category: created.category || created.data?.category,
        number: created.number || created.data?.number,
        eachMarks: created.eachMarks || created.data?.eachMarks,
        calculationMethod: created.calculationMethod || created.data?.calculationMethod,
        n: created.n || created.data?.n,
        totalMarks: created.totalMarks || created.data?.totalMarks,
        selectedAssignments: created.selectedAssignments || created.data?.selectedAssignments || []
      };

      setAssessmentCategories(prev => [...prev, newCategory]);
      toast.success("Category added successfully");
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error(error.response?.data?.error || "Failed to create category");
    }
  };

  const updateCategory = async (id, field, value) => {
    // Optimistically update UI
    const category = assessmentCategories.find(cat => cat.id === id || cat._id === id);
    if (!category) return;

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

    // Update local state immediately
    setAssessmentCategories(prev => prev.map(cat => 
      (cat.id === id || cat._id === id) ? updated : cat
    ));

    // Save to backend
    try {
      const categoryId = category._id || category.id;
      await updateContinuousAssessmentCategory(courseID, categoryId, {
        [field]: value,
        totalMarks: updated.totalMarks
      });
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(error.response?.data?.error || "Failed to update category");
      // Revert on error
      setAssessmentCategories(prev => prev.map(cat => 
        (cat.id === id || cat._id === id) ? category : cat
      ));
    }
  };

  const deleteCategory = async (id) => {
    const category = assessmentCategories.find(cat => cat.id === id || cat._id === id);
    if (!category) return;

    try {
      const categoryId = category._id || category.id;
      await deleteContinuousAssessmentCategory(courseID, categoryId);
      
      // Remove from local state
      setAssessmentCategories(prev => prev.filter(cat => cat.id !== id && cat._id !== id));
      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error.response?.data?.error || "Failed to delete category");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Convert frontend format to backend format
      const categoriesToSave = assessmentCategories.map(cat => ({
        category: cat.category,
        number: cat.number,
        eachMarks: cat.eachMarks,
        calculationMethod: cat.calculationMethod,
        n: cat.n,
        totalMarks: cat.totalMarks,
        selectedAssignments: Array.isArray(cat.selectedAssignments) 
          ? cat.selectedAssignments.map(a => typeof a === 'string' ? a : a._id || a.id)
          : []
      }));

      await bulkUpdateContinuousAssessmentPlan(courseID, categoriesToSave);
      setIsEditing(false);
      toast.success("Continuous assessment plan saved successfully");
    } catch (error) {
      console.error("Error saving continuous assessment plan:", error);
      toast.error(error.response?.data?.error || "Failed to save plan");
    }
  };

  const handleCancel = async () => {
    // Reload from backend to cancel changes
    try {
      const categories = await getContinuousAssessmentPlan(courseID);
      if (categories && categories.length > 0) {
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
        setAssessmentCategories(formattedCategories);
      } else {
        setAssessmentCategories([]);
      }
    } catch (error) {
      console.error("Error reloading data:", error);
    }
    setIsEditing(false);
  };

  // Fetch assignments for selection
  const fetchAssignments = async (categoryType) => {
    if (!courseID) return;
    
    try {
      setLoadingAssignments(true);
      const response = await getAllCourseAssignments({ courseID });
      const assignments = response.assignments || [];
      
      // Filter assignments based on category type
      let filteredAssignments = [];
      if (categoryType === "General Assignment") {
        // Show assignments with subjective questions
        filteredAssignments = assignments.filter(assignment => {
          const questions = assignment.questions || [];
          return questions.some(q => q.type === 'subjective');
        });
      } else if (categoryType === "Objective one") {
        // Show assignments with objective questions
        filteredAssignments = assignments.filter(assignment => {
          const questions = assignment.questions || [];
          return questions.some(q => q.type === 'objective');
        });
      }
      
      setAvailableAssignments(filteredAssignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoadingAssignments(false);
    }
  };

  // Handle category selection change
  const handleCategoryChange = (id, value) => {
    updateCategory(id, 'category', value);
    
    // If General Assignment or Objective one is selected, show options
    if (value === "General Assignment" || value === "Objective one") {
      // Don't show modal immediately, just update the category
      // The modal will be shown when user clicks on the row
    }
  };

  // Handle "Add new" button click
  const handleAddNew = (categoryType) => {
    // Set the assignment type and show the create form
    const assignmentType = categoryType === "General Assignment" ? "subjective" : "objective";
    setCreateAssignmentType(assignmentType);
    setIsCreatingAssignment(true);
  };

  // Handle back from create assignment
  const handleBackFromCreate = () => {
    setIsCreatingAssignment(false);
    setCreateAssignmentType('subjective');
  };

  // Handle assignment saved
  const handleAssignmentSaved = (assignment) => {
    setIsCreatingAssignment(false);
    setCreateAssignmentType('subjective');
    // Optionally refresh assignments list
    toast.success("Assignment created successfully!");
  };

  // Handle "Select" button click
  const handleSelect = async (id, categoryType) => {
    setSelectedCategoryId(id);
    await fetchAssignments(categoryType);
    setShowAssignmentModal(true);
    
    // Load previously selected assignments for this category
    const category = assessmentCategories.find(cat => cat.id === id || cat._id === id);
    if (category?.selectedAssignments) {
      const selected = {};
      category.selectedAssignments.forEach(assignmentId => {
        // Handle both string IDs and object IDs
        const id = typeof assignmentId === 'string' ? assignmentId : assignmentId._id || assignmentId.id;
        selected[id] = true;
      });
      setSelectedAssignments(selected);
    } else {
      setSelectedAssignments({});
    }
  };

  // Handle assignment checkbox toggle
  const handleAssignmentToggle = (assignmentId) => {
    setSelectedAssignments(prev => ({
      ...prev,
      [assignmentId]: !prev[assignmentId]
    }));
  };

  // Save selected assignments to category
  const handleSaveSelectedAssignments = async () => {
    const selectedIds = Object.keys(selectedAssignments).filter(id => selectedAssignments[id]);
    
    const category = assessmentCategories.find(cat => cat.id === selectedCategoryId || cat._id === selectedCategoryId);
    if (!category) return;

    try {
      const categoryId = category._id || category.id;
      await updateContinuousAssessmentCategory(courseID, categoryId, {
        selectedAssignments: selectedIds
      });

      // Update local state
      setAssessmentCategories(prev => prev.map(cat => 
        (cat.id === selectedCategoryId || cat._id === selectedCategoryId)
          ? { ...cat, selectedAssignments: selectedIds }
          : cat
      ));

      setShowAssignmentModal(false);
      setSelectedAssignments({});
      setSelectedCategoryId(null);
      toast.success("Assignments linked successfully");
    } catch (error) {
      console.error("Error saving selected assignments:", error);
      toast.error(error.response?.data?.error || "Failed to save assignments");
    }
  };

  const remainingMarks = assessmentPlan.continuousAssessment - totalMarks;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // If creating assignment, show the create form
  if (isCreatingAssignment) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={handleBackFromCreate}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Continuous Assessment</span>
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New {createAssignmentType === 'subjective' ? 'General' : 'Objective'} Assignment
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create a new assignment to include in your continuous assessment plan
            </p>
          </div>
          <div className="p-6">
            <CreateAssignmentNew
              courseID={courseID}
              inModal={false}
              assignmentType={createAssignmentType}
              onSave={handleAssignmentSaved}
              onCancel={handleBackFromCreate}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Continuous Assessments Plan</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Plan and configure assessment categories for your course</p>
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
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Continuous Assessment</h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Allocated: {totalMarks}/{assessmentPlan.continuousAssessment} marks
            </span>
            {remainingMarks > 0 && (
              <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                Add another {remainingMarks} marks
              </span>
            )}
            {remainingMarks < 0 && (
              <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                Reduce by {Math.abs(remainingMarks)} marks
              </span>
            )}
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 mb-4 pb-3 border-b-2 border-gray-300 dark:border-gray-600">
          <div className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide flex items-center">Category</div>
          <div className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide flex items-center">Number</div>
          <div className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide flex items-center">Each of Marks</div>
          <div className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide flex items-center">Marks Calculation Based on</div>
          <div className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide flex items-center">n</div>
          <div className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide flex items-center">Total Marks</div>
        </div>

        {/* Assessment Rows */}
        {assessmentCategories.length === 0 && !isEditing ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No assessment categories configured yet. Click "Edit Plan" to add categories.
          </div>
        ) : (
          assessmentCategories.map((category, index) => (
            <div key={category.id || category._id} className="grid grid-cols-6 gap-4 mb-4 items-start py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-2 transition-colors border border-gray-200 dark:border-gray-600">
            {/* Category Dropdown */}
            <div className="flex items-start">
              {isEditing ? (
                <div className="w-full flex flex-col gap-2">
                  <select
                    value={category.category}
                    onChange={(e) => handleCategoryChange(category.id || category._id, e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {categoryOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {(category.category === "General Assignment" || category.category === "Objective one") && (
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddNew(category.category);
                        }}
                        className="relative px-2 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm cursor-pointer flex items-center justify-center group"
                        title="Add new"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          Add new
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSelect(category.id || category._id, category.category);
                        }}
                        className="relative px-2 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm cursor-pointer flex items-center justify-center group"
                        title="Select"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          Select
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Determine assignment type based on category
                          const sectionName = category.category === "General Assignment" ? "Subjective" : "Objective";
                          localStorage.setItem(`course_${courseID}_selectedSection`, sectionName);
                          // Dispatch custom event to notify CourseManagement to update
                          window.dispatchEvent(new CustomEvent('sectionChange', { detail: { section: sectionName } }));
                        }}
                        className="relative px-2 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-sm cursor-pointer flex items-center justify-center group"
                        title="View All"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          View All
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full flex flex-col">
                  <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">{category.category}</span>
                  {(category.category === "General Assignment" || category.category === "Objective one") && category.selectedAssignments && category.selectedAssignments.length > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {category.selectedAssignments.length} assignment(s) selected
                    </span>
                  )}
                  {category.assignmentDetails && category.assignmentDetails.length > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {category.assignmentDetails.length} assignment(s) linked
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Number Input */}
            <div className="flex items-center">
              {isEditing ? (
                <input
                  type="number"
                  value={category.number}
                  onChange={(e) => updateCategory(category.id || category._id, 'number', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="1"
                />
              ) : (
                <span className="text-gray-800 dark:text-gray-200 text-sm w-full">{category.number}</span>
              )}
            </div>

            {/* Each of Marks Input */}
            <div className="flex items-center">
              {isEditing ? (
                <input
                  type="number"
                  value={category.eachMarks}
                  onChange={(e) => updateCategory(category.id || category._id, 'eachMarks', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="1"
                />
              ) : (
                <span className="text-gray-800 dark:text-gray-200 text-sm w-full">{category.eachMarks}</span>
              )}
            </div>

            {/* Calculation Method Dropdown */}
            <div className="flex items-center">
              {isEditing ? (
                <select
                  value={category.calculationMethod}
                  onChange={(e) => updateCategory(category.id || category._id, 'calculationMethod', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {calculationOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <span className="text-gray-800 dark:text-gray-200 text-sm w-full">{category.calculationMethod}</span>
              )}
            </div>

            {/* n Value Input */}
            <div className="flex items-center">
              {isEditing ? (
                <input
                  type="number"
                  value={category.n}
                  onChange={(e) => updateCategory(category.id || category._id, 'n', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="1"
                />
              ) : (
                <span className="text-gray-800 dark:text-gray-200 text-sm w-full">{category.n}</span>
              )}
            </div>

            {/* Total Marks Display */}
            <div className="flex items-center justify-between">
              <span className="text-gray-800 dark:text-gray-200 font-semibold text-sm">{category.totalMarks}</span>
              {isEditing && (
                <button
                  onClick={() => deleteCategory(category.id || category._id)}
                  className="p-1 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors ml-2"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))
        )}

        {/* Add More Category Button */}
        {isEditing && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={addNewCategory}
              className="inline-flex items-center px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add More Category
            </button>
          </div>
        )}
      </div>

      {/* Summary Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Continuous Assessment Summary</h4>
              <p className="text-gray-600 dark:text-gray-400">Total marks allocated: {totalMarks}/{assessmentPlan.continuousAssessment}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-800 dark:text-white">{totalMarks}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">of {assessmentPlan.continuousAssessment}% allocated</div>
          </div>
        </div>
        
        {remainingMarks > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center">
              <Target className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
              <span className="text-yellow-800 dark:text-yellow-300 text-sm">
                You need to allocate {remainingMarks} more marks to complete the continuous assessment plan.
              </span>
            </div>
          </div>
        )}

        {remainingMarks < 0 && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <BarChart3 className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <span className="text-red-800 dark:text-red-300 text-sm">
                Total marks exceed the allocated {assessmentPlan.continuousAssessment}%. Please adjust your assessment plan.
              </span>
            </div>
          </div>
        )}

        {remainingMarks === 0 && totalMarks > 0 && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center">
              <Target className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <span className="text-green-800 dark:text-green-300 text-sm font-medium">
                Perfect! All {assessmentPlan.continuousAssessment}% continuous assessment marks have been allocated.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Assignment Selection Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Select Assignments
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Choose assignments to include in this category
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setSelectedAssignments({});
                    setSelectedCategoryId(null);
                  }}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {loadingAssignments ? (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2">Loading assignments...</p>
                </div>
              ) : availableAssignments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 dark:text-gray-500 mb-2">
                    <FileText className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No assignments available. Click "Add new" to create one.
                  </p>
                  <button
                    onClick={() => {
                      setShowAssignmentModal(false);
                      handleAddNew(assessmentCategories.find(c => c.id === selectedCategoryId)?.category || "General Assignment");
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create New Assignment
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableAssignments.map((assignment) => (
                    <label
                      key={assignment._id}
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedAssignments[assignment._id]
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAssignments[assignment._id] || false}
                        onChange={() => handleAssignmentToggle(assignment._id)}
                        className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{assignment.title}</div>
                        {assignment.description && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {assignment.description}
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{assignment.totalPoints} points</span>
                          {assignment.dueDate && (
                            <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {Object.keys(selectedAssignments).filter(id => selectedAssignments[id]).length} assignment(s) selected
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setSelectedAssignments({});
                    setSelectedCategoryId(null);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSelectedAssignments}
                  disabled={Object.keys(selectedAssignments).filter(id => selectedAssignments[id]).length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Selected ({Object.keys(selectedAssignments).filter(id => selectedAssignments[id]).length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContinuousAssessment;
