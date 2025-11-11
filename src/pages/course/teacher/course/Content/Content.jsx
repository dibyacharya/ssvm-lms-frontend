import React, { useState, useEffect } from 'react';
import { FileText, Video, Presentation, Plus, Edit, Trash2, Upload, Eye, Download, Link, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { useCourse } from '../../../../../context/CourseContext';
import { 
  addModuleContent, 
  updateContentItem, 
  deleteContentItem 
} from '../../../../../services/content.service';
import { getCoursesById } from '../../../../../services/course.service';

const ContentSection = () => {
  const { courseData, setCourseData } = useCourse();
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedContentType, setSelectedContentType] = useState('pdfs');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [expandedModule, setExpandedModule] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Content type configurations
  const contentTypes = {
    pdfs: { label: 'PDFs', icon: FileText, key: 'pdfs', countKey: 'pdfCount' },
    ppts: { label: 'Presentations', icon: Presentation, key: 'ppts', countKey: 'pptCount' },
    videos: { label: 'Videos', icon: Video, key: 'videos', countKey: 'videoCount' },
    links: { label: 'Links', icon: Link, key: 'links', countKey: 'linkCount' }
  };

  useEffect(() => {
    if (courseData?.syllabus?.modules?.length > 0) {
      const firstModule = courseData.syllabus.modules[0];
      setExpandedModule(firstModule._id);
      setSelectedModule(firstModule);
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
      
      // For links, add the URL
      if (selectedContentType === 'links' && contentData.url) {
        formData.append('url', contentData.url);
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
        formData.append('url', updatedData.url);
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
            formatFileSize={formatFileSize}
            formatDate={formatDate}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Module Accordion */}
      <div className="w-80 bg-white shadow-lg border-r">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Course Modules</h2>
          <p className="text-sm text-gray-600 mt-1">{courseData?.title}</p>
        </div>
        
        <div className="overflow-y-auto h-full pb-20">
          {courseData?.syllabus?.modules?.map((module) => (
            <div key={module._id} className="border-b">
              {/* Module Header */}
              <div 
                onClick={() => handleModuleToggle(module._id)}
                className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                  expandedModule === module._id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">
                      Module {module.moduleNumber}: {module.moduleTitle}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {module.description}
                    </p>
                  </div>
                  <div className="ml-2">
                    {expandedModule === module._id ? (
                      <ChevronDown size={20} className="text-blue-600" />
                    ) : (
                      <ChevronRight size={20} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Module Content - Accordion Panel */}
              {expandedModule === module._id && (
                <div className="bg-gray-50 px-4 pb-4">
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
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Icon size={16} />
                            <span>{config.label}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedModule?._id === module._id && selectedContentType === key
                              ? 'bg-blue-200 text-blue-800'
                              : 'bg-gray-200 text-gray-600'
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

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col">
        {selectedModule ? (
          <>
            {/* Header */}
            <div className="bg-white shadow-sm border-b p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Module {selectedModule.moduleNumber}: {selectedModule.moduleTitle}
                  </h1>
                  <p className="text-gray-600 ">
                    Viewing {contentTypes[selectedContentType]?.label}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
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
            <div className="text-center">
              <div className="text-gray-400 mb-4">
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
const ContentCard = ({ item, contentType, onDelete, onEdit, formatFileSize, formatDate }) => {
  const getFileIcon = () => {
    switch (contentType) {
      case 'pdfs':
        return <FileText className="text-red-500" size={24} />;
      case 'ppts':
        return <Presentation className="text-orange-500" size={24} />;
      case 'videos':
        return <Video className="text-blue-500" size={24} />;
      case 'links':
        return <Link className="text-green-500" size={24} />;
      default:
        return <FileText className="text-gray-500" size={24} />;
    }
  };

  const handleViewClick = () => {
    if (contentType === 'links') {
      window.open(item.url || item.link, '_blank');
    } else {
      window.open(item.fileUrl || item.videoUrl, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      <div className="h-40 bg-gray-100 flex items-center justify-center">
        {item.thumbnail?.thumbnailUrl ? (
          <img 
            src={item.thumbnail.thumbnailUrl} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400">
            {getFileIcon()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {item.name || item.title}
        </h3>
        
        {item.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {item.description || item.content}
          </p>
        )}

        {/* Show URL for links */}
        {contentType === 'links' && (item.url || item.link) && (
          <div className="mb-3">
            <p className="text-xs text-blue-600 truncate" title={item.url || item.link}>
              {item.url || item.link}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          {item.fileSize && (
            <span>{formatFileSize(item.fileSize)}</span>
          )}
          {item.createDate && (
            <span>{formatDate(item.createDate)}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={handleViewClick}
              className="text-blue-600 hover:text-blue-800 transition-colors"
              title={contentType === 'links' ? 'Open Link' : 'View'}
            >
              {contentType === 'links' ? <ExternalLink size={16} /> : <Eye size={16} />}
            </button>
            <button
              onClick={onEdit}
              className="text-green-600 hover:text-green-800 transition-colors"
              title="Edit"
            >
              <Edit size={16} />
            </button>
          </div>
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
    pdfs: { label: 'PDFs' },
    ppts: { label: 'Presentations' },
    videos: { label: 'Videos' },
    links: { label: 'Links' }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (contentType === 'links' && !formData.url.trim()) return;
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
        return ''; // No file upload for links
      default:
        return '';
    }
  };

  const isFileRequired = () => {
    return contentType !== 'links';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">
          Add {contentTypes[contentType]?.label}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {contentType === 'links' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
                required
              />
            </div>
          )}

          {isFileRequired() && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File {isFileRequired() ? '*' : ''}
              </label>
              <input
                type="file"
                accept={getAcceptedFileTypes()}
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={isFileRequired()}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files[0])}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
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
    url: item.url || item.link || ''
  });
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  const contentTypes = {
    pdfs: { label: 'PDFs' },
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
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">
          Edit {contentTypes[contentType]?.label}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {contentType === 'links' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com"
                required
              />
            </div>
          )}

          {contentType !== 'links' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Replace File (optional)
              </label>
              <input
                type="file"
                accept={getAcceptedFileTypes()}
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Replace Thumbnail (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files[0])}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
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