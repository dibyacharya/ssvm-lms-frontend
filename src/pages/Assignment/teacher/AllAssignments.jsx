import React, { useState, useEffect } from "react";
import {
  Plus,
  X,
  Edit,
  Trash,
  Paperclip,
  Calendar,
  CheckCircle,
  Users,
  Award,
  ClipboardCheck,
} from "lucide-react";
import AssignmentSectionRevamp from "./CreateAssignmentNew";
import EditAssignmentForm from "./EditAssignment";
import { Link, useNavigate } from "react-router-dom";
import {
  deleteAssignment,
  getAllCourseAssignments,
} from "../../../services/assignment.service";
import LoadingSpinner from "../../../utils/LoadingAnimation";
import toast from "react-hot-toast";

// Custom Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-secondary bg-opacity-70 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-50 w-full max-w-7xl bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-tertiary" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const StatusBadge = ({ isActive }) => {
  return (
    <div
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        isActive ? "bg-green-100 text-primary" : "bg-red-100 text-red-600"
      }`}
    >
      {isActive ? "Active" : "Closed"}
    </div>
  );
};

const AssignmentCard = ({
  assignment,
  onEdit,
  onDelete,
  onGrade,
}) => {
  const {
    id,
    title,
    description,
    dueDate,
    date,
    stats,
    attachments,
    isActive,
    grade,
  } = assignment;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="p-4">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Link to={`/teacher/assignment/${id}`}>
                <h3 className="font-semibold text-lg text-primary hover:text-primary/80 transition-colors cursor-pointer truncate">
                  {title}
                </h3>
              </Link>
              <StatusBadge isActive={isActive} />
            </div>
            
            {/* Description */}
            {description && (
              <p className="text-sm text-gray-600 mt-1.5 line-clamp-1 leading-snug">
                {description.length > 100 ? `${description.substring(0, 100)}...` : description}
              </p>
            )}

            {/* Date and Due Date */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {date && (
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar size={12} className="mr-1" />
                  <span>{date}</span>
                </div>
              )}
              {dueDate && (
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar size={12} className="mr-1" />
                  <span className="font-medium">{dueDate}</span>
                </div>
              )}
              {grade && (
                <div className="flex items-center text-xs text-gray-500">
                  <Award size={12} className="mr-1" />
                  <span>{grade} pts</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Attachments Section - Compact */}
        {attachments && attachments.length > 0 && (
          <div className="mt-2 mb-3">
            <div className="flex flex-wrap gap-1.5">
              {attachments.slice(0, 3).map((attachment) => (
                <a
                  key={attachment._id}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors border border-blue-200"
                >
                  <Paperclip size={10} />
                  <span className="max-w-[100px] truncate">{attachment.name}</span>
                </a>
              ))}
              {attachments.length > 3 && (
                <span className="text-xs text-gray-500 px-2 py-1">+{attachments.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Stats and Action Buttons on Single Line */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          {/* Stats - Horizontal Layout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-green-600" />
              <span className="text-sm font-semibold text-green-700">
                {stats?.turnedIn || 0}
              </span>
              <span className="text-xs text-gray-500">Turned in</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">
                {stats?.assigned || 0}
              </span>
              <span className="text-xs text-gray-500">Assigned</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Award size={14} className="text-amber-600" />
              <span className="text-sm font-semibold text-amber-700">
                {stats?.graded || 0}
              </span>
              <span className="text-xs text-gray-500">Graded</span>
            </div>

            {/* Status Badge */}
            {isActive ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-700 bg-green-50 rounded-full border border-green-200">
                <CheckCircle size={10} />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-red-700 bg-red-50 rounded-full border border-red-200">
                <X size={10} />
                Closed
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onGrade(id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
            >
              <ClipboardCheck size={14} />
              Grade
            </button>
            <button
              onClick={() => onEdit(id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <Edit size={14} />
              Edit
            </button>
            <button
              onClick={() => onDelete(id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            >
              <Trash size={14} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AllAssignments = ({ courseID }) => {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch assignments from API
  const fetchAssignments = async () => {
    if (!courseID) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getAllCourseAssignments({ courseID });
      const courseAssignments = response.assignments || [];

      // Map to the format expected by the component
      const formattedAssignments = courseAssignments.map((assignment) => ({
        id: assignment._id,
        title: assignment.title,
        description: assignment.description,
        courseId: assignment.course,
        dueDate: assignment.dueDate
          ? `Due ${new Date(assignment.dueDate).toLocaleDateString()}`
          : "",
        originalDueDate: assignment.dueDate,
        date: assignment.createdAt
          ? `Posted ${new Date(assignment.createdAt).toLocaleDateString()}`
          : "",
        stats: {
          turnedIn: assignment.stats?.turnedIn || 0,
          assigned: assignment.stats?.assigned || assignment.stats?.total || 0,
          graded: assignment.stats?.graded || 0,
        },
        attachments: assignment.attachments || [],
        grade: assignment.totalPoints || 100,
        allowLateSubmissions: assignment.allowLateSubmissions !== false,
        topic: assignment.description
          ? assignment.description.substring(0, 20) + "..."
          : "N/A",
        isActive: assignment.isActive !== false,
      }));

      setAssignments(formattedAssignments);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      const errorMessage = err.response?.data?.message || "Failed to load assignments. Please try again later.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseID) {
      fetchAssignments();
    }
  }, [courseID]);

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (assignment) => {
    setCurrentAssignment(assignment);
    setIsEditModalOpen(true);
  };

  const handleEdit = (assignmentId) => {
    const assignmentToEdit = assignments.find((a) => a.id === assignmentId);
    if (assignmentToEdit) {
      handleOpenEditModal(assignmentToEdit);
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm("Are you sure you want to delete this assignment? This action cannot be undone.")) {
      return;
    }
    
    try {
      await deleteAssignment(assignmentId);
      await fetchAssignments();
    } catch (error) {
      // Error is already handled in the service with toast
      console.error("Error deleting assignment:", error);
    }
  };

  const handleGrade = (assignmentId) => {
    // Navigate to grading page
    navigate(`/teacher/assignment/${assignmentId}/grade`);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-lg bg-red-50 text-red-600 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 md:px-[15%] rounded-lg shadow-sm">
      <div className="px-6 py-5 border-b border-gray-200 bg-white rounded-t-lg">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">Assignments</h2>
            <p className="text-sm text-gray-600 max-w-2xl">
              Manage and track all course assignments. Create new assignments, view submission statistics, grade student work, and monitor assignment progress.
            </p>
          </div>
          {!isCreateModalOpen && (
            <button
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
              onClick={handleOpenCreateModal}
            >
              <Plus size={18} />
              New Assignment
            </button>
          )}
        </div>
      </div>

      {/* Create Assignment Form - Displayed below nav */}
      {isCreateModalOpen && (
        <div className="bg-white">
          <AssignmentSectionRevamp
            courseID={courseID}
            inModal={false}
            onSave={(data) => {
              console.log('Assignment saved:', data);
              // Refresh assignments from API
              fetchAssignments();
              setIsCreateModalOpen(false);
            }}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </div>
      )}

      {/* Edit Assignment Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Assignment"
      >
        {currentAssignment && (
          <EditAssignmentForm
            assignment={currentAssignment}
            courseID={courseID}
            onClose={() => setIsEditModalOpen(false)}
            fetchAssignments={fetchAssignments}
          />
        )}
      </Modal>

      {!isCreateModalOpen && (
        <div className="p-6">
        {assignments.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center border border-gray-100">
            <div className="text-lg text-tertiary">
              No assignments found for this course.
            </div>
            <button
              className="mt-4 inline-flex items-center gap-2 text-primary hover:text-primary/90 font-medium"
              onClick={handleOpenCreateModal}
            >
              <Plus size={18} />
              Create your first assignment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-1">
            {assignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onGrade={handleGrade}
              />
            ))}
          </div>
        )}
        </div>
      )}
    </div>
  );
};

export default AllAssignments;
