
import React, { useEffect, useState } from "react";
import {
  getAllCourseAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../../../../services/announcement.service";
import {
  Megaphone,
  Edit,
  Trash2,
  Image,
  Plus,
  Circle,
  Clock,
  User,
  AlertCircle,
  X,
  Upload,
  Save,
  RefreshCw,
} from "lucide-react";

const AnnouncementManagement = ({ courseID }) => {
  console.log(courseID);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: null,
  });
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission loading

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await getAllCourseAnnouncements({ courseID });
      setAnnouncements(response.announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, image: file }));

    // Create preview URL
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Set loading to true before API call

    const form = new FormData();
    form.append("title", formData.title);
    form.append("content", formData.content);
    if (formData.image) form.append("image", formData.image);

    try {
      if (editingAnnouncement) {
        await updateAnnouncement(courseID, editingAnnouncement._id, form);
        setEditingAnnouncement(null);
      } else {
        await createAnnouncement(courseID, form);
      }
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      console.error("Error saving announcement:", error);
      // Optionally, show an error message to the user here
    } finally {
      setIsSubmitting(false); // Set loading to false after API call completes
    }
  };

  // Handle delete
  const handleDelete = async (announcementID) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await deleteAnnouncement(courseID, announcementID);
        fetchAnnouncements();
      } catch (error) {
        console.error("Error deleting announcement:", error);
      }
    }
  };

  // Handle edit
  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      image: null,
    });
    setImagePreview(announcement.image?.imageUrl || null);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({ title: "", content: "", image: null });
    setEditingAnnouncement(null);
    setImagePreview(null);
    setShowForm(false);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [courseID]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* ... (rest of the header and action buttons) ... */}
       <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Course Announcements
          </h1>
          <p className="text-tertiary mt-1">
            Manage communications with your students
          </p>
        </div>
      </div>

      {/* Action Button */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Announcement</span>
        </button>
      ) : (
        <div className="flex space-x-3">
          <button
            onClick={resetForm}
            className="flex items-center space-x-2 border border-tertiary/20 text-tertiary px-4 py-2 rounded-xl hover:bg-tertiary/5 transition-all duration-200"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button
            onClick={() =>
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
              })
            }
            className="flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-xl hover:bg-primary/20 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            <span>View Announcements</span>
          </button>
        </div>
      )}


      {/* Form Section */}
      {showForm && (
        <div className="lg:col-span-3">
            {/* ... (form content) ... */}
            <div className="bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden">
              <div className="p-6 border-b border-tertiary/10">
                <div className="flex items-center space-x-3">
                  <Megaphone className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold text-primary">
                    {editingAnnouncement
                      ? "Edit Announcement"
                      : "Create New Announcement"}
                  </h2>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-tertiary">
                    Announcement Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-tertiary/20
                      focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200
                      text-primary placeholder-tertiary/50"
                    placeholder="Enter a descriptive title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-tertiary">
                    Announcement Content
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    className="w-full min-h-[200px] p-4 rounded-xl border border-tertiary/20
                      focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200
                      text-primary placeholder-tertiary/50"
                    placeholder="Enter the announcement details here..."
                    rows="6"
                    required
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-tertiary">
                    Announcement Image (Optional)
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-tertiary/30 rounded-xl cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-all duration-300">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {imagePreview ? (
                          <div className="relative w-full h-full flex flex-col items-center">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="max-h-48 max-w-full rounded-lg object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setImagePreview(null);
                                setFormData((prev) => ({
                                  ...prev,
                                  image: null,
                                }));
                              }}
                              className="mt-2 text-red-500 hover:text-red-700 transition-colors"
                            >
                              Remove Image
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-10 h-10 mb-2 text-tertiary/50" />
                            <p className="mb-2 text-sm text-tertiary/80">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs text-tertiary/60">
                              PNG, JPG or GIF (MAX. 2MB)
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/*"
                      />
                    </label>
                  </div>
                </div>

                {/* --- MODIFIED BUTTON SECTION --- */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-tertiary/10">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-tertiary/20 text-tertiary rounded-xl hover:bg-tertiary/5 transition-all duration-200"
                    disabled={isSubmitting} // Also disable cancel button during submission
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-sm flex items-center justify-center min-w-[210px] disabled:bg-primary/70 disabled:cursor-not-allowed"
                    disabled={isSubmitting} // Disable button when submitting
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        <span>
                          {editingAnnouncement
                            ? "Update Announcement"
                            : "Publish Announcement"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
        </div>
      )}

      {/* Announcements List and Help Text */}
      {/* ... (rest of the component remains the same) ... */}
        <div className={showForm ? "lg:col-span-3" : "lg:col-span-3"}>
          <div className="bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden">
            <div className="p-6 border-b border-tertiary/10 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Megaphone className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-primary">
                  All Announcements
                </h2>
              </div>
              <div className="text-sm text-tertiary">
                {announcements.length}{" "}
                {announcements.length === 1 ? "announcement" : "announcements"}
              </div>
            </div>

            {/* Announcements Grid */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 mb-4"></div>
                    <div className="h-4 w-32 bg-primary/20 rounded"></div>
                  </div>
                </div>
              ) : announcements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <Megaphone className="w-16 h-16 text-tertiary/30 mb-4" />
                  <h3 className="text-xl font-semibold text-primary mb-2">
                    No Announcements Yet
                  </h3>
                  <p className="text-tertiary max-w-md">
                    Create your first announcement to communicate with your
                    students.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {announcements.map((announcement) => (
                    <div
                      key={announcement._id}
                      className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col justify-between hover:shadow-lg transition-shadow duration-200"
                    >
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-primary truncate">
                          {announcement.title}
                        </h3>
                        <div className="flex items-center space-x-2 mt-2 text-sm text-tertiary">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(announcement.publishDate)}</span>
                          <span className="mx-1">•</span>
                          <User className="w-4 h-4" />
                          <span>{announcement.publishedBy.user.name}</span>
                        </div>
                        <p className="mt-4 text-sm text-primary line-clamp-3">
                          {announcement.content}
                        </p>
                      </div>
                      {
                        <img
                          src={
                            announcement.image.imageUrl || "/announcement.png"
                          }
                          alt={announcement.title}
                          className="w-full h-40 object-cover"
                        />
                      }
                      <div className="flex justify-between items-center p-4 border-t border-gray-200">
                        <button
                          onClick={() => handleEdit(announcement)}
                          className="text-primary hover:text-primary/80 transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(announcement._id)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-start p-5 rounded-xl bg-primary/5 border border-primary/20 mt-6">
        <AlertCircle className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <p className="text-primary font-medium mb-1">About Announcements</p>
          <p className="text-tertiary text-sm">
            Announcements are visible to all students enrolled in your course.
            Students will receive an email notification when a new announcement
            is published.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementManagement;