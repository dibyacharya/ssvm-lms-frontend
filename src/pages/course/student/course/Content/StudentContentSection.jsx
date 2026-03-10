import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Link,
  Presentation,
  Video,
} from "lucide-react";
import { useCourse } from "../../../../../context/CourseContext";
import { getCourseMaterials } from "../../../../../services/course.service";
import {
  resolveContentTheme,
  resolveModuleTheme,
} from "../../../../../utils/lmsAssetResolver";
import LmsAssetImage from "../../../../../components/common/LmsAssetImage";
import CoursePageBanner from "../../../../../components/shared/CoursePageBanner";

const contentTypes = {
  pdfs: {
    label: "Course Content",
    icon: FileText,
    key: "pdfs",
    countKey: "pdfCount",
  },
  ppts: {
    label: "Presentations",
    icon: Presentation,
    key: "ppts",
    countKey: "pptCount",
  },
  videos: {
    label: "Videos",
    icon: Video,
    key: "videos",
    countKey: "videoCount",
  },
  links: {
    label: "Links",
    icon: Link,
    key: "links",
    countKey: "linkCount",
  },
};

const normalizeMaterialItem = (item) => ({
  _id: item?._id,
  name: item?.name || item?.title || "Untitled",
  title: item?.title || item?.name || "Untitled",
  fileUrl: item?.fileUrl || item?.url || item?.videoUrl || "",
  url: item?.url || item?.fileUrl || "",
  fileName: item?.fileName || "",
  fileSize: Number(item?.fileSize || item?.sizeBytes || item?.size || 0) || 0,
  createDate: item?.createDate || item?.uploadedAt || item?.createdAt || null,
  thumbnail: item?.thumbnail || null,
  description: item?.description || "",
});

const normalizeModules = (modules = []) =>
  modules.map((mod, index) => {
    const pdfs = Array.isArray(mod?.pdfs)
      ? mod.pdfs.map(normalizeMaterialItem)
      : Array.isArray(mod?.items?.pdf)
      ? mod.items.pdf.map(normalizeMaterialItem)
      : [];

    const ppts = Array.isArray(mod?.ppts)
      ? mod.ppts.map(normalizeMaterialItem)
      : Array.isArray(mod?.presentations)
      ? mod.presentations.map(normalizeMaterialItem)
      : Array.isArray(mod?.items?.presentation)
      ? mod.items.presentation.map(normalizeMaterialItem)
      : [];

    const videos = Array.isArray(mod?.videos)
      ? mod.videos.map(normalizeMaterialItem)
      : Array.isArray(mod?.items?.video)
      ? mod.items.video.map(normalizeMaterialItem)
      : [];

    const links = Array.isArray(mod?.links)
      ? mod.links.map(normalizeMaterialItem)
      : Array.isArray(mod?.items?.link)
      ? mod.items.link.map(normalizeMaterialItem)
      : [];

    return {
      _id: mod?._id,
      moduleNumber:
        Number(mod?.moduleNumber) || Number(mod?.moduleNo) || Number(mod?.order) || index + 1,
      moduleTitle: mod?.moduleTitle || mod?.title || `Module ${index + 1}`,
      description: mod?.description || "",
      pdfs,
      ppts,
      videos,
      links,
      pdfCount: Number(mod?.pdfCount ?? mod?.counts?.pdf ?? pdfs.length) || 0,
      pptCount: Number(mod?.pptCount ?? mod?.counts?.presentation ?? ppts.length) || 0,
      videoCount: Number(mod?.videoCount ?? mod?.counts?.video ?? videos.length) || 0,
      linkCount: Number(mod?.linkCount ?? mod?.counts?.link ?? links.length) || 0,
    };
  });

