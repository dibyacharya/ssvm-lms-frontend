import React, { useState, useEffect } from "react";
import { updateAssignment } from "../../../services/assignment.service";

const EditAssignmentForm = ({
  assignment,
  courseID,
  onClose,
  fetchAssignments,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]); // Single attachments array that will contain all files
  const [totalPoints, setTotalPoints] = useState(100);
  const [dueDate, setDueDate] = useState("");
  const [isActive, setIsActive] = useState(true); // New state for late submission
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Initialize form with assignment data
  console.log(assignment);
  useEffect(() => {
    if (assignment) {
      setTitle(assignment.title || "");
      setDescription(assignment.description || "");
      setTotalPoints(assignment.totalPoints || 100);
      setIsActive(assignment.isActive); // Initialize isActive

      // Set existing attachments if available
      if (assignment.attachments && assignment.attachments.length > 0) {
        setAttachments(assignment.attachments);
      } else {
        setAttachments([]);
      }

      // Format the date from "Due DD/MM/YYYY" or ISO format to YYYY-MM-DD for the input
      if (assignment.dueDate) {
        try {
          // Case 1: Handle "Due DD/MM/YYYY" format
          if (
            typeof assignment.dueDate === "string" &&
            assignment.dueDate.startsWith("Due ")
          ) {
            // Extract the date part after "Due "
            const datePart = assignment.dueDate.replace("Due ", "");

            // Parse DD/MM/YYYY format
            const [day, month, year] = datePart.split("/");
            if (day && month && year) {
              // Format as YYYY-MM-DD for the input field
              const formattedDate = `${year}-${month.padStart(
                2,
                "0"
              )}-${day.padStart(2, "0")}`;
              setDueDate(formattedDate);
              console.log(
                "Date set from 'Due DD/MM/YYYY' format:",
                formattedDate
              );
            } else {
              console.error("Failed to parse date parts from:", datePart);
              setDueDate("");
            }
          }
          // Case 2: Handle ISO format "YYYY-MM-DDT00:00:00.000Z"
          else if (
            typeof assignment.dueDate === "string" &&
            assignment.dueDate.includes("T")
          ) {
            // Simply split by T and take the first part for YYYY-MM-DD format
            const formattedDate = assignment.dueDate.split("T")[0];
            setDueDate(formattedDate);
            console.log("Date set from ISO format:", formattedDate);
          }
          // Case 3: Fallback to standard Date object approach
          else {
            const date = new Date(assignment.dueDate);

            // Check if date is valid before formatting
            if (!isNaN(date.getTime())) {
              const formattedDate = date.toISOString().split("T")[0];
              setDueDate(formattedDate);
              console.log("Date set using Date object:", formattedDate);
            } else {
              console.error("Invalid date format:", assignment.dueDate);
              setDueDate("");
            }
          }
        } catch (err) {
          console.error(
            "Error parsing date:",
            err,
            "for date:",
            assignment.dueDate
          );
          setDueDate("");
        }
      }
    }
  }, [assignment]);

  // Handle file upload - accept multiple PDFs
  const handleFileUpload = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      // Convert FileList to array and append to existing attachments
      const newFiles = Array.from(event.target.files);
      setAttachments((prevAttachments) => [...prevAttachments, ...newFiles]);
    }
  };

  // Remove file from attachments array
  const handleRemoveFile = (fileToRemove) => {
    setAttachments((prevAttachments) =>
      prevAttachments.filter((file) => {
        // If the file has an _id, it's an existing attachment
        if (file._id && fileToRemove._id) {
          return file._id !== fileToRemove._id;
        }
        // For new files (which don't have _id), compare by name/size/etc.
        return file !== fileToRemove;
      })
    );
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

      // Append text fields
      formData.append("title", title);
      formData.append("description", description);
      formData.append("totalPoints", totalPoints.toString());
      formData.append("dueDate", dueDate);
      formData.append("isActive", isActive.toString()); // Add isActive to form data

      // Process attachments:
      // 1. Existing attachment objects (with _id) will be kept as-is
      // 2. New File objects will be uploaded

      // First, handle existing attachments that need to be kept
      const existingAttachmentIds = attachments
        .filter((file) => file._id) // Only get the ones with _id (existing ones)
        .map((file) => file._id);

      // Add the list of attachment IDs to keep
      formData.append("attachments", JSON.stringify(existingAttachmentIds));

      // Then add all new File objects to be uploaded
      attachments.forEach((file) => {
        // If it's a new file (without _id, meaning it's a File object)
        if (!file._id && file instanceof File) {
          formData.append("attachments", file);
        }
      });

      // Log the FormData to validate structure (for debugging)
      console.log("Form data being sent for update:");
      for (let pair of formData.entries()) {
        console.log(
          pair[0] +
            ": " +
            (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1])
        );
      }

      // Call the updateAssignment service function
      const result = await updateAssignment(assignment.id, formData);

      // Handle success
      setSuccess(true);

      // Refresh the assignments list
      setTimeout(() => {
        fetchAssignments();
        if (onClose) onClose();
      }, 1000);
    } catch (err) {
      // Handle error
      setError(
        err.response?.data?.message ||
          "Failed to update assignment. Please try again."
      );
      console.error("Error updating assignment:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full p-6">
      {/* Left Section - Assignment Form */}
      <div className="w-2/3 p-4 bg-white shadow-md rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Edit Assignment</h2>
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

        {/* Attachments Section - showing both existing and new files */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Attachments</label>

          {/* File Upload Input */}
          <div className="flex items-center mb-3">
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileUpload}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* All Attachments List */}
          {attachments.length > 0 && (
            <div className="border rounded p-2">
              {attachments.map((file, index) => (
                <div
                  key={file._id || index}
                  className="flex justify-between items-center py-2 px-3 hover:bg-gray-50 rounded"
                >
                  <div className="flex items-center">
                    <span className="mr-2">📄</span>
                    <span className="text-sm text-gray-700 truncate max-w-xs">
                      {file.name}
                    </span>
                    {!file._id && (
                      <span className="ml-2 text-xs text-gray-500">
                        ({(file.size / 1024).toFixed(2)} KB)
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-1/3 p-4 bg-gray-100 shadow-md rounded-lg ml-4">
        <h3 className="text-md font-semibold mb-2">Assignment Settings</h3>

        <div className="mb-4">
          <label className="block font-medium">Total Points</label>
          <select
            className="w-full border p-2 rounded"
            value={totalPoints}
            onChange={(e) => setTotalPoints(Number(e.target.value))}
          >
            <option value="100">100</option>
            <option value="50">50</option>
            <option value="25">25</option>
            <option value="10">10</option>
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

        {/* New Late Submission Toggle */}
        <div className="mb-4 ">
          <label className="flex items-center cursor-pointer justify-between">
            <div className="mr-2 font-medium">Allow Late Submissions</div>
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <div
                className={`block w-14 h-8 rounded-full ${
                  isActive ? "bg-green-400" : "bg-gray-400"
                }`}
              ></div>
              <div
                className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform transform ${
                  isActive ? "translate-x-6" : ""
                }`}
              ></div>
            </div>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            {isActive
              ? "Students can submit after the due date"
              : "Late submissions are not accepted"}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 bg-gray-400 text-white p-2 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-1/2 bg-green-400 text-white p-2 rounded hover:bg-green-500 disabled:bg-green-300"
            disabled={loading || !title || !dueDate}
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>

        {/* Display success or error message */}
        {success && (
          <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
            Assignment updated successfully!
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

export default EditAssignmentForm;
