
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
  FileText,
  ListOrdered,
} from "lucide-react";

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

  // Color accents for announcement cards - cycles through these
  const cardAccents = [
    "border-t-4 border-t-rose-400",
    "border-t-4 border-t-pink-400",
    "border-t-4 border-t-fuchsia-400",
    "border-t-4 border-t-purple-400",
    "border-t-4 border-t-sky-400",
    "border-t-4 border-t-teal-400",
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* Gradient Header Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden">
        <SectionHeader
          icon={Megaphone}
          title="Course Announcements"
          gradient="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-500"
        />
        <div className="px-6 py-3 bg-gradient-to-r from-rose-50 to-fuchsia-50 border-b border-rose-100">
          <p className="text-sm text-tertiary">
            Manage communications with your students
          </p>
        </div>
      </div>

      {/* Action Button */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg"
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
              <SectionHeader
                icon={FileText}
                title={editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}
                gradient="bg-gradient-to-r from-amber-500 to-orange-500"
              />

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
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-pink-200 rounded-xl cursor-pointer hover:bg-pink-50/50 hover:border-pink-400 transition-all duration-300 bg-gradient-to-b from-white to-rose-50/30">
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
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center mb-3">
                              <Upload className="w-7 h-7 text-pink-400" />
                            </div>
                            <p className="mb-2 text-sm text-tertiary/80">
                              <span className="font-semibold text-pink-500">
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
                    className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center min-w-[210px] disabled:opacity-70 disabled:cursor-not-allowed"
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
        <div className={showForm ? "lg:col-span-3" : "lg:col-span-3"}>
          <div className="bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden">
            <SectionHeader
              icon={ListOrdered}
              title="All Announcements"
              gradient="bg-gradient-to-r from-sky-500 to-blue-600"
              count={announcements.length}
            />

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
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center mb-4">
                    <Megaphone className="w-10 h-10 text-sky-400" />
                  </div>
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
                  {announcements.map((announcement, index) => (
                    <div
                      key={announcement._id}
                      className={`bg-white rounded-xl shadow-md overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${cardAccents[index % cardAccents.length]}`}
                    >
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-primary truncate">
                          {announcement.title}
                        </h3>
                        <div className="flex items-center space-x-2 mt-2 text-sm text-tertiary">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(announcement.publishDate)}</span>
                          <span className="mx-1">&bull;</span>
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
                          className="flex items-center gap-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all duration-200"
                        >
                          <Edit className="w-4 h-4" />
                          <span className="text-xs font-medium">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(announcement._id)}
                          className="flex items-center gap-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-xs font-medium">Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* About Announcements Info Bar */}
        <div className="flex items-start p-5 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 mt-6 border-l-4 border-l-rose-400">
        <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 mr-3 flex-shrink-0" />
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