const StudentContentSection = () => {
  const { courseData } = useCourse();
  const courseId = courseData?.id || courseData?._id;

  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedContentType, setSelectedContentType] = useState("pdfs");
  const [expandedModule, setExpandedModule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [viewingItem, setViewingItem] = useState(null);
  const [viewerLoading, setViewerLoading] = useState(true);
  const [viewerFailed, setViewerFailed] = useState(false);

  useEffect(() => {
    if (!courseId) return;

    let cancelled = false;

    const loadMaterials = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getCourseMaterials(courseId);
        if (cancelled) return;

        const normalized = normalizeModules(response?.modules || []);
        setModules(normalized);

        if (normalized.length > 0) {
          setExpandedModule(normalized[0]._id);
          setSelectedModule(normalized[0]);
        } else {
          setExpandedModule(null);
          setSelectedModule(null);
        }
      } catch (_err) {
        if (!cancelled) {
          setError("Failed to load course materials.");
          setModules([]);
          setSelectedModule(null);
          setExpandedModule(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadMaterials();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const currentItems = useMemo(() => {
    if (!selectedModule) return [];
    return Array.isArray(selectedModule[selectedContentType])
      ? selectedModule[selectedContentType]
      : [];
  }, [selectedModule, selectedContentType]);

  const handleModuleToggle = (moduleId) => {
    if (expandedModule === moduleId) {
      setExpandedModule(null);
      setSelectedModule(null);
      return;
    }

    setExpandedModule(moduleId);
    const moduleRow = modules.find((mod) => mod._id === moduleId) || null;
    setSelectedModule(moduleRow);
  };

  const handleContentTypeSelect = (moduleRow, contentType) => {
    setSelectedModule(moduleRow);
    setSelectedContentType(contentType);
  };

  const formatFileSize = (bytes) => {
    const size = Number(bytes) || 0;
    if (size <= 0) return "";
    const base = 1024;
    const units = ["Bytes", "KB", "MB", "GB"];
    const unitIndex = Math.floor(Math.log(size) / Math.log(base));
    return `${parseFloat((size / Math.pow(base, unitIndex)).toFixed(2))} ${units[unitIndex]}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const BACKEND_URL = window.RUNTIME_CONFIG?.BACKEND_URL || "";

  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${BACKEND_URL}${url}`;
  };

  const getPptPreviewUrl = (fileUrl) =>
    `${BACKEND_URL}/api/preview/ppt-to-pdf?file=${encodeURIComponent(fileUrl)}`;

  // Detect if a video item is an uploaded file (vs YouTube/Vimeo URL)
  const isUploadedVideo = (item) => {
    if (item?.fileKey || item?.fileName) return true;
    const url = item?.fileUrl || item?.url || "";
    if (!url) return false;
    if (url.includes("blob.core.windows.net") || url.includes("/uploads/")) return true;
    if (url && !url.includes("youtube.com") && !url.includes("youtu.be") && !url.includes("vimeo.com")) return true;
    return false;
  };

  const convertToEmbedUrl = (url) => {
    if (!url) return url;
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("/").pop().split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("vimeo.com/") && !url.includes("player.vimeo.com")) {
      const videoId = url.split("/").pop().split("?")[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  const getInlineViewerUrl = (item, type) => {
    if (type === "links") {
      return getFullUrl(item.url || item.fileUrl);
    }

    const rawUrl = item.fileUrl || item.videoUrl || item.url;
    const url = getFullUrl(rawUrl);
    if (!url) return null;

    if (type === "pdfs") return `${url}#toolbar=0`;
    if (type === "ppts") return `${getPptPreviewUrl(rawUrl)}#toolbar=0`;
    if (type === "videos") return convertToEmbedUrl(url);

    return null;
  };

  const handleViewInline = (item) => {
    setViewingItem(item);
    setViewerLoading(true);
    setViewerFailed(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-blue-600 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {!viewingItem && (
        <div className="w-80 bg-white shadow-lg border-r">
          <div className="relative overflow-hidden p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
            <div className="absolute -bottom-4 right-12 w-12 h-12 bg-white/5 rounded-full" />
            <h2 className="relative z-10 text-xl font-bold text-white">Course Modules</h2>
            <p className="relative z-10 text-sm text-white/70 mt-1">{courseData?.title}</p>
          </div>

          <div className="overflow-y-auto h-full pb-20">
            {modules.map((moduleRow) => (
              <div key={moduleRow._id} className="border-b">
                {(() => {
                  const modTheme = resolveModuleTheme(moduleRow);
                  const totalCount =
                    (moduleRow.pdfCount || 0) +
                    (moduleRow.pptCount || 0) +
                    (moduleRow.videoCount || 0) +
                    (moduleRow.linkCount || 0);

                  return (
                    <div
                      onClick={() => handleModuleToggle(moduleRow._id)}
                      className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                        expandedModule === moduleRow._id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <LmsAssetImage
                          src={modTheme.moduleThumbnailUrl}
                          alt={moduleRow.moduleTitle}
                          gradientCSS={modTheme.gradientCSS}
                          containerClassName="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                          className="w-full h-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 mb-1">
                            Module {moduleRow.moduleNumber}: {moduleRow.moduleTitle}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {moduleRow.description || `${totalCount} items`}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          {expandedModule === moduleRow._id ? (
                            <ChevronDown size={20} className="text-blue-600" />
                          ) : (
                            <ChevronRight size={20} className="text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {expandedModule === moduleRow._id && (
                  <div className="bg-gray-50 px-4 pb-4">
                    <div className="space-y-2">
                      {Object.entries(contentTypes).map(([key, config]) => {
                        const Icon = config.icon;
                        const count = moduleRow[config.countKey] || 0;
                        const isActive =
                          selectedModule?._id === moduleRow._id && selectedContentType === key;

                        return (
                          <button
                            key={key}
                            onClick={() => handleContentTypeSelect(moduleRow, key)}
                            className={`w-full flex items-center justify-between p-3 rounded-md text-sm transition-colors ${
                              isActive
                                ? "bg-blue-100 text-blue-700 border border-blue-200"
                                : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <Icon size={16} />
                              <span>{config.label}</span>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isActive
                                  ? "bg-blue-200 text-blue-800"
                                  : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        {viewingItem ? (
          <>
            <div className="bg-white shadow-sm border-b p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setViewingItem(null)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                    title="Back to files"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                      {viewingItem.name || viewingItem.title}
                    </h1>
                    <p className="text-sm text-gray-500">
                      {contentTypes[selectedContentType]?.label}
                    </p>
                  </div>
                </div>
                {selectedContentType !== "links" &&
                  (viewingItem.fileUrl || viewingItem.url) && (
                    <a
                      href={getFullUrl(viewingItem.fileUrl || viewingItem.url)}
                      download
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
                    >
                      <Download size={16} />
                      <span>Download</span>
                    </a>
                  )}
              </div>
            </div>

            <div className="flex-1 relative">
              {(() => {
                const viewerUrl = getInlineViewerUrl(viewingItem, selectedContentType);
                if (!viewerUrl) {
                  return (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-500">Preview not available for this file type.</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <>
                    {viewerLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                        <div className="text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent" />
                          <p className="mt-2 text-gray-600">Loading...</p>
                        </div>
                      </div>
                    )}

                    {selectedContentType === "videos" && isUploadedVideo(viewingItem) ? (
                      <video
                        src={viewerUrl}
                        controls
                        className="w-full h-full"
                        style={{ minHeight: "70vh", backgroundColor: "#000" }}
                        onLoadedData={() => setViewerLoading(false)}
                        onError={() => {
                          setViewerLoading(false);
                          setViewerFailed(true);
                        }}
                      />
                    ) : (
                      <iframe
                        src={viewerUrl}
                        className="w-full h-full border-0"
                        style={{ minHeight: "70vh" }}
                        title={viewingItem.name || viewingItem.title}
                        onLoad={() => setViewerLoading(false)}
                        onError={() => {
                          setViewerLoading(false);
                          setViewerFailed(true);
                        }}
                        sandbox={
                          selectedContentType === "links"
                            ? "allow-same-origin allow-scripts allow-popups allow-forms"
                            : undefined
                        }
                      />
                    )}

                    {viewerFailed && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white">
                        <div className="text-center max-w-md">
                          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Failed to load preview
                          </h3>
                          <p className="text-gray-500 mb-4">
                            The content could not be embedded. Try opening it in a new tab.
                          </p>
                          <a
                            href={viewerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2 text-sm"
                          >
                            <ExternalLink size={16} />
                            Open in New Tab
                          </a>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </>
        ) : selectedModule ? (
          <>
            <CoursePageBanner
              icon={FileText}
              title={`Module ${selectedModule.moduleNumber}: ${selectedModule.moduleTitle}`}
              subtitle={`Viewing ${contentTypes[selectedContentType]?.label}`}
              gradient="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
            />

            <div className="flex-1 overflow-y-auto p-6">
              {currentItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-lg mb-2">
                    No {contentTypes[selectedContentType]?.label.toLowerCase()} found
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentItems.map((item) => (
                    <ReadonlyContentCard
                      key={item._id}
                      item={item}
                      contentType={selectedContentType}
                      onView={() => handleViewInline(item)}
                      formatFileSize={formatFileSize}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 mb-4 w-full flex items-center justify-center">
                <FileText size={64} />
              </div>
              <h2 className="text-xl font-medium text-gray-600">Select a Module</h2>
              <p className="text-gray-500 mt-2">
                Choose a module from the left to view its content
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ReadonlyContentCard = ({
  item,
  contentType,
  onView,
  formatFileSize,
  formatDate,
}) => {
  const contentTheme = resolveContentTheme(item, contentType);

  const getFileIcon = () => {
    switch (contentType) {
      case "pdfs":
        return <FileText className="text-red-500" size={24} />;
      case "ppts":
        return <Presentation className="text-orange-500" size={24} />;
      case "videos":
        return <Video className="text-blue-500" size={24} />;
      case "links":
        return <Link className="text-green-500" size={24} />;
      default:
        return <FileText className="text-gray-500" size={24} />;
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onView}
    >
      <LmsAssetImage
        src={contentTheme.contentThumbnailUrl}
        alt={item.name || item.title}
        gradientCSS={contentTheme.gradientCSS}
        fallbackIcon={getFileIcon()}
        containerClassName="h-40 w-full"
        className="w-full h-full object-cover"
      />

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {item.name || item.title}
        </h3>

        {item.description ? (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
        ) : null}

        {contentType === "links" && (item.url || item.fileUrl) ? (
          <div className="mb-3">
            <p className="text-xs text-blue-600 truncate" title={item.url || item.fileUrl}>
              {item.url || item.fileUrl}
            </p>
          </div>
        ) : null}

        <div className="flex items-center justify-between text-xs text-gray-500">
          {item.fileSize ? <span>{formatFileSize(item.fileSize)}</span> : <span />}
          {item.createDate ? <span>{formatDate(item.createDate)}</span> : null}
        </div>
      </div>
    </div>
  );
};

export default StudentContentSection;
