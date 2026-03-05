import React, { useEffect, useState } from "react";
import {
  LinkIcon,
  XIcon,
  BookIcon,
  FileTextIcon,
  PresentationIcon,
  ExternalLinkIcon,
  ArrowLeft,
  PencilIcon,
  TrashIcon,
  BookOpen,
  Layers,
  Plus,
  Filter,
  FolderOpen,
} from "lucide-react";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowDown } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { getAllEContent } from "../../services/econtent.service";
import AddModuleModal from "./AddModuleModal";
import EditModuleModal from "./EditModuleModal"; // Adjust path as needed
import DeleteConfirmationModal from "./DeleteModuleModal";

const EContentViewer = () => {
  const [activeModule, setActiveModule] = useState(1);
  const [activeFileType, setActiveFileType] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedLink, setSelectedLink] = useState(null);
  const { courseId } = useParams();
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [showEditModuleModal, setShowEditModuleModal] = useState(false);
  const [showDeleteModuleModal, setShowDeleteModuleModal] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contentData, setContentData] = useState(null);
  const [isViewerLoading, setIsViewerLoading] = useState(true);
  const [viewerFailed, setViewerFailed] = useState(false);

  useEffect(() => {
    const fetchEContent = async () => {
      try {
        setLoading(true);
        const data = await getAllEContent(courseId);
        setContentData(data);

        // Initialize with first module if data is available
        if (data && data.eContent && data.eContent.modules) {
          const firstModule = data.eContent.modules[0];
          setActiveModule(firstModule.moduleNumber);
        }

        setLoading(false);
      } catch (err) {
        setError("Failed to load content. Please try again later.");
        setLoading(false);
        console.error(err);
      }
    };

    if (courseId) {
      fetchEContent();
    }
  }, [courseId]);

  const handleModuleAdded = async () => {
    try {
      setLoading(true);
      const data = await getAllEContent(courseId);
      setContentData(data);
      setLoading(false);
    } catch (err) {
      setError("Failed to refresh content. Please try again later.");
      setLoading(false);
      console.error(err);
    }
  };
  const handleModuleUpdated = async () => {
    try {
      setLoading(true);
      const data = await getAllEContent(courseId);
      setContentData(data);
      setLoading(false);
    } catch (err) {
      setError("Failed to refresh content. Please try again later.");
      setLoading(false);
      console.error(err);
    }
  };
  const handleModuleDeleted = async () => {
    try {
      setLoading(true);
      const data = await getAllEContent(courseId);
      setContentData(data);
      setActiveModule(null);
      setActiveTopic(null);
      setActiveFileType(null);
      setLoading(false);
    } catch (err) {
      setError("Failed to refresh content. Please try again later.");
      setLoading(false);
      console.error(err);
    }
  };

  const openEditModal = (e) => {
    e.stopPropagation();
    setShowEditModuleModal(true);
  };
  const openDeleteModal = (e) => {
    e.stopPropagation();
    setShowDeleteModuleModal(true);
  };

  // Helper function to group modules by number
  if (contentData?.eContent?.modules.length === 0) {
    return <div> No data Available. Add the first module</div>;
  }
  const groupModulesByNumber = () => {
    const grouped = {};
    contentData?.eContent?.modules?.forEach((module) => {
      if (!grouped[module.moduleNumber]) {
        grouped[module.moduleNumber] = [];
      }
      grouped[module.moduleNumber].push(module);
    });
    return grouped;
  };

  const groupedModules = contentData ? groupModulesByNumber() : {};

  const handleFileTypeClick = (e, moduleNumber, topic, fileType) => {
    e.stopPropagation();
    setActiveModule(moduleNumber);
    setActiveTopic(topic);
    setActiveFileType(fileType);
  };

  const handleFileClick = (file) => {
    setSelectedFile(file);
    setSelectedLink(null);
    setIsViewerLoading(true);
    setViewerFailed(false);
  };

  const handleLinkClick = (link) => {
    setSelectedLink(link);
    setSelectedFile(null);
    setIsViewerLoading(true);
    setViewerFailed(false);
  };

  const handleCloseViewer = () => {
    setSelectedFile(null);
    setSelectedLink(null);
  };

  // Filter files by type
  const getFilesByType = (module, type) => {
    if (!module || !module.files) return [];
    return (
      module.files.filter(
        (file) => file.fileType.toLowerCase() === type.toLowerCase()
      ) || []
    );
  };

  // Helper: Backend URL for resolving relative file paths
  const BACKEND_URL = window.RUNTIME_CONFIG?.BACKEND_URL || '';

  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${BACKEND_URL}${url}`;
  };

  // Helper: Get PPT-to-PDF conversion URL (backend converts PPT→PDF via LibreOffice)
  const getPptPreviewUrl = (fileUrl) => {
    return `${BACKEND_URL}/api/preview/ppt-to-pdf?file=${encodeURIComponent(fileUrl)}`;
  };

  // Helper: Create viewer URL based on file type
  const getViewerUrl = (file) => {
    if (!file) return null;
    const fileType = file.fileType.toLowerCase();
    const url = getFullUrl(file.fileUrl);
    if (!url) return null;
    if (fileType === "pdf") return `${url}#toolbar=0`;
    if (fileType === "ppt" || fileType === "pptx") return `${getPptPreviewUrl(file.fileUrl)}#toolbar=0`;
    return null;
  };

  // Check if we're in inline viewer mode
  const isViewingContent = !!(selectedFile || selectedLink);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 dark:border-emerald-400 border-t-transparent"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Loading course content...</p>
        </div>
      </div>
    );
  }

  // Add an error state (place this after the loading check)
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-tertiary/10">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">!</span>
          </div>
          <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 text-white rounded-xl hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-600 transition-all font-medium shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        {/* Header Section - Gradient Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 px-8 py-6 shadow-lg">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 right-20 w-24 h-24 bg-white/5 rounded-full" />
          <div className="absolute top-4 left-[40%] w-16 h-16 bg-white/5 rounded-full" />
          <div className="relative z-10 flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">E-Learning Content</h1>
              <p className="text-white/80 text-sm font-medium mt-1">Browse and manage course materials</p>
            </div>
          </div>
        </div>

        {/* Main Layout: Sidebar + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Modules (hidden when viewing content) */}
          {!isViewingContent && (
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden sticky top-6">
              {/* Sidebar Section Header */}
              <div className="relative overflow-hidden px-6 py-4 bg-gradient-to-r from-sky-500 to-blue-600">
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
                <div className="absolute -bottom-4 right-12 w-12 h-12 bg-white/5 rounded-full" />
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Layers className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Modules</h2>
                </div>
              </div>

              {/* Module List */}
              <div className="overflow-y-auto max-h-[calc(100vh-320px)]">
                {Object.keys(groupedModules).map((moduleNumber) => (
                  <div key={moduleNumber} className="border-b border-tertiary/10 last:border-b-0">
                    <div
                      className={`flex items-center px-5 py-3.5 cursor-pointer transition-colors ${
                        parseInt(moduleNumber) === activeModule
                          ? "bg-sky-50 dark:bg-sky-900/20"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      }`}
                      onClick={() => {
                        setActiveModule(parseInt(moduleNumber));
                        setActiveFileType(null);
                        setActiveTopic(null);
                      }}
                    >
                      <span
                        className={`mr-2.5 ${
                          parseInt(moduleNumber) === activeModule
                            ? "text-sky-600 dark:text-sky-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {parseInt(moduleNumber) === activeModule ? (
                          <IoIosArrowDown />
                        ) : (
                          <IoIosArrowForward />
                        )}
                      </span>
                      <span
                        className={`font-semibold text-sm ${
                          parseInt(moduleNumber) === activeModule
                            ? "text-sky-600 dark:text-sky-400"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        Module {moduleNumber}
                      </span>
                    </div>

                    {parseInt(moduleNumber) === activeModule && (
                      <div className="pb-2">
                        {groupedModules[moduleNumber].map((module, idx) => (
                          <div key={idx}>
                            <div
                              className={`flex items-center py-2.5 px-5 pl-10 cursor-pointer transition-colors text-sm ${
                                activeTopic === module
                                  ? "bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400"
                                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              }`}
                              onClick={() => {
                                setActiveTopic(module);
                                setActiveFileType(null);
                              }}
                            >
                              <span className="mr-2 font-medium">{idx + 1}.</span>
                              <span className="truncate flex-1">
                                {module.moduleTitle || `Topic ${idx + 1}`}
                              </span>
                              <div className="flex space-x-1.5 ml-2 flex-shrink-0">
                                {module.files &&
                                  module.files.some(
                                    (f) => f.fileType.toLowerCase() === "pdf"
                                  ) && (
                                    <div
                                      className={`cursor-pointer rounded-lg p-1.5 transition-colors ${
                                        activeFileType === "pdf" &&
                                        activeTopic === module
                                          ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                          : "text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                      }`}
                                      onClick={(e) =>
                                        handleFileTypeClick(
                                          e,
                                          parseInt(moduleNumber),
                                          module,
                                          "pdf"
                                        )
                                      }
                                    >
                                      <FileTextIcon size={14} />
                                    </div>
                                  )}
                                {module.files &&
                                  module.files.some(
                                    (f) =>
                                      f.fileType.toLowerCase() === "ppt" ||
                                      f.fileType.toLowerCase() === "pptx"
                                  ) && (
                                    <div
                                      className={`cursor-pointer rounded-lg p-1.5 transition-colors ${
                                        activeFileType === "ppt" &&
                                        activeTopic === module
                                          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                                          : "text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                      }`}
                                      onClick={(e) =>
                                        handleFileTypeClick(
                                          e,
                                          parseInt(moduleNumber),
                                          module,
                                          "ppt"
                                        )
                                      }
                                    >
                                      <PresentationIcon size={14} />
                                    </div>
                                  )}
                                {Array.isArray(module.link) &&
                                  module.link.length > 0 && (
                                    <div
                                      className={`cursor-pointer rounded-lg p-1.5 transition-colors ${
                                        activeFileType === "link" &&
                                        activeTopic === module
                                          ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                                          : "text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                      }`}
                                      onClick={(e) =>
                                        handleFileTypeClick(
                                          e,
                                          parseInt(moduleNumber),
                                          module,
                                          "link"
                                        )
                                      }
                                    >
                                      <LinkIcon size={14} />
                                    </div>
                                  )}
                                {typeof module.link === "string" && (
                                  <div
                                    className="cursor-pointer rounded-lg p-1.5 text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleLinkClick(module.link);
                                    }}
                                  >
                                    <ExternalLinkIcon size={14} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Module Button */}
              <div className="p-4 border-t border-tertiary/10 bg-gray-50/50 dark:bg-gray-700/30">
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all font-medium text-sm shadow-sm"
                  onClick={() => setShowAddModuleModal(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add New Module/Topic
                </button>
              </div>
            </div>
          </div>
          )}

          {/* Main Content Area */}
          <div className={isViewingContent ? "lg:col-span-12" : "lg:col-span-9"}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden">
              {/* Content Section Header */}
              <div className="relative overflow-hidden px-6 py-4 bg-gradient-to-r from-violet-500 to-purple-600">
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
                <div className="absolute -bottom-4 right-12 w-12 h-12 bg-white/5 rounded-full" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isViewingContent ? (
                      <>
                        <button
                          onClick={handleCloseViewer}
                          className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                          title="Back to files"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          {selectedFile ? <FileTextIcon className="w-5 h-5 text-white" /> : <LinkIcon className="w-5 h-5 text-white" />}
                        </div>
                        <h2 className="text-lg font-bold text-white tracking-tight truncate max-w-md">
                          {selectedFile ? selectedFile.fileName : "Link Viewer"}
                        </h2>
                      </>
                    ) : (
                      <>
                        <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <FolderOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-white tracking-tight">
                            {activeModule && `Module ${activeModule}`}
                            {activeTopic && ` / ${activeTopic.moduleTitle}`}
                            {activeFileType && ` / ${activeFileType.toUpperCase()}`}
                            {!activeModule && "Content"}
                          </h2>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="relative z-10 flex items-center gap-2">
                    {isViewingContent && selectedFile && (
                      <a
                        href={getFullUrl(selectedFile.fileUrl)}
                        download
                        className="px-4 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-white text-sm font-medium hover:bg-white/30 transition-colors"
                      >
                        Download
                      </a>
                    )}
                    {!isViewingContent && activeTopic && (
                      <button
                        className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                        onClick={(e) => openEditModal(e)}
                        title="Edit module"
                      >
                        <PencilIcon size={16} />
                      </button>
                    )}
                    {!isViewingContent && activeTopic && (
                      <button
                        className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-red-400/40 transition-colors"
                        onClick={(e) => openDeleteModal(e)}
                        title="Delete module"
                      >
                        <TrashIcon size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Area */}
              {isViewingContent ? (
                /* INLINE VIEWER - Renders file/link on the same page */
                <div className="relative" style={{ minHeight: "70vh" }}>
                  {selectedFile ? (
                    (() => {
                      const viewerUrl = getViewerUrl(selectedFile);
                      const canPreview = !!viewerUrl && !viewerFailed;
                      return canPreview ? (
                        <div className="relative w-full h-full" style={{ minHeight: "70vh" }}>
                          {isViewerLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 z-10">
                              <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-violet-500 dark:border-violet-400 border-t-transparent"></div>
                                <p className="mt-2 text-gray-600 dark:text-gray-300">Loading document...</p>
                              </div>
                            </div>
                          )}
                          <iframe
                            src={viewerUrl}
                            className="w-full border-0"
                            style={{ minHeight: "70vh" }}
                            title={selectedFile.fileName}
                            onLoad={() => setIsViewerLoading(false)}
                            onError={() => { setIsViewerLoading(false); setViewerFailed(true); }}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-900" style={{ minHeight: "70vh" }}>
                          <div className="text-center max-w-md">
                            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                              <FileTextIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                              {viewerFailed ? "Preview Failed to Load" : "Preview Not Available"}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                              {viewerFailed
                                ? "We couldn't load a preview for this file. This may be due to file permissions or network issues."
                                : "We can't display a preview for this file type."}
                            </p>
                            <div className="flex flex-col items-center space-y-3">
                              <a
                                href={getFullUrl(selectedFile.fileUrl)}
                                download
                                className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all font-medium shadow-sm"
                              >
                                Download File
                              </a>
                              {viewerFailed && (
                                <button
                                  onClick={() => { setViewerFailed(false); setIsViewerLoading(true); }}
                                  className="inline-flex items-center justify-center px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                                >
                                  Try Again
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : selectedLink ? (
                    <div className="relative w-full h-full" style={{ minHeight: "70vh" }}>
                      {isViewerLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 z-10">
                          <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 dark:border-purple-400 border-t-transparent"></div>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">Loading link...</p>
                          </div>
                        </div>
                      )}
                      <iframe
                        src={getFullUrl(selectedLink)}
                        className="w-full border-0"
                        style={{ minHeight: "70vh" }}
                        title="Link Viewer"
                        onLoad={() => setIsViewerLoading(false)}
                        onError={() => { setIsViewerLoading(false); setViewerFailed(true); }}
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                      />
                      {viewerFailed && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-900">
                          <div className="text-center max-w-md">
                            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                              <LinkIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                              Unable to Load Link
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                              This link cannot be embedded due to the website's security settings.
                            </p>
                            <a
                              href={selectedLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all font-medium shadow-sm"
                            >
                              <ExternalLinkIcon className="w-4 h-4" />
                              Open in New Tab
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              ) : (
              /* FILE GRID - Browse files and folders */
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {activeFileType && activeTopic ? (
                    // Show specific file type for selected topic
                    activeFileType === "pdf" ? (
                      // Show PDF files
                      getFilesByType(activeTopic, "pdf").map((file, idx) => (
                        <div
                          key={`pdf-${idx}`}
                          className="relative group overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-tertiary/10 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => handleFileClick(file)}
                        >
                          <div className="p-6 flex items-center justify-center bg-red-50/50 dark:bg-red-900/10">
                            <div className="text-red-500 group-hover:scale-110 transition-transform">
                              <FileTextIcon size={48} />
                            </div>
                          </div>
                          <div className="p-4 border-t border-tertiary/10">
                            <div className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-2">
                              PDF Document
                            </div>
                            <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-2 truncate">
                              {file.fileName}
                            </h3>
                            <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                              <span>
                                {new Date(file.uploadDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : activeFileType === "ppt" ? (
                      // Show PPT files
                      getFilesByType(activeTopic, "ppt")
                        .concat(getFilesByType(activeTopic, "pptx"))
                        .map((file, idx) => (
                          <div
                            key={`ppt-${idx}`}
                            className="relative group overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-tertiary/10 hover:shadow-md transition-all cursor-pointer"
                            onClick={() => handleFileClick(file)}
                          >
                            <div className="p-6 flex items-center justify-center bg-orange-50/50 dark:bg-orange-900/10">
                              <div className="text-orange-500 group-hover:scale-110 transition-transform">
                                <PresentationIcon size={48} />
                              </div>
                            </div>
                            <div className="p-4 border-t border-tertiary/10">
                              <div className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 mb-2">
                                Presentation
                              </div>
                              <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-2 truncate">
                                {file.fileName}
                              </h3>
                              <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                                <span>
                                  {new Date(file.uploadDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      activeFileType === "link" &&
                      // Show links
                      (Array.isArray(activeTopic.link)
                        ? activeTopic.link.map((link, idx) => (
                            <div
                              key={`link-${idx}`}
                              className="relative group overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-tertiary/10 hover:shadow-md transition-all cursor-pointer"
                              onClick={() => handleLinkClick(link)}
                            >
                              <div className="p-6 flex items-center justify-center bg-purple-50/50 dark:bg-purple-900/10">
                                <div className="text-purple-500 group-hover:scale-110 transition-transform">
                                  <LinkIcon size={48} />
                                </div>
                              </div>
                              <div className="p-4 border-t border-tertiary/10">
                                <div className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mb-2">
                                  Web Link
                                </div>
                                <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-2 truncate">
                                  {link.split("/").pop()}
                                </h3>
                                <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                                  <span>External Resource</span>
                                </div>
                              </div>
                            </div>
                          ))
                        : typeof activeTopic.link === "string" && (
                            <div
                              className="relative group overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-tertiary/10 hover:shadow-md transition-all cursor-pointer"
                              onClick={() => handleLinkClick(activeTopic.link)}
                            >
                              <div className="p-6 flex items-center justify-center bg-purple-50/50 dark:bg-purple-900/10">
                                <div className="text-purple-500 group-hover:scale-110 transition-transform">
                                  <LinkIcon size={48} />
                                </div>
                              </div>
                              <div className="p-4 border-t border-tertiary/10">
                                <div className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mb-2">
                                  Web Link
                                </div>
                                <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-2 truncate">
                                  {typeof activeTopic.link === "string"
                                    ? activeTopic.link.split("/").pop()
                                    : "Link"}
                                </h3>
                                <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                                  <span>External Resource</span>
                                </div>
                              </div>
                            </div>
                          ))
                    )
                  ) : activeTopic ? (
                    // Show all files for selected topic
                    <>
                      {/* PDF Files */}
                      {getFilesByType(activeTopic, "pdf").map((file, idx) => (
                        <div
                          key={`pdf-${idx}`}
                          className="relative group overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-tertiary/10 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => handleFileClick(file)}
                        >
                          <div className="p-6 flex items-center justify-center bg-red-50/50 dark:bg-red-900/10">
                            <div className="text-red-500 group-hover:scale-110 transition-transform">
                              <FileTextIcon size={48} />
                            </div>
                          </div>
                          <div className="p-4 border-t border-tertiary/10">
                            <div className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-2">
                              PDF Document
                            </div>
                            <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-2 truncate">
                              {file.fileName}
                            </h3>
                            <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                              <span>
                                {new Date(file.uploadDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* PPT Files */}
                      {getFilesByType(activeTopic, "ppt")
                        .concat(getFilesByType(activeTopic, "pptx"))
                        .map((file, idx) => (
                          <div
                            key={`ppt-${idx}`}
                            className="relative group overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-tertiary/10 hover:shadow-md transition-all cursor-pointer"
                            onClick={() => handleFileClick(file)}
                          >
                            <div className="p-6 flex items-center justify-center bg-orange-50/50 dark:bg-orange-900/10">
                              <div className="text-orange-500 group-hover:scale-110 transition-transform">
                                <PresentationIcon size={48} />
                              </div>
                            </div>
                            <div className="p-4 border-t border-tertiary/10">
                              <div className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 mb-2">
                                Presentation
                              </div>
                              <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-2 truncate">
                                {file.fileName}
                              </h3>
                              <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                                <span>
                                  {new Date(file.uploadDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}

                      {/* Links */}
                      {Array.isArray(activeTopic.link)
                        ? activeTopic.link.map((link, idx) => (
                            <div
                              key={`link-${idx}`}
                              className="relative group overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-tertiary/10 hover:shadow-md transition-all cursor-pointer"
                              onClick={() => handleLinkClick(link)}
                            >
                              <div className="p-6 flex items-center justify-center bg-purple-50/50 dark:bg-purple-900/10">
                                <div className="text-purple-500 group-hover:scale-110 transition-transform">
                                  <LinkIcon size={48} />
                                </div>
                              </div>
                              <div className="p-4 border-t border-tertiary/10">
                                <div className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mb-2">
                                  Web Link
                                </div>
                                <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-2 truncate">
                                  {link.split("/").pop()}
                                </h3>
                                <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                                  <span>External Resource</span>
                                </div>
                              </div>
                            </div>
                          ))
                        : typeof activeTopic.link === "string" && (
                            <div
                              className="relative group overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-tertiary/10 hover:shadow-md transition-all cursor-pointer"
                              onClick={() => handleLinkClick(activeTopic.link)}
                            >
                              <div className="p-6 flex items-center justify-center bg-purple-50/50 dark:bg-purple-900/10">
                                <div className="text-purple-500 group-hover:scale-110 transition-transform">
                                  <LinkIcon size={48} />
                                </div>
                              </div>
                              <div className="p-4 border-t border-tertiary/10">
                                <div className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mb-2">
                                  Web Link
                                </div>
                                <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-2 truncate">
                                  {typeof activeTopic.link === "string"
                                    ? activeTopic.link.split("/").pop()
                                    : "Link"}
                                </h3>
                                <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                                  <span>External Resource</span>
                                </div>
                              </div>
                            </div>
                          )}
                    </>
                  ) : (
                    // Show all topics for the active module if no topic is selected
                    activeModule &&
                    groupedModules[activeModule]?.map((module, moduleIdx) => (
                      <div
                        key={`module-${moduleIdx}`}
                        className="relative group overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-tertiary/10 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => setActiveTopic(module)}
                      >
                        <div className="p-6 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10">
                          <div className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                            <BookIcon size={48} />
                          </div>
                        </div>
                        <div className="p-4 border-t border-tertiary/10">
                          <div className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-2">
                            Module {activeModule}
                          </div>
                          <h3 className="font-semibold text-gray-800 dark:text-white text-sm mb-2 truncate">
                            {module.moduleTitle || `Topic ${moduleIdx + 1}`}
                          </h3>
                          <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                            <span>{module.files?.length || 0} files</span>
                            <span className="mx-2">•</span>
                            <span>
                              {Array.isArray(module.link)
                                ? module.link.length
                                : module.link
                                ? 1
                                : 0}{" "}
                              links
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Placeholder content if needed */}
                  {(!activeModule ||
                    !groupedModules[activeModule] ||
                    groupedModules[activeModule].length === 0) && (
                    <div className="col-span-full text-center py-16">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                        <Layers className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">Select a module to view content</p>
                    </div>
                  )}
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddModuleModal && (
        <AddModuleModal
          show={showAddModuleModal}
          onClose={() => setShowAddModuleModal(false)}
          courseId={courseId}
          onModuleAdded={handleModuleAdded}
        />
      )}
      {showEditModuleModal && (
        <EditModuleModal
          show={showEditModuleModal}
          onClose={() => setShowEditModuleModal(false)}
          courseId={courseId}
          module={activeTopic}
          onModuleUpdated={handleModuleUpdated}
        />
      )}

      {showDeleteModuleModal && (
        <DeleteConfirmationModal
          show={showDeleteModuleModal}
          onClose={() => setShowDeleteModuleModal(false)}
          courseId={courseId}
          module={activeTopic}
          onModuleDeleted={handleModuleDeleted}
        />
      )}
    </div>
  );
};

export default EContentViewer;
