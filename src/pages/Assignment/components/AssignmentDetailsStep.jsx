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
  courseData
}) => (
  <div className="max-w-6xl mx-auto">
    <div className="flex items-center gap-2 mb-6">
      <BookOpen className="text-blue-500" size={24} />
      <h2 className="text-2xl font-bold">Assignment Details</h2>
      <p className="text-gray-600 ml-2">Configure the basic information for your assignment</p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Title</label>
            <input
              type="text"
              value={assignmentTitle}
              onChange={(e) => setAssignmentTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter assignment title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Module</label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <Calendar className="text-blue-500" size={20} />
            <h3 className="text-lg font-semibold">Scheduling</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Points</label>
              <select
                value={totalPoints}
                onChange={(e) => setTotalPoints(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={100}>100</option>
                <option value={50}>50</option>
                <option value={25}>25</option>
                <option value={10}>10</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AssignmentDetailsStep;


