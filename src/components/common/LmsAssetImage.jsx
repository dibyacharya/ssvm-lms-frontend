import React, { useState, useCallback } from "react";

/**
 * LmsAssetImage
 *
 * A safe, reusable image component for LMS visual assets.
 *
 * Features:
 *  - Renders the `src` image normally
 *  - On load error, hides the <img> and shows a CSS gradient fallback
 *  - Optionally renders a fallback icon inside the gradient
 *  - No broken-image artifacts or console noise
 *
 * Props:
 *  @param {string}  src          – primary image URL
 *  @param {string}  alt          – alt text (default "")
 *  @param {string}  className    – Tailwind classes for the <img> (default "w-full h-full object-cover")
 *  @param {string}  gradientCSS  – CSS gradient string for fallback background
 *  @param {string}  accentColor  – single colour fallback if no gradient
 *  @param {React.ReactNode} fallbackIcon – optional icon/element shown when image fails
 *  @param {object}  style        – additional inline styles on the container
 *  @param {string}  containerClassName – Tailwind classes for the outer wrapper
 */
const LmsAssetImage = ({
  src,
  alt = "",
  className = "w-full h-full object-cover",
  gradientCSS,
  accentColor,
  fallbackIcon,
  style,
  containerClassName = "",
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  const handleError = useCallback(() => {
    setImgFailed(true);
  }, []);

  const bgStyle = gradientCSS
    ? { background: gradientCSS }
    : accentColor
    ? { backgroundColor: accentColor }
    : { backgroundColor: "#334155" };

  return (
    <div
      className={containerClassName}
      style={{ ...bgStyle, ...style }}
    >
      {!imgFailed && src ? (
        <img
          src={src}
          alt={alt}
          className={className}
          onError={handleError}
          loading="lazy"
        />
      ) : (
        fallbackIcon && (
          <div className="w-full h-full flex items-center justify-center text-white/60">
            {fallbackIcon}
          </div>
        )
      )}
    </div>
  );
};

export default LmsAssetImage;
