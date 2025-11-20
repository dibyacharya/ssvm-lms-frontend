import React from 'react';
import { Eye, BookOpen, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

const ReviewStep = ({
  questions, assignmentTitle, description, selectedModule,
  totalPoints, dueDate, dueTime, loading, handleSave, courseData, isUngraded,
  attachments = [], onPrevious, completeIn
}) => {
  // Find the selected module
  const selectedModuleData = selectedModule 
    ? courseData?.syllabus?.modules?.find(m => m._id === selectedModule || m.id === selectedModule)
    : null;
  const moduleName = selectedModuleData 
    ? `Module ${selectedModuleData.moduleNumber || ''}: ${selectedModuleData.name}`.replace('Module :', 'Module')
    : "Not selected";
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Eye className="text-blue-500" size={24} />
        <div>
          <h2 className="text-2xl font-bold">Review & Publish</h2>
          <p className="text-gray-600">Review your assignment details and publish when ready</p>
        </div>
      </div>
      
      {/* Assignment Summary - In a row layout */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="text-blue-500" size={20} />
          <h3 className="text-lg font-semibold">Assignment Summary</h3>
        </div>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">{assignmentTitle || "Untitled Assignment"}</h4>
            <p className="text-sm text-gray-600">{description || "No description provided"}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500 uppercase tracking-wide mb-1">COURSE</div>
              <div className="font-medium">{courseData?.courseCode || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 uppercase tracking-wide mb-1">MODULE</div>
              <div className="font-medium">{moduleName.split(":")[0]}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 uppercase tracking-wide mb-1">POINTS</div>
              <div className="font-medium">
                {isUngraded ? (
                  <span className="text-gray-400 italic">Ungraded</span>
                ) : (
                  totalPoints
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 uppercase tracking-wide mb-1">QUESTIONS</div>
              <div className="font-medium">{questions.length}</div>
            </div>
          </div>
          {isUngraded && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <AlertCircle className="text-gray-500" size={16} />
              <span className="text-sm text-gray-600">This is an ungraded assignment</span>
            </div>
          )}
          {dueDate && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Calendar className="text-blue-600" size={16} />
              <span className="text-sm font-medium text-blue-900">
                Due: {new Date(dueDate + "T" + dueTime).toLocaleDateString()} at {dueTime}
              </span>
            </div>
          )}
          {completeIn && completeIn > 0 && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <AlertCircle className="text-orange-600" size={16} />
              <span className="text-sm font-medium text-orange-900">
                Time Limit: {completeIn} minutes ({completeIn >= 60 ? `${Math.floor(completeIn / 60)} hour${Math.floor(completeIn / 60) > 1 ? 's' : ''}` : ''}{completeIn % 60 !== 0 && completeIn >= 60 ? ` ${completeIn % 60} minute${completeIn % 60 > 1 ? 's' : ''}` : completeIn < 60 ? `${completeIn} minute${completeIn > 1 ? 's' : ''}` : ''})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Questions Overview - Below Assignment Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Questions Overview</h3>
        {questions.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
            <p className="text-sm text-gray-600">No questions added yet</p>
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-2">
            {questions.map((q, index) => (
              <div key={q.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                <span className="bg-white text-gray-600 text-xs px-2 py-1 rounded font-medium">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{q.question}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      q.type === 'objective' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {q.type}
                    </span>
                    {!isUngraded && (q.score || q.points) && (
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        {(q.score || q.points)} pts
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {!isUngraded && questions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total Score:</span>
                  <span className="text-sm font-bold text-blue-600">
                    {questions.reduce((sum, q) => sum + (q.score || q.points || 0), 0)} points
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Attachments Section */}
      {attachments.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Attachments</h3>
          <div className="space-y-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">{file.name || (file.url ? 'Attachment' : 'File')}</span>
                {file.size && (
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Ready to Publish?</h3>
            <p className="text-sm text-gray-600">Once published, students will be able to see and submit this assignment.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={loading || !assignmentTitle || (questions.length === 0 && attachments.length === 0)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Publishing...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Publish Assignment
              </>
            )}
          </button>
        </div>
        {(!assignmentTitle || (questions.length === 0 && attachments.length === 0)) && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-yellow-600" size={16} />
              <p className="text-sm text-yellow-800">
                Please provide an assignment title and add at least one question or attachment before publishing.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Previous Button */}
      <div className="mt-6 flex justify-start">
        <button
          onClick={onPrevious}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Previous
        </button>
      </div>
    </div>
  );
};

export default ReviewStep;


