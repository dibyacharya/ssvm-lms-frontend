import React from "react";
import { scatterPositions } from "../../utils/courseBannerHelper";

/** Inline SVG banner – unique gradient + subject symbols per course */
const CourseBannerSVG = ({ grad, symbols, seed }) => {
  // Pick 8 symbols from the pool using seed for determinism
  const picked = [];
  for (let i = 0; i < 8; i++) {
    picked.push(symbols[(seed + i * 3) % symbols.length]);
  }
  const positions = scatterPositions(seed, 8);

  return (
    <svg
      viewBox="0 0 400 144"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`cg-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={grad.from} />
          <stop offset="50%" stopColor={grad.via} />
          <stop offset="100%" stopColor={grad.to} />
        </linearGradient>
      </defs>
      <rect width="400" height="144" fill={`url(#cg-${seed})`} />

      {/* Decorative background circles for depth */}
      <circle cx={320 + (seed % 60)} cy={40 + (seed % 40)} r={55 + (seed % 25)} fill="white" opacity="0.06" />
      <circle cx={80 + (seed % 50)} cy={90 + (seed % 30)} r={40 + (seed % 20)} fill="white" opacity="0.05" />

      {/* Subject-specific symbols scattered across the banner */}
      {picked.map((sym, i) => (
        <text
          key={i}
          x={positions[i].x}
          y={positions[i].y}
          fontSize={positions[i].size}
          fill="white"
          opacity={positions[i].opacity}
          fontFamily="system-ui, sans-serif"
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="central"
          transform={`rotate(${positions[i].rotate}, ${positions[i].x}, ${positions[i].y})`}
        >
          {sym}
        </text>
      ))}

      {/* Large hero symbol — top-right, bigger & bolder */}
      <text
        x={340 + (seed % 40)}
        y={50 + (seed % 30)}
        fontSize="42"
        fill="white"
        opacity="0.12"
        fontFamily="system-ui, sans-serif"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="central"
        transform={`rotate(${(seed % 30) - 15}, ${340 + (seed % 40)}, ${50 + (seed % 30)})`}
      >
        {symbols[seed % symbols.length]}
      </text>
    </svg>
  );
};

export default CourseBannerSVG;
