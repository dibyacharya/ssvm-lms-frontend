import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Lock, Award } from 'lucide-react';
import { getCourseDescription } from '../../../services/course.service';

const AssignmentDetailsStep = ({
  assignmentTitle, setAssignmentTitle,
  description, setDescription,
  instructions, setInstructions,
  selectedModule, setSelectedModule,
  totalPoints, setTotalPoints,
  dueDate, setDueDate,
  dueTime, setDueTime,
  courseData,
  isUngraded, setIsUngraded,
  completeIn, setCompleteIn,
  isCAMode = false,
  autoTitle = '',
  configuredMarks = null
}) => {
  // Get today's date in YYYY-MM-DD format for min date validation
  const today = new Date().toISOString().split('T')[0];

  // Fetch course outcomes from backend
  const [courseOutcomes, setCourseOutcomes] = useState([]);

  useEffect(() => {
    const fetchOutcomes = async () => {
      const courseId = courseData?._id || courseData?.id;
      if (!courseId) return;
      try {
        const result = await getCourseDescription(courseId);
        const desc = result?.description || result;
        if (desc?.courseOutcomes && Array.isArray(desc.courseOutcomes) && desc.courseOutcomes.length > 0) {
          const formatted = desc.courseOutcomes
            .map((co, idx) => ({
              code: co.code || `CO${idx + 1}`,
              description: co.outcome || co.description || ''
            }))
            .filter(co => co.description); // Skip outcomes with empty description
          setCourseOutcomes(formatted);
          return;
        }
      } catch (err) {
        console.log('Could not fetch course outcomes from backend:', err.message);
      }
      // Fallback to courseData context
      if (courseData?.learningOutcomes && Array.isArray(courseData.learningOutcomes) && courseData.learningOutcomes.length > 0) {
        setCourseOutcomes(courseData.learningOutcomes.map((outcome, index) => {
          const outcomeStr = String(outcome);
          const coMatch = outcomeStr.match(/^(CO\d+)/i);
          const loMatch = outcomeStr.match(/^(LO\d+)/i);
          if (coMatch) {
            return { code: coMatch[1], description: outcomeStr.replace(/^CO\d+[:\s]*/i, '').trim() || outcomeStr };
          } else if (loMatch) {
            return { code: loMatch[1].replace(/^LO/i, 'CO'), description: outcomeStr.replace(/^LO\d+[:\s]*/i, '').trim() || outcomeStr };
          }
          return { code: `CO${index + 1}`, description: outcomeStr };
        }));
      }
    };
    fetchOutcomes();
  }, [courseData]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <BookOpen className="text-blue-600" size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Assignment Details</h2>
          <p className="text-sm text-gray-500">Configure the basic information for your assignment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Basic Info */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-blue-500 rounded-full"></span>
              Basic Information
            </h3>
            <div className="space-y-4">
              {/* Title - Read-only in CA mode, editable otherwise */}
              {isCAMode && autoTitle ? (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    Assignment Title
                  </label>
                  <div className="w-full p-3 bg-gradient-to-r from-blue-50 to-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="font-semibold text-blue-800">{autoTitle}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Auto-generated from assessment plan</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    Assignment Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={assignmentTitle}
                    onChange={(e) => setAssignmentTitle(e.target.value)}
                    required
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      !assignmentTitle ? 'border-red-300 bg-red-50/30' : 'border-gray-300'
                    }`}
                    placeholder="Enter assignment title"
                  />
                </div>
              )}

              {/* Description - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Description <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  rows="3"
                  placeholder="Brief description of the assignment (optional)"
                />
              </div>

              {/* Course - Read-only */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Course</label>
                <input
                  type="text"
                  value={courseData ? `${courseData.courseCode || ''} - ${courseData.title || ''}` : ''}
                  disabled
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              {/* Module */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Module <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  required
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    !selectedModule ? 'border-red-300 bg-red-50/30' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select module</option>
                  {courseData?.syllabus?.modules?.map(module => (
                    <option key={module._id} value={module._id}>
                      Module {module.moduleNumber}: {module.name || module.moduleTitle}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Course Outcomes Card */}
          {courseOutcomes.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-500" />
                Course Outcomes
              </h3>
              <div className="space-y-2">
                {courseOutcomes.map((outcome, index) => {
                  const code = typeof outcome === 'string'
                    ? `CO${index + 1}`
                    : (outcome.code || `CO${index + 1}`);
                  const desc = typeof outcome === 'string'
                    ? outcome
                    : (outcome.description || outcome.outcome || outcome.text || String(outcome.code || ''));
                  return (
                    <div key={index} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-blue-50/50 border border-blue-100">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold flex-shrink-0 mt-0.5">
                        {code}
                      </span>
                      <span className="text-sm text-gray-700">{desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Instructions & Scheduling */}
        <div className="space-y-5">
          {/* Instructions - Optional */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-amber-500 rounded-full"></span>
              Instructions <span className="text-gray-400 text-xs font-normal ml-1">(Optional)</span>
            </h3>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
              rows="5"
              placeholder="Use clear, concise language. Include any special requirements or resources students will need."
            />
          </div>

          {/* Scheduling */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="text-blue-500" size={18} />
              <h3 className="text-base font-semibold text-gray-800">Scheduling & Grading</h3>
            </div>
            <div className="space-y-4">
              {/* Total Points */}
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isUngraded ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Points
                  {isCAMode && configuredMarks && (
                    <span className="ml-2 text-xs text-blue-600 font-normal bg-blue-50 px-2 py-0.5 rounded-full">
                      Auto-set from plan: {configuredMarks}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  value={totalPoints}
                  onChange={(e) => setTotalPoints(Number(e.target.value))}
                  min="0"
                  step="1"
                  disabled={isUngraded || (isCAMode && configuredMarks)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    isUngraded || (isCAMode && configuredMarks)
                      ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed'
                      : 'border-gray-300'
                  }`}
                  placeholder="Enter total points"
                />
              </div>

              {/* Due Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={today}
                    required
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      !dueDate ? 'border-red-300 bg-red-50/30' : 'border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Due Time</label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Time Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Time Limit <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={completeIn || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : parseInt(e.target.value);
                      setCompleteIn(value);
                    }}
                    min="1"
                    step="1"
                    placeholder="Enter time in minutes"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <span className="text-sm text-gray-500 whitespace-nowrap">minutes</span>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Set a time limit for students to complete this assignment. Leave empty for no time limit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetailsStep;
