import React from 'react';
import { BookOpen, Calendar } from 'lucide-react';

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
  completeIn, setCompleteIn
}) => {
  // Get today's date in YYYY-MM-DD format for min date validation
  const today = new Date().toISOString().split('T')[0];
  
  return (
  <div className="max-w-6xl mx-auto">
    <div className="flex items-center gap-2 mb-6">
      <BookOpen className="text-primary" size={24} />
      <h2 className="text-2xl font-bold">Assignment Details</h2>
      <p className="text-gray-600 ml-2">Configure the basic information for your assignment</p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={assignmentTitle}
              onChange={(e) => setAssignmentTitle(e.target.value)}
              required
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                !assignmentTitle ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter assignment title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                !description || description.trim() === '' ? 'border-red-300' : 'border-gray-300'
              }`}
              rows="4"
              placeholder="Brief description of the assignment"
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <input
                type="text"
                value={courseData ? `${courseData.courseCode} - ${courseData.title}` : ''}
                disabled
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Module <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                required
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                  !selectedModule ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select module</option>
                {courseData?.syllabus?.modules?.map(module => (
                  <option key={module._id} value={module._id}>
                    Module {module.moduleNumber}: {module.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Instructions</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Instructions</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="6"
              placeholder="Use clear, concise language. Include any special requirements or resources students will need."
            />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-primary" size={20} />
            <h3 className="text-lg font-semibold">Scheduling</h3>
          </div>
          <div className="space-y-4">
            {/* Ungraded Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ungraded Assignment
                </label>
                <p className="text-xs text-gray-500">
                  This assignment will not be scored or graded
                </p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isUngraded}
                  onChange={(e) => {
                    setIsUngraded(e.target.checked);
                    if (e.target.checked) {
                      setTotalPoints(0);
                    }
                  }}
                />
                <div
                  className={`block w-14 h-8 rounded-full transition-colors cursor-pointer ${
                    isUngraded ? "bg-primary" : "bg-gray-300"
                  }`}
                  onClick={() => {
                    const newValue = !isUngraded;
                    setIsUngraded(newValue);
                    if (newValue) {
                      setTotalPoints(0);
                    }
                  }}
                >
                  <div
                    className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform transform ${
                      isUngraded ? "translate-x-6" : ""
                    }`}
                  ></div>
                </div>
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isUngraded ? 'text-gray-400' : 'text-gray-700'}`}>
                Total Points
              </label>
              <input
                type="number"
                value={totalPoints}
                onChange={(e) => setTotalPoints(Number(e.target.value))}
                min="0"
                step="1"
                disabled={isUngraded}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                  isUngraded 
                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'border-gray-300'
                }`}
                placeholder="Enter total points"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={today}
                  required
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                    !dueDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Time</label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Limit (Optional)
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <span className="text-sm text-gray-500 whitespace-nowrap">minutes</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Set a time limit for students to complete this assignment. Leave empty for no time limit.
                <br />
                <span className="font-medium">Examples:</span> 30 (30 min), 60 (1 hour), 90 (1.5 hours), 120 (2 hours)
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


