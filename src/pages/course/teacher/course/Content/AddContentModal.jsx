import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import MarkdownEditor from "react-markdown-editor-lite";
import ReactMarkdown from "react-markdown";
import "react-markdown-editor-lite/lib/index.css";

const AddContentModal = ({
  courseID,
  moduleId,
  contentType,
  onClose,
  editingContent, // Changed from currentContent to editingContent
  onAdd,
  onUpdate, // New prop for update function
}) => {
  const [newContent, setNewContent] = useState({
    contentType: contentType,
    title: "",
    description: "",
  });

  const [file, setFile] = useState(null);
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Reset loading state when modal opens/closes
  useEffect(() => {
    setIsLoading(false);
  }, [editingContent, contentType]);

  // Reset form when modal opens or contentType changes
  useEffect(() => {
    // Reset form to default values
    setNewContent({
      contentType: contentType,
      title: "",
      description: "",
    });
    setFile(null);
    setContent("");
    setUrl("");
    setPreviewMode(false);
  }, [contentType]);

  // Populate form fields ONLY when editing content
  useEffect(() => {
    if (editingContent) {
      setNewContent({
        contentType: editingContent.contentType || contentType,
        title: editingContent.title || "",
        description: editingContent.description || "",
      });

      // Populate type-specific fields based on editing content
      if (editingContent.type === "text" || editingContent.contentType === "text") {
        setContent(editingContent.content || "");
      } else if (
        editingContent.type === "link" || 
        editingContent.contentType === "link" ||
        editingContent.type === "video" || 
        editingContent.contentType === "video"
      ) {
        setUrl(editingContent.url || editingContent.videoUrl || "");
      }
      // Note: For file editing, we don't set the file since it's already uploaded
    } else {
      // If not editing, ensure form is clean
      setNewContent({
        contentType: contentType,
        title: "",
        description: "",
      });
      setFile(null);
      setContent("");
      setUrl("");
      setPreviewMode(false);
    }
  }, [editingContent, contentType]);

  const handleChange = (e) => {
    setNewContent({
      ...newContent,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!newContent.title) {
      alert("Please enter a title");
      return;
    }

    if (isLoading) return; // Prevent multiple submissions

    setIsLoading(true);

    try {
      // Create FormData object for API call
      const formData = new FormData();
      formData.append("contentType", newContent.contentType);
      formData.append("title", newContent.title);
      formData.append("description", newContent.description || "");

      // Add type-specific fields
      switch (contentType) {
        case "file":
          if (!editingContent && !file) {
            alert("Please select a file");
            setIsLoading(false);
            return;
          }
          if (file) {
            formData.append("file", file);
          }
          break;
        case "link":
          if (!url) {
            alert("Please enter a URL");
            setIsLoading(false);
            return;
          }
          formData.append("url", url);
          break;
        case "video":
          if (!url) {
            alert("Please enter a video URL");
            setIsLoading(false);
            return;
          }
          formData.append("videoUrl", url);
          formData.append("videoProvider", "other");
          break;
        case "text":
          if (!content) {
            alert("Please enter content");
            setIsLoading(false);
            return;
          }
          formData.append("content", content);
          break;
        default:
          break;
      }

      // Call appropriate function based on mode
      if (editingContent) {
        await onUpdate(courseID, moduleId, editingContent._id, formData);
      } else {
        await onAdd(courseID, moduleId, formData);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  const getModalTitle = () => {
    if (editingContent) {
      return `Edit ${editingContent.type || editingContent.contentType || "Content"}`;
    }
    switch (contentType) {
      case "file":
        return "Add File Resource";
      case "video":
        return "Add Video Content";
      case "link":
        return "Add External Link";
      case "text":
        return "Add Text Content";
      default:
        return "Add Content";
    }
  };

  const isEditMode = !!editingContent;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{getModalTitle()}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={newContent.title}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter content title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              name="description"
              value={newContent.description}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter a brief description"
            />
          </div>

          {contentType === "file" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, DOC, DOCX, PPT, PPTX, JPG, PNG, GIF
                {isEditMode && " (Leave empty to keep current file)"}
              </p>
            </div>
          )}

          {contentType === "link" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
              />
            </div>
          )}

          {contentType === "video" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://www.youtube.com/watch?v=example"
              />
              <p className="text-xs text-gray-500 mt-1">
                YouTube, Vimeo or other video platform URLs
              </p>
            </div>
          )}

          {contentType === "text" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content (Markdown supported)
              </label>
              <MarkdownEditor
                value={content}
                style={{ height: "300px" }}
                onChange={({ text }) => setContent(text)}
                renderHTML={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="px-4 py-2 border text-gray-700 rounded hover:bg-gray-50"
                >
                  {previewMode ? "Edit" : "Preview"}
                </button>
              </div>
              {previewMode && (
                <div className="mt-4 p-4 border rounded bg-gray-50">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              )}
              {isEditMode ? "Save Changes" : "Add Content"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddContentModal;