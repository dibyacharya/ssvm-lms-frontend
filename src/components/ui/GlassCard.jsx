import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({
  children,
  className = '',
  hover = true,
  glow = false,
  glowColor = 'indigo',
  padding = 'p-6',
  animate = true,
  delay = 0,
  onClick,
  ...props
}) => {
  const glowColors = {
    indigo: 'hover:shadow-glow',
    orange: 'hover:shadow-glow-orange',
    none: '',
  };

  const baseClasses = `
    relative overflow-hidden rounded-2xl
    bg-white/70 backdrop-blur-xl
    border border-gray-200
    shadow-card
    transition-all duration-300
    ${hover ? 'hover:border-primary-500/30 hover:translate-y-[-2px] hover:shadow-card cursor-pointer' : ''}
    ${glow ? glowColors[glowColor] : ''}
    ${padding}
    ${className}
  `;

  if (!animate) {
    return (
      <div className={baseClasses} onClick={onClick} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={baseClasses}
      onClick={onClick}
      {...props}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
      </div>
      {children}
    </motion.div>
  );
};

export default GlassCard;
