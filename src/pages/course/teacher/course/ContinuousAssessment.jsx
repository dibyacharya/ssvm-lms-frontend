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
  FileText,
  Eye,
  CheckCircle,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { getAllCourseAssignments } from "../../../../services/assignment.service";
import CreateAssignmentNew from "../../../Assignment/teacher/CreateAssignmentNew";
import {
  getContinuousAssessmentPlan,
  createContinuousAssessmentCategory,
  updateContinuousAssessmentCategory,
  deleteContinuousAssessmentCategory,
  bulkUpdateContinuousAssessmentPlan,
  getAssessmentPlan,
  getCAConfig,
} from "../../../../services/course.service";
import toast from "react-hot-toast";
import LoadingSpinner from "../../../../utils/LoadingAnimation";

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
        <span className="px-2.5 py-1 text-xs font-bold text-white bg-white/20 rounded-full backdrop-blur-sm">{count}</span>
      )}
    </div>
  </div>
);

const normalizeCalculationMethod = (method) => {
  if (method === "Average of Best of n") {
    return "Average of the Best 'n'";
  }
  return method;
};

const isNDerivedFromNumber = (method) => {
  const normalizedMethod = normalizeCalculationMethod(method);
  return normalizedMethod === "Average of all" || normalizedMethod === "Sum of all";
};

