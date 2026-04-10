import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Clock,
  User,
  BookOpen,
} from "lucide-react";
import { useParams } from "react-router-dom";
import {
  getHandouts,
  createHandout,
  updateHandout,
  deleteHandout,
} from "../../../../services/handout.service";
import LoadingSpinner from "../../../../utils/LoadingAnimation";

const Handouts = () => {
  const { courseID } = useParams();
  const [handouts, setHandouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchHandouts = async () => {
    try {
      setLoading(true);
      const data = await getHandouts(courseID);
      setHandouts(data);
    } catch (err) {
      console.error("Failed to fetch handouts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseID) fetchHandouts();
  }, [courseID]);

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) return;
    try {
      setSaving(true);
      const newHandout = await createHandout(courseID, formData);
      setHandouts((prev) => [...prev, newHandout]);
      setFormData({ title: "", content: "" });
      setShowForm(false);
      showSuccess("Handout created successfully!");
    } catch (err) {
      console.error("Failed to create handout:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.title.trim() || !editingId) return;
    try {
      setSaving(true);
      const updated = await updateHandout(editingId, formData);
      setHandouts((prev) =>
        prev.map((h) => (h._id === editingId ? updated : h))
      );
      setFormData({ title: "", content: "" });
      setEditingId(null);
      setShowForm(false);
      showSuccess("Handout updated successfully!");
    } catch (err) {
      console.error("Failed to update handout:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this handout?")) return;
    try {
      await deleteHandout(id);
      setHandouts((prev) => prev.filter((h) => h._id !== id));
      showSuccess("Handout deleted successfully!");
    } catch (err) {
      console.error("Failed to delete handout:", err);
    }
  };

  const startEdit = (handout) => {
    setEditingId(handout._id);
    setFormData({ title: handout.title, content: handout.content || "" });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: "", content: "" });
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white relative -top-6 w-full mx-auto p-4 min-h-[400px]">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-xl mb-6 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 shadow-lg">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -bottom-6 right-20 w-20 h-20 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/5 rounded-full" />
        <div className="relative z-10 px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-gray-900" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  Handouts
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                  Create and manage class handouts for students
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setFormData({ title: "", content: "" });
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-gray-900 rounded-lg hover:bg-white/30 transition-all border border-white/30"
            >
              <Plus className="w-5 h-5" />
              New Handout
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg shadow-sm">
          <p className="text-blue-800 dark:text-blue-300 font-medium flex items-center">
            <Save className="mr-2 h-5 w-5 text-blue-500" />
            {successMessage}
          </p>
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div className="mb-6 bg-gray-50 dark:bg-gray-50 rounded-xl p-6 border border-gray-200 dark:border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-900">
              {editingId ? "Edit Handout" : "New Handout"}
            </h3>
            <button
              onClick={cancelForm}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-600 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter handout title..."
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-300 rounded-lg bg-white dark:bg-white text-gray-900 dark:text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-600 mb-1">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                rows={8}
                placeholder="Write your handout content here..."
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-300 rounded-lg bg-white dark:bg-white text-gray-900 dark:text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelForm}
                className="px-4 py-2 border border-gray-300 dark:border-gray-300 rounded-lg text-gray-700 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingId ? handleUpdate : handleCreate}
                disabled={saving || !formData.title.trim()}
                className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-500 text-gray-900 rounded-lg hover:from-blue-600 hover:to-blue-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Handouts List */}
      {handouts.length === 0 ? (
        <div className="flex justify-center items-center py-16">
          <div className="p-8 bg-white dark:bg-white rounded-xl shadow-md border border-gray-200 dark:border-gray-200 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/30 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-teal-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              No handouts created yet.
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Click "New Handout" to create your first handout.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {handouts.map((handout, index) => (
            <div
              key={handout._id}
              className="bg-white dark:bg-white rounded-xl shadow-sm border border-gray-200 dark:border-gray-200 overflow-hidden hover:shadow-md transition-all"
            >
              <div className="px-6 py-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-gray-900 font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-900">
                        {handout.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {handout.createdBy?.name || "Teacher"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(handout.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      {handout.content && (
                        <div className="mt-3 text-sm text-gray-600 dark:text-gray-600 leading-relaxed whitespace-pre-wrap">
                          {handout.content}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => startEdit(handout)}
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(handout._id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Handouts;
