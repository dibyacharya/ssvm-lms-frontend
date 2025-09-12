import React, { useState } from "react";
import { createActivity } from "../../../services/activity.service";
import { Link as LinkIcon, Plus, X } from "lucide-react";

const ActivityForm = ({ courseID, fetchActivities }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]); // Array of files
  const [totalPoints, setTotalPoints] = useState(100);
  const [dueDate, setDueDate] = useState("");
  const [links, setLinks] = useState([]); // Array of link objects
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle file upload - accept multiple PDFs
  const handleFileUpload = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      // Convert FileList to array and append to existing attachments
      const newFiles = Array.from(event.target.files);
      setAttachments((prevAttachments) => [...prevAttachments, ...newFiles]);
    }
  };

  // Remove selected file by index
  const handleRemoveFile = (index) => {
    setAttachments((prevAttachments) =>
      prevAttachments.filter((_, fileIndex) => fileIndex !== index)
    );
  };

  // Add link to links array
  const handleAddLink = () => {
    if (linkName.trim() && linkUrl.trim()) {
      setLinks([...links, { name: linkName, url: linkUrl }]);
      setLinkName("");
      setLinkUrl("");
    }
  };

  // Remove link by index
  const handleRemoveLink = (index) => {
    setLinks((prevLinks) => prevLinks.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Create FormData object to handle file upload
      const formData = new FormData();

      // Append text fields exactly as shown in Postman
      formData.append("title", title);
      formData.append("description", description);
      formData.append("totalPoints", totalPoints.toString());
      formData.append("dueDate", dueDate);

      // Append links data as JSON string
      formData.append("links", JSON.stringify(links));

      // Append multiple attachments
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      // Log the FormData to validate structure (for debugging)
      console.log("Form data being sent:");
      for (let pair of formData.entries()) {
        console.log(
          pair[0] +
            ": " +
            (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1])
        );
      }

      // Call the createActivity service function
      const result = await createActivity(courseID, formData);

      // Handle success
      setSuccess(true);

      // Reset form after successful submission
      setTitle("");
      setDescription("");
      setAttachments([]);
      setTotalPoints(100);
      setDueDate("");
      setLinks([]);
      setTimeout(() => {
        fetchActivities();
      }, 1000);
    } catch (err) {
      // Handle error
      setError(
        err.response?.data?.message ||
          "Failed to create activity. Please try again."
      );
      console.error("Error creating activity:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full p-6">
      {/* Left Section - Activity Form */}
      <div className="w-2/3 p-4 bg-white shadow-md rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Create Activity</h2>
        <input
          type="text"
          className="w-full border p-2 rounded mb-4"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="w-full border p-2 rounded mb-4"
          placeholder="Description"
          rows="4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>

        {/* File Upload Section - PDF only, multiple files */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">
            Attachments (PDF only)
          </label>
          <div className="flex items-center">
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileUpload}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Files Preview Section */}
          {attachments.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">
                Selected Attachments ({attachments.length})
              </h4>
              <div className="border rounded p-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 px-3 hover:bg-gray-50 rounded"
                  >
                    <div className="flex items-center">
                      <span className="mr-2">📄</span>
                      <span className="text-sm text-gray-700 truncate max-w-xs">
                        {file.name}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Links Section - New for Activity */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">External Links</label>

          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              className="flex-1 border p-2 rounded"
              placeholder="Link Name"
              value={linkName}
              onChange={(e) => setLinkName(e.target.value)}
            />
            <input
              type="url"
              className="flex-1 border p-2 rounded"
              placeholder="URL (https://...)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAddLink}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              disabled={!linkName.trim() || !linkUrl.trim()}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Links Preview Section */}
          {links.length > 0 && (
            <div className="border rounded p-2">
              {links.map((link, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 px-3 hover:bg-gray-50 rounded"
                >
                  <div className="flex items-center">
                    <LinkIcon className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm text-gray-700 mr-2">
                      {link.name}
                    </span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline truncate max-w-xs"
                    >
                      {link.url}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-1/3 p-4 bg-gray-100 shadow-md rounded-lg ml-4">
        <h3 className="text-md font-semibold mb-2">Activity Settings</h3>

        <div className="mb-4">
          <label className="block font-medium">Total Points</label>
          <select
            className="w-full border p-2 rounded"
            value={totalPoints}
            onChange={(e) => setTotalPoints(e.target.value)}
          >
            <option value="100">4</option>
            <option value="50">3</option>
            <option value="25">2</option>
            <option value="10">1</option>
            <option value="0">Ungraded</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-medium">Due Date</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          disabled={loading || !title || !dueDate}
        >
          {loading ? "Creating..." : "Create Activity"}
        </button>

        {/* Display success or error message */}
        {success && (
          <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
            Activity created successfully!!!
          </div>
        )}

        {error && (
          <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>
    </form>
  );
};

export default ActivityForm;
