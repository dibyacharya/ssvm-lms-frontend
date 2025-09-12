// ModuleList.js
import React from "react";

const ModuleList = ({
  modules,
  selectedModule,
  selectedFile,
  onModuleClick,
  onFileClick,
  onEditModule,
  onDeleteModule,
  onDeleteFile,
  searchQuery,
}) => {
  // Filter modules based on search query
  const filteredModules = modules.filter((module) => {
    const moduleText =
      `${module.moduleTitle} ${module.moduleNumber}`.toLowerCase();
    const filesText = module.files
      ? module.files.map((file) => file.fileName.toLowerCase()).join(" ")
      : "";
    const searchText = searchQuery.toLowerCase();

    return moduleText.includes(searchText) || filesText.includes(searchText);
  });

  return (
    <div className="p-4">
      {filteredModules.length > 0 ? (
        filteredModules.map((module) => (
          <div
            key={module._id}
            className="mb-4 border rounded-md overflow-hidden"
          >
            <div
              className={`p-3 cursor-pointer transition flex items-center justify-between ${
                selectedModule?._id === module._id
                  ? "bg-blue-50 border-blue-300"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
              onClick={() => onModuleClick(module)}
            >
              <div className="flex items-center">
                <span className="mr-2 text-gray-500">▶</span>
                <span>
                  Module {module.moduleNumber}: {module.moduleTitle}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditModule(module);
                  }}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteModule(module._id);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {selectedModule?._id === module._id && module.files?.length > 0 && (
              <div className="pl-6 pr-4 py-2 bg-gray-50 border-t">
                {module.files.map((file) => (
                  <div
                    key={file._id}
                    className={`p-2 rounded-md cursor-pointer flex items-center justify-between ${
                      selectedFile?._id === file._id
                        ? "bg-gray-200"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => onFileClick(file)}
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 mr-2">
                        {file.fileType === "pdf" ? (
                          <div className="bg-red-500 text-white text-xs flex items-center justify-center w-6 h-6 rounded">
                            PDF
                          </div>
                        ) : file.fileType === "ppt" ||
                          file.fileType === "pptx" ? (
                          <div className="bg-orange-500 text-white text-xs flex items-center justify-center w-6 h-6 rounded">
                            PPT
                          </div>
                        ) : (
                          <div className="bg-gray-500 text-white text-xs flex items-center justify-center w-6 h-6 rounded">
                            DOC
                          </div>
                        )}
                      </div>
                      <span className="text-sm truncate max-w-[120px]">
                        {file.fileName}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFile(module._id, file._id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-6 text-gray-500">
          {searchQuery ? "No matching modules found" : "No modules available"}
        </div>
      )}
    </div>
  );
};

export default ModuleList;
