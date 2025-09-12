import React, { useEffect, useRef, useState } from "react";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import {
  FileIcon,
  FolderIcon,
  LinkIcon,
  XIcon,
  BookIcon,
  FileTextIcon,
  PresentationIcon,
  ExternalLinkIcon,
  ArrowLeft,
} from "lucide-react";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowDown } from "react-icons/io";
import { eContent } from "../../components/data/mockData";
import { useNavigate, useParams } from "react-router-dom";
import { getAllEContent } from "../../services/econtent.service";
import AddModuleModal from "./AddModuleModal";
import { PencilIcon, TrashIcon } from "lucide-react";
import EditModuleModal from "./EditModuleModal"; // Adjust path as needed
import DeleteConfirmationModal from "./DeleteModuleModal";

const EContentViewer = () => {
  const [activeModule, setActiveModule] = useState(1);
  const [activeFileType, setActiveFileType] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { courseId } = useParams();
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [showEditModuleModal, setShowEditModuleModal] = useState(false);
  const [showDeleteModuleModal, setShowDeleteModuleModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contentData, setContentData] = useState(null);

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
    setSelectedModule(activeTopic);
    setShowEditModuleModal(true);
  };
  const openDeleteModal = (e) => {
    e.stopPropagation();
    setSelectedModule(activeTopic);
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
    setShowModal(true);
  };

  const handleLinkClick = (link) => {
    window.open(link, "_blank");
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

  // PDF Viewer Modal
  const FileViewerModal = () => {
    if (!selectedFile) return null;

    // Create a signed URL with Google Drive viewer
    const getGoogleDocsViewerUrl = (url) => {
      return `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(
        url
      )}`;
    };

    // Create viewer URL based on file type
    const getViewerUrl = () => {
      const fileType = selectedFile.fileType.toLowerCase();
      const url = selectedFile.fileUrl;

      if (fileType === "pdf") {
        return `${url}#toolbar=0`;
      } else if (fileType === "ppt" || fileType === "pptx") {
        return getGoogleDocsViewerUrl(url);
      }

      return null;
    };

    const [isLoading, setIsLoading] = useState(true);
    const [viewerFailed, setViewerFailed] = useState(false);

    const handleIframeLoad = () => {
      setIsLoading(false);
    };

    const handleIframeError = () => {
      setIsLoading(false);
      setViewerFailed(true);
    };

    // Determine if we can preview this file
    const viewerUrl = getViewerUrl();
    const canPreview = !!viewerUrl && !viewerFailed;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
        <div className="bg-white rounded-lg w-4/5 h-4/5 max-w-6xl flex flex-col">
          <div className="flex justify-between items-center p-4 border-b bg-emerald-600 text-white rounded-t-lg">
            <h3 className="font-semibold text-lg">{selectedFile.fileName}</h3>
            <button
              onClick={() => setShowModal(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <XIcon size={24} />
            </button>
          </div>

          <div className="flex-1 relative overflow-hidden">
            {canPreview ? (
              <>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
                      <p className="mt-2 text-gray-600">Loading document...</p>
                    </div>
                  </div>
                )}

                <iframe
                  src={viewerUrl}
                  className="w-full h-full border-0"
                  title={selectedFile.fileName}
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                ></iframe>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6">
                <div className="text-center max-w-md">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>

                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {viewerFailed
                      ? "Preview Failed to Load"
                      : "Preview Not Available"}
                  </h3>

                  <p className="text-gray-500 mb-6">
                    {viewerFailed
                      ? "We couldn't load a preview for this file. This may be due to file permissions or network issues."
                      : "We can't display a preview for this file type."}
                  </p>

                  <div className="flex flex-col space-y-3">
                    <a
                      href={selectedFile.fileUrl}
                      download
                      className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                    >
                      Download File
                    </a>

                    {viewerFailed && (
                      <button
                        onClick={() => {
                          setViewerFailed(false);
                          setIsLoading(true);
                        }}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Try Again
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading course content...</p>
        </div>
      </div>
    );
  }

  // Add an error state (place this after the loading check)
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-80 min-h-screen border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200 bg-emerald-600 text-white">
          <h2 className="text-lg font-semibold">Course Content</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-64px)]">
          {Object.keys(groupedModules).map((moduleNumber) => (
            <div key={moduleNumber} className="mb-2">
              <div
                className={`flex items-center p-3 cursor-pointer hover:bg-emerald-50 ${
                  parseInt(moduleNumber) === activeModule
                    ? "bg-emerald-100"
                    : ""
                }`}
                onClick={() => {
                  setActiveModule(parseInt(moduleNumber));
                  setActiveFileType(null);
                  setActiveTopic(null);
                }}
              >
                <span
                  className={`mr-2 ${
                    parseInt(moduleNumber) === activeModule
                      ? "text-emerald-600"
                      : "text-gray-400"
                  }`}
                >
                  {parseInt(moduleNumber) === activeModule ? (
                    <IoIosArrowDown />
                  ) : (
                    <IoIosArrowForward />
                  )}
                </span>
                <span
                  className={`font-medium ${
                    parseInt(moduleNumber) === activeModule
                      ? "text-emerald-700"
                      : "text-gray-700"
                  }`}
                >
                  Module {moduleNumber}
                </span>
              </div>

              {parseInt(moduleNumber) === activeModule && (
                <div className="ml-8 my-2">
                  {groupedModules[moduleNumber].map((module, idx) => (
                    <div key={idx} className="mb-3">
                      <div
                        className={`flex items-center py-1 px-2 cursor-pointer hover:bg-emerald-50 transition-colors ${
                          activeTopic === module
                            ? "bg-emerald-50 rounded text-emerald-700"
                            : "text-gray-600"
                        }`}
                        onClick={() => {
                          setActiveTopic(module);
                          setActiveFileType(null);
                        }}
                      >
                        <span className="mr-2">{idx + 1}.</span>
                        <span className="truncate">
                          {module.moduleTitle || `Topic ${idx + 1}`}
                        </span>
                        <div className="flex space-x-2 ml-auto">
                          {module.files &&
                            module.files.some(
                              (f) => f.fileType.toLowerCase() === "pdf"
                            ) && (
                              <div
                                className={`cursor-pointer rounded-full p-1 hover:bg-emerald-100 ${
                                  activeFileType === "pdf" &&
                                  activeTopic === module
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "text-red-500"
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
                                <FileTextIcon size={16} />
                              </div>
                            )}
                          {module.files &&
                            module.files.some(
                              (f) =>
                                f.fileType.toLowerCase() === "ppt" ||
                                f.fileType.toLowerCase() === "pptx"
                            ) && (
                              <div
                                className={`cursor-pointer rounded-full p-1 hover:bg-emerald-100 ${
                                  activeFileType === "ppt" &&
                                  activeTopic === module
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "text-orange-500"
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
                                <PresentationIcon size={16} />
                              </div>
                            )}
                          {Array.isArray(module.link) &&
                            module.link.length > 0 && (
                              <div
                                className={`cursor-pointer rounded-full p-1 hover:bg-emerald-100 ${
                                  activeFileType === "link" &&
                                  activeTopic === module
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "text-purple-500"
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
                                <LinkIcon size={16} />
                              </div>
                            )}
                          {typeof module.link === "string" && (
                            <div
                              className="cursor-pointer rounded-full p-1 hover:bg-emerald-100 text-purple-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLinkClick(module.link);
                              }}
                            >
                              <ExternalLinkIcon size={16} />
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
          <div className="w-full flex justify-center">
            <div className="w-full flex justify-center">
              <button
                className="text-white p-2 bg-emerald-400 hover:bg-emerald-500 rounded-lg"
                onClick={() => setShowAddModuleModal(true)}
              >
                Add New Module/Topic
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 w-full text-green-600 hover:text-green-900 mb-4 justify-end p-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2"></div>
          <div className="flex items-center text-xl text-emerald-600 justify-between px-3 py-2 rounded">
            <span className="font-medium">
              {activeModule && `Module ${activeModule}`}
              {activeTopic && ` > ${activeTopic.moduleTitle}`}
              {activeFileType && ` > ${activeFileType.toUpperCase()} Files`}
            </span>
            <div className="flex gap-2">
              {activeTopic && (
                <div
                  className="cursor-pointer rounded-full p-1 hover:bg-blue-100 text-blue-500"
                  onClick={(e) => openEditModal(e)}
                  title="Edit module"
                >
                  <PencilIcon size={20} />
                </div>
              )}
              {activeTopic && (
                <div
                  className="cursor-pointer rounded-full p-1 hover:bg-red-100 text-red-500"
                  onClick={(e) => openDeleteModal(e)}
                  title="Delete module"
                >
                  <TrashIcon size={20} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 ">
          {activeFileType && activeTopic ? (
            // Show specific file type for selected topic
            activeFileType === "pdf" ? (
              // Show PDF files
              getFilesByType(activeTopic, "pdf").map((file, idx) => (
                <div
                  key={`pdf-${idx}`}
                  className="relative group overflow-hidden rounded-lg  border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-emerald-300"
                  onClick={() => handleFileClick(file)}
                >
                  <div className="aspect-w-16 aspect-h-9 relative">
                    <div className="p-2 flex items-center justify-center">
                      <div className="text-red-500 group-hover:scale-110 transition-transform">
                        <FileTextIcon size={48} />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-red-100/20 rounded-lg">
                    <div className="text-xs font-medium text-red-600 mb-1">
                      PDF Document
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm mb-2 truncate">
                      {file.fileName}
                    </h3>
                    <div className="flex items-center text-gray-500 text-xs">
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
                    className="relative group overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-emerald-300"
                    onClick={() => handleFileClick(file)}
                  >
                    <div className="p-2 aspect-w-16 aspect-h-9 relative">
                      <div className=" flex items-center justify-center">
                        <div className="text-orange-500 group-hover:scale-110 transition-transform">
                          <PresentationIcon size={48} />
                        </div>
                      </div>
                    </div>
                    <div className="p-4  bg-orange-50 rounded-lg">
                      <div className="text-xs font-medium text-orange-600 mb-1">
                        Presentation
                      </div>
                      <h3 className="font-semibold text-gray-800 text-sm mb-2 truncate">
                        {file.fileName}
                      </h3>
                      <div className="flex items-center text-gray-500 text-xs">
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
                      className="relative group overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-emerald-300"
                      onClick={() => handleLinkClick(link)}
                    >
                      <div className="aspect-w-16 aspect-h-9  relative">
                        <div className="p-2 flex items-center justify-center">
                          <div className="text-purple-500 group-hover:scale-110 transition-transform">
                            <LinkIcon size={48} />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-xs font-medium text-purple-600 mb-1">
                          Web Link
                        </div>
                        <h3 className="font-semibold text-gray-800 text-sm mb-2 truncate">
                          {link.split("/").pop()}
                        </h3>
                        <div className="flex items-center text-gray-500 text-xs">
                          <span>External Resource</span>
                        </div>
                      </div>
                    </div>
                  ))
                : typeof activeTopic.link === "string" && (
                    <div
                      className="relative group overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-emerald-300"
                      onClick={() => handleLinkClick(activeTopic.link)}
                    >
                      <div className="aspect-w-16 aspect-h-9 bg-purple-50 relative">
                        <div className=" flex items-center justify-center">
                          <div className="text-purple-500 group-hover:scale-110 transition-transform">
                            <LinkIcon size={48} />
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="text-xs font-medium text-purple-600 mb-1">
                          Web Link
                        </div>
                        <h3 className="font-semibold text-gray-800 text-sm mb-2 truncate">
                          {typeof activeTopic.link === "string"
                            ? activeTopic.link.split("/").pop()
                            : "Link"}
                        </h3>
                        <div className="flex items-center text-gray-500 text-xs">
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
                  className="relative group overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-emerald-300"
                  onClick={() => handleFileClick(file)}
                >
                  <div className="aspect-w-16 aspect-h-9  relative">
                    <div className="p-2 flex items-center justify-center">
                      <div className="text-red-500 group-hover:scale-110 transition-transform">
                        <FileTextIcon size={48} />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-xs font-medium text-red-600 mb-1">
                      PDF Document
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm mb-2 truncate">
                      {file.fileName}
                    </h3>
                    <div className="flex items-center text-gray-500 text-xs">
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
                    className="relative group overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-emerald-300"
                    onClick={() => handleFileClick(file)}
                  >
                    <div className="aspect-w-16 aspect-h-9 relative">
                      <div className="p-2 flex items-center justify-center">
                        <div className="text-orange-500 group-hover:scale-110 transition-transform">
                          <PresentationIcon size={48} />
                        </div>
                      </div>
                    </div>
                    <div className="p-4  bg-orange-50 rounded-lg">
                      <div className="text-xs font-medium text-orange-600 mb-1">
                        Presentation
                      </div>
                      <h3 className="font-semibold text-gray-800 text-sm mb-2 truncate">
                        {file.fileName}
                      </h3>
                      <div className="flex items-center text-gray-500 text-xs">
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
                      className="relative group overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-emerald-300"
                      onClick={() => handleLinkClick(link)}
                    >
                      <div className="aspect-w-16 aspect-h-9  relative">
                        <div className="p-2 flex items-center justify-center">
                          <div className="text-purple-500 group-hover:scale-110 transition-transform">
                            <LinkIcon size={48} />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-xs font-medium text-purple-600 mb-1">
                          Web Link
                        </div>
                        <h3 className="font-semibold text-gray-800 text-sm mb-2 truncate">
                          {link.split("/").pop()}
                        </h3>
                        <div className="flex items-center text-gray-500 text-xs">
                          <span>External Resource</span>
                        </div>
                      </div>
                    </div>
                  ))
                : typeof activeTopic.link === "string" && (
                    <div
                      className="relative group overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-emerald-300"
                      onClick={() => handleLinkClick(activeTopic.link)}
                    >
                      <div className="aspect-w-16 aspect-h-9 b relative">
                        <div className="p-2 flex items-center justify-center">
                          <div className="text-purple-500 group-hover:scale-110 transition-transform">
                            <LinkIcon size={48} />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-xs font-medium text-purple-600 mb-1">
                          Web Link
                        </div>
                        <h3 className="font-semibold text-gray-800 text-sm mb-2 truncate">
                          {typeof activeTopic.link === "string"
                            ? activeTopic.link.split("/").pop()
                            : "Link"}
                        </h3>
                        <div className="flex items-center text-gray-500 text-xs">
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
                className="relative group overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-emerald-300"
                onClick={() => setActiveTopic(module)}
              >
                <div className="aspect-w-16 aspect-h-9 bg-emerald-50 relative">
                  <div className="p-2 flex items-center justify-center">
                    <div className="text-emerald-500 group-hover:scale-110 transition-transform">
                      <BookIcon size={48} />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-xs font-medium text-emerald-600 mb-1">
                    Module {activeModule}
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm mb-2 truncate">
                    {module.moduleTitle || `Topic ${moduleIdx + 1}`}
                  </h3>
                  <div className="flex items-center text-gray-500 text-xs">
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
            <div className="col-span-4 text-center py-10">
              <p className="text-gray-500">Select a module to view content</p>
            </div>
          )}
        </div>
      </div>

      {/* PDF/File Viewer Modal */}
      {showModal && <FileViewerModal />}

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
