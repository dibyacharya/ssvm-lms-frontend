import React from 'react';

const GlowBorder = ({
  children,
  color = 'indigo',
  animate = true,
  className = '',
  borderWidth = 1,
  rounded = 'rounded-2xl',
  ...props
}) => {
  const gradients = {
    indigo: 'from-primary-500 via-primary-500 to-primary-600',
    orange: 'from-accent-500 via-accent-300 to-accent-600',
    brand: 'from-primary-500 via-accent-500 to-primary-500',
    rainbow: 'from-primary-500 via-accent-500 to-emerald-500',
    cyan: 'from-cyan-500 via-cyan-300 to-cyan-600',
  };

  return (
    <div className={`relative ${rounded} ${className}`} {...props}>
      {/* Animated gradient border */}
      <div
        className={`
          absolute -inset-[${borderWidth}px] ${rounded}
          bg-gradient-to-r ${gradients[color] || gradients.indigo}
          ${animate ? 'bg-[length:200%_100%] animate-border-flow' : ''}
          opacity-60
        `}
        style={{ padding: `${borderWidth}px` }}
      />
      {/* Inner content with background to create border effect */}
      <div className={`relative ${rounded} bg-white h-full`}>
        {children}
      </div>
    </div>
  );
};

export default GlowBorder;
