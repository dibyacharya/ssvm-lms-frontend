import React, { useState } from 'react';
import { Settings, BarChart3, Target, Clock, TrendingUp, Award, BookOpen, Calendar, Activity, Heart, Star, FileText, Play, CheckCircle, XCircle, RotateCcw, ArrowRight, Upload } from 'lucide-react';
import { contentData, knowledgeGraphNodes, quizData } from './data';

function Content({ 
  selectedContent, 
  selectedSection, 
  setSelectedContent,
  draggedNodes,
  isDragging,
  isOverDropZone,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemoveNode,
  dragAreaRef
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);

  const currentContent = contentData[selectedSection] || contentData['intro-stats'];
  const currentQuiz = quizData[selectedSection];

  // Quiz Functions
  const handleAnswerSelect = (questionId, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const calculateScore = () => {
    const questions = currentQuiz.questions;
    let correct = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correct) {
        correct++;
      }
    });
    return (correct / questions.length) * 100;
  };

  const nextQuestion = () => {
    if (currentQuestion < currentQuiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setQuizStarted(false);
    setTimeLeft(currentQuiz.timeLimit * 60);
  };

  // Dashboard Component
  const Dashboard = () => (
    <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Learning Dashboard</h2>
          <p className="text-gray-600">Track your progress in Statistics & Probability</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                <p className="text-3xl font-bold text-blue-600">75%</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Topics Completed</p>
                <p className="text-3xl font-bold text-green-600">12</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">out of 16 total topics</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Study Time</p>
                <p className="text-3xl font-bold text-purple-600">24h</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">this week</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quiz Average</p>
                <p className="text-3xl font-bold text-orange-600">85%</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-green-500 mt-2">+5% from last week</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="text-blue-600 font-semibold">Continue Learning</div>
              <div className="text-sm text-gray-600">Resume Hypothesis Testing</div>
            </button>
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <div className="text-green-600 font-semibold">Take Practice Quiz</div>
              <div className="text-sm text-gray-600">Test your knowledge</div>
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <div className="text-purple-600 font-semibold">Review Notes</div>
              <div className="text-sm text-gray-600">Go over key concepts</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Favorites Component
  const Favorites = () => (
    <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Heart className="h-8 w-8 text-red-500" />
            Favorite Topics
          </h2>
          <p className="text-gray-600">Your bookmarked statistics and probability concepts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Advanced</span>
                <Heart className="h-5 w-5 fill-current text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Central Limit Theorem</h3>
              <p className="text-gray-600 text-sm mb-4">The fundamental theorem that explains how sample means approach normal distribution</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Added 2024-01-15</span>
                <div className="flex items-center gap-2">
                  <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                    <Play className="h-4 w-4" />
                  </button>
                  <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                    <FileText className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Intermediate</span>
                <Heart className="h-5 w-5 fill-current text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Confidence Intervals</h3>
              <p className="text-gray-600 text-sm mb-4">Statistical method for estimating population parameters with specified confidence level</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Added 2024-01-10</span>
                <div className="flex items-center gap-2">
                  <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                    <Play className="h-4 w-4" />
                  </button>
                  <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                    <FileText className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Video Content
  const VideoContent = () => (
    <div className="flex-1 bg-black">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${currentContent.videoId}?enablejsapi=1&origin=${window.location.origin}`}
        title={currentContent.title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );

  // Knowledge Graph
  const KnowledgeGraph = () => (
    <div className="flex-1 bg-white p-4">
      <div className="h-full border-2 border-dashed border-gray-300 rounded-lg relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="absolute inset-0 p-6">
          {knowledgeGraphNodes.map((node) => (
            <div
              key={node.id}
              className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing hover:scale-110 transition-all duration-200 hover:shadow-lg"
              style={{ left: `${node.x}px`, top: `${node.y}px` }}
              draggable
              onDragStart={(e) => onDragStart(e, node)}
              onDragEnd={(e) => {
                e.target.style.opacity = '1';
                e.target.style.transform = 'scale(1)';
              }}
            >
              <div className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center text-white font-semibold text-xs shadow-lg border-2 border-white ${
                node.type === 'concept' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 
                node.type === 'measure' ? 'bg-gradient-to-br from-green-500 to-green-600' : 
                node.type === 'theory' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' : 
                'bg-gradient-to-br from-purple-500 to-purple-600'
              }`}>
                <div className="text-center leading-tight">
                  {node.name.length > 12 ? (
                    <>
                      <div>{node.name.split(' ')[0]}</div>
                      <div>{node.name.split(' ').slice(1).join(' ')}</div>
                    </>
                  ) : (
                    <div>{node.name}</div>
                  )}
                </div>
              </div>
              <div className={`mt-1 px-2 py-1 text-xs rounded-full text-center font-medium ${
                node.type === 'concept' ? 'bg-blue-100 text-blue-700' : 
                node.type === 'measure' ? 'bg-green-100 text-green-700' : 
                node.type === 'theory' ? 'bg-yellow-100 text-yellow-700' : 
                'bg-purple-100 text-purple-700'
              }`}>
                {node.type}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Notes Content
  const NotesContent = () => (
    <div className="flex-1 bg-white p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{currentContent.title}</h2>
        <div className="prose prose-lg">
          <p className="text-gray-700 leading-relaxed mb-4">{currentContent.notes}</p>
          
          {selectedSection === 'intro-stats' && (
            <>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Areas of Statistics:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Descriptive Statistics:</strong> Summarizing and describing data features</li>
                <li><strong>Probability Theory:</strong> Mathematical framework for uncertainty</li>
                <li><strong>Inferential Statistics:</strong> Making conclusions about populations from samples</li>
                <li><strong>Statistical Modeling:</strong> Creating mathematical representations of real-world phenomena</li>
              </ul>
            </>
          )}
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">📊 Study Tip:</h4>
            <p className="text-blue-700 text-sm">
              Practice with real datasets to better understand how statistical concepts apply in practice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Quiz Content
  const QuizContent = () => {
    if (!currentQuiz) return <div className="p-6">No quiz available for this section.</div>;

    if (selectedSection === 'final-project') {
      return (
        <div className="flex-1 bg-white p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Final Project: Statistical Analysis</h2>
              <p className="text-gray-600 text-lg">Complete a comprehensive statistical analysis project</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Submit Your Project</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
                  <input 
                    type="text" 
                    placeholder="Enter your project title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Files</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Upload your dataset, analysis code, and report</p>
                    <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Choose Files
                    </button>
                  </div>
                </div>

                <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold">
                  Submit Project
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!quizStarted) {
      return (
        <div className="flex-1 bg-white p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <Award className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-4">{currentQuiz.title}</h2>
              <p className="text-gray-600 text-lg">{currentQuiz.description}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quiz Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Time Limit</p>
                  <p className="text-lg font-semibold text-gray-800">{currentQuiz.timeLimit} minutes</p>
                </div>
                <div>
                  <FileText className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Questions</p>
                  <p className="text-lg font-semibold text-gray-800">{currentQuiz.questions.length}</p>
                </div>
                <div>
                  <Award className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Passing Score</p>
                  <p className="text-lg font-semibold text-gray-800">70%</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setQuizStarted(true)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold text-lg"
            >
              Start Quiz
            </button>
          </div>
        </div>
      );
    }

    if (showResults) {
      const score = calculateScore();
      const passed = score >= 70;

      return (
        <div className="flex-1 bg-white p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-8">
              {passed ? (
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              ) : (
                <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              )}
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
              <p className="text-gray-600 text-lg">
                Your Score: <span className={`font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                  {score.toFixed(1)}%
                </span>
              </p>
            </div>

            <button
              onClick={resetQuiz}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="h-5 w-5" />
              Retake Quiz
            </button>
          </div>
        </div>
      );
    }

    const question = currentQuiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / currentQuiz.questions.length) * 100;

    return (
      <div className="flex-1 bg-white p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{currentQuiz.title}</h2>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-5 w-5" />
                <span>30:00</span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {currentQuiz.questions.length}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">{question.question}</h3>
            
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(question.id, index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedAnswers[question.id] === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswers[question.id] === index
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300'
                    }`}>
                      {selectedAnswers[question.id] === index && (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </div>
                    <span className="text-gray-800">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <button
              onClick={nextQuestion}
              disabled={selectedAnswers[question.id] === undefined}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {currentQuestion === currentQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next'}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Learning Path Planner
  const LearningPathPlanner = () => (
    <div className="bg-white border-t border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        Learning Path Planner
        {isDragging && (
          <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-full animate-pulse">
            Drop here to add to path
          </span>
        )}
      </h3>
      <div
        ref={dragAreaRef}
        className={`min-h-32 border-2 border-dashed rounded-lg p-4 transition-all duration-300 ${
          isOverDropZone 
            ? 'border-blue-400 bg-blue-50 shadow-inner' 
            : isDragging 
              ? 'border-green-400 bg-green-50' 
              : 'border-gray-300 bg-gray-50'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {draggedNodes.length === 0 ? (
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-500 font-medium">Drag statistics concepts from the Knowledge Graph</p>
            <p className="text-gray-400 text-sm mt-1">Build your personalized learning sequence</p>
          </div>
        ) : (
          <div className="space-y-4">
            {draggedNodes.map((node, index) => (
              <div
                key={node.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-md">
                      {index + 1}
                    </span>
                    <h4 className="font-semibold text-gray-800 text-lg">{node.name}</h4>
                  </div>
                  <button
                    onClick={() => onRemoveNode(node.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors text-xl font-bold w-8 h-8 flex items-center justify-center hover:bg-red-50 rounded-full"
                  >
                    ×
                  </button>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed pl-11">
                  {node.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Main render logic
  const renderTabs = () => {
    if (['dashboard', 'favorites'].includes(selectedSection)) return null;
    if (selectedSection.includes('quiz') || selectedSection === 'final-project') {
      return (
        <div className="flex space-x-1 mb-4">
          <button className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white">
            Assessment
          </button>
        </div>
      );
    }

    return (
      <div className="flex space-x-1 mb-4">
        <button
          onClick={() => setSelectedContent('video')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedContent === 'video' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
           Lecture
        </button>
        <button
          onClick={() => setSelectedContent('knowledge')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedContent === 'knowledge' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Knowledge Graph
        </button>
        <button
          onClick={() => setSelectedContent('notes')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedContent === 'notes' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Study Notes
        </button>
      </div>
    );
  };

  const renderContent = () => {
    if (selectedSection === 'dashboard') return <Dashboard />;
    if (selectedSection === 'favorites') return <Favorites />;
    if (selectedSection.includes('quiz') || selectedSection === 'final-project') return <QuizContent />;

    switch (selectedContent) {
      case 'video': return <VideoContent />;
      case 'knowledge': return <KnowledgeGraph />;
      case 'notes': return <NotesContent />;
      default: return <VideoContent />;
    }
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Content Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        {renderTabs()}
        
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-800">
            {currentContent.title}
          </h1>
          <div className="flex space-x-2">
            <button className="text-gray-600 hover:text-gray-800">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        {renderContent()}

        {/* Learning Path Planner - Only for regular content */}
        {!['dashboard', 'favorites'].includes(selectedSection) && 
         !selectedSection.includes('quiz') && 
         selectedSection !== 'final-project' && (
          <LearningPathPlanner />
        )}
      </div>
    </div>
  );
}

export default Content;