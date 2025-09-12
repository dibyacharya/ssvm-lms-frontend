// FileViewer.js
import React from "react";

const FileViewer = ({ selectedFile }) => {
  if (!selectedFile) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <p className="text-gray-500">No file selected</p>
      </div>
    );
  }

  if (selectedFile.fileType === "pdf") {
    return (
      <iframe
        src={`${selectedFile.fileUrl}#toolbar=1&navpanes=1`}
        className="w-full h-full border-0"
        title={selectedFile.fileName}
      />
    );
  } else if (
    selectedFile.fileType === "ppt" ||
    selectedFile.fileType === "pptx"
  ) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-orange-500 text-white text-sm flex items-center justify-center w-10 h-10 rounded">
              PPT
            </div>
            <h3 className="ml-3 font-semibold text-lg">
              {selectedFile.fileName}
            </h3>
          </div>
          <p className="text-gray-600 mb-6">
            PowerPoint presentations cannot be previewed directly. You can
            download the file to view it.
          </p>
          <div className="flex justify-center">
            <a
              href={selectedFile.fileUrl}
              download={selectedFile.fileName}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Download Presentation
            </a>
          </div>
        </div>
      </div>
    );
  } else {
    // For other file types
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gray-500 text-white text-sm flex items-center justify-center w-10 h-10 rounded">
              FILE
            </div>
            <h3 className="ml-3 font-semibold text-lg">
              {selectedFile.fileName}
            </h3>
          </div>
          <p className="text-gray-600 mb-6">
            This file type cannot be previewed. You can download it to view.
          </p>
          <div className="flex justify-center">
            <a
              href={selectedFile.fileUrl}
              download={selectedFile.fileName}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Download File
            </a>
          </div>
        </div>
      </div>
    );
  }
};

export default FileViewer;
