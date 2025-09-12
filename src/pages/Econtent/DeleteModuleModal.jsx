import React, { useState } from "react";
import { XIcon } from "lucide-react";
import { deleteEContent } from "../../services/econtent.service";

const DeleteConfirmationModal = ({
  show,
  onClose,
  courseId,
  module,
  onModuleDeleted,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);

      await deleteEContent(courseId, module._id);

      // Notify parent component
      if (onModuleDeleted) onModuleDeleted();

      // Close modal
      onClose();
    } catch (err) {
      console.error("Error deleting module:", err);
      setError("Failed to delete module. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!show || !module) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white rounded-lg w-11/12 max-w-md">
        <div className="flex justify-between items-center p-4 border-b bg-red-600 text-white rounded-t-lg">
          <h3 className="font-semibold text-lg">Delete Module</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <XIcon size={24} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="mb-6">
            <p className="text-gray-700 mb-2">
              Are you sure you want to delete this module?
            </p>
            <div className="p-3 bg-gray-100 rounded-md">
              <p className="font-medium">
                Module {module.moduleNumber}: {module.moduleTitle}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {module.files?.length || 0} file(s) •
                {Array.isArray(module.link)
                  ? ` ${module.link.length} link(s)`
                  : module.link
                  ? " 1 link"
                  : " 0 links"}
              </p>
            </div>
            <p className="text-red-600 text-sm mt-4">
              This action cannot be undone. All files and links associated with
              this module will be permanently deleted.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Module"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
