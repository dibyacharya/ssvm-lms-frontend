import React, { useState, useEffect } from "react";
import {
  Plus,
  MoreVertical,
  X,
  Edit,
  Trash,
  Paperclip,
  Calendar,
  CheckCircle,
  Users,
  Award,
} from "lucide-react";
import AssignmentForm from "./CreateAssignment";
import EditAssignmentForm from "./EditAssignment";
import { Link } from "react-router-dom";
import {
  deleteAssignment,
  getAllCourseAssignments,
} from "../../../services/assignment.service";
import LoadingSpinner from "../../../utils/LoadingAnimation";

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
  onMenuClick,
  openMenuId,
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
  } = assignment;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <Link to={`/teacher/assignment/${id}`}>
                <h3 className="font-semibold text-lg text-primary hover:text-primary transition-colors">
                  {title}
                </h3>
              </Link>
              <StatusBadge isActive={isActive} />
            </div>
            <p className="text-sm text-tertiary mt-1">{date}</p>
            {dueDate && (
              <div className="flex items-center text-sm text-tertiary mt-1">
                <Calendar size={14} className="mr-1" />
                {dueDate}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              className="text-tertiary hover:text-primary p-1 rounded-full hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                onMenuClick(id, e);
              }}
            >
              <MoreVertical size={16} />
            </button>

            {openMenuId === id && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-20">
                <button
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-primary hover:bg-gray-50 transition-colors"
                  onClick={() => onEdit(id)}
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-red-600 hover:bg-gray-50 transition-colors"
                  onClick={() => onDelete(id)}
                >
                  <Trash size={16} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50">
              <div className="flex items-center gap-1">
                <CheckCircle size={16} className="text-primary" />
                <span className="text-lg font-semibold text-primary">
                  {stats.turnedIn}
                </span>
              </div>
              <div className="text-xs text-tertiary mt-1">Turned in</div>
            </div>

            <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50">
              <div className="flex items-center gap-1">
                <Users size={16} className="text-blue-500" />
                <span className="text-lg font-semibold text-primary">
                  {stats.assigned}
                </span>
              </div>
              <div className="text-xs text-tertiary mt-1">Assigned</div>
            </div>

            <div className="flex flex-col items-center p-2 rounded-lg bg-gray-50">
              <div className="flex items-center gap-1">
                <Award size={16} className="text-amber-500" />
                <span className="text-lg font-semibold text-primary">
                  {stats.graded}
                </span>
              </div>
              <div className="text-xs text-tertiary mt-1">Graded</div>
            </div>
          </div>
        </div>

        {/* Attachments Section */}
        {attachments && attachments.length > 0 && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="text-sm font-medium text-primary mb-2">
              Attachments
            </div>
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <a
                  key={attachment._id}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <Paperclip size={14} className="mr-1" />
                  {attachment.name}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 text-xs text-right">
          {isActive ? (
            <span className="text-primary">Late submission allowed</span>
          ) : (
            <span className="text-red-500">Late submission closed</span>
          )}
        </div>
      </div>
    </div>
  );
};

const AllAssignments = ({ courseID }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch assignments from API
  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      const data = await getAllCourseAssignments({ courseID });

      // Map API data to the format expected by the component
      const formattedAssignments = data.assignments.map((assignment) => ({
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
          turnedIn: assignment.submissions ? assignment.submissions.length : 0,
          assigned: 40, // Placeholder - will be available later
          graded: assignment.submissions
            ? assignment.submissions.filter((sub) => sub.grade).length
            : 0,
        },
        attachments: assignment.attachments || [],
        grade: assignment.totalPoints || 100,
        allowLateSubmissions: assignment.isActive,
        topic: assignment.description
          ? assignment.description.substring(0, 20) + "..."
          : "N/A",
        isActive: assignment.isActive,
      }));

      setAssignments(formattedAssignments);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("Failed to load assignments. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [courseID]);

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (assignment) => {
    setCurrentAssignment(assignment);
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const handleMoreClick = (assignmentId, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === assignmentId ? null : assignmentId);
  };

  const handleEdit = (assignmentId) => {
    const assignmentToEdit = assignments.find((a) => a.id === assignmentId);
    if (assignmentToEdit) {
      handleOpenEditModal(assignmentToEdit);
    }
  };

  const handleDelete = async (assignmentId) => {
    await deleteAssignment(assignmentId);
    await fetchAssignments();
    setOpenMenuId(null);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-primary">Assignments</h2>
          <button
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm"
            onClick={handleOpenCreateModal}
          >
            <Plus size={18} />
            New Assignment
          </button>
        </div>
      </div>

      {/* Create Assignment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Assignment"
      >
        <AssignmentForm
          courseID={courseID}
          fetchAssignments={fetchAssignments}
        />
      </Modal>

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
                onMenuClick={handleMoreClick}
                openMenuId={openMenuId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllAssignments;
