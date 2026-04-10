import React, { useState, useEffect, useRef } from "react";
import { Upload, File, Download, Trash2, X } from "lucide-react";
import api from "../../../services/api";

/**
 * Session files panel for live classes.
 * Teachers can upload files, students can download.
 */
const SessionFiles = ({ isOpen, onClose, meetingId, isTeacher = false }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchFiles = async () => {
    try {
      const res = await api.get(`/vconf/meetings/${meetingId}/files`);
      setFiles(res.data.files || []);
    } catch (err) {
      console.error("Failed to fetch session files:", err);
    }
  };

  useEffect(() => {
    if (isOpen && meetingId) {
      fetchFiles();
    }
  }, [isOpen, meetingId]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      await api.post(`/vconf/meetings/${meetingId}/files`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchFiles();
    } catch (err) {
      console.error("Failed to upload file:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await api.delete(`/vconf/meetings/${meetingId}/files/${fileId}`);
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
    } catch (err) {
      console.error("Failed to delete file:", err);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full bg-white/70 backdrop-blur-xl border-l border-gray-200 w-80">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <File size={18} className="text-gray-500" />
          <h3 className="font-semibold text-sm text-gray-900">Session Files</h3>
          <span className="text-xs text-gray-400">({files.length})</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-50 rounded">
          <X size={16} />
        </button>
      </div>

      {/* Upload button (teacher only) */}
      {isTeacher && (
        <div className="p-3 border-b border-gray-200">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUpload}
            className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.jpg,.png"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-900/20 text-primary-600 text-sm font-medium rounded-lg border border-primary-700 hover:bg-primary-50 disabled:opacity-50 transition-colors"
          >
            <Upload size={16} />
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        </div>
      )}

      {/* File list */}
      <div className="flex-1 overflow-y-auto">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <File size={24} />
            <p className="text-xs mt-2">No files uploaded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {files.map((file) => (
              <div
                key={file._id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
              >
                <File size={16} className="text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 truncate">
                    {file.fileName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatSize(file.fileSize)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <a
                    href={file.fileUrl}
                    download={file.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-primary-900/20 rounded text-primary-600"
                  >
                    <Download size={14} />
                  </a>
                  {isTeacher && (
                    <button
                      onClick={() => handleDelete(file._id)}
                      className="p-1.5 hover:bg-red-900/20 rounded text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionFiles;
