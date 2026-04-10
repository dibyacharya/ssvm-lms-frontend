import React, { useState, useEffect } from "react";
import {
  Loader2,
  AlertCircle,
  BookOpen,
  Layers,
  ChevronDown,
  FileText,
  Clock,
  Library,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { getCourseDescription } from "../../../../services/course.service";

const SectionHeader = ({ icon: Icon, title, gradient, count }) => (
  <div className={`relative overflow-hidden px-6 py-4 ${gradient}`}>
    <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
    <div className="absolute -bottom-4 right-12 w-12 h-12 bg-white/5 rounded-full" />
    <div className="relative z-10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-900" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>
      </div>
      {count != null && (
        <span className="px-2.5 py-1 text-xs font-bold text-gray-900 bg-white/20 rounded-full backdrop-blur-sm">
          {count}
        </span>
      )}
    </div>
  </div>
);

const DescriptionSyllabus = () => {
  const { courseID } = useParams();
  const [syllabus, setSyllabus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModule, setExpandedModule] = useState(null);

  useEffect(() => {
    const fetchSyllabus = async () => {
      if (!courseID) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getCourseDescription(courseID);
        const desc = data.description || data;
        setSyllabus(desc.syllabus || []);
      } catch (err) {
        console.error("Error fetching syllabus:", err);
        setError("Failed to load syllabus.");
      } finally {
        setLoading(false);
      }
    };
    fetchSyllabus();
  }, [courseID]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-tertiary">Loading syllabus...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-red-50 p-6 rounded-xl text-center max-w-md">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!syllabus || syllabus.length === 0) {
    return (
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div className="bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden">
          <SectionHeader
            icon={BookOpen}
            title="Course Syllabus"
            gradient="bg-gradient-to-r from-blue-600 via-blue-600 to-fuchsia-500"
          />
          <div className="p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center mx-auto mb-4">
              <Library className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-primary mb-2">
              No Syllabus Available
            </h3>
            <p className="text-tertiary max-w-md mx-auto">
              The syllabus has not been set up by the admin yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatTimeWeightage = (tw) => {
    if (!tw) return null;
    const num = parseFloat(tw);
    if (!isNaN(num) && num > 0 && num <= 1) {
      return `${Math.round(num * 100)}%`;
    }
    return tw;
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 bg-gray-50">
      {/* Gradient Header Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden">
        <SectionHeader
          icon={BookOpen}
          title="Course Syllabus"
          gradient="bg-gradient-to-r from-blue-600 via-blue-600 to-fuchsia-500"
          count={`${syllabus.length} Modules`}
        />
        <div className="px-6 py-3 bg-gradient-to-r from-violet-50 to-fuchsia-50 border-b border-violet-100">
          <p className="text-sm text-violet-700">
            Module-wise syllabus as defined by the admin
          </p>
        </div>
      </div>

      {/* Modules List */}
      <div className="grid grid-cols-1 gap-6">
        {syllabus.map((module, idx) => {
          const moduleNo = module.moduleNo || idx + 1;
          const isExpanded = expandedModule === moduleNo;
          const timeWeightage = formatTimeWeightage(module.timeWeightage);

          return (
            <div
              key={idx}
              className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 hover:shadow-md ${
                isExpanded
                  ? "border-indigo-200"
                  : "border-tertiary/10 hover:border-indigo-200"
              }`}
            >
              {/* Module Header */}
              <div
                className={`cursor-pointer transition-all duration-200 ${
                  isExpanded
                    ? "bg-gradient-to-r from-blue-50 via-blue-50 to-violet-50 border-b border-indigo-100"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setExpandedModule(isExpanded ? null : moduleNo)}
              >
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-4 flex-grow">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                        isExpanded
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-indigo-200"
                          : "bg-gradient-to-r from-blue-500 to-blue-600"
                      }`}
                    >
                      <Layers className="w-6 h-6 text-gray-900" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-semibold px-3 py-1 rounded-full text-xs transition-all duration-200 ${
                            isExpanded
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-gray-900"
                              : "bg-gradient-to-r from-blue-500 to-blue-600 text-gray-900"
                          }`}
                        >
                          Module {moduleNo}
                        </span>
                        {timeWeightage && (
                          <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-gradient-to-r from-amber-50 to-blue-50 text-amber-700 rounded-full border border-amber-200 font-medium">
                            <Clock className="w-3 h-3" />
                            {timeWeightage}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-primary mt-1">
                        {module.moduleTitle || "Untitled Module"}
                      </h3>
                    </div>
                  </div>
                  <div
                    className={`p-2 rounded-full transition-all duration-300 ${
                      isExpanded
                        ? "bg-indigo-100 rotate-180"
                        : "bg-gray-100"
                    }`}
                  >
                    <ChevronDown
                      className={`w-5 h-5 transition-colors duration-200 ${
                        isExpanded ? "text-blue-600" : "text-tertiary"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Module Details (expanded) */}
              {isExpanded && (
                <div className="p-6 bg-white">
                  {module.moduleDetails ? (
                    <div className="border-l-4 border-indigo-400 pl-5 ml-2">
                      <div className="prose max-w-none">
                        <p className="text-black leading-relaxed whitespace-pre-wrap">
                          {module.moduleDetails}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-7 h-7 text-tertiary/30" />
                      </div>
                      <p className="text-tertiary/60 italic">
                        No details available for this module.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DescriptionSyllabus;
