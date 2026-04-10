import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'indigo',
  delay = 0,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseInt(value) || 0;

  // Animated counter
  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }
    const duration = 1500;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [numericValue, value]);

  const colorMap = {
    indigo: {
      iconBg: 'from-primary-600/20 to-primary-500/10',
      iconColor: 'text-primary-600',
      glow: 'group-hover:shadow-glow-sm',
      border: 'group-hover:border-primary-500/20',
    },
    orange: {
      iconBg: 'from-accent-600/20 to-accent-500/10',
      iconColor: 'text-accent-600',
      glow: 'group-hover:shadow-glow-orange',
      border: 'group-hover:border-accent-500/20',
    },
    emerald: {
      iconBg: 'from-emerald-600/20 to-emerald-500/10',
      iconColor: 'text-emerald-600',
      glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]',
      border: 'group-hover:border-emerald-500/20',
    },
    cyan: {
      iconBg: 'from-cyan-600/20 to-cyan-500/10',
      iconColor: 'text-cyan-600',
      glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]',
      border: 'group-hover:border-cyan-500/20',
    },
    rose: {
      iconBg: 'from-rose-600/20 to-rose-500/10',
      iconColor: 'text-rose-600',
      glow: 'group-hover:shadow-[0_0_20px_-5px_rgba(244,63,94,0.3)]',
      border: 'group-hover:border-rose-500/20',
    },
  };

  const c = colorMap[color] || colorMap.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`
        group relative overflow-hidden rounded-2xl
        bg-white/70 backdrop-blur-xl
        border border-gray-200
        ${c.border} ${c.glow}
        p-5 transition-all duration-300
        hover:translate-y-[-2px]
        ${className}
      `}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 shimmer-effect pointer-events-none" />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 font-mono tracking-tight">
            {displayValue}
          </p>
          {subtitle && (
            <p className="text-gray-400 text-xs mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                className={trend === 'down' ? 'rotate-180' : ''}>
                <polyline points="18 15 12 9 6 15" />
              </svg>
              {trendValue}
            </div>
          )}
        </div>

        {Icon && (
          <div className={`
            flex items-center justify-center w-12 h-12 rounded-xl
            bg-gradient-to-br ${c.iconBg}
            ${c.iconColor}
            transition-transform duration-300 group-hover:scale-110
          `}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
