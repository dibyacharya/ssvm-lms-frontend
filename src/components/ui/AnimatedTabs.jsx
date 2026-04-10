import React, { useState, useRef, useEffect } from 'react';

const AnimatedTabs = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className = '',
}) => {
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const tabRefs = useRef([]);

  useEffect(() => {
    const activeIndex = tabs.findIndex(t => t.id === activeTab);
    const activeEl = tabRefs.current[activeIndex];
    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
      });
    }
  }, [activeTab, tabs]);

  if (variant === 'pills') {
    return (
      <div className={`flex items-center gap-1.5 p-1 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-100 ${className}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
              ${activeTab === tab.id
                ? 'bg-primary-600 text-white shadow-glow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon && <tab.icon size={15} />}
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    );
  }

  // Default: underline variant
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-0 border-b border-gray-100">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={el => tabRefs.current[index] = el}
            onClick={() => onChange(tab.id)}
            className={`
              relative px-5 py-3 text-sm font-medium transition-all duration-300
              ${activeTab === tab.id
                ? 'text-primary-600'
                : 'text-gray-500 hover:text-gray-900'
              }
            `}
          >
            <span className="flex items-center gap-2">
              {tab.icon && <tab.icon size={15} />}
              {tab.label}
              {tab.count !== undefined && (
                <span className={`
                  text-xs px-1.5 py-0.5 rounded-full
                  ${activeTab === tab.id
                    ? 'bg-primary-50 text-primary-600'
                    : 'bg-gray-100 text-gray-500'
                  }
                `}>
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {/* Sliding underline indicator */}
      <div
        className="absolute bottom-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-300 ease-out"
        style={indicatorStyle}
      />
    </div>
  );
};

export default AnimatedTabs;
