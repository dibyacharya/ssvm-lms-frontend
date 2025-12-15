import React, { useState, useEffect } from 'react';
import { Upload, Sparkles, FileText, Edit, Trash, CheckCircle2, Plus, X, Paperclip, Save, HelpCircle } from 'lucide-react';
import MCQGenerator from './MCQGenerator';
import AIApprovalModal from './AIApprovalModal';
import AddQuestionModal from './AddQuestionModal';
import AIGenerationModal from './AIGenerationModal';
import { parseFile, getSampleCSVFormat, getSampleJSONFormat } from '../utils/questionParser';

const QuestionsStep = ({
  questions, setQuestions,
  activeTab, setActiveTab,
  courseData,
  assignmentType = null, // 'subjective' or 'objective' - if set, restricts to that type only
  attachments = [], // Assignment-level attachments
  setAttachments = () => {}, // Function to update assignment-level attachments
  totalPoints = 100, // Total points for the assignment
  isUngraded = false // Whether the assignment is ungraded
}) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showMCQGenerator, setShowMCQGenerator] = useState(false);
  const [showAIApproval, setShowAIApproval] = useState(false);
  const [pendingAIQuestions, setPendingAIQuestions] = useState([]);
  
  // Modal states
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showAIGenerationModal, setShowAIGenerationModal] = useState(false);
  const [showAIGenerationModalMCQ, setShowAIGenerationModalMCQ] = useState(false);
  
  // AI Generator State (for subjective)
  const [numQuestions, setNumQuestions] = useState(5);
  const [selectedBloomLevel, setSelectedBloomLevel] = useState('');
  const [selectedModule2, setSelectedModule2] = useState('');
  const [selectedCourseOutcome, setSelectedCourseOutcome] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Editing state
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  const [editPoints, setEditPoints] = useState(10);
  const [editBloomLevel, setEditBloomLevel] = useState('');
  const [editCourseOutcome, setEditCourseOutcome] = useState('');

  // Tab state for Questions step
  const [questionsTab, setQuestionsTab] = useState('create'); // 'create' or 'attachments'
  
  // Tooltip states
  const [showFormatTooltip, setShowFormatTooltip] = useState(false);
  const [showCreateTooltip, setShowCreateTooltip] = useState(false);
  const [showAttachmentTooltip, setShowAttachmentTooltip] = useState(false);
  const [showAddQuestionTooltip, setShowAddQuestionTooltip] = useState(false);
  const [showAIGenerateTooltip, setShowAIGenerateTooltip] = useState(false);
  const [showUploadTooltip, setShowUploadTooltip] = useState(false);
  const [showMCQGeneratorTooltip, setShowMCQGeneratorTooltip] = useState(false);
  const [showAIGeneratorTooltip, setShowAIGeneratorTooltip] = useState(false);

  const bloomLevels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

  // Helper function to extract course outcomes from courseData
  // Expected format: courseData.courseOutcomes = [{ code: 'CO1', description: 'Description' }, ...]
  // Or courseData.courseOutcomes = ['CO1 (Description)', 'CO2 (Description)', ...]
  const getCourseOutcomes = () => {
    if (!courseData) {
      console.log('No courseData available');
      return [];
    }
    
    // Check if courseOutcomes exists as an array
    if (courseData.courseOutcomes && Array.isArray(courseData.courseOutcomes) && courseData.courseOutcomes.length > 0) {
      console.log('Found courseOutcomes:', courseData.courseOutcomes);
      return courseData.courseOutcomes;
    }
    
    // Check alternative field names
    if (courseData.course_outcomes && Array.isArray(courseData.course_outcomes) && courseData.course_outcomes.length > 0) {
      console.log('Found course_outcomes:', courseData.course_outcomes);
      return courseData.course_outcomes;
    }
    
    // Check if learningOutcomes exist and can be converted
    if (courseData.learningOutcomes && Array.isArray(courseData.learningOutcomes) && courseData.learningOutcomes.length > 0) {
      console.log('Found learningOutcomes, converting to course outcomes format:', courseData.learningOutcomes);
      // Try to extract CO codes from learning outcomes
      // Format might be "LO1: Description" or "CO1: Description"
      return courseData.learningOutcomes.map((outcome, index) => {
        const outcomeStr = String(outcome);
        // Try to extract CO code
        const coMatch = outcomeStr.match(/^(CO\d+)/i);
        const loMatch = outcomeStr.match(/^(LO\d+)/i);
        
        if (coMatch) {
          // Already has CO format
          const code = coMatch[1];
          const description = outcomeStr.replace(/^CO\d+[:\s]*/i, '').trim();
          return { code, description: description || outcomeStr };
        } else if (loMatch) {
          // Convert LO to CO
          const loCode = loMatch[1];
          const code = loCode.replace(/^LO/i, 'CO');
          const description = outcomeStr.replace(/^LO\d+[:\s]*/i, '').trim();
          return { code, description: description || outcomeStr };
        } else {
          // Default: create CO code from index
          return { code: `CO${index + 1}`, description: outcomeStr };
        }
      });
    }
    
    console.log('No course outcomes found in courseData. Available fields:', Object.keys(courseData));
    // If not found, return empty array (can be populated from API)
    return [];
  };

  // Helper function to extract CO code from outcome string
  // Handles formats like: "CO1 (Description)" or "CO1" or { code: 'CO1', description: 'Description' }
  const extractOutcomeCode = (outcome) => {
    if (!outcome) return '';
    
    // If it's an object with code property
    if (typeof outcome === 'object' && outcome.code) {
      return outcome.code;
    }
    
    // If it's a string, extract CO1, CO2, etc.
    if (typeof outcome === 'string') {
      const match = outcome.match(/^(CO\d+)/i);
      return match ? match[1] : outcome;
    }
    
    return outcome;
  };

  // Helper function to format outcome for display
  const formatOutcomeForDisplay = (outcome) => {
    if (!outcome) return '';
    
    // If it's an object with code and description
    if (typeof outcome === 'object' && outcome.code) {
      return outcome.description 
        ? `${outcome.code} (${outcome.description})`
        : outcome.code;
    }
    
    // If it's already a string with format "CO1 (Description)" or just "CO1"
    if (typeof outcome === 'string') {
      return outcome;
    }
    
    return String(outcome);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    try {
      const parsedQuestions = await parseFile(file);
      // If assignmentType is restricted, only add questions of that type
      const validQuestions = assignmentType 
        ? parsedQuestions.filter(q => q.type === assignmentType)
        : parsedQuestions;
      
      if (assignmentType && validQuestions.length < parsedQuestions.length) {
        alert(`Only ${assignmentType} questions are allowed. Some questions were filtered out.`);
      }
      
      // Only validate if assignment is not ungraded
      if (!isUngraded && totalPoints > 0) {
        const currentTotal = calculateTotalQuestionPoints();
        const newQuestionsTotal = validQuestions.reduce((sum, q) => sum + (q.points || 0), 0);
        const newTotal = currentTotal + newQuestionsTotal;
        
        if (newTotal > totalPoints) {
          const remaining = totalPoints - currentTotal;
          if (remaining <= 0) {
            alert(`Cannot add questions from file. Total points already reached (${currentTotal}/${totalPoints}). Please adjust question points or total assignment points.`);
            return;
          }
          const confirm = window.confirm(
            `Warning: Adding questions from file will exceed the total points (${newTotal} > ${totalPoints}).\n\n` +
            `Current total: ${currentTotal} points\n` +
            `File questions total: ${newQuestionsTotal} points\n` +
            `Remaining points available: ${remaining} points\n\n` +
            `Would you like to proceed anyway?`
          );
          if (!confirm) {
            return;
          }
        }
      }
      
      setQuestions(prev => [...prev, ...validQuestions]);
    } catch (error) {
      alert(`Error parsing file: ${error.message}`);
    }
  };

  const generateAISubjectiveQuestions = async (params) => {
    const { numQuestions: num, selectedCourseOutcome: co, selectedBloomLevel: bloom, additionalContext: context } = params;
    
    setGenerating(true);
    setAiError(null);
    setShowAIGenerationModal(false);

    const apiEndpoint = "https://qgen.bluehill-eb07d9c6.centralindia.azurecontainerapps.io/api/generate-questions";

    try {
      // Extract modules, topics, and units from courseData
      const modules = [];
      const topics = [];
      const units = [];

      if (courseData?.syllabus?.modules && Array.isArray(courseData.syllabus.modules)) {
        courseData.syllabus.modules.forEach((module, moduleIndex) => {
          // Add module identifier (e.g., "M1", "M2")
          modules.push(`M${module.moduleNumber || moduleIndex + 1}`);
          
          // Add topics for this module
          if (module.topics && Array.isArray(module.topics)) {
            module.topics.forEach((topic, topicIndex) => {
              topics.push(`M${module.moduleNumber || moduleIndex + 1}T${topicIndex + 1}`);
            });
          }
        });
      }

      // Get course code and remove spaces
      const courseCode = (courseData?.courseCode || courseData?.course_code || "").replace(/\s+/g, "");

      // Generate questions - API expects JSON format
      const requestBody = {
        course_code: courseCode,
        selected_cos: [co],
        selected_bloom: bloom.toLowerCase(),
        selected_type: "subjective", // Subjective/Long answer questions
        num_questions: num,
        extra_prompt: context || "",
        modules: modules,
        topics: topics,
        units: units
      };

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        const generatedQuestions = data.questions.map((q_item, index) => {
          // The actual question text is in the 'output' property
          const questionText = q_item.output || q_item.question || '';
          return {
            id: `ai_${Date.now()}_${index}`,
            question: questionText,
            type: 'subjective',
            bloomLevel: q_item.bloom_level || bloom.toLowerCase(),
            courseOutcome: extractOutcomeCode(q_item.co || co),
            options: null,
            correctAnswer: null,
            points: 20, // Default points, can be edited later
            score: 20, // Add score field for per-question scoring
            source: 'ai',
            status: 'pending'
          };
        });

        setPendingAIQuestions(generatedQuestions);
        setShowAIApproval(true);
      } else {
        throw new Error("No questions were generated in the expected format.");
      }
    } catch (err) {
      console.error("Error generating questions:", err);
      setAiError(err.message || "Failed to generate questions. Please try again.");
      setShowAIGenerationModal(true); // Reopen modal to show error
    } finally {
      setGenerating(false);
    }
  };

  const generateAIMCQQuestions = async (params) => {
    const { numQuestions: num, selectedCourseOutcome: co, selectedBloomLevel: bloom, additionalContext: context } = params;
    
    setGenerating(true);
    setAiError(null);
    setShowAIGenerationModalMCQ(false);

    const apiEndpoint = "https://qgen.bluehill-eb07d9c6.centralindia.azurecontainerapps.io/api/generate-questions";

    try {
      // Extract modules, topics, and units from courseData
      const modules = [];
      const topics = [];
      const units = [];

      if (courseData?.syllabus?.modules && Array.isArray(courseData.syllabus.modules)) {
        courseData.syllabus.modules.forEach((module, moduleIndex) => {
          // Add module identifier (e.g., "M1", "M2")
          modules.push(`M${module.moduleNumber || moduleIndex + 1}`);
          
          // Add topics for this module
          if (module.topics && Array.isArray(module.topics)) {
            module.topics.forEach((topic, topicIndex) => {
              topics.push(`M${module.moduleNumber || moduleIndex + 1}T${topicIndex + 1}`);
            });
          }
        });
      }

      // Get course code and remove spaces
      const courseCode = (courseData?.courseCode || courseData?.course_code || "").replace(/\s+/g, "");

      // Generate questions - API expects JSON format
      const requestBody = {
        course_code: courseCode,
        selected_cos: [co],
        selected_bloom: bloom.toLowerCase(),
        selected_type: "objective", // MCQ questions
        num_questions: num,
        extra_prompt: context || "",
        modules: modules,
        topics: topics,
        units: units
      };

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        const generatedQuestions = data.questions.map((q_item, index) => {
          // For MCQ, we need to handle options and correctAnswer
          const questionText = q_item.question || '';
          const options = q_item.options || [];
          const correctAnswer = q_item.correct_answer || q_item.correctAnswer || '';
          
          return {
            id: `ai_mcq_${Date.now()}_${index}`,
            question: questionText,
            type: 'objective',
            bloomLevel: q_item.bloom_level || bloom.toLowerCase(),
            courseOutcome: extractOutcomeCode(q_item.co || co),
            options: options.length >= 2 ? options : ['', '', '', ''],
            correctAnswer: correctAnswer,
            points: q_item.estimated_points || 5, // Default points for MCQ
            score: q_item.estimated_points || 5, // Add score field for per-question scoring
            source: 'ai',
            status: 'pending'
          };
        });

        setPendingAIQuestions(generatedQuestions);
        setShowAIApproval(true);
      } else {
        throw new Error("No questions were generated in the expected format.");
      }
    } catch (err) {
      console.error("Error generating MCQ questions:", err);
      setAiError(err.message || "Failed to generate questions. Please try again.");
      setShowAIGenerationModalMCQ(true); // Reopen modal to show error
    } finally {
      setGenerating(false);
    }
  };

  const handleApproveAIQuestions = (approvedQuestions) => {
    const approved = approvedQuestions.map(q => ({
      ...q,
      status: 'approved'
    }));
    
    // If assignmentType is restricted, only add questions of that type
    const validQuestions = assignmentType 
      ? approved.filter(q => q.type === assignmentType)
      : approved;
    
    if (assignmentType && validQuestions.length < approved.length) {
      alert(`Only ${assignmentType} questions are allowed. Some questions were filtered out.`);
    }
    
    // Only validate if assignment is not ungraded
    if (!isUngraded && totalPoints > 0) {
      const currentTotal = calculateTotalQuestionPoints();
      const newQuestionsTotal = validQuestions.reduce((sum, q) => sum + (q.points || 0), 0);
      const newTotal = currentTotal + newQuestionsTotal;
      
      if (newTotal > totalPoints) {
        const remaining = totalPoints - currentTotal;
        if (remaining <= 0) {
          alert(`Cannot add questions. Total points already reached (${currentTotal}/${totalPoints}). Please adjust question points or total assignment points.`);
          return;
        }
        const confirm = window.confirm(
          `Warning: Adding these questions will exceed the total points (${newTotal} > ${totalPoints}).\n\n` +
          `Current total: ${currentTotal} points\n` +
          `New questions total: ${newQuestionsTotal} points\n` +
          `Remaining points available: ${remaining} points\n\n` +
          `Would you like to proceed anyway?`
        );
        if (!confirm) {
          return;
        }
      }
    }
    
    setQuestions(prev => [...prev, ...validQuestions]);
    setPendingAIQuestions([]);
  };

  const handleRejectAIQuestions = (rejectedQuestions) => {
    setPendingAIQuestions([]);
  };

  const removeQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };


  // Calculate total points from all questions (use score if available, fallback to points)
  const calculateTotalQuestionPoints = () => {
    return questions.reduce((sum, q) => sum + (q.score || q.points || 0), 0);
  };

  const handleAddManualQuestion = (newQuestion) => {
    // Only validate if assignment is not ungraded
    if (!isUngraded && totalPoints > 0) {
      const currentTotal = calculateTotalQuestionPoints();
      const newTotal = currentTotal + (newQuestion.points || 0);
      
      if (newTotal > totalPoints) {
        const remaining = totalPoints - currentTotal;
        if (remaining <= 0) {
          alert(`Cannot add question. Total points already reached (${currentTotal}/${totalPoints}). Please adjust question points or total assignment points.`);
          return;
        }
        const confirm = window.confirm(
          `Warning: Adding this question will exceed the total points (${newTotal} > ${totalPoints}).\n\n` +
          `Current total: ${currentTotal} points\n` +
          `This question: ${newQuestion.points} points\n` +
          `Remaining points available: ${remaining} points\n\n` +
          `Would you like to proceed anyway?`
        );
        if (!confirm) {
          return;
        }
      } else if (newTotal < totalPoints) {
        const remaining = totalPoints - newTotal;
        // Just show a warning, but allow it
        console.log(`Points total: ${newTotal}/${totalPoints}. Remaining: ${remaining} points.`);
      }
    }
    
    setQuestions(prev => [...prev, newQuestion]);
  };

  const handleStartEdit = (question) => {
    setEditingQuestionId(question.id);
    setEditQuestionText(question.question);
    // For ungraded assignments, always set points to 0
    setEditPoints(isUngraded ? 0 : (question.score || question.points || 10)); // Use score if available, fallback to points
    setEditBloomLevel(question.bloomLevel || '');
    setEditCourseOutcome(question.courseOutcome || '');
  };

  const handleSaveEdit = () => {
    if (!editQuestionText.trim()) {
      alert('Please enter a question');
      return;
    }

    // Only validate if assignment is not ungraded
    if (!isUngraded && totalPoints > 0) {
      const currentQuestion = questions.find(q => q.id === editingQuestionId);
      const currentTotal = calculateTotalQuestionPoints();
      const oldPoints = currentQuestion?.points || 0;
      const newPoints = editPoints || 10;
      const newTotal = currentTotal - oldPoints + newPoints;
      
      if (newTotal > totalPoints) {
        const remaining = totalPoints - (currentTotal - oldPoints);
        if (remaining <= 0) {
          alert(`Cannot update question. Total points would exceed the limit (${newTotal} > ${totalPoints}). Please adjust the points.`);
          return;
        }
        const confirm = window.confirm(
          `Warning: Updating this question will exceed the total points (${newTotal} > ${totalPoints}).\n\n` +
          `Current total: ${currentTotal} points\n` +
          `Old question points: ${oldPoints} points\n` +
          `New question points: ${newPoints} points\n` +
          `Remaining points available: ${remaining} points\n\n` +
          `Would you like to proceed anyway?`
        );
        if (!confirm) {
          return;
        }
      }
    }

    // For ungraded assignments, always use 0 points
    const finalPoints = isUngraded ? 0 : (editPoints || 10);
    
    setQuestions(prev => prev.map(q => 
      q.id === editingQuestionId 
        ? { 
            ...q, 
            question: editQuestionText.trim(),
            points: finalPoints,
            score: finalPoints, // Update score field as well
            bloomLevel: editBloomLevel || undefined,
            courseOutcome: extractOutcomeCode(editCourseOutcome) || undefined
          }
        : q
    ));
    
    setEditingQuestionId(null);
    setEditQuestionText('');
    setEditPoints(isUngraded ? 0 : 10);
    setEditBloomLevel('');
    setEditCourseOutcome('');
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setEditQuestionText('');
    setEditPoints(isUngraded ? 0 : 10);
    setEditBloomLevel('');
    setEditCourseOutcome('');
  };

  // Assignment-level attachment handlers with validation
  const handleAttachmentUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Validate file types according to backend guide
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'application/json'
      ];
      
      const validFiles = newFiles.filter(file => {
        const isValid = allowedTypes.includes(file.type);
        if (!isValid) {
          console.warn(`File "${file.name}" has invalid type: ${file.type}`);
        }
        return isValid;
      });
      
      if (validFiles.length !== newFiles.length) {
        alert('Some files have invalid types and were removed. Allowed types: PDF, JPEG, PNG, DOC, DOCX, XLS, XLSX, CSV, JSON');
      }
      
      // Validate file size (20MB limit - adjust if backend has different limit)
      const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
      const sizeValidFiles = validFiles.filter(file => {
        if (file.size > MAX_FILE_SIZE) {
          alert(`File "${file.name}" is too large. Maximum size: 20MB`);
          return false;
        }
        return true;
      });
      
      setAttachments((prev) => [...prev, ...sizeValidFiles]);
    }
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const subjectiveQuestions = questions.filter(q => q.type === 'subjective');
  const objectiveQuestions = questions.filter(q => q.type === 'objective');
  
  // Auto-create subjective question when attachments are added
  useEffect(() => {
    // Only for subjective assignments
    if (assignmentType !== 'subjective' && activeTab !== 'subjective') {
      return;
    }

    setQuestions(prev => {
      // Check if there's already an auto-generated question from attachments
      const hasAutoAttachmentQuestion = prev.some(
        q => q.type === 'subjective' && q.source === 'attachment-auto'
      );

      if (attachments.length > 0 && !hasAutoAttachmentQuestion) {
        // Create auto-question for attachments
        const autoQuestion = {
          id: `attachment_auto_${Date.now()}`,
          question: 'Solve the given assignment questions in the attached sheet(s).',
          type: 'subjective',
          points: isUngraded ? 0 : totalPoints,
          score: isUngraded ? 0 : totalPoints, // Add score field for per-question scoring
          source: 'attachment-auto',
          status: 'approved'
        };
        
        return [...prev, autoQuestion];
      } else if (attachments.length === 0 && hasAutoAttachmentQuestion) {
        // Remove auto-question when all attachments are removed
        return prev.filter(q => !(q.type === 'subjective' && q.source === 'attachment-auto'));
      } else if (attachments.length > 0 && hasAutoAttachmentQuestion) {
        // Update points and score of auto-question when totalPoints changes
        return prev.map(q => 
          q.source === 'attachment-auto' && q.type === 'subjective'
            ? { ...q, points: isUngraded ? 0 : totalPoints, score: isUngraded ? 0 : totalPoints }
            : q
        );
      }
      
      return prev;
    });
  }, [attachments.length, assignmentType, activeTab, isUngraded, totalPoints, setQuestions]);
  
  // If assignmentType is restricted, ensure activeTab matches and filter questions
  useEffect(() => {
    if (assignmentType) {
      setActiveTab(assignmentType);
      // Filter out questions that don't match the assignment type
      setQuestions(prev => {
        const validQuestions = prev.filter(q => q.type === assignmentType);
        // Only update if there are invalid questions
        if (validQuestions.length !== prev.length) {
          return validQuestions;
        }
        return prev;
      });
    }
  }, [assignmentType, setActiveTab, setQuestions]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary" size={24} />
          <div>
            <h2 className="text-2xl font-bold">Questions</h2>
            <p className="text-gray-600">
              {assignmentType === 'subjective' 
                ? 'Add subjective questions' 
                : assignmentType === 'objective'
                ? 'Add objective (MCQ) questions'
                : 'Add subjective and objective questions'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {questions.length} questions 
            {!assignmentType && (
              <> ({subjectiveQuestions.length} subjective, {objectiveQuestions.length} objective)</>
            )}
            {assignmentType === 'subjective' && (
              <> ({subjectiveQuestions.length} subjective)</>
            )}
            {assignmentType === 'objective' && (
              <> ({objectiveQuestions.length} objective)</>
            )}
          </span>
        </div>
      </div>

      {/* Tab Navigation - Only show if assignmentType is not restricted */}
      {!assignmentType && (
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
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      )}
      
      {/* Show type indicator if assignmentType is restricted */}
     

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {/* If assignmentType is set, only show that type's content */}
        {(activeTab === 'subjective' || assignmentType === 'subjective') && assignmentType !== 'objective' && (
          <div className="space-y-6">
            {/* Tabs for Create Questions and Add Attachments */}
            <div className="bg-white rounded-lg shadow-sm border p-1 relative">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <button
                    onClick={() => setQuestionsTab('create')}
                    onMouseEnter={() => setShowCreateTooltip(true)}
                    onMouseLeave={() => setShowCreateTooltip(false)}
                    className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      questionsTab === 'create'
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Create Your Own Assignment
                  </button>
                  {/* Tooltip for Create Your Own Assignment */}
                  {showCreateTooltip && (
                    <div 
                      className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg"
                      onMouseEnter={() => setShowCreateTooltip(true)}
                      onMouseLeave={() => setShowCreateTooltip(false)}
                    >
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                      </div>
                      Manually create and add questions one by one. You can set points, Bloom's level, and course outcomes for each question.
                    </div>
                  )}
                </div>
                <div className="flex-1 relative">
                  <button
                    onClick={() => setQuestionsTab('attachments')}
                    onMouseEnter={() => setShowAttachmentTooltip(true)}
                    onMouseLeave={() => setShowAttachmentTooltip(false)}
                    className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      questionsTab === 'attachments'
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Add Attachments
                  </button>
                  {/* Tooltip for Add Attachments */}
                  {showAttachmentTooltip && (
                    <div 
                      className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg"
                      onMouseEnter={() => setShowAttachmentTooltip(true)}
                      onMouseLeave={() => setShowAttachmentTooltip(false)}
                    >
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                      </div>
                      Upload files (PDF, DOC, images, etc.) that students can download along with the assignment.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            {questionsTab === 'create' && (
              <React.Fragment>
                {/* Action Buttons */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <button
                        onClick={() => setShowAddQuestionModal(true)}
                        onMouseEnter={() => setShowAddQuestionTooltip(true)}
                        onMouseLeave={() => setShowAddQuestionTooltip(false)}
                        className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2 font-medium"
                      >
                        <Plus size={20} />
                        Add Question
                      </button>
                      {/* Tooltip for Add Question */}
                      {showAddQuestionTooltip && (
                        <div 
                          className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg"
                          onMouseEnter={() => setShowAddQuestionTooltip(true)}
                          onMouseLeave={() => setShowAddQuestionTooltip(false)}
                        >
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="border-4 border-transparent border-t-gray-900"></div>
                          </div>
                          Manually add a new question. You can specify the question text, points, Bloom's taxonomy level, and course outcome.
                        </div>
                      )}
                    </div>
                    <div className="flex-1 relative">
                      <button
                        onClick={() => setShowAIGenerationModal(true)}
                        onMouseEnter={() => setShowAIGenerateTooltip(true)}
                        onMouseLeave={() => setShowAIGenerateTooltip(false)}
                        className="w-full px-6 py-3 bg-accent1 text-white rounded-lg hover:bg-accent1/90 flex items-center justify-center gap-2 font-medium"
                      >
                        <Sparkles size={20} />
                        Generate with AI
                      </button>
                      {/* Tooltip for Generate with AI */}
                      {showAIGenerateTooltip && (
                        <div 
                          className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg"
                          onMouseEnter={() => setShowAIGenerateTooltip(true)}
                          onMouseLeave={() => setShowAIGenerateTooltip(false)}
                        >
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="border-4 border-transparent border-t-gray-900"></div>
                          </div>
                          Use AI to automatically generate subjective questions based on course content, Bloom's taxonomy level, and course outcomes.
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Points Summary - Only show if not ungraded */}
                  {!isUngraded && totalPoints > 0 && (
                    <div className={`mt-4 p-3 rounded-lg border ${
                      calculateTotalQuestionPoints() === totalPoints
                        ? 'bg-accent2 border-primary'
                        : calculateTotalQuestionPoints() > totalPoints
                        ? 'bg-red-50 border-red-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Points Summary:
                        </span>
                        <span className={`text-sm font-bold ${
                          calculateTotalQuestionPoints() === totalPoints
                        ? 'text-primary'
                        : calculateTotalQuestionPoints() > totalPoints
                        ? 'text-red-700'
                        : 'text-yellow-700'
                        }`}>
                          {calculateTotalQuestionPoints()} / {totalPoints} points
                        </span>
                      </div>
                      {calculateTotalQuestionPoints() !== totalPoints && (
                        <p className="text-xs mt-1">
                          {calculateTotalQuestionPoints() > totalPoints
                            ? `⚠️ Exceeds total by ${calculateTotalQuestionPoints() - totalPoints} points`
                            : `ℹ️ ${totalPoints - calculateTotalQuestionPoints()} points remaining`
                          }
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Question List */}
                <div className="bg-white rounded-lg shadow-sm border">
              {subjectiveQuestions.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Subjective Questions</h3>
                  <p className="text-gray-600">Click "Add Question" or "Generate with AI" to get started.</p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {subjectiveQuestions.map((q, index) => (
                    <div key={q.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      {editingQuestionId === q.id ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Question Text <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={editQuestionText}
                              onChange={(e) => setEditQuestionText(e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              rows="4"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className={`block text-sm font-medium mb-2 ${isUngraded ? 'text-gray-400' : 'text-gray-700'}`}>
                                Points
                                {isUngraded && (
                                  <span className="text-xs text-gray-400 ml-2">
                                    (Ungraded - disabled)
                                  </span>
                                )}
                                {!isUngraded && totalPoints > 0 && (
                                  <span className="text-xs text-gray-500 ml-2">
                                    (Remaining: {totalPoints - (calculateTotalQuestionPoints() - (questions.find(q => q.id === editingQuestionId)?.points || 0))} pts)
                                  </span>
                                )}
                              </label>
                              <input
                                type="number"
                                value={editPoints}
                                onChange={(e) => {
                                  if (!isUngraded) {
                                    setEditPoints(Number(e.target.value));
                                  }
                                }}
                                min="0"
                                max={!isUngraded && totalPoints > 0 
                                  ? totalPoints - (calculateTotalQuestionPoints() - (questions.find(q => q.id === editingQuestionId)?.points || 0))
                                  : undefined}
                                disabled={isUngraded}
                                className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                  isUngraded 
                                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'border-gray-300'
                                }`}
                              />
                              {isUngraded ? (
                                <p className="text-xs text-gray-400 mt-1 italic">
                                  This assignment is ungraded - points are set to 0
                                </p>
                              ) : totalPoints > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Total: {calculateTotalQuestionPoints() - (questions.find(q => q.id === editingQuestionId)?.points || 0)} / {totalPoints} points (without this question)
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Bloom Level</label>
                              <select
                                value={editBloomLevel}
                                onChange={(e) => setEditBloomLevel(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Select level</option>
                                {bloomLevels.map(level => (
                                  <option key={level} value={level.toLowerCase()}>{level}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Course Outcome</label>
                              <select
                                value={editCourseOutcome}
                                onChange={(e) => setEditCourseOutcome(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Select course outcome</option>
                                {getCourseOutcomes().map((outcome, idx) => {
                                  const displayText = formatOutcomeForDisplay(outcome);
                                  const code = extractOutcomeCode(outcome);
                                  return (
                                    <option key={idx} value={code}>
                                      {displayText}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={handleCancelEdit}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
                            >
                              <Save size={16} />
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <span className="bg-accent2 text-primary text-xs px-2 py-1 rounded font-medium">
                                Q{index + 1}
                              </span>
                              <span className="bg-accent2 text-primary text-xs px-2 py-1 rounded">
                                Subjective
                              </span>
                              {q.source === 'ai' && (
                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                                  <Sparkles size={10} />
                                  AI Generated
                                </span>
                              )}
                              {q.source === 'attachment-auto' && (
                                <span className="bg-accent2 text-primary text-xs px-2 py-1 rounded flex items-center gap-1">
                                  <Paperclip size={10} />
                                  Auto from Attachments
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
                                onClick={() => handleStartEdit(q)}
                                className="p-1 text-gray-400 hover:text-primary"
                                title="Edit question"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => removeQuestion(q.id)}
                                className="p-1 text-gray-400 hover:text-red-600"
                                title="Delete question"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-900 mb-2 whitespace-pre-wrap">{q.question}</p>
                          
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
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
                </div>
              </React.Fragment>
            )}

            {/* Attachments Tab Content */}
            {questionsTab === 'attachments' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Paperclip className="text-primary" size={20} />
                  <h3 className="text-lg font-semibold">Assignment Attachments</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Files
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        onChange={handleAttachmentUpload}
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.json,image/jpeg,image/png"
                        className="hidden"
                        id="assignment-attachment-upload"
                      />
                      <label
                        htmlFor="assignment-attachment-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Upload className="text-gray-400" size={32} />
                        <span className="text-sm font-medium text-gray-700">Click to upload files</span>
                        <span className="text-xs text-gray-500">PDF, DOC, DOCX, Images, etc.</span>
                      </label>
                    </div>
                  </div>

                  {attachments.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Attached Files ({attachments.length})
                      </label>
                      <div className="space-y-2">
                        {attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <Paperclip className="text-gray-500" size={16} />
                              <span className="text-sm text-gray-700">{file.name}</span>
                              <span className="text-xs text-gray-500">
                                ({(file.size / 1024).toFixed(2)} KB)
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemoveAttachment(index)}
                              className="text-red-600 hover:text-red-800"
                              title="Remove attachment"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {attachments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Paperclip className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm">No attachments added yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* If assignmentType is set, only show that type's content */}
        {(activeTab === 'objective' || assignmentType === 'objective') && assignmentType !== 'subjective' && (
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.csv,.json';
                      input.onchange = handleFileUpload;
                      input.click();
                    }}
                    onMouseEnter={() => setShowUploadTooltip(true)}
                    onMouseLeave={() => setShowUploadTooltip(false)}
                    className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2 font-medium"
                  >
                    <Upload size={20} />
                    Upload CSV/JSON
                  </button>
                  {/* Tooltip for Upload CSV/JSON */}
                  {showUploadTooltip && (
                    <div 
                      className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg"
                      onMouseEnter={() => setShowUploadTooltip(true)}
                      onMouseLeave={() => setShowUploadTooltip(false)}
                    >
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                      </div>
                      Upload a CSV or JSON file containing multiple objective questions. Click the help icon for format details.
                    </div>
                  )}
                  <button
                    type="button"
                    onMouseEnter={() => setShowFormatTooltip(true)}
                    onMouseLeave={() => setShowFormatTooltip(false)}
                    onClick={() => setShowFormatTooltip(!showFormatTooltip)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-primary/70 hover:text-white transition-colors"
                    title="View file format help"
                  >
                    <HelpCircle size={18} />
                  </button>
                  
                  {/* Format Tooltip */}
                  {showFormatTooltip && (
                    <div 
                      className="absolute z-50 top-full left-0 mt-2 w-[90vw] max-w-[600px] bg-white border-2 border-primary/30 rounded-lg shadow-xl p-4"
                      onMouseEnter={() => setShowFormatTooltip(true)}
                      onMouseLeave={() => setShowFormatTooltip(false)}
                    >
                      {/* Arrow pointing up */}
                      <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-l-2 border-t-2 border-primary/30 transform rotate-45"></div>
                      
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <HelpCircle size={18} className="text-primary" />
                          File Format Guide
                        </h4>
                        <button
                          onClick={() => setShowFormatTooltip(false)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Close"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      {/* CSV Format */}
                      <div className="mb-4">
                        <h5 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
                          <FileText size={14} />
                          CSV Format
                        </h5>
                        <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs font-mono overflow-x-auto">
                          <div className="text-gray-600 mb-1 font-semibold">Header row (required):</div>
                          <div className="text-gray-800 whitespace-pre-wrap break-all">
                            question,type,option_a,option_b,option_c,option_d,correct_answer,points,bloom_level,course_outcome
                          </div>
                          <div className="text-gray-600 mt-3 mb-1 font-semibold">Example rows:</div>
                          <div className="text-gray-800 whitespace-pre-wrap">
                            What is statistics?,subjective,,,,,20,understand,CO1{'\n'}
                            Which is a measure of central tendency?,objective,Mean,Range,Variance,Mode,Mean,10,remember,CO1
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-600 space-y-1">
                          <p><strong>Note:</strong> For subjective questions, leave option columns empty. For objective questions, provide all 4 options.</p>
                          <p><strong>Required fields:</strong> question, type</p>
                          <p><strong>Optional fields:</strong> points (default: 10), bloom_level, course_outcome</p>
                        </div>
                      </div>
                      
                      {/* JSON Format */}
                      <div>
                        <h5 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
                          <FileText size={14} />
                          JSON Format
                        </h5>
                        <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs font-mono overflow-x-auto max-h-48 overflow-y-auto">
                          <pre className="text-gray-800 whitespace-pre-wrap">
{JSON.stringify([
  {
    "question": "What is statistics?",
    "type": "subjective",
    "points": 20,
    "bloomLevel": "understand",
    "courseOutcome": "CO1"
  },
  {
    "question": "Which is a measure of central tendency?",
    "type": "objective",
    "points": 10,
    "options": ["Mean", "Range", "Variance", "Mode"],
    "correctAnswer": "Mean",
    "bloomLevel": "remember",
    "courseOutcome": "CO1"
  }
], null, 2)}
                          </pre>
                        </div>
                        <div className="mt-2 text-xs text-gray-600 space-y-1">
                          <p><strong>Required fields:</strong> question, type</p>
                          <p><strong>Optional fields:</strong> points (default: 10), bloomLevel, courseOutcome</p>
                          <p><strong>For objective questions:</strong> options (array), correctAnswer</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 relative">
                  <button
                    onClick={() => setShowMCQGenerator(true)}
                    onMouseEnter={() => setShowMCQGeneratorTooltip(true)}
                    onMouseLeave={() => setShowMCQGeneratorTooltip(false)}
                    className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2 font-medium"
                  >
                    <Sparkles size={20} />
                    MCQ Generator
                  </button>
                  {/* Tooltip for MCQ Generator */}
                  {showMCQGeneratorTooltip && (
                    <div 
                      className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg"
                      onMouseEnter={() => setShowMCQGeneratorTooltip(true)}
                      onMouseLeave={() => setShowMCQGeneratorTooltip(false)}
                    >
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                      </div>
                      Generate multiple choice questions interactively. Create questions with options and set the correct answer.
                    </div>
                  )}
                </div>
                <div className="flex-1 relative">
                  <button
                    onClick={() => setShowAIGenerationModalMCQ(true)}
                    onMouseEnter={() => setShowAIGeneratorTooltip(true)}
                    onMouseLeave={() => setShowAIGeneratorTooltip(false)}
                    className="w-full px-6 py-3 bg-accent1 text-white rounded-lg hover:bg-accent1/90 flex items-center justify-center gap-2 font-medium"
                  >
                    <Sparkles size={20} />
                    AI Generator
                  </button>
                  {/* Tooltip for AI Generator */}
                  {showAIGeneratorTooltip && (
                    <div 
                      className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg"
                      onMouseEnter={() => setShowAIGeneratorTooltip(true)}
                      onMouseLeave={() => setShowAIGeneratorTooltip(false)}
                    >
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                      </div>
                      Use AI to automatically generate objective (MCQ) questions based on course content, Bloom's taxonomy level, and course outcomes.
                    </div>
                  )}
                </div>
              </div>
              
              {/* Points Summary - Only show if not ungraded */}
              {!isUngraded && totalPoints > 0 && (
                <div className={`mt-4 p-3 rounded-lg border ${
                  calculateTotalQuestionPoints() === totalPoints
                    ? 'bg-accent2 border-primary'
                    : calculateTotalQuestionPoints() > totalPoints
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Points Summary:
                    </span>
                    <span className={`text-sm font-bold ${
                      calculateTotalQuestionPoints() === totalPoints
                        ? 'text-primary'
                        : calculateTotalQuestionPoints() > totalPoints
                        ? 'text-red-700'
                        : 'text-yellow-700'
                    }`}>
                      {calculateTotalQuestionPoints()} / {totalPoints} points
                    </span>
                  </div>
                  {calculateTotalQuestionPoints() !== totalPoints && (
                    <p className="text-xs mt-1">
                      {calculateTotalQuestionPoints() > totalPoints
                        ? `⚠️ Exceeds total by ${calculateTotalQuestionPoints() - totalPoints} points`
                        : `ℹ️ ${totalPoints - calculateTotalQuestionPoints()} points remaining`
                      }
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Question List */}
            <div className="bg-white rounded-lg shadow-sm border">
              {objectiveQuestions.length === 0 ? (
                <div className="p-12 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Objective Questions</h3>
                  <p className="text-gray-600">Upload a CSV file, use the MCQ generator, or generate with AI to add questions.</p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {objectiveQuestions.map((q, index) => (
                    <div key={q.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-accent2 text-primary text-xs px-2 py-1 rounded">
                            Q{index + 1}
                          </span>
                          <span className="bg-accent2 text-primary text-xs px-2 py-1 rounded">
                            MCQ
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
                            onClick={() => handleStartEdit(q)}
                            className="p-1 text-gray-400 hover:text-primary"
                            title="Edit question"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => removeQuestion(q.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Delete question"
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
                                  ? 'bg-accent2 border-primary text-primary'
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
                // If assignmentType is restricted, only add questions of that type
                const validQuestions = assignmentType 
                  ? generatedQuestions.filter(q => q.type === assignmentType)
                  : generatedQuestions;
                
                if (assignmentType && validQuestions.length < generatedQuestions.length) {
                  alert(`Only ${assignmentType} questions are allowed. Some questions were filtered out.`);
                }
                
                // Only validate if assignment is not ungraded
                if (!isUngraded && totalPoints > 0) {
                  const currentTotal = calculateTotalQuestionPoints();
                  const newQuestionsTotal = validQuestions.reduce((sum, q) => sum + (q.points || 0), 0);
                  const newTotal = currentTotal + newQuestionsTotal;
                  
                  if (newTotal > totalPoints) {
                    const remaining = totalPoints - currentTotal;
                    if (remaining <= 0) {
                      alert(`Cannot add questions. Total points already reached (${currentTotal}/${totalPoints}). Please adjust question points or total assignment points.`);
                      return;
                    }
                    const confirm = window.confirm(
                      `Warning: Adding these questions will exceed the total points (${newTotal} > ${totalPoints}).\n\n` +
                      `Current total: ${currentTotal} points\n` +
                      `New questions total: ${newQuestionsTotal} points\n` +
                      `Remaining points available: ${remaining} points\n\n` +
                      `Would you like to proceed anyway?`
                    );
                    if (!confirm) {
                      return;
                    }
                  }
                }
                
                setQuestions(prev => [...prev, ...validQuestions]);
                setShowMCQGenerator(false);
              }}
              onCancel={() => setShowMCQGenerator(false)}
              courseData={courseData}
              bloomLevels={bloomLevels}
              getCourseOutcomes={getCourseOutcomes}
              formatOutcomeForDisplay={formatOutcomeForDisplay}
              extractOutcomeCode={extractOutcomeCode}
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

      <AddQuestionModal
        isOpen={showAddQuestionModal}
        onClose={() => setShowAddQuestionModal(false)}
        onSave={handleAddManualQuestion}
        courseData={courseData}
        bloomLevels={bloomLevels}
        getCourseOutcomes={getCourseOutcomes}
        formatOutcomeForDisplay={formatOutcomeForDisplay}
        extractOutcomeCode={extractOutcomeCode}
        totalPoints={totalPoints}
        isUngraded={isUngraded}
        currentTotalPoints={calculateTotalQuestionPoints()}
      />

      <AIGenerationModal
        isOpen={showAIGenerationModal}
        onClose={() => {
          setShowAIGenerationModal(false);
          setAiError(null);
        }}
        onGenerate={generateAISubjectiveQuestions}
        courseData={courseData}
        bloomLevels={bloomLevels}
        getCourseOutcomes={getCourseOutcomes}
        formatOutcomeForDisplay={formatOutcomeForDisplay}
        extractOutcomeCode={extractOutcomeCode}
        generating={generating}
        aiError={aiError}
      />

      <AIGenerationModal
        isOpen={showAIGenerationModalMCQ}
        onClose={() => {
          setShowAIGenerationModalMCQ(false);
          setAiError(null);
        }}
        onGenerate={generateAIMCQQuestions}
        courseData={courseData}
        bloomLevels={bloomLevels}
        getCourseOutcomes={getCourseOutcomes}
        formatOutcomeForDisplay={formatOutcomeForDisplay}
        extractOutcomeCode={extractOutcomeCode}
        generating={generating}
        aiError={aiError}
      />
    </div>
  );
};

export default QuestionsStep;


