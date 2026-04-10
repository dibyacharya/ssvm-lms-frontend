import React, { useRef, useEffect, useCallback } from "react";

/**
 * Scrolling banner overlay for live class video.
 * Two modes:
 * - "html": CSS marquee animation (visible to viewer only, NOT in recording)
 * - "canvas": Exports drawBanner function for canvas recording
 */

// Canvas draw function for baked-in recording
export const drawBanner = (ctx, canvasWidth, canvasHeight, text, speed, elapsed) => {
  if (!text) return;

  const fontSize = 20;
  const barHeight = 36;
  const y = canvasHeight - barHeight;

  // Semi-transparent dark background
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, y, canvasWidth, barHeight);

  // Text
  ctx.font = `${fontSize}px Arial, sans-serif`;
  ctx.fillStyle = "#FFFFFF";
  ctx.textBaseline = "middle";

  const textWidth = ctx.measureText(text).width;
  const totalWidth = textWidth + canvasWidth;
  const xOffset = canvasWidth - ((elapsed * speed) % totalWidth);

  ctx.fillText(text, xOffset, y + barHeight / 2);
};

const BannerOverlay = ({ text, speed = 50, enabled = false, mode = "html" }) => {
  const containerRef = useRef(null);

  // Calculate animation duration based on text length and speed
  const getDuration = useCallback(() => {
    if (!text || speed <= 0) return 10;
    // Approximate: assume container ~1200px + text width
    const estimatedDistance = 1200 + text.length * 10;
    return estimatedDistance / speed;
  }, [text, speed]);

  if (!enabled || !text || mode !== "html") return null;

  const duration = getDuration();

  return (
    <div
      ref={containerRef}
      className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none"
      style={{ height: "36px", backgroundColor: "rgba(0, 0, 0, 0.7)", zIndex: 50 }}
    >
      <div
        className="whitespace-nowrap text-gray-900 text-base font-medium leading-9"
        style={{
          animation: `bannerScroll ${duration}s linear infinite`,
          paddingLeft: "100%",
        }}
      >
        {text}
      </div>

      <style>{`
        @keyframes bannerScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default BannerOverlay;
