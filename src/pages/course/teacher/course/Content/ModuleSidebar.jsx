import React from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Image,
  Video,
  File,
  Link2,
  MessageSquare,
} from "lucide-react";

const ModuleSidebar = ({
  modules,
  currentModuleIndex,
  expandedModules,
  currentContent,
  toggleModule,
  selectModule,
  selectContent,
}) => {
  // Content type icon mapping
  const getContentIcon = (contentItem) => {
    // Check if it's a resource (from old data model)
    if (contentItem.isResource) {
      return <FileText size={16} className="text-gray-500" />;
    }

    // Handle content based on type
    switch (contentItem.type) {
      case "video":
        return <Video size={16} className="text-blue-500" />;
      case "text":
        return <MessageSquare size={16} className="text-green-500" />;
      case "link":
        return <Link2 size={16} className="text-purple-500" />;
      case "file":
        // For files, check the file type
        if (contentItem.fileType === "pdf") {
          return <FileText size={16} className="text-red-500" />;
        } else if (contentItem.fileType === "image") {
          return <Image size={16} className="text-orange-500" />;
        } else if (contentItem.fileType === "presentation") {
          return <FileText size={16} className="text-yellow-500" />;
        } else {
          return <File size={16} className="text-gray-500" />;
        }
      default:
        return <File size={16} className="text-gray-500" />;
    }
  };

  // Function to get content name
  const getContentName = (contentItem) => {
    // Check for resources or content items
    if (contentItem.isResource) {
      return contentItem.fileName || "Untitled Resource";
    }

    return contentItem.title || "Untitled Content";
  };

  // Function to get formatted date
  const getFormattedDate = (contentItem) => {
    const date = contentItem.createdAt || contentItem.uploadDate;
    if (!date) return "";

    return new Date(date).toLocaleDateString();
  };

  // Function to separate content items and resources based on the specified rules
  const categorizeModuleContent = (module) => {
    if (!module) return { contentItems: [], resources: [] };

    const contentItems = [];
    const resources = [];

    // Process both contentItems and legacy resources
    const allItems = [
      ...(module.contentItems || []),
      ...((module.resources || []).map((resource) => ({
        ...resource,
        isResource: true,
      })) || []),
    ];

    allItems.forEach((item) => {
      if (
        // Content Items criteria
        (item.type === "link" &&
          item.url &&
          item.url.includes("drive.google.com")) || // Google Drive links
        (item.type === "file" && item.fileType === "presentation") || // PPT files
        (item.type === "file" && item.fileType === "image") || // Images
        item.type === "text" // Text content
      ) {
        contentItems.push(item);
      } else {
        // Everything else goes to Resources
        resources.push(item);
      }
    });

    // Sort both arrays by date (newest first)
    const sortByDate = (a, b) => {
      const dateA = new Date(a.createdAt || a.uploadDate || 0);
      const dateB = new Date(b.createdAt || b.uploadDate || 0);
      return dateB - dateA;
    };

    return {
      contentItems: contentItems.sort(sortByDate),
      resources: resources.sort(sortByDate),
    };
  };

  return (
    <div className="w-auto bg-white border-r overflow-y-auto">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-bold text-lg py-2">Modules</h2>
      </div>

      <div className="p-4">
        {modules.map((module, index) => {
          // Categorize content based on new rules
          const { contentItems, resources } = categorizeModuleContent(module);

          return (
            <div key={module._id} className="mb-4">
              <div
                className={`flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer rounded ${
                  currentModuleIndex === index ? "bg-gray-100" : ""
                }`}
                onClick={() => selectModule(index)}
              >
                <div className="flex items-center">
                  <button
                    className="mr-2 focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleModule(module._id);
                    }}
                  >
                    {expandedModules[module._id] ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                  <span className="font-medium truncate">
                    {module.moduleNumber}. {module.moduleTitle}
                  </span>
                </div>
              </div>

              {expandedModules[module._id] && (
                <div className="ml-6 mt-2 space-y-1">
                  {/* Content Items section */}
                  {contentItems.length > 0 && (
                    <>
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        Content Items
                      </div>
                      {contentItems.map((item) => {
                        const isSelected =
                          currentContent && item._id === currentContent._id;
                        return (
                          <div
                            key={item._id}
                            className={`flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer text-sm ${
                              isSelected ? "bg-gray-100" : ""
                            }`}
                            onClick={() =>
                              selectContent(
                                item.isResource
                                  ? { ...item, isResource: true }
                                  : item
                              )
                            }
                          >
                            {getContentIcon(item)}
                            <span className="ml-2 truncate">
                              {getContentName(item)}
                            </span>
                            <span className="ml-auto text-xs text-gray-400">
                              {getFormattedDate(item)}
                            </span>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {/* Resources section */}
                  {resources.length > 0 && (
                    <>
                      <div className="text-sm font-medium text-gray-500 mb-1 mt-3">
                        Resources
                      </div>
                      {resources.map((item) => {
                        const isSelected =
                          currentContent && item._id === currentContent._id;
                        return (
                          <div
                            key={item._id}
                            className={`flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer text-sm ${
                              isSelected ? "bg-gray-100" : ""
                            }`}
                            onClick={() =>
                              selectContent(
                                item.isResource
                                  ? { ...item, isResource: true }
                                  : item
                              )
                            }
                          >
                            {getContentIcon(item)}
                            <span className="ml-2 truncate">
                              {getContentName(item)}
                            </span>
                            <span className="ml-auto text-xs text-gray-400">
                              {getFormattedDate(item)}
                            </span>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {/* Show message if no content is available */}
                  {contentItems.length === 0 && resources.length === 0 && (
                    <div className="text-sm text-gray-500 italic p-2">
                      No content available
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ModuleSidebar;
