import React, { useState, useEffect } from 'react';
import { FileText, Video, Presentation, Plus, Edit, Trash2, Upload, Download, Link, ExternalLink, ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { useCourse } from '../../../../../context/CourseContext';
import {
  addModuleContent,
  updateContentItem,
  deleteContentItem
} from '../../../../../services/content.service';
import { getCoursesById } from '../../../../../services/course.service';
import { resolveModuleTheme, resolveContentTheme } from '../../../../../utils/lmsAssetResolver';
import LmsAssetImage from '../../../../../components/common/LmsAssetImage';

const ContentSection = () => {
  const { courseData, setCourseData } = useCourse();
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedContentType, setSelectedContentType] = useState('pdfs');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [expandedModule, setExpandedModule] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewingItem, setViewingItem] = useState(null);
  const [viewerLoading, setViewerLoading] = useState(true);
  const [viewerFailed, setViewerFailed] = useState(false);

  // Content type configurations
  const contentTypes = {
    pdfs: { label: 'Course Content', icon: FileText, key: 'pdfs', countKey: 'pdfCount' },
    ppts: { label: 'Presentations', icon: Presentation, key: 'ppts', countKey: 'pptCount' },
    videos: { label: 'Videos', icon: Video, key: 'videos', countKey: 'videoCount' },
    links: { label: 'Links', icon: Link, key: 'links', countKey: 'linkCount' }
  };

  useEffect(() => {
    if (courseData?.syllabus?.modules?.length > 0) {
      // Only auto-select first module if no module is currently selected
      if (!selectedModule && !expandedModule) {
        const firstModule = courseData.syllabus.modules[0];
        setExpandedModule(firstModule._id);
        setSelectedModule(firstModule);
      }
    }
  }, [courseData]);

  const handleModuleToggle = (moduleId) => {
    if (expandedModule === moduleId) {
      setExpandedModule(null);
      setSelectedModule(null);
    } else {
      setExpandedModule(moduleId);
      const module = courseData.syllabus.modules.find(m => m._id === moduleId);
      setSelectedModule(module);
    }
  };

  // Properly set the content type; do not refetch here to keep it lightweight
  const handleContentTypeSelect = async (module, contentType) => {
    setSelectedContentType(contentType);
    setSelectedModule(module);
  };

  const normalizeSyllabus = (responseCourse) => {
    if (!responseCourse?.syllabus) return { modules: [] };
    let modules = [];
    if (Array.isArray(responseCourse.syllabus)) {
      modules = responseCourse.syllabus;
    } else if (Array.isArray(responseCourse.syllabus.modules)) {
      modules = responseCourse.syllabus.modules;
    }
    modules = modules.map(m => ({ ...m, topics: Array.isArray(m.topics) ? m.topics : [] }));
    return { modules };
  };

  const refreshCourseAndModule = async (moduleId) => {
    const freshCourse = await getCoursesById(courseData.id);
    const normalizedSyllabus = normalizeSyllabus(freshCourse);
    const newCourseData = { ...freshCourse, syllabus: normalizedSyllabus };
    setCourseData(newCourseData);
    const freshModule = newCourseData.syllabus.modules.find(m => m._id === moduleId);
    if (freshModule) {
      setSelectedModule(freshModule);
    }
    setRefreshKey((k) => k + 1);
  };

  const handleAddContent = async (contentData, file, thumbnail) => {
    if (!selectedModule) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      
      // Add content type and basic data
      formData.append('contentType', selectedContentType.slice(0, -1)); // Remove 's' from end
      formData.append('name', contentData.name);
      formData.append('description', contentData.description || '');
      
      // For links, add the URL (backend expects 'fileUrl')
      if (selectedContentType === 'links' && contentData.url) {
        formData.append('fileUrl', contentData.url);
      }

      // For videos, add URL if provided (YouTube/Vimeo)
      if (selectedContentType === 'videos' && contentData.url) {
        formData.append('videoUrl', contentData.url);
      }

      if (file) {
        formData.append('file', file);
      }
      
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }

      await addModuleContent(courseData.id, selectedModule._id, formData);

      // Force-refresh full course and selected module from /courses
      await refreshCourseAndModule(selectedModule._id);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteContent = async (contentId) => {
    if (!selectedModule || !window.confirm('Are you sure you want to delete this content?')) return;

    setIsLoading(true);
    try {
      const contentType = selectedContentType.slice(0, -1); // Remove 's' from end
      await deleteContentItem(courseData.id, selectedModule._id, contentType, contentId);
      
      // Force-refresh full course and selected module from /courses
      await refreshCourseAndModule(selectedModule._id);
    } catch (error) {
      console.error('Error deleting content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateContent = async (updatedData, file, thumbnail) => {
    if (!selectedModule || !editingItem) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', updatedData.name);
      formData.append('description', updatedData.description || '');
      
      if (selectedContentType === 'links' && updatedData.url) {
        formData.append('fileUrl', updatedData.url);
      }

      if (selectedContentType === 'videos' && updatedData.url) {
        formData.append('videoUrl', updatedData.url);
      }

      if (file) {
        formData.append('file', file);
      }

      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }

      const contentType = selectedContentType.slice(0, -1);
      await updateContentItem(courseData.id, selectedModule._id, contentType, editingItem._id, formData);
      
      // Force-refresh full course and selected module from /courses
      await refreshCourseAndModule(selectedModule._id);
      
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Inline viewer helpers
  const BACKEND_URL = window.RUNTIME_CONFIG?.BACKEND_URL || '';

  const getFullUrl = (url) => {
    if (!url) return null;
    // If already a full URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    // Prepend backend URL for relative paths
    return `${BACKEND_URL}${url}`;
  };

  // Helper: Get PPT-to-PDF conversion URL (backend converts PPT→PDF via LibreOffice)
  const getPptPreviewUrl = (fileUrl) => {
    return `${BACKEND_URL}/api/preview/ppt-to-pdf?file=${encodeURIComponent(fileUrl)}`;
  };

  // Detect if a video item is an uploaded file (vs YouTube/Vimeo URL)
  const isUploadedVideo = (item) => {
    if (item?.fileKey || item?.fileName) return true;
    const url = item?.fileUrl || item?.url || '';
    if (!url) return false;
    if (url.includes('blob.core.windows.net') || url.includes('/uploads/')) return true;
    if (url && !url.includes('youtube.com') && !url.includes('youtu.be') && !url.includes('vimeo.com')) return true;
    return false;
  };

  const convertToEmbedUrl = (url) => {
    if (!url) return url;
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('/').pop().split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
      const videoId = url.split('/').pop().split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  const getInlineViewerUrl = (item, type) => {
    if (type === 'links') {
      const linkUrl = item.url || item.link || item.fileUrl;
      return getFullUrl(linkUrl);
    }
    const url = getFullUrl(item.fileUrl || item.videoUrl || item.url);
    if (!url) return null;
    if (type === 'pdfs') return `${url}#toolbar=0`;
    if (type === 'ppts') return `${getPptPreviewUrl(item.fileUrl)}#toolbar=0`;
    if (type === 'videos') return convertToEmbedUrl(url);
    return null;
  };

  const handleViewInline = (item) => {
    setViewingItem(item);
    setViewerLoading(true);
    setViewerFailed(false);
  };

  const handleCloseViewer = () => {
    setViewingItem(null);
  };

  const renderContentItems = () => {
    if (!selectedModule || !selectedModule[selectedContentType]) {
      return (
        <div className="text-center py-12 text-gray-500">
          <div className="text-lg mb-2">No {contentTypes[selectedContentType]?.label.toLowerCase()} found</div>
          <div className="text-sm">Click "Add {contentTypes[selectedContentType]?.label}" to get started</div>
        </div>
      );
    }

    const items = selectedModule[selectedContentType];
    
    return (
      <div key={`${selectedModule._id}-${selectedContentType}-${refreshKey}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <ContentCard
            key={item._id}
            item={item}
            contentType={selectedContentType}
            onDelete={() => handleDeleteContent(item._id)}
            onEdit={() => setEditingItem(item)}
            onView={() => handleViewInline(item)}
            formatFileSize={formatFileSize}
            formatDate={formatDate}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Module Accordion (hidden when viewing content) */}
      {!viewingItem && (
      <div className="w-80 bg-white/70 backdrop-blur-xl shadow-card border-r border-gray-200">
        <div className="relative overflow-hidden p-6 bg-gradient-to-r from-primary-600 to-blue-600">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
          <div className="absolute -bottom-4 right-12 w-12 h-12 bg-white/5 rounded-full" />
          <h2 className="relative z-10 text-xl font-bold text-gray-900">Course Modules</h2>
          <p className="relative z-10 text-sm text-gray-900/70 mt-1">{courseData?.title}</p>
        </div>
        
        <div className="overflow-y-auto h-full pb-20">
          {courseData?.syllabus?.modules?.map((module) => (
            <div key={module._id} className="border-b">
              {/* Module Header */}
              {(() => {
                const modTheme = resolveModuleTheme(module);
                return (
                  <div
                    onClick={() => handleModuleToggle(module._id)}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                      expandedModule === module._id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <LmsAssetImage
                        src={modTheme.moduleThumbnailUrl}
                        alt={module.moduleTitle}
                        gradientCSS={modTheme.gradientCSS}
                        containerClassName="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                        className="w-full h-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 mb-1">
                          Module {module.moduleNumber}: {module.moduleTitle}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {module.description}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        {expandedModule === module._id ? (
                          <ChevronDown size={20} className="text-primary-600" />
                        ) : (
                          <ChevronRight size={20} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Module Content - Accordion Panel */}
              {expandedModule === module._id && (
                <div className="bg-white/[0.02] px-4 pb-4">
                  <div className="space-y-2">
                    {Object.entries(contentTypes).map(([key, config]) => {
                      const Icon = config.icon;
                      const count = module[config.countKey] || 0;
                      
                      return (
                        <button
                          key={key}
                          onClick={() => handleContentTypeSelect(module, key)}
                          className={`w-full flex items-center justify-between p-3 rounded-md text-sm transition-colors ${
                            selectedModule?._id === module._id && selectedContentType === key
                              ? 'bg-primary-100 text-primary-600 border border-primary-500/30'
                              : 'bg-white/5 hover:bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Icon size={16} />
                            <span>{config.label}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedModule?._id === module._id && selectedContentType === key
                              ? 'bg-primary-500/30 text-primary-600'
                              : 'bg-white/10 text-gray-500'
                          }`}>
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

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col">
        {viewingItem ? (
          /* INLINE VIEWER - Shows file/link on the same page */
          <>
            <div className="bg-white/70 backdrop-blur-xl shadow-card border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCloseViewer}
                    className="p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-500"
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
                {selectedContentType !== 'links' && (viewingItem.fileUrl || viewingItem.videoUrl) && (
                  <a
                    href={getFullUrl(viewingItem.fileUrl || viewingItem.videoUrl)}
                    download
                    className="bg-primary-600 text-gray-900 px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 text-sm"
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
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                        <div className="text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                          <p className="mt-2 text-gray-600">Loading...</p>
                        </div>
                      </div>
                    )}
                    {selectedContentType === 'videos' && isUploadedVideo(viewingItem) ? (
                      <video
                        src={viewerUrl}
                        controls
                        className="w-full h-full"
                        style={{ minHeight: '70vh', backgroundColor: '#000' }}
                        onLoadedData={() => setViewerLoading(false)}
                        onError={() => { setViewerLoading(false); setViewerFailed(true); }}
                      />
                    ) : (
                      <iframe
                        src={viewerUrl}
                        className="w-full h-full border-0"
                        style={{ minHeight: '70vh' }}
                        title={viewingItem.name || viewingItem.title}
                        onLoad={() => setViewerLoading(false)}
                        onError={() => { setViewerLoading(false); setViewerFailed(true); }}
                        sandbox={selectedContentType === 'links' ? 'allow-same-origin allow-scripts allow-popups allow-forms' : undefined}
                      />
                    )}
                    {viewerFailed && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                        <div className="text-center max-w-md">
                          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load preview</h3>
                          <p className="text-gray-500 mb-4">The content could not be embedded. Try downloading or opening directly.</p>
                          <div className="flex justify-center gap-3">
                            <a
                              href={viewerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-primary-600 text-gray-900 px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2 text-sm"
                            >
                              <ExternalLink size={16} />
                              Open in New Tab
                            </a>
                            <button
                              onClick={() => { setViewerFailed(false); setViewerLoading(true); }}
                              className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm"
                            >
                              Try Again
                            </button>
                          </div>
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
            {/* Header Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-600 to-blue-600 p-6 shadow-lg">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
              <div className="absolute -bottom-8 right-20 w-24 h-24 bg-white/5 rounded-full" />
              <div className="absolute top-4 right-40 w-12 h-12 bg-white/10 rounded-full" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Module {selectedModule.moduleNumber}: {selectedModule.moduleTitle}
                  </h1>
                  <p className="text-gray-900/70 text-sm mt-1">
                    Viewing {contentTypes[selectedContentType]?.label}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-white text-primary-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-all shadow-md flex items-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Add {contentTypes[selectedContentType]?.label}</span>
                </button>
              </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                renderContentItems()
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center items-center justify-center ">
              <div className="text-gray-400 mb-4 w-full flex items-center justify-center">
                <FileText size={64} />
              </div>
              <h2 className="text-xl font-medium text-gray-600">Select a Module</h2>
              <p className="text-gray-500 mt-2">Choose a module from the left to view its content</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Content Modal */}
      {showAddModal && (
        <AddContentModal
          contentType={selectedContentType}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddContent}
          isLoading={isLoading}
        />
      )}

      {/* Edit Content Modal */}
      {editingItem && (
        <EditContentModal
          item={editingItem}
          contentType={selectedContentType}
          onClose={() => setEditingItem(null)}
          onUpdate={handleUpdateContent}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

// Content Card Component
const ContentCard = ({ item, contentType, onDelete, onEdit, onView, formatFileSize, formatDate }) => {
  const contentTheme = resolveContentTheme(item, contentType);

  const getFileIcon = () => {
    switch (contentType) {
      case 'pdfs':
        return <FileText className="text-red-500" size={24} />;
      case 'ppts':
        return <Presentation className="text-blue-500" size={24} />;
      case 'videos':
        return <Video className="text-blue-500" size={24} />;
      case 'links':
        return <Link className="text-blue-500" size={24} />;
      default:
        return <FileText className="text-gray-500" size={24} />;
    }
  };

  return (
    <div
      className="glass-card rounded-lg overflow-hidden hover:shadow-card transition-shadow cursor-pointer"
      onClick={onView}
    >
      {/* Thumbnail */}
      <LmsAssetImage
        src={contentTheme.contentThumbnailUrl}
        alt={item.name || item.title}
        gradientCSS={contentTheme.gradientCSS}
        fallbackIcon={getFileIcon()}
        containerClassName="h-40 w-full"
        className="w-full h-full object-cover"
      />

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {item.name || item.title}
        </h3>

        {item.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {item.description || item.content}
          </p>
        )}

        {/* Show URL for links */}
        {contentType === 'links' && (item.url || item.link) && (
          <div className="mb-3">
            <p className="text-xs text-primary-600 truncate" title={item.url || item.link}>
              {item.url || item.link}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          {item.fileSize && (
            <span>{formatFileSize(item.fileSize)}</span>
          )}
          {item.createDate && (
            <span>{formatDate(item.createDate)}</span>
          )}
        </div>

        {/* Actions - Edit & Delete only */}
        <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onEdit}
            className="text-primary-600 hover:text-blue-800 transition-colors"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Content Modal Component
const AddContentModal = ({ contentType, onClose, onAdd, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: ''
  });
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  const contentTypes = {
    pdfs: { label: 'Course Content' },
    ppts: { label: 'Presentations' },
    videos: { label: 'Videos' },
    links: { label: 'Links' }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (contentType === 'links' && !formData.url.trim()) return;
    if (contentType === 'videos' && !file && !formData.url.trim()) return;
    if ((contentType === 'pdfs' || contentType === 'ppts') && !file) return;
    onAdd(formData, file, thumbnail);
  };

  const getAcceptedFileTypes = () => {
    switch (contentType) {
      case 'pdfs':
        return '.pdf';
      case 'ppts':
        return '.ppt,.pptx';
      case 'videos':
        return '.mp4,.avi,.mov,.wmv,.flv,.webm';
      case 'links':
        return '';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="glass-modal rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Add {contentTypes[contentType]?.label}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full glass-input rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full glass-input rounded-md px-3 py-2"
            />
          </div>

          {(contentType === 'links' || contentType === 'videos') && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Video URL {contentType === 'links' ? '*' : ''}
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full glass-input rounded-md px-3 py-2"
                placeholder={contentType === 'videos' ? 'https://www.youtube.com/watch?v=...' : 'https://example.com'}
                required={contentType === 'links'}
              />
              {contentType === 'videos' && (
                <p className="text-xs text-gray-400 mt-1">
                  Paste a YouTube or Vimeo URL, or upload a video file below
                </p>
              )}
            </div>
          )}

          {contentType !== 'links' && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                File {contentType !== 'videos' ? '*' : ''}
              </label>
              <input
                type="file"
                accept={getAcceptedFileTypes()}
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full glass-input rounded-md px-3 py-2"
                required={contentType !== 'videos' && contentType !== 'links'}
              />
              {contentType === 'videos' && (
                <p className="text-xs text-gray-400 mt-1">
                  Upload .mp4, .avi, .mov, .wmv, .flv, .webm (optional if URL provided)
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Thumbnail
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files[0])}
              className="w-full glass-input rounded-md px-3 py-2"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary-600 text-gray-900 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Content Modal Component
const EditContentModal = ({ item, contentType, onClose, onUpdate, isLoading }) => {
  const [formData, setFormData] = useState({
    name: item.name || item.title || '',
    description: item.description || item.content || '',
    url: item.url || item.link || item.fileUrl || ''
  });
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  const contentTypes = {
    pdfs: { label: 'Course Content' },
    ppts: { label: 'Presentations' },
    videos: { label: 'Videos' },
    links: { label: 'Links' }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (contentType === 'links' && !formData.url.trim()) return;
    onUpdate(formData, file, thumbnail);
  };

  const getAcceptedFileTypes = () => {
    switch (contentType) {
      case 'pdfs':
        return '.pdf';
      case 'ppts':
        return '.ppt,.pptx';
      case 'videos':
        return '.mp4,.avi,.mov,.wmv,.flv,.webm';
      case 'links':
        return '';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="glass-modal rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Edit {contentTypes[contentType]?.label}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full glass-input rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full glass-input rounded-md px-3 py-2"
            />
          </div>

          {(contentType === 'links' || contentType === 'videos') && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {contentType === 'videos' ? 'Video URL' : 'URL'} {contentType === 'links' ? '*' : ''}
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full glass-input rounded-md px-3 py-2"
                placeholder={contentType === 'videos' ? 'https://www.youtube.com/watch?v=...' : 'https://example.com'}
                required={contentType === 'links'}
              />
              {contentType === 'videos' && (
                <p className="text-xs text-gray-400 mt-1">YouTube or Vimeo URL</p>
              )}
            </div>
          )}

          {contentType !== 'links' && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Replace File (optional)
              </label>
              <input
                type="file"
                accept={getAcceptedFileTypes()}
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full glass-input rounded-md px-3 py-2"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Replace Thumbnail (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files[0])}
              className="w-full glass-input rounded-md px-3 py-2"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary-600 text-gray-900 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentSection;