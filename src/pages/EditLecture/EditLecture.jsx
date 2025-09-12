import React, { useRef, useState, useEffect } from "react";
import noUiSlider from "nouislider";
import "nouislider/dist/nouislider.css";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { X, Scissors, RotateCcw, Upload, Download, Clock } from "lucide-react";
import { updateLecture } from "../../services/lecture.service";

const ffmpeg = new FFmpeg();

// Custom CSS only for noUiSlider which can't be styled with Tailwind
const customizeSlider = () => {
  const style = document.createElement("style");
  style.textContent = `
    .noUi-connect {
      background: #1aa100 !important;
      height: 20px;
    }
    .noUi-handle {
      background: #000000 !important;
      border: none !important;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
      width: 18px !important;
      height: 18px !important;
      border-radius: 50% !important;
    }
    .noUi-txt-dir-ltr {
      padding: 0px !important;
    }
    .noUi-handle:before, .noUi-handle:after {
      display: none !important;
    }
    .noUi-tooltip {
      background-color: #000000 !important;
      color: white !important;
      border: none !important;
      border-radius: 4px !important;
      padding: 4px 8px !important;
      font-size: 12px !important;
    }
  `;
  document.head.appendChild(style);
};

const VideoEditor = ({
  videoUrl,
  setShowVideoModal,
  lectureId,
  courseId,
  lectureReviewed,
}) => {
  const videoRef = useRef(null);
  const sliderRef = useRef(null);
  const [removeRanges, setRemoveRanges] = useState([]); // Stores multiple trim sections
  const [processing, setProcessing] = useState(false);
  const [outputURL, setOutputURL] = useState(null);
  const [currentRange, setCurrentRange] = useState([0, 0]); // Current selected range
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hoveredButton, setHoveredButton] = useState(null);

  useEffect(() => {
    if (!videoUrl) return;
    setVideoLoaded(true);
    // Apply custom slider styles
    customizeSlider();
  }, [videoUrl]);

  useEffect(() => {
    if (!videoLoaded || !videoUrl) return;

    const video = videoRef.current;
    const slider = sliderRef.current;

    video.onloadedmetadata = () => {
      const duration = video.duration;
      setVideoDuration(duration);

      if (slider.noUiSlider) {
        slider.noUiSlider.destroy();
      }

      noUiSlider.create(slider, {
        start: [duration * 0.2, duration * 0.4], // Default selection
        connect: true,
        range: { min: 0, max: duration },
        step: 0.1,
        tooltips: [
          {
            to: (value) => formatTime(value),
            from: function (value) {
              return Number(value);
            },
          },
          {
            to: (value) => formatTime(value),
            from: function (value) {
              return Number(value);
            },
          },
        ],
      });

      slider.noUiSlider.on("update", (values) => {
        setCurrentRange([parseFloat(values[0]), parseFloat(values[1])]);
      });
    };
  }, [videoLoaded, videoUrl]);

  // Format time in MM:SS.ms format
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}.${ms}`;
  };

  const addTrimSection = () => {
    if (currentRange[0] !== currentRange[1]) {
      setRemoveRanges((prev) => [...prev, currentRange]);
    }
  };

  const removeSection = (index) => {
    setRemoveRanges((prev) => prev.filter((_, i) => i !== index));
  };

  // Update video time when clicking on a trim range
  const jumpToRange = (start, end) => {
    if (videoRef.current) {
      videoRef.current.currentTime = start;
      if (sliderRef.current && sliderRef.current.noUiSlider) {
        sliderRef.current.noUiSlider.set([start, end]);
      }
    }
  };

  const trimVideo = async () => {
  if (!ffmpeg.loaded) {
    await ffmpeg.load();
  }
  setProcessing(true);
  setProgress(0);

  try {
    const inputFile = "input.mp4";
    
    // Better way to handle video data - convert to blob first
    let videoData;
    
    if (videoUrl.startsWith('blob:')) {
      // If it's a blob URL, fetch it directly
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch blob: ${response.statusText}`);
      }
      videoData = await response.arrayBuffer();
    } else {
      // For regular URLs, try fetchFile with error handling
      try {
        videoData = await fetchFile(videoUrl);
      } catch (fetchError) {
        console.error('fetchFile failed, trying alternative method:', fetchError);
        
        // Fallback: try direct fetch
        const response = await fetch(videoUrl, {
          mode: 'cors',
          credentials: 'same-origin'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch video: ${response.statusText}`);
        }
        
        videoData = await response.arrayBuffer();
      }
    }

    // Write the video data to FFmpeg
    await ffmpeg.writeFile(inputFile, new Uint8Array(videoData));

    const video = videoRef.current;
    const duration = video.duration;
    let segments = [];
    let lastEnd = 0;

    // Sort the remove ranges and process segments
    const sortedRanges = [...removeRanges].sort((a, b) => a[0] - b[0]);
    for (const [start, end] of sortedRanges) {
      if (lastEnd < start) {
        segments.push([lastEnd, start]);
      }
      lastEnd = end;
    }
    if (lastEnd < duration) {
      segments.push([lastEnd, duration]);
    }

    if (segments.length === 0) {
      alert("Nothing left to save! Select a valid trim range.");
      setProcessing(false);
      return;
    }

    let segmentFiles = [];
    for (let i = 0; i < segments.length; i++) {
      const [segStart, segEnd] = segments[i];
      const outputSegment = `segment_${i}.mp4`;
      
      await ffmpeg.exec([
        "-i",
        inputFile,
        "-ss",
        `${segStart}`,
        "-to",
        `${segEnd}`,
        "-c",
        "copy",
        outputSegment,
      ]);
      
      segmentFiles.push(outputSegment);
      setProgress(Math.round(((i + 1) / segments.length) * 70)); // 70% for segments
    }

    // Merge segments
    let finalOutput = "output.mp4";
    if (segmentFiles.length > 1) {
      const fileList = "fileList.txt";
      const listContent = segmentFiles.map((f) => `file '${f}'`).join("\n");
      await ffmpeg.writeFile(fileList, new TextEncoder().encode(listContent));

      await ffmpeg.exec([
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        fileList,
        "-c",
        "copy",
        finalOutput,
      ]);
    } else {
      finalOutput = segmentFiles[0]; // Only one segment, no need to merge
    }

    setProgress(90); // 90% after merging

    const data = await ffmpeg.readFile(finalOutput);
    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: "video/mp4" })
    );
    setOutputURL(url);
    setProgress(100);
    setProcessing(false);
    
  } catch (error) {
    console.error("Error processing video:", error);
    alert(`Failed to process video: ${error.message}`);
    setProcessing(false);
    setProgress(0);
  }
};

  const resetEditor = () => {
    setRemoveRanges([]);
    setOutputURL(null);
    if (sliderRef.current && sliderRef.current.noUiSlider) {
      sliderRef.current.noUiSlider.set([
        videoDuration * 0.2,
        videoDuration * 0.4,
      ]);
    }
  };

  const handleSubmit = async () => {
    if (!outputURL) return;

    try {
      setProcessing(true);

      // Convert the Blob URL to a File object
      const response = await fetch(outputURL);
      const blob = await response.blob();
      const videoFile = new File([blob], "edited_video.mp4", {
        type: "video/mp4",
      });

      // Create FormData and append the video file
      const lectureData = new FormData();
      lectureData.append("video", videoFile);
      lectureData.append("isReviewed", true);
      // Call the updateLecture function
      await updateLecture(courseId, lectureId, lectureData);

      // Close the modal after successful upload
      setShowVideoModal(false);
    } catch (error) {
      console.error("Error submitting edited video:", error);
      alert("Failed to upload the edited video. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-11/12 max-w-6xl mx-auto p-6 h-[85vh] rounded-xl bg-white shadow-xl overflow-y-auto relative">
      <div className="flex justify-between items-center border-b-2 border-primary pb-4 mb-6">
        <h2 className="text-2xl font-semibold text-secondary">
          Professional Video Editor
        </h2>
        <button
          onClick={() => setShowVideoModal(false)}
          className="text-tertiary hover:text-secondary transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {videoUrl && (
        <div>
          <div className="flex flex-col items-center w-full mb-6">
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              className="w-full rounded-lg shadow-md bg-black aspect-video"
            />
            <div ref={sliderRef} className="w-full mt-6 mb-8"></div>
          </div>

          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={addTrimSection}
              onMouseEnter={() => setHoveredButton("add")}
              onMouseLeave={() => setHoveredButton(null)}
              className={`flex items-center gap-2 bg-primary text-white py-3 px-4 rounded-md shadow-sm transition-all duration-200 ${
                hoveredButton === "add"
                  ? "transform -translate-y-1 shadow-md"
                  : ""
              }`}
            >
              <Scissors size={18} />
              Add Section to Remove
            </button>

            <button
              onClick={resetEditor}
              onMouseEnter={() => setHoveredButton("reset")}
              onMouseLeave={() => setHoveredButton(null)}
              className={`flex items-center gap-2 bg-white text-tertiary border border-tertiary py-3 px-4 rounded-md transition-all duration-200 ${
                hoveredButton === "reset"
                  ? "transform -translate-y-1 shadow-sm"
                  : ""
              }`}
              disabled={processing}
            >
              <RotateCcw size={18} />
              Reset
            </button>
          </div>

          {removeRanges.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-5 mt-6 mb-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-medium text-secondary mb-4">
                Sections to Remove:
              </h3>
              <div className="space-y-3">
                {removeRanges.map(([start, end], index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-white rounded-md border-l-4 border-primary shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => jumpToRange(start, end)}
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-primary" />
                      <span className="text-secondary">
                        {formatTime(start)} - {formatTime(end)}
                        <span className="text-sm text-tertiary ml-2">
                          (Duration: {formatTime(end - start)})
                        </span>
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSection(index);
                      }}
                      className="w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      aria-label="Remove section"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {processing ? (
            <div className="text-center py-5">
              <p className="text-secondary mb-2">
                Processing Video... {progress}%
              </p>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="text-center mt-6">
              <button
                onClick={trimVideo}
                disabled={processing || removeRanges.length === 0}
                onMouseEnter={() => setHoveredButton("trim")}
                onMouseLeave={() => setHoveredButton(null)}
                className={`inline-flex items-center gap-2 bg-primary text-white py-3 px-6 rounded-md text-lg font-medium transition-all duration-200 ${
                  processing || removeRanges.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : hoveredButton === "trim"
                    ? "transform -translate-y-1 shadow-md"
                    : "shadow-sm"
                }`}
              >
                <Scissors size={20} />
                {removeRanges.length === 0
                  ? "Select Sections to Remove"
                  : "Trim & Finalize Video"}
              </button>
            </div>
          )}
        </div>
      )}

      {outputURL && !processing && (
        <div className="mt-8 pt-6 border-t-2 border-primary">
          <h3 className="text-xl font-medium text-secondary mb-4">
            Your Edited Video:
          </h3>
          <div className="flex flex-col items-center w-full">
            <video
              src={outputURL}
              controls
              className="w-full rounded-lg shadow-md bg-black aspect-video"
            />
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={handleSubmit}
                disabled={processing}
                onMouseEnter={() => setHoveredButton("save")}
                onMouseLeave={() => setHoveredButton(null)}
                className={`flex items-center gap-2 bg-primary text-white py-3 px-5 rounded-md transition-all duration-200 ${
                  processing
                    ? "opacity-50 cursor-not-allowed"
                    : hoveredButton === "save"
                    ? "transform -translate-y-1 shadow-md"
                    : "shadow-sm"
                }`}
              >
                <Upload size={18} />
                {processing ? "Uploading..." : "Save and Update Lecture"}
              </button>
              <a
                href={outputURL}
                download="edited_video.mp4"
                onMouseEnter={() => setHoveredButton("download")}
                onMouseLeave={() => setHoveredButton(null)}
                className={`flex items-center gap-2 bg-white text-secondary border border-secondary py-3 px-5 rounded-md no-underline transition-all duration-200 ${
                  hoveredButton === "download"
                    ? "transform -translate-y-1 shadow-sm"
                    : ""
                }`}
              >
                <Download size={18} />
                Download Video
              </a>
            </div>
          </div>
          <p className="text-sm text-tertiary mt-3 text-center">
            *once saved, it will be marked reviewed automatically
          </p>
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          onClick={() => setShowVideoModal(false)}
          className="px-4 py-2 bg-secondary hover:bg-gray-800 text-white rounded-md transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default VideoEditor;
