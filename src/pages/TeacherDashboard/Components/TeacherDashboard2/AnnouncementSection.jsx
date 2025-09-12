import React, { useState, useEffect } from "react";
import { Clock, FileVideo, X } from "lucide-react";
import {
  getAllCourseAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
} from "../../../../services/announcement.service";

const AnnouncementsSection = ({
  showModal,
  onCloseModal,
  onOpenModal,
  courseID,
}) => {
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    type: "text",
    file: null,
  });

  // Fetch announcements on component mount
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await getAllCourseAnnouncements({ courseID });
        setAnnouncements(data);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };

    fetchAnnouncements();
  }, [courseID]);

  // Handle adding a new announcement
  const handleAddAnnouncement = async () => {
    try {
      const formData = new FormData();
      formData.append("title", newAnnouncement.title);
      formData.append("content", newAnnouncement.content);
      formData.append("type", newAnnouncement.type);
      if (newAnnouncement.file) {
        formData.append("file", newAnnouncement.file);
      }

      const createdAnnouncement = await createAnnouncement(courseID, formData);
      setAnnouncements((prev) => [...prev, createdAnnouncement.announcement]);
      setNewAnnouncement({ title: "", content: "", type: "text", file: null });
      onCloseModal();
    } catch (error) {
      console.error("Error creating announcement:", error);
    }
  };

  // Handle deleting an announcement
  const handleDeleteAnnouncement = async (announcementID) => {
    try {
      await deleteAnnouncement(announcementID);
      setAnnouncements((prev) =>
        prev.filter((announcement) => announcement._id !== announcementID)
      );
    } catch (error) {
      console.error("Error deleting announcement:", error);
    }
  };

  return (
    <>
      {/* Announcements Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Announcements</h2>
          <button
            className="text-sm text-emerald-600 hover:text-emerald-800 font-medium"
            onClick={onOpenModal}
          >
            View All
          </button>
        </div>
        <div className="space-y-4">
          {announcements.slice(0, 3).map((announcement) => (
            <div
              key={announcement._id}
              className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-all"
            >
              <div className="flex justify-between mb-2">
                <h3 className="font-medium text-lg text-gray-900">
                  {announcement.title}
                </h3>
                <span className="text-sm text-gray-500 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(announcement.publishDate).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 mb-3">{announcement.content}</p>

              {announcement.image?.imageUrl && (
                <div className="flex items-center text-emerald-600 mt-2">
                  <FileVideo className="h-5 w-5 mr-2" />
                  <a
                    href={announcement.image.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium cursor-pointer hover:underline"
                  >
                    View attached file
                  </a>
                </div>
              )}

              <button
                onClick={() => handleDeleteAnnouncement(announcement._id)}
                className="text-red-600 text-sm hover:underline"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Announcement Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">New Announcement</h2>
              <button
                onClick={onCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newAnnouncement.title}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      title: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700"
                >
                  Content
                </label>
                <textarea
                  id="content"
                  rows={4}
                  value={newAnnouncement.content}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      content: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label
                  htmlFor="file"
                  className="block text-sm font-medium text-gray-700"
                >
                  Attachment (Optional)
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      file: e.target.files[0],
                    })
                  }
                  className="mt-1 block w-full text-sm text-gray-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAnnouncement}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                  disabled={!newAnnouncement.title || !newAnnouncement.content}
                >
                  Post Announcement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnnouncementsSection;
