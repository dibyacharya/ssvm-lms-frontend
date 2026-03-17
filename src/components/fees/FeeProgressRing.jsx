import React from 'react';
import { motion } from 'framer-motion';

const FeeProgressRing = ({ paid = 0, total = 1, size = 140, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? paid / total : 0;
  const offset = circumference - progress * circumference;

  const getColor = () => {
    if (progress >= 0.75) return { stroke: '#10B981', bg: '#D1FAE5', text: '#065F46' };
    if (progress >= 0.5) return { stroke: '#F59E0B', bg: '#FEF3C7', text: '#92400E' };
    return { stroke: '#EF4444', bg: '#FEE2E2', text: '#991B1B' };
  };

  const colors = getColor();
  const percentage = Math.round(progress * 100);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-2xl font-bold"
          style={{ color: colors.text }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {percentage}%
        </motion.span>
        <span className="text-xs text-gray-500 mt-0.5">
          {paid} of {total} Paid
        </span>
      </div>
    </div>
  );
};

export default FeeProgressRing;
