import React from 'react';
import { Eye, BookOpen, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

const ReviewStep = ({
  questions, assignmentTitle, description, selectedModule,
  totalPoints, dueDate, dueTime, loading, handleSave, courseData
}) => {
  const objectiveQuestions = questions.filter(q => q.type === 'objective');
  const subjectiveQuestions = questions.filter(q => q.type === 'subjective');
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Eye className="text-blue-500" size={24} />
        <div>
          <h2 className="text-2xl font-bold">Review & Publish</h2>
          <p className="text-gray-600">Review your assignment details and publish when ready</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="text-blue-500" size={20} />
            <h3 className="text-lg font-semibold">Assignment Summary</h3>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">{assignmentTitle || "Untitled Assignment"}</h4>
              <p className="text-sm text-gray-600">{description || "No description provided"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">COURSE</div>
                <div className="font-medium">{courseData?.courseCode || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">MODULE</div>
                <div className="font-medium">
                  {selectedModule ? courseData?.syllabus?.modules?.find(m => m._id === selectedModule)?.name : "Not selected"}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">POINTS</div>
                <div className="font-medium">{totalPoints}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">QUESTIONS</div>
                <div className="font-medium">{questions.length}</div>
              </div>
            </div>
            {dueDate && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Calendar className="text-blue-600" size={16} />
                <span className="text-sm font-medium text-blue-900">
                  Due: {new Date(dueDate + "T" + dueTime).toLocaleDateString()} at {dueTime}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Question Review Status</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{questions.length}</div>
              <div className="text-sm text-green-600">Total</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{objectiveQuestions.length}</div>
              <div className="text-sm text-blue-600">Objective</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{subjectiveQuestions.length}</div>
              <div className="text-sm text-purple-600">Subjective</div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium">Questions Overview</h4>
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
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        q.type === 'objective' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {q.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Ready to Publish?</h3>
            <p className="text-sm text-gray-600">Once published, students will be able to see and submit this assignment.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={loading || !assignmentTitle || questions.length === 0}
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
        {(!assignmentTitle || questions.length === 0) && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-yellow-600" size={16} />
              <p className="text-sm text-yellow-800">
                Please provide an assignment title and add at least one question before publishing.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewStep;

