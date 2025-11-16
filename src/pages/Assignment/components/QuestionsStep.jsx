import React, { useState } from 'react';
import { Upload, Sparkles, FileText, Edit, Trash, CheckCircle2 } from 'lucide-react';
import MCQGenerator from './MCQGenerator';
import AIApprovalModal from './AIApprovalModal';
import { parseFile } from '../utils/questionParser';

const QuestionsStep = ({
  questions, setQuestions,
  activeTab, setActiveTab,
  courseData
}) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showMCQGenerator, setShowMCQGenerator] = useState(false);
  const [showAIApproval, setShowAIApproval] = useState(false);
  const [pendingAIQuestions, setPendingAIQuestions] = useState([]);
  
  // AI Generator State (for subjective)
  const [numQuestions, setNumQuestions] = useState(5);
  const [selectedBloomLevel, setSelectedBloomLevel] = useState('');
  const [selectedModule2, setSelectedModule2] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [generating, setGenerating] = useState(false);

  const bloomLevels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    try {
      const parsedQuestions = await parseFile(file);
      setQuestions(prev => [...prev, ...parsedQuestions]);
    } catch (error) {
      alert(`Error parsing file: ${error.message}`);
    }
  };

  const generateAISubjectiveQuestions = () => {
    setGenerating(true);
    // Dummy AI generation - only subjective questions
    setTimeout(() => {
      const dummySubjectiveQuestions = [
        {
          id: `ai_${Date.now()}_1`,
          question: 'What is the difference between population and sample in statistics?',
          type: 'subjective',
          bloomLevel: selectedBloomLevel || 'understand',
          courseOutcome: 'CO1',
          options: null,
          correctAnswer: null,
          points: 20,
          source: 'ai',
          status: 'pending'
        },
        {
          id: `ai_${Date.now()}_2`,
          question: 'Calculate the mean of the following dataset: 5, 10, 15, 20, 25',
          type: 'subjective',
          bloomLevel: selectedBloomLevel || 'apply',
          courseOutcome: 'CO1',
          options: null,
          correctAnswer: null,
          points: 20,
          source: 'ai',
          status: 'pending'
        },
        {
          id: `ai_${Date.now()}_3`,
          question: 'Explain Bayes\' theorem and provide a real-world example of its application.',
          type: 'subjective',
          bloomLevel: selectedBloomLevel || 'analyze',
          courseOutcome: 'CO2',
          options: null,
          correctAnswer: null,
          points: 25,
          source: 'ai',
          status: 'pending'
        }
      ].slice(0, numQuestions);

      setPendingAIQuestions(dummySubjectiveQuestions);
      setShowAIApproval(true);
      setGenerating(false);
    }, 2000);
  };

  const handleApproveAIQuestions = (approvedQuestions) => {
    const approved = approvedQuestions.map(q => ({
      ...q,
      status: 'approved'
    }));
    setQuestions(prev => [...prev, ...approved]);
    setPendingAIQuestions([]);
  };

  const handleRejectAIQuestions = (rejectedQuestions) => {
    setPendingAIQuestions([]);
  };

  const removeQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const editQuestion = (id) => {
    // Simple edit - in production, this would open a modal
    const question = questions.find(q => q.id === id);
    if (question) {
      const newQuestion = prompt('Edit question:', question.question);
      if (newQuestion) {
        setQuestions(prev => prev.map(q => 
          q.id === id ? { ...q, question: newQuestion } : q
        ));
      }
    }
  };

  const subjectiveQuestions = questions.filter(q => q.type === 'subjective');
  const objectiveQuestions = questions.filter(q => q.type === 'objective');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="text-blue-500" size={24} />
          <div>
            <h2 className="text-2xl font-bold">Questions</h2>
            <p className="text-gray-600">Add subjective and objective questions</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {questions.length} questions ({subjectiveQuestions.length} subjective, {objectiveQuestions.length} objective)
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'subjective', icon: FileText, label: `Subjective (${subjectiveQuestions.length})` },
          { key: 'objective', icon: CheckCircle2, label: `Objective (${objectiveQuestions.length})` }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'subjective' && (
          <div className="space-y-6">
            {/* AI Generation Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-blue-500" size={20} />
                <h3 className="text-lg font-semibold">AI Question Generator</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
                  <input
                    type="number"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    min="1"
                    max="20"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bloom Taxonomy Level</label>
                  <select
                    value={selectedBloomLevel}
                    onChange={(e) => setSelectedBloomLevel(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select level</option>
                    {bloomLevels.map(level => (
                      <option key={level} value={level.toLowerCase()}>{level}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Context (Optional)</label>
                  <textarea
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Provide any additional context..."
                  />
                </div>
              </div>
              <button
                onClick={generateAISubjectiveQuestions}
                disabled={generating || !numQuestions}
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Subjective Questions
                  </>
                )}
              </button>
            </div>

            {/* Question List */}
            <div className="bg-white rounded-lg shadow-sm border">
              {subjectiveQuestions.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Subjective Questions</h3>
                  <p className="text-gray-600">Generate questions using AI or upload a file.</p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {subjectiveQuestions.map((q, index) => (
                    <div key={q.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            Q{index + 1}
                          </span>
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                            Subjective
                          </span>
                          {q.source === 'ai' && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                              <Sparkles size={10} />
                              AI Generated
                            </span>
                          )}
                          {q.points && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {q.points} pts
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editQuestion(q.id)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => removeQuestion(q.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-900 mb-2">{q.question}</p>
                      {(q.bloomLevel || q.courseOutcome) && (
                        <div className="flex gap-2 mt-3">
                          {q.bloomLevel && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {q.bloomLevel}
                            </span>
                          )}
                          {q.courseOutcome && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {q.courseOutcome}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'objective' && (
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="text-blue-500" size={20} />
                <h3 className="text-lg font-semibold">Upload MCQ Questions</h3>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Question File</h4>
                <p className="text-gray-600 mb-4">
                  Drag and drop your CSV or JSON file here, or click to browse
                </p>
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload-objective"
                />
                <label
                  htmlFor="file-upload-objective"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                >
                  Choose File
                </label>
                {uploadedFile && (
                  <p className="mt-2 text-sm text-green-600">
                    Uploaded: {uploadedFile.name}
                  </p>
                )}
              </div>
            </div>

            {/* MCQ Generator Button */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">MCQ Generator</h3>
                  <p className="text-sm text-gray-600">Create multiple choice questions interactively</p>
                </div>
                <button
                  onClick={() => setShowMCQGenerator(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  Open Generator
                </button>
              </div>
            </div>

            {/* Question List */}
            <div className="bg-white rounded-lg shadow-sm border">
              {objectiveQuestions.length === 0 ? (
                <div className="p-12 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Objective Questions</h3>
                  <p className="text-gray-600">Upload a file or use the MCQ generator to add questions.</p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {objectiveQuestions.map((q, index) => (
                    <div key={q.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            Q{index + 1}
                          </span>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            MCQ
                          </span>
                          {q.points && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {q.points} pts
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editQuestion(q.id)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => removeQuestion(q.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-900 mb-3">{q.question}</p>
                      {q.options && (
                        <div className="space-y-2">
                          {q.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-2 rounded border text-sm ${
                                q.correctAnswer === option
                                  ? 'bg-green-50 border-green-200 text-green-800'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                              {option}
                              {q.correctAnswer === option && (
                                <CheckCircle2 className="inline ml-2" size={14} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showMCQGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <MCQGenerator
              onSave={(generatedQuestions) => {
                setQuestions(prev => [...prev, ...generatedQuestions]);
                setShowMCQGenerator(false);
              }}
              onCancel={() => setShowMCQGenerator(false)}
            />
          </div>
        </div>
      )}

      <AIApprovalModal
        isOpen={showAIApproval}
        onClose={() => setShowAIApproval(false)}
        questions={pendingAIQuestions}
        onApprove={handleApproveAIQuestions}
        onReject={handleRejectAIQuestions}
      />
    </div>
  );
};

export default QuestionsStep;


