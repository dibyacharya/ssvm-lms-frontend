import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Maximize,
  Minimize,
} from "lucide-react";
import Markdown from "react-markdown";

const StudentContentDisplay = ({
  content,
  onNext,
  onPrevious,
  isFirstContent,
  isLastModule,
  hasNextContent,
  courseID,
  moduleId,
}) => {
  // IMPORTANT: All hooks must be called before any conditional returns
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Listen for fullscreen change events from browser controls
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement ||
          document.mozFullScreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);

    // Find the main content element
    const contentElement = document.querySelector(".content-display-container");

    if (!isFullscreen) {
      // Enter fullscreen
      if (contentElement) {
        if (contentElement.requestFullscreen) {
          contentElement.requestFullscreen();
        } else if (contentElement.mozRequestFullScreen) {
          /* Firefox */
          contentElement.mozRequestFullScreen();
        } else if (contentElement.webkitRequestFullscreen) {
          /* Chrome, Safari & Opera */
          contentElement.webkitRequestFullscreen();
        } else if (contentElement.msRequestFullscreen) {
          /* IE/Edge */
          contentElement.msRequestFullscreen();
        }
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        /* Firefox */
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        /* Chrome, Safari & Opera */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        /* IE/Edge */
        document.msExitFullscreen();
      }
    }
  };

  // NOW it's safe to do conditional returns
  if (!content) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Select content to view</div>
      </div>
    );
  }

  // Determine content type for display
  const getContentType = () => {
    if (content.isResource) {
      return content.fileType || "file";
    }
    return content.type;
  };

  // Render content based on type
  const renderContentBody = () => {
    // Handle legacy resources
    if (content.isResource) {
      if (content.fileType === "pdf") {
        return (
          <iframe
            src={content.fileUrl}
            className="w-full h-full border rounded"
            title={content.fileName}
          />
        );
      } else {
        return (
          <div className="p-4 bg-gray-50 rounded-md">
            <p>File: {content.fileName}</p>
            <a
              href={content.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 hover:underline flex items-center"
            >
              Download File <ArrowRight size={16} className="ml-1" />
            </a>
          </div>
        );
      }
    }

    // Handle new content items
    switch (content.type) {
      case "file":
        // Handle different file types
        switch (content.fileType) {
          case "pdf":
            return (
              <iframe
                src={content.fileUrl}
                className="w-full h-full border rounded"
                title={content.fileName}
              />
            );
          case "image":
            return (
              <img
                src={content.fileUrl}
                alt={content.title}
                className="max-w-full h-auto rounded mx-auto"
              />
            );
          case "presentation":
            return (
              <iframe
                src={content.fileUrl}
                className="w-full h-64 border"
                title={content.title}
              />
            );
          case "document":
            return (
              <div className="p-4 bg-gray-50 rounded-md">
                <p>Document file: {content.fileName}</p>
                <a
                  href={content.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 hover:underline flex items-center"
                >
                  View Document <ArrowRight size={16} className="ml-1" />
                </a>
              </div>
            );
          default:
            return (
              <div className="p-4 bg-gray-50 rounded-md">
                <p>File: {content.fileName}</p>
                <a
                  href={content.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 hover:underline flex items-center"
                >
                  Download File <ArrowRight size={16} className="ml-1" />
                </a>
              </div>
            );
        }

      case "video":
        if (content.videoUrl) {
          // Handle video based on provider or direct URL
          // For embedded videos (YouTube, Vimeo)
          if (
            content.videoUrl.includes("youtube.com") ||
            content.videoUrl.includes("youtu.be")
          ) {
            const videoId = content.videoUrl.includes("v=")
              ? content.videoUrl.split("v=")[1].split("&")[0]
              : content.videoUrl.split("/").pop();

            return (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="w-full h-full bg-black"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={content.title}
              />
            );
          } else if (content.videoUrl.includes("vimeo.com")) {
            const videoId = content.videoUrl.split("/").pop();
            return (
              <iframe
                src={`https://player.vimeo.com/video/${videoId}`}
                className="w-full h-full bg-black"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={content.title}
              />
            );
          } else {
            // For direct video URLs
            return (
              <video
                controls
                className="w-full h-full bg-black"
                src={content.videoUrl}
              >
                Your browser does not support video playback.
              </video>
            );
          }
        } else {
          return <div>Video URL not available</div>;
        }

      case "link":
        return (
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="mb-4">{content.description}</p>
            <iframe
              src={content.url}
              title={content.title}
              className="w-full h-[70vh] rounded-md border"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            ></iframe>
          </div>
        );

      case "text":
        return (
          <div className="prose max-w-none px-4">
            <Markdown>{content.content || "No content available"}</Markdown>
          </div>
        );

      default:
        return <div>Unsupported content type</div>;
    }
  };

  // Get content date for display
  const getContentDate = () => {
    const date = content.createdAt || content.uploadDate;
    if (date) {
      return new Date(date).toLocaleDateString();
    }
    return "Unknown date";
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden content-display-container">
      <div className="bg-gray-100 p-4 flex justify-between items-center">
        <h3 className="text-lg font-medium">
          {content.title || content.fileName}
          <span className="ml-2 text-sm text-gray-500">
            ({getContentType()})
          </span>
        </h3>
        <div className="flex space-x-2">
          <button
            className="p-2 bg-primary/10 hover:bg-primary/20 rounded text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={onPrevious}
            disabled={isFirstContent}
            title="Previous content"
          >
            <ChevronLeft
              size={24}
              className="text-primary/80 hover:text-primary"
            />
          </button>
          <button
            className="p-2 bg-primary/10 hover:bg-primary/20 rounded text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={onNext}
            disabled={!hasNextContent && isLastModule}
            title={
              hasNextContent
                ? "Next content"
                : isLastModule
                ? "End of content"
                : "Next module"
            }
          >
            <ChevronRight
              size={24}
              className="text-primary/80 hover:text-primary"
            />
          </button>
          <button
            className="p-2 bg-primary/10 hover:bg-primary/20 rounded text-primary transition-colors"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize
                size={24}
                className="text-primary/80 hover:text-primary"
              />
            ) : (
              <Maximize
                size={24}
                className="text-primary/80 hover:text-primary"
              />
            )}
          </button>
        </div>
      </div>

      <div className={`flex-1 overflow-auto ${isFullscreen ? "bg-white" : ""}`}>
        {renderContentBody()}
      </div>

      {/* Only show footer in non-fullscreen mode */}
      {!isFullscreen && (
        <div className="p-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Added on {getContentDate()}
          </div>
          {content.description && (
            <div className="text-sm text-gray-700">{content.description}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentContentDisplay;
