import React, { useRef, useState, useEffect } from "react";
import noUiSlider from "nouislider";
import "nouislider/dist/nouislider.css";
import { FFmpeg } from "@ffmpeg/ffmpeg";
// fetchFile no longer needed — using direct fetch() for better Content-Type detection
import { X, Scissors, RotateCcw, Upload, Download, Clock, AlertTriangle } from "lucide-react";
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
  viewMode = false, // When true, shows video player only (no trim/edit tools)
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
  const [videoError, setVideoError] = useState(false);
  const [outputFormat, setOutputFormat] = useState("mp4"); // Track actual video format
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!videoUrl) return;
    setVideoLoaded(true);
    setVideoError(false);
    // Apply custom slider styles
    customizeSlider();
  }, [videoUrl]);

  useEffect(() => {
    if (!videoLoaded || !videoUrl || viewMode) return;

    const video = videoRef.current;
    const slider = sliderRef.current;

    const initSlider = (duration) => {
      if (!duration || !isFinite(duration) || duration <= 0) return;

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

    video.onloadedmetadata = () => {
      const duration = video.duration;
      if (isFinite(duration) && duration > 0) {
        initSlider(duration);
      } else {
        // WebM files from MediaRecorder often have Infinity duration.
        // Seek to a large time to force the browser to compute the real duration.
        video.currentTime = Number.MAX_SAFE_INTEGER;
        video.ontimeupdate = function onceSeek() {
          video.ontimeupdate = null;
          const realDuration = video.duration;
          video.currentTime = 0;
          if (isFinite(realDuration) && realDuration > 0) {
            initSlider(realDuration);
          } else {
            // Last resort: use 60s default so the editor doesn't crash
            initSlider(60);
          }
        };
      }
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
      try {
        await ffmpeg.load();
      } catch (loadError) {
        console.error("FFmpeg load failed:", loadError);
        alert(
          "Failed to load the video processor. Please refresh the page and try again."
        );
        return;
      }
    }
    setProcessing(true);
    setProgress(0);

    try {
      // Fetch video data first, then detect format from Content-Type or bytes
      let videoData;
      let detectedContentType = "";

      if (videoUrl.startsWith("blob:")) {
        const response = await fetch(videoUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch blob: ${response.statusText}`);
        }
        detectedContentType = response.headers.get("content-type") || "";
        videoData = await response.arrayBuffer();
      } else {
        // Use fetch directly (works with proxy URL and CORS)
        const response = await fetch(videoUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
        }
        detectedContentType = response.headers.get("content-type") || "";
        videoData = await response.arrayBuffer();
      }

      if (!videoData || videoData.byteLength === 0) {
        throw new Error("Downloaded video is empty. The recording may be unavailable.");
      }

      // Detect format using MAGIC BYTES first (most reliable), then Content-Type fallback
      // NEVER use URL patterns — /stream/ proxy doesn't indicate format
      const bytes = new Uint8Array(videoData);
      const isWebMByMagic = bytes.length >= 4 && bytes[0] === 0x1A && bytes[1] === 0x45 && bytes[2] === 0xDF && bytes[3] === 0xA3;
      const isMp4ByMagic = bytes.length >= 8 && (
        // ftyp box: bytes 4-7 are "ftyp"
        (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70)
      );

      let isWebM;
      if (isWebMByMagic || isMp4ByMagic) {
        // Trust magic bytes over everything else
        isWebM = isWebMByMagic;
      } else {
        // Fallback to Content-Type header
        isWebM = detectedContentType.includes("webm");
      }

      const ext = isWebM ? "webm" : "mp4";
      const mimeType = isWebM ? "video/webm" : "video/mp4";
      const inputFile = `input.${ext}`;
      setOutputFormat(ext);

      console.log(`[VideoEditor] Format: ${ext}, Content-Type: ${detectedContentType}, Size: ${videoData.byteLength} bytes, Magic: ${isWebMByMagic ? 'WebM' : isMp4ByMagic ? 'MP4' : 'unknown'}`);

      await ffmpeg.writeFile(inputFile, bytes);
      setProgress(10);

      // Use the already-computed videoDuration state (handles WebM Infinity)
      const duration = videoDuration;
      if (!duration || !isFinite(duration) || duration <= 0) {
        throw new Error(
          "Could not determine video duration. Please reload the page and try again."
        );
      }

      // Calculate keep-segments (inverse of remove-ranges)
      let segments = [];
      let lastEnd = 0;
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

      // Extract each keep-segment using stream copy (fast, low memory).
      // Stream copy is safe because the canvas recording is now single-track with proper frames.
      // Re-encoding with libvpx in WASM causes "memory access out of bounds" on larger videos.
      let segmentFiles = [];
      for (let i = 0; i < segments.length; i++) {
        const [segStart, segEnd] = segments[i];
        const outputSegment = `segment_${i}.${ext}`;

        // Use -ss BEFORE -i for fast keyframe-based seeking, then stream copy
        const execArgs = [
          "-ss", `${segStart}`,
          "-i", inputFile,
          "-t", `${segEnd - segStart}`,
          "-c", "copy",
          "-avoid_negative_ts", "make_zero",
          outputSegment,
        ];
        await ffmpeg.exec(execArgs);

        segmentFiles.push(outputSegment);
        setProgress(10 + Math.round(((i + 1) / segments.length) * 60));
      }

      // Merge segments if more than one
      let finalOutput = `output.${ext}`;
      if (segmentFiles.length > 1) {
        const fileList = "fileList.txt";
        const listContent = segmentFiles
          .map((f) => `file '${f}'`)
          .join("\n");
        await ffmpeg.writeFile(
          fileList,
          new TextEncoder().encode(listContent)
        );

        const mergeArgs = [
          "-f", "concat",
          "-safe", "0",
          "-i", fileList,
          "-c", "copy",
          finalOutput,
        ];
        await ffmpeg.exec(mergeArgs);
      } else {
        finalOutput = segmentFiles[0];
      }

      setProgress(90);

      const data = await ffmpeg.readFile(finalOutput);
      const url = URL.createObjectURL(
        new Blob([data.buffer], { type: mimeType })
      );
      setOutputURL(url);
      setProgress(100);
      setProcessing(false);

      // Clean up FFmpeg virtual filesystem
      try {
        await ffmpeg.deleteFile(inputFile);
        for (const sf of segmentFiles) {
          try {
            await ffmpeg.deleteFile(sf);
          } catch (_) {}
        }
        if (segmentFiles.length > 1) {
          try {
            await ffmpeg.deleteFile("fileList.txt");
          } catch (_) {}
          try {
            await ffmpeg.deleteFile(`output.${ext}`);
          } catch (_) {}
        }
      } catch (cleanupErr) {
        console.warn("FFmpeg cleanup warning:", cleanupErr);
      }
    } catch (error) {
      console.error("Error processing video:", error);
      const errorMsg =
        error?.message ||
        (typeof error === "string" ? error : String(error));
      alert(`Failed to process video: ${errorMsg}`);
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

      // Prevent uploading empty/corrupt videos (< 10KB is definitely broken)
      if (blob.size < 10000) {
        alert(`The edited video is too small (${blob.size} bytes) and likely corrupt. Please try editing again.`);
        setProcessing(false);
        return;
      }

      const sizeMB = (blob.size / 1024 / 1024).toFixed(2);
      console.log(`[VideoEditor] Uploading edited video: format=${outputFormat}, size=${blob.size} bytes (${sizeMB} MB)`);

      const mimeType = outputFormat === "webm" ? "video/webm" : "video/mp4";
      const videoFile = new File([blob], `edited_video.${outputFormat}`, {
        type: mimeType,
      });

      // Create FormData and append the video file
      const lectureData = new FormData();
      lectureData.append("video", videoFile);
      lectureData.append("isReviewed", true);

      // Call the updateLecture function with upload progress
      setProgress(0);
      const result = await updateLecture(courseId, lectureId, lectureData, (pct) => {
        setProgress(pct);
      });
      console.log(`[VideoEditor] Upload result:`, result);

      // Close the modal and reload to show the updated video
      setShowVideoModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Error submitting edited video:", error);
      console.error("[VideoEditor] Response status:", error?.response?.status, "Response data:", error?.response?.data);
      const status = error?.response?.status;
      const serverMsg = error?.response?.data?.error || error?.response?.data?.message || error?.response?.data?.details;
      let userMsg = "Failed to upload the edited video. Please try again.";
      if (status === 413) {
        userMsg = "Video file is too large for upload. Try trimming a shorter section.";
      } else if (status === 408 || error?.code === "ECONNABORTED") {
        userMsg = "Upload timed out. The video may be too large. Try trimming a shorter section.";
      } else if (serverMsg) {
        userMsg = `Upload failed: ${serverMsg}`;
      } else if (!navigator.onLine) {
        userMsg = "No internet connection. Please check your network and try again.";
      }
      alert(userMsg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-11/12 max-w-6xl mx-auto p-6 h-[85vh] rounded-xl bg-white shadow-xl overflow-y-auto relative">
      <div className="flex justify-between items-center border-b-2 border-primary pb-4 mb-6">
        <h2 className="text-2xl font-semibold text-secondary">
          {viewMode ? "Video Player" : "Professional Video Editor"}
        </h2>
        <button
          onClick={() => setShowVideoModal(false)}
          className="text-tertiary hover:text-secondary transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {!videoUrl && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <AlertTriangle size={48} className="mb-4 text-amber-400" />
          <p className="text-lg font-medium text-gray-700">No video available</p>
          <p className="text-sm mt-1">This lecture does not have a video attached yet.</p>
        </div>
      )}

      {videoUrl && videoError && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <AlertTriangle size={48} className="mb-4 text-red-400" />
          <p className="text-lg font-medium text-gray-700">Video failed to load</p>
          <p className="text-sm mt-1 text-center max-w-md">
            The video recording is empty or corrupted. This usually happens when the class recording was too short or the upload failed during editing.
          </p>
          <button
            onClick={() => setShowVideoModal(false)}
            className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-sm"
          >
            Close Editor
          </button>
        </div>
      )}

      {videoUrl && !videoError && (
        <div>
          <div className="flex flex-col items-center w-full mb-6">
            <div className="relative w-full group">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onError={() => setVideoError(true)}
                className="w-full rounded-lg shadow-md bg-black aspect-video"
              />
              {/* Centered play button overlay */}
              {!isPlaying && (
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.play().catch(() => {});
                    }
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors rounded-lg cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110">
                    <svg className="w-10 h-10 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </button>
              )}
            </div>
            {!viewMode && <div ref={sliderRef} className="w-full mt-6 mb-8"></div>}
          </div>

          {!viewMode && (
            <>
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
            </>
          )}
        </div>
      )}

      {!viewMode && outputURL && !processing && (
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
                {processing ? `Uploading... ${progress}%` : "Save and Update Lecture"}
              </button>
              <a
                href={outputURL}
                download={`edited_video.${outputFormat}`}
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
