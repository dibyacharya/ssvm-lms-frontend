import React from "react";

/**
 * NTA-style vertical section tabs for exam navigation.
 * Shows section name, subject, and progress indicator.
 */
const SectionTabs = ({
  sections = [],
  currentSectionIndex = 0,
  onSectionChange,
  sectionProgress = {},
}) => {
  return (
    <div className="flex flex-col w-full">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
        Sections
      </p>
      {sections.map((section, idx) => {
        const isActive = idx === currentSectionIndex;
        const progress = sectionProgress[section.sectionId] || {
          answered: 0,
          total: section.questionCount || 0,
        };
        const progressPercent =
          progress.total > 0
            ? Math.round((progress.answered / progress.total) * 100)
            : 0;

        return (
          <button
            key={section.sectionId}
            onClick={() => onSectionChange(idx)}
            className={`
              w-full text-left px-3 py-3 border-l-4 transition-all duration-150
              ${
                isActive
                  ? "border-primary-500 bg-primary-50 text-primary-200"
                  : "border-transparent hover:bg-gray-50 text-gray-600"
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">
                  Section {section.sectionId}
                </p>
                <p className="text-xs text-gray-500">{section.name}</p>
                {section.subject && (
                  <p className="text-xs text-primary-600 mt-0.5">
                    {section.subject}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs font-medium">
                  {progress.answered}/{progress.total}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-1.5 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Marking info */}
            <div className="mt-1 flex gap-2 text-[10px] text-gray-400">
              <span>{section.questionCount} Qs</span>
              <span>{section.marksPerQuestion || 4} marks each</span>
              {section.questionType === "numerical" && (
                <span className="text-blue-400">Numerical</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default SectionTabs;