// Ordinal helper: 1→1st, 2→2nd, 3→3rd, 4→4th, etc.
const getOrdinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const ContinuousAssessment = ({ mode = "plan", readOnly = false }) => {
  const { courseID } = useParams();
  const isAssessmentMode = mode === "assessment";
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
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [currentCategoryEachMarks, setCurrentCategoryEachMarks] = useState(0);
  const [currentCategoryName, setCurrentCategoryName] = useState('');
  const [currentAssignmentIndex, setCurrentAssignmentIndex] = useState(1);
  // (sessionCreatedCount removed — we derive the index from category.selectedAssignments.length)
  // View-only modal for category-specific assignments
  const [showViewAssignmentsModal, setShowViewAssignmentsModal] = useState(false);
  const [viewCategoryAssignments, setViewCategoryAssignments] = useState([]);
  const [viewCategoryName, setViewCategoryName] = useState('');

  // Config fetched from backend — no hardcoding
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [calculationOptions, setCalculationOptions] = useState([]);
  const [categoryConfig, setCategoryConfig] = useState({});
  // Default category name derived from config (first available)
  const defaultCategoryName = categoryOptions.length > 0 ? categoryOptions[0] : "General Assignment";
  // Default calculation method derived from config (first available)
  const defaultCalcMethod = calculationOptions.length > 0 ? calculationOptions[0] : "Average of all";

  // Load data from backend on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!courseID) return;

      try {
        setLoading(true);

        // Fetch CA config (category types, calculation methods, category→assignmentType mapping)
        try {
          const config = await getCAConfig();
          if (config) {
            if (config.categoryTypes && config.categoryTypes.length > 0) {
              setCategoryOptions(config.categoryTypes);
            }
            if (config.calculationMethods && config.calculationMethods.length > 0) {
              // Normalize: frontend uses "Average of the Best 'n'" format
              const normalized = config.calculationMethods
                .map(m => normalizeCalculationMethod(m))
                .filter((v, i, arr) => arr.indexOf(v) === i); // deduplicate after normalization
              setCalculationOptions(normalized);
            }
            if (config.categoryConfig) {
              setCategoryConfig(config.categoryConfig);
            }
          }
        } catch (configErr) {
          console.warn("Could not fetch CA config, using defaults:", configErr);
        }

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
          const formattedCategories = categories.map(cat => {
            const normalizedMethod = normalizeCalculationMethod(cat.calculationMethod);
            const numberValue = parseInt(cat.number, 10) || 1;
            const nValue = isNDerivedFromNumber(normalizedMethod)
              ? numberValue
              : (parseInt(cat.n, 10) || 1);

            return {
              id: cat._id,
              _id: cat._id,
              category: cat.category,
              number: cat.number,
              eachMarks: cat.eachMarks,
              calculationMethod: normalizedMethod,
              n: nValue,
              totalMarks: cat.totalMarks,
              selectedAssignments: cat.selectedAssignments || [],
              assignmentDetails: cat.selectedAssignments || [] // Backend populates this
            };
          });
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

  useEffect(() => {
    if (isAssessmentMode) {
      setIsEditing(false);
    }
  }, [isAssessmentMode]);

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
        category: defaultCategoryName,
        number: 1,
        eachMarks: 10,
        calculationMethod: defaultCalcMethod,
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

    const normalizedValue =
      field === "calculationMethod" ? normalizeCalculationMethod(value) : value;
    const updated = { ...category, [field]: normalizedValue };

    // Recalculate total marks based on calculation method
    let totalMarks = 0;
    const num = parseInt(updated.number, 10) || 0;
    const eachMarks = parseInt(updated.eachMarks, 10) || 0;

    if (isNDerivedFromNumber(updated.calculationMethod)) {
      updated.n = num;
    }

    const n = parseInt(updated.n, 10) || 0;

    switch (updated.calculationMethod) {
      case "Average of all":
        totalMarks = eachMarks;
        break;
      case "Sum of all":
        totalMarks = num * eachMarks;
        break;
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
        [field]: normalizedValue,
        n: updated.n,
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
    if (readOnly) return;
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // Convert frontend format to backend format
      const categoriesToSave = assessmentCategories.map(cat => {
        const normalizedMethod = normalizeCalculationMethod(cat.calculationMethod);
        const numberValue = parseInt(cat.number, 10) || 1;
        const nValue = isNDerivedFromNumber(normalizedMethod)
          ? numberValue
          : (parseInt(cat.n, 10) || 1);

        return {
          _id: cat._id || cat.id,
          category: cat.category,
          number: cat.number,
          eachMarks: cat.eachMarks,
          calculationMethod: normalizedMethod,
          n: nValue,
          totalMarks: cat.totalMarks,
          selectedAssignments: Array.isArray(cat.selectedAssignments)
            ? cat.selectedAssignments.map(a => typeof a === 'string' ? a : a._id || a.id)
            : []
        };
      });

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
        const formattedCategories = categories.map(cat => {
          const normalizedMethod = normalizeCalculationMethod(cat.calculationMethod);
          const numberValue = parseInt(cat.number, 10) || 1;
          const nValue = isNDerivedFromNumber(normalizedMethod)
            ? numberValue
            : (parseInt(cat.n, 10) || 1);

          return {
            id: cat._id,
            _id: cat._id,
            category: cat.category,
            number: cat.number,
            eachMarks: cat.eachMarks,
            calculationMethod: normalizedMethod,
            n: nValue,
            totalMarks: cat.totalMarks,
            selectedAssignments: cat.selectedAssignments || []
          };
        });
        setAssessmentCategories(formattedCategories);
      } else {
        setAssessmentCategories([]);
      }
    } catch (error) {
      console.error("Error reloading data:", error);
    }
    setIsEditing(false);
  };

  // Fetch assignments for selection - returns filtered list
  const fetchAssignments = async (categoryType) => {
    if (!courseID) return [];

    try {
      setLoadingAssignments(true);
      const response = await getAllCourseAssignments({ courseID });
      const assignments = response.assignments || [];

      // Collect assignment IDs already selected by OTHER categories
      const currentCategory = assessmentCategories.find(c => c.category === categoryType);
      const currentCategorySelectedIds = new Set(
        (currentCategory?.selectedAssignments || []).map(id =>
          (typeof id === 'string' ? id : (id._id || id.id))?.toString()
        )
      );
      const otherCategorySelectedIds = new Set();
      assessmentCategories.forEach(cat => {
        if (cat.category !== categoryType && cat.selectedAssignments) {
          cat.selectedAssignments.forEach(id => {
            const idStr = (typeof id === 'string' ? id : (id._id || id.id))?.toString();
            if (idStr) otherCategorySelectedIds.add(idStr);
          });
        }
      });

      // Derive assignment type from backend config — no hardcoded category name checks
      const configEntry = categoryConfig[categoryType];
      const expectedType = configEntry?.assignmentType || (categoryType.toLowerCase().includes("objective") ? "objective" : "subjective");

      // Filter assignments based on category's assignment type
      let filteredAssignments = assignments.filter(assignment => {
        const questions = assignment.questions || [];
        const id = assignment._id?.toString();
        // Check if assignment matches the category's expected type
        const matchesType = questions.some(q => q.type === expectedType);
        // Exclude assignments already selected by OTHER categories (but keep current category's own)
        const notTakenByOther = !otherCategorySelectedIds.has(id) || currentCategorySelectedIds.has(id);
        return matchesType && notTakenByOther;
      });

      setAvailableAssignments(filteredAssignments);
      return filteredAssignments;
    } catch (error) {
      console.error("Error fetching assignments:", error);
      return [];
    } finally {
      setLoadingAssignments(false);
    }
  };

  // Handle category selection change
  const handleCategoryChange = (id, value) => {
    updateCategory(id, 'category', value);
    // Category updated — modal will be shown when user clicks on the row actions
  };

  // Handle slot click — open CreateAssignmentNew wizard for a specific slot
  // Uses category ID (not name) to avoid duplicate-name bugs
  const handleAddNew = (catId, slotIndex) => {
    const category = assessmentCategories.find(c => (c._id || c.id) === catId);
    if (!category) return;

    const categoryType = category.category;
    const existingCount = (category?.selectedAssignments?.length) || 0;
    const maxAllowed = parseInt(category?.number, 10) || 0;

    // Block if this slot is already filled
    if (slotIndex <= existingCount) {
      return; // already created
    }
    // Block if beyond max
    if (maxAllowed > 0 && slotIndex > maxAllowed) {
      return;
    }

    // Store category metadata for passing to backend when creating assignments
    setCurrentCategoryId(catId);
    setCurrentCategoryEachMarks(category?.eachMarks || 0);
    setCurrentCategoryName(categoryType);
    setCurrentAssignmentIndex(slotIndex);
    // Derive assignment type from backend config — no hardcoding
    const configEntry = categoryConfig[categoryType];
    const assignmentType = configEntry?.assignmentType || (categoryType.toLowerCase().includes("objective") ? "objective" : "subjective");
    setCreateAssignmentType(assignmentType);
    setIsCreatingAssignment(true);
  };

  // Handle back from create assignment
  const handleBackFromCreate = () => {
    setIsCreatingAssignment(false);
    setCreateAssignmentType('subjective');
    setCurrentCategoryId(null);
    setCurrentCategoryEachMarks(0);
    setCurrentCategoryName('');
    setCurrentAssignmentIndex(1);
  };

  // Handle assignment saved from CreateAssignmentNew wizard
  const handleAssignmentSaved = async (createdAssignment) => {
    toast.success("Assignment created successfully!");
    setIsCreatingAssignment(false);
    setCurrentCategoryId(null);
    setCurrentCategoryEachMarks(0);
    setCurrentCategoryName('');
    setCurrentAssignmentIndex(1);

    // Refresh CA categories to reflect newly linked assignments
    try {
      const categories = await getContinuousAssessmentPlan(courseID);
      if (categories && categories.length > 0) {
        const formattedCategories = categories.map(cat => {
          const normalizedMethod = normalizeCalculationMethod(cat.calculationMethod);
          const numberValue = parseInt(cat.number, 10) || 1;
          const nValue = isNDerivedFromNumber(normalizedMethod)
            ? numberValue
            : (parseInt(cat.n, 10) || 1);
          return {
            id: cat._id,
            _id: cat._id,
            category: cat.category,
            number: cat.number,
            eachMarks: cat.eachMarks,
            calculationMethod: normalizedMethod,
            n: nValue,
            totalMarks: cat.totalMarks,
            selectedAssignments: cat.selectedAssignments || [],
            assignmentDetails: cat.selectedAssignments || []
          };
        });
        setAssessmentCategories(formattedCategories);
      }
    } catch (refreshError) {
      console.error("Error refreshing categories:", refreshError);
    }
  };

  // Handle "Select" button click
  const handleSelect = async (id, categoryType) => {
    setSelectedCategoryId(id);
    const fetchedList = await fetchAssignments(categoryType);
    setShowAssignmentModal(true);

    // Load previously selected assignments for this category
    // Only pre-select assignments that are actually available in the fetched list
    const category = assessmentCategories.find(cat => cat.id === id || cat._id === id);
    if (category?.selectedAssignments) {
      const availableIds = new Set((fetchedList || []).map(a => (a._id || a.id).toString()));
      const selected = {};
      category.selectedAssignments.forEach(assignmentId => {
        const aId = typeof assignmentId === 'string' ? assignmentId : assignmentId._id || assignmentId.id;
        const aIdStr = aId?.toString();
        // Only pre-select if assignment exists in the available list
        if (aIdStr && availableIds.has(aIdStr)) {
          selected[aIdStr] = true;
        }
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

  // Handle "View All Assignments" for non-standard categories
  const handleViewCategoryAssignments = async (category) => {
    if (!courseID) return;
    setViewCategoryName(category.category);
    setShowViewAssignmentsModal(true);
    setLoadingAssignments(true);
    try {
      const response = await getAllCourseAssignments({ courseID });
      const allAssignments = response.assignments || [];
      const selectedIds = (category.selectedAssignments || []).map(id =>
        typeof id === 'string' ? id : (id._id || id.id)?.toString()
      );
      const filtered = allAssignments.filter(a =>
        selectedIds.includes(a._id?.toString())
      );
      setViewCategoryAssignments(filtered);
    } catch (error) {
      console.error("Error fetching category assignments:", error);
      setViewCategoryAssignments([]);
    } finally {
      setLoadingAssignments(false);
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

  // If creating assignment, show the full CreateAssignmentNew wizard
  if (isCreatingAssignment) {
    return (
      <CreateAssignmentNew
        onBack={handleBackFromCreate}
        onSave={handleAssignmentSaved}
        courseID={courseID}
        assignmentType={createAssignmentType}
        categoryRef={currentCategoryId}
        configuredMarks={currentCategoryEachMarks}
        categoryName={currentCategoryName}
        assignmentIndex={currentAssignmentIndex}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header - Gradient Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 shadow-lg">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-6 right-20 w-24 h-24 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2" />
        <div className="relative z-10 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-purple-900/20">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {isAssessmentMode ? "Continuous Assessment" : "Continuous Assessments Plan"}
              </h2>
              <p className="text-white/70 mt-0.5 text-sm">
                {isAssessmentMode
                  ? "Create and map assignments using your configured assessment plan"
                  : "Plan and configure assessment categories for your course"}
              </p>
            </div>
          </div>
          {!readOnly && (
            !isAssessmentMode && !isEditing ? (
              <button
                onClick={handleEdit}
                className="inline-flex items-center px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all shadow-lg shadow-purple-900/10 font-semibold border border-white/20"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Plan
              </button>
            ) : !isAssessmentMode ? (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all font-semibold border border-white/20"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-5 py-2.5 bg-white text-purple-700 rounded-xl hover:bg-white/90 transition-all shadow-lg font-semibold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </button>
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* Assessment Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Section Header with Gradient */}
        <div className="relative overflow-hidden px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
          <div className="absolute -bottom-4 right-12 w-12 h-12 bg-white/5 rounded-full" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">Continuous Assessment</h2>
            </div>
            <div className="flex items-center gap-3">
              {/* Allocated marks gradient pill */}
              <span className="px-3 py-1.5 text-xs font-bold text-white bg-white/20 rounded-full backdrop-blur-sm">
                {totalMarks}/{assessmentPlan.continuousAssessment} marks
              </span>
              {remainingMarks > 0 && (
                <span className="px-3 py-1.5 text-xs font-bold text-yellow-100 bg-yellow-500/30 rounded-full backdrop-blur-sm">
                  +{remainingMarks} needed
                </span>
              )}
              {remainingMarks < 0 && (
                <span className="px-3 py-1.5 text-xs font-bold text-red-100 bg-red-500/30 rounded-full backdrop-blur-sm">
                  -{Math.abs(remainingMarks)} over
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 mb-4 px-3 py-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-700/30 border border-gray-200/60 dark:border-gray-600/40">
            <div className="font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider flex items-center">Category</div>
            <div className="font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider flex items-center">Number</div>
            <div className="font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider flex items-center">Each of Marks</div>
            <div className="font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider flex items-center">Marks Calculation Based on</div>
            <div className="font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider flex items-center">n</div>
            <div className="font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider flex items-center">Total Marks</div>
          </div>

          {/* Assessment Rows */}
          {assessmentCategories.length === 0 && !isEditing ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {readOnly
                ? "No assessment categories have been configured for this course yet."
                : isAssessmentMode
                  ? "No assessment categories configured yet. First complete your plan in Continuous Assessment Plan."
                  : 'No assessment categories configured yet. Click "Edit Plan" to add categories.'}
            </div>
          ) : (
            <div className="space-y-2">
              {assessmentCategories.map((category, index) => (
                <div key={category.id || category._id} className="py-3 px-3 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 rounded-lg transition-all duration-200 border border-gray-100 dark:border-gray-700/50 hover:border-indigo-200 dark:hover:border-indigo-800/50 hover:shadow-sm">
                  <div className="grid grid-cols-6 gap-4 items-start">
                  {/* Category Dropdown */}
                  <div className="flex items-start">
                    {isEditing && !isAssessmentMode ? (
                      <div className="w-full">
                        <select
                          value={category.category}
                          onChange={(e) => handleCategoryChange(category.id || category._id, e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          {categoryOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col">
                        <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">{category.category}</span>
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
                        value={isNDerivedFromNumber(category.calculationMethod) ? category.number : category.n}
                        onChange={(e) => updateCategory(category.id || category._id, 'n', e.target.value)}
                        disabled={isNDerivedFromNumber(category.calculationMethod)}
                        className={`w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white ${
                          isNDerivedFromNumber(category.calculationMethod)
                            ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                            : "bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        }`}
                        min="1"
                      />
                    ) : (
                      <span className="text-gray-800 dark:text-gray-200 text-sm w-full">
                        {isNDerivedFromNumber(category.calculationMethod) ? category.number : category.n}
                      </span>
                    )}
                  </div>

                  {/* Total Marks Display */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800 dark:text-gray-200 font-semibold text-sm">{category.totalMarks}</span>
                    {isEditing && !readOnly && (
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
                  {/* Slot-based assignment creation + View */}
                  {isAssessmentMode && (
                    <div className="mt-3">
                      {/* Assignment Slots — one per number */}
                      {(() => {
                        const catId = category._id || category.id;
                        const totalSlots = parseInt(category?.number, 10) || 0;
                        const existingCount = (category?.selectedAssignments?.length) || 0;
                        const allCreated = totalSlots > 0 && existingCount >= totalSlots;

                        return (
                          <>
                            <div className="flex flex-row flex-wrap items-center gap-2">
                              {Array.from({ length: totalSlots }, (_, i) => {
                                const slotIndex = i + 1;
                                const isCreated = slotIndex <= existingCount;
                                // Only the NEXT uncreated slot is clickable (sequential creation)
                                const isNextSlot = slotIndex === existingCount + 1;

                                return (
                                  <button
                                    key={slotIndex}
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (!readOnly && !isCreated && isNextSlot) {
                                        handleAddNew(catId, slotIndex);
                                      }
                                    }}
                                    disabled={readOnly || isCreated || !isNextSlot}
                                    className={`px-3 py-1.5 rounded-lg transition-all text-xs font-medium flex items-center gap-1.5 ${
                                      isCreated
                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                                        : readOnly
                                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-600 cursor-not-allowed'
                                          : isNextSlot
                                            ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm shadow-blue-500/25 hover:shadow-md cursor-pointer'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-600 cursor-not-allowed'
                                    }`}
                                    title={
                                      isCreated
                                        ? `${getOrdinal(slotIndex)} ${category.category} — Created`
                                        : readOnly
                                          ? `${getOrdinal(slotIndex)} ${category.category} — Not created yet`
                                          : isNextSlot
                                            ? `Create ${getOrdinal(slotIndex)} ${category.category}`
                                            : `Complete ${getOrdinal(slotIndex - 1)} first`
                                    }
                                  >
                                    {isCreated ? (
                                      <CheckCircle className="w-3.5 h-3.5" />
                                    ) : !readOnly && isNextSlot ? (
                                      <Plus className="w-3.5 h-3.5" />
                                    ) : (
                                      <span className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-500 inline-block" />
                                    )}
                                    <span>{getOrdinal(slotIndex)} {category.category}</span>
                                  </button>
                                );
                              })}

                              {/* View All Assignments */}
                              {!readOnly && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleViewCategoryAssignments(category);
                                }}
                                className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 text-xs font-medium"
                                title="View All Assignments"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View</span>
                              </button>
                              )}
                            </div>

                            {/* Progress indicator */}
                            {totalSlots > 0 && (
                              <div className="mt-2 flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${allCreated ? 'bg-green-500' : 'bg-blue-500'}`}
                                    style={{ width: `${Math.min((existingCount / totalSlots) * 100, 100)}%` }}
                                  />
                                </div>
                                <span className={`text-xs font-medium ${allCreated ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                  {existingCount}/{totalSlots}
                                </span>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add More Category Button */}
          {isEditing && !readOnly && (
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
      </div>

      {/* Summary Card with Gradient Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <SectionHeader
          icon={Calculator}
          title="Continuous Assessment Summary"
          gradient="bg-gradient-to-r from-emerald-500 to-green-600"
        />
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Total marks allocated: {totalMarks}/{assessmentPlan.continuousAssessment}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{totalMarks}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">of {assessmentPlan.continuousAssessment}% allocated</div>
            </div>
          </div>

          {remainingMarks > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg border-l-4 border-l-yellow-500">
              <div className="flex items-center">
                <Target className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                <span className="text-yellow-800 dark:text-yellow-300 text-sm">
                  You need to allocate {remainingMarks} more marks to complete the continuous assessment plan.
                </span>
              </div>
            </div>
          )}

          {remainingMarks < 0 && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg border-l-4 border-l-red-500">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                <span className="text-red-800 dark:text-red-300 text-sm">
                  Total marks exceed the allocated {assessmentPlan.continuousAssessment}%. Please adjust your assessment plan.
                </span>
              </div>
            </div>
          )}

          {remainingMarks === 0 && totalMarks > 0 && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg border-l-4 border-l-green-500">
              <div className="flex items-center">
                <Target className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-green-800 dark:text-green-300 text-sm font-medium">
                  Perfect! All {assessmentPlan.continuousAssessment}% continuous assessment marks have been allocated.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Selection Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col overflow-hidden">
            {/* Modal Gradient Header */}
            <div className="relative overflow-hidden px-6 py-5 bg-gradient-to-r from-sky-500 to-blue-600">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
              <div className="absolute -bottom-4 right-12 w-12 h-12 bg-white/5 rounded-full" />
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Select Assignments
                  </h3>
                  <p className="text-sm text-white/70 mt-1">
                    Choose assignments to include in this category
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAssignmentModal(false);
                    setSelectedAssignments({});
                    setSelectedCategoryId(null);
                  }}
                  className="text-white/70 hover:text-white transition-colors p-1.5 hover:bg-white/20 rounded-lg"
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
                      const cat = assessmentCategories.find(c => c.id === selectedCategoryId || c._id === selectedCategoryId);
                      if (cat) {
                        const catId = cat._id || cat.id;
                        const nextSlot = (cat.selectedAssignments?.length || 0) + 1;
                        handleAddNew(catId, nextSlot);
                      }
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

      {/* View-only modal for category-specific assignments */}
      {showViewAssignmentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] flex flex-col overflow-hidden">
            <div className="relative overflow-hidden px-6 py-5 bg-gradient-to-r from-purple-500 to-indigo-600">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
              <div className="absolute -bottom-4 right-12 w-12 h-12 bg-white/5 rounded-full" />
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {viewCategoryName} - Assignments
                  </h3>
                  <p className="text-sm text-white/70 mt-1">
                    Assignments linked to this category
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowViewAssignmentsModal(false);
                    setViewCategoryAssignments([]);
                    setViewCategoryName('');
                  }}
                  className="text-white/70 hover:text-white transition-colors p-1.5 hover:bg-white/20 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingAssignments ? (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-2">Loading assignments...</p>
                </div>
              ) : viewCategoryAssignments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 dark:text-gray-500 mb-2">
                    <FileText className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    No assignments linked to this category yet. Use "Select Assignments" to link assignments.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {viewCategoryAssignments.map((assignment) => (
                    <div
                      key={assignment._id}
                      className="flex items-start gap-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                    >
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
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => {
                  setShowViewAssignmentsModal(false);
                  setViewCategoryAssignments([]);
                  setViewCategoryName('');
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContinuousAssessment;
