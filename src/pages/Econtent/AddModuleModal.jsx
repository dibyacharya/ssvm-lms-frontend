import React, { useState } from "react";
import { XIcon, FileTextIcon, PresentationIcon } from "lucide-react";
import { createEContent } from "../../services/econtent.service";

const AddModuleModal = ({ show, onClose, courseId, onModuleAdded }) => {
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleNumber, setModuleNumber] = useState("");
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      // Convert FileList to array and append to existing files
      const newFiles = Array.from(event.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);

      console.log(
        "Files selected:",
        newFiles.map((f) => ({ name: f.name, type: f.type, size: f.size }))
      );
    }
  };

  const handleRemoveFile = (index) => {
    setFiles((prevFiles) =>
      prevFiles.filter((_, fileIndex) => fileIndex !== index)
    );
  };

  const addLinkField = () => {
    setLinks([...links, ""]);
  };

  const updateLink = (index, value) => {
    const updatedLinks = [...links];
    updatedLinks[index] = value;
    setLinks(updatedLinks);
  };

  const removeLink = (index) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!moduleTitle.trim() || !moduleNumber) {
      setError("Module title and number are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create FormData object
      const formData = new FormData();

      // Append text fields
      formData.append("moduleTitle", moduleTitle);
      formData.append("moduleNumber", Number(moduleNumber));

      // Append multiple files
      files.forEach((file) => {
        formData.append("files", file);
      });

      // Add links (filter out empty ones)
      const linksToAdd = [];
      links
        .filter((link) => link.trim() !== "")
        .forEach((link) => {
          linksToAdd.push(link);
        });
      formData.append("link", linksToAdd);
      // Log the FormData to validate structure (for debugging)
      console.log("Form data being sent:");
      for (let pair of formData.entries()) {
        console.log(
          pair[0] +
            ": " +
            (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1])
        );
      }

      await createEContent(courseId, formData);

      // Reset form
      setModuleTitle("");
      setModuleNumber("");
      setFiles([]);
      setLinks([""]);

      // Notify parent component
      if (onModuleAdded) onModuleAdded();

      // Close modal
      onClose();
    } catch (err) {
      console.error("Error adding module:", err);
      setError("Failed to add module. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white rounded-lg w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b bg-green-600 text-white rounded-t-lg">
          <h3 className="font-semibold text-lg">Add New Module/Topic</h3>
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

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Module Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Module Number *
                  </label>
                  <input
                    type="number"
                    value={moduleNumber}
                    onChange={(e) => setModuleNumber(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Module Title *
                  </label>
                  <input
                    type="text"
                    value={moduleTitle}
                    onChange={(e) => setModuleTitle(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Files (PDF, PPT, PPTX)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                      >
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          name="files"
                          type="file"
                          className="sr-only"
                          multiple
                          accept=".pdf,.ppt,.pptx"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, PPT, PPTX up to 10MB each
                    </p>
                  </div>
                </div>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Selected Files:
                  </h4>
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md"
                      >
                        <div className="flex items-center">
                          {file.name.toLowerCase().endsWith(".pdf") ? (
                            <FileTextIcon
                              size={20}
                              className="text-red-500 mr-2"
                            />
                          ) : (
                            <PresentationIcon
                              size={20}
                              className="text-orange-500 mr-2"
                            />
                          )}
                          <span className="text-sm text-gray-700 truncate max-w-xs">
                            {file.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XIcon size={18} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Links */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    External Links
                  </label>
                  <button
                    type="button"
                    onClick={addLinkField}
                    className="text-xs bg-green-100 text-green-800 py-1 px-2 rounded"
                  >
                    + Add Link
                  </button>
                </div>

                {links.map((link, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <div className="flex-grow mr-2">
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => updateLink(index, e.target.value)}
                        placeholder="https://example.com"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XIcon size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Module"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddModuleModal;
