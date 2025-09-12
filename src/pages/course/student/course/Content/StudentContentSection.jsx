import React, { useState, useEffect } from 'react';
import { FileText, Video, Presentation, Eye, Download, Link, ExternalLink, ChevronDown, ChevronRight, Play, BookOpen } from 'lucide-react';
import { useCourse } from '../../../../../context/CourseContext';
import { 
  getCourseSyllabus, 
  getModuleById
} from '../../../../../services/content.service';

const StudentContentSection = () => {
  const { courseData, setCourseData } = useCourse();
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedContentType, setSelectedContentType] = useState('pdfs');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedModule, setExpandedModule] = useState(null);

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

  const handleContentTypeSelect = async (module, contentType) => {
    setIsLoading(true);
    
    // Set the content type immediately
    setSelectedContentType(contentType);
    
    try {
      const moduleData = await getModuleById(courseData.id, module._id);
      setSelectedModule(moduleData);
    } catch (error) {
      console.error('Error fetching module:', error);
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
          <div className="text-lg mb-2">No {contentTypes[selectedContentType]?.label.toLowerCase()} available</div>
          <div className="text-sm">Check back later for new content</div>
        </div>
      );
    }

    const items = selectedModule[selectedContentType];
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <StudentContentCard 
            key={item._id} 
            item={item} 
            contentType={selectedContentType}
            formatFileSize={formatFileSize}
            formatDate={formatDate}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 mt-4">
      {/* Left Sidebar - Module Accordion */}
      <div className="w-80 bg-white shadow-lg border-r">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Course Materials</h2>
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
                  <p className="text-gray-600">
                    {contentTypes[selectedContentType]?.label}
                  </p>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <BookOpen size={16} />
                    <span>Learning Materials</span>
                  </div>
                </div>
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
            <div className="text-center flex items-center justify-center flex-col">
              <div className="text-gray-400 mb-4">
                <BookOpen size={64} />
              </div>
              <h2 className="text-xl font-medium text-gray-600">Select a Module</h2>
              <p className="text-gray-500 mt-2">Choose a module from the left to view learning materials</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Student Content Card Component - View Only
const StudentContentCard = ({ item, contentType, formatFileSize, formatDate }) => {
  const getFileIcon = () => {
    switch (contentType) {
      case 'pdfs':
        return <FileText className="text-red-500" size={32} />;
      case 'ppts':
        return <Presentation className="text-orange-500" size={32} />;
      case 'videos':
        return <Video className="text-blue-500" size={32} />;
      case 'links':
        return <Link className="text-green-500" size={32} />;
      default:
        return <FileText className="text-gray-500" size={32} />;
    }
  };

  const handleAccessContent = () => {
    if (contentType === 'links') {
      window.open(item.url || item.link, '_blank');
    } else {
      window.open(item.fileUrl || item.videoUrl, '_blank');
    }
  };

  const getAccessButtonText = () => {
    switch (contentType) {
      case 'videos':
        return 'Watch Video';
      case 'links':
        return 'Open Link';
      case 'pdfs':
        return 'View PDF';
      case 'ppts':
        return 'View Presentation';
      default:
        return 'View';
    }
  };

  const getAccessIcon = () => {
    switch (contentType) {
      case 'videos':
        return <Play size={16} />;
      case 'links':
        return <ExternalLink size={16} />;
      default:
        return <Eye size={16} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200">
      {/* Thumbnail */}
      <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
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
        
        {(item.description || item.content) && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
            {item.description || item.content}
          </p>
        )}

        {/* Show URL for links */}
        {contentType === 'links' && (item.url || item.link) && (
          <div className="mb-3 p-2 bg-gray-50 rounded">
            <p className="text-xs text-blue-600 truncate" title={item.url || item.link}>
              <ExternalLink size={12} className="inline mr-1" />
              {item.url || item.link}
            </p>
          </div>
        )}

        {/* File Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-3">
            {item.fileSize && (
              <span className="bg-gray-100 px-2 py-1 rounded">
                {formatFileSize(item.fileSize)}
              </span>
            )}
            {item.createDate && (
              <span>Added {formatDate(item.createDate)}</span>
            )}
          </div>
        </div>

        {/* Access Button */}
        <button
          onClick={handleAccessContent}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          {getAccessIcon()}
          <span>{getAccessButtonText()}</span>
        </button>
      </div>
    </div>
  );
};

export default StudentContentSection;