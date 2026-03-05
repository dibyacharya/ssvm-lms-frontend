import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight, Sparkles } from 'lucide-react';
import { createAssignment } from '../../../services/assignment.service';
import AssignmentDetailsStep from '../components/AssignmentDetailsStep';
import QuestionsStep from '../components/QuestionsStep';
import ReviewStep from '../components/ReviewStep';
import StepIndicator from '../components/StepIndicator';
import { useCourse } from '../../../context/CourseContext';
import toast from 'react-hot-toast';

// Dummy course data structure
const getDummyCourseData = () => ({
  id: "68a42cbdefa0d4e7c4f41706",
  title: "Fundamentals of Probability and Statistics",
  courseCode: "CS101",
  syllabus: {
    modules: [
      {
        _id: "68a42cbdefa0d4e7c4f41714",
        name: "Descriptive Statistics and Data Analysis",
        moduleNumber: 1
      },
      {
        _id: "68a42cbdefa0d4e7c4f41716",
        name: "Probability Theory",
        moduleNumber: 2
      }
    ]
  }
});

// Ordinal helper
const getOrdinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const AssignmentCreator = ({
  onBack, onSave, courseID, inModal = false,
  assignmentType = 'subjective',
  categoryRef = null, configuredMarks = null,
  categoryName = '', assignmentIndex = null
}) => {
  const { courseData: contextCourseData } = useCourse();
  const courseData = contextCourseData || getDummyCourseData();

  // Use courseID from props if available, otherwise from courseData
  const finalCourseID = courseID || courseData.id || courseData._id;

  if (!finalCourseID) {
    console.error('Course ID is required to create an assignment');
  }

  // Determine if we're in CA mode (creating from continuous assessment page)
  const isCAMode = !!categoryRef;

  // Auto-generate title when in CA mode
  const autoTitle = isCAMode && categoryName && assignmentIndex
    ? `${getOrdinal(assignmentIndex)} ${categoryName}`
    : '';

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);

  // Assignment Details State
  const [assignmentTitle, setAssignmentTitle] = useState(autoTitle);
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [totalPoints, setTotalPoints] = useState(isCAMode && configuredMarks ? configuredMarks : 100);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [isUngraded, setIsUngraded] = useState(false);
  const [completeIn, setCompleteIn] = useState(null);

  // Update title if CA props change
  useEffect(() => {
    if (isCAMode && categoryName && assignmentIndex) {
      setAssignmentTitle(`${getOrdinal(assignmentIndex)} ${categoryName}`);
    }
  }, [isCAMode, categoryName, assignmentIndex]);

  // Auto-set totalPoints from configuredMarks
  useEffect(() => {
    if (isCAMode && configuredMarks) {
      setTotalPoints(configuredMarks);
    }
  }, [isCAMode, configuredMarks]);

  // Questions State - set activeTab based on assignmentType
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState(assignmentType);

  const steps = [
    { number: 1, title: 'Assignment Details', subtitle: 'Basic information and settings' },
    { number: 2, title: 'Questions', subtitle: 'Add assignment questions' },
    { number: 3, title: 'Review & Publish', subtitle: 'Review and publish assignment' }
  ];

  // Header title based on mode
  const headerTitle = isCAMode && autoTitle
    ? `Create ${autoTitle}`
    : 'Create Assignment';

  const headerSubtitle = isCAMode
    ? `Configure and add questions for this ${categoryName.toLowerCase()}`
    : 'Design and configure your assignment';

  const handleNext = () => {
    if (currentStep < 3) {
      if (currentStep === 1) {
        if (!assignmentTitle) {
          toast.error('Please provide an assignment title');
          return;
        }
        if (!selectedModule) {
          toast.error('Please select a module');
          return;
        }
        if (!dueDate) {
          toast.error('Please select a due date');
          return;
        }
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Allow clicking on step indicators to navigate
  const handleStepClick = (stepNumber) => {
    // Can only go back to completed steps or stay on current
    if (stepNumber < currentStep) {
      setCurrentStep(stepNumber);
    }
  };

  const handleSave = async () => {
    if (!assignmentTitle) {
      toast.error('Please provide an assignment title before publishing.');
      return;
    }

    // Allow publishing with either questions or attachments
    if (questions.length === 0 && attachments.length === 0) {
      toast.error('Please add at least one question or attachment before publishing.');
      return;
    }

    if (!finalCourseID) {
      toast.error('Course ID is required. Please try again.');
      return;
    }

    setLoading(true);

    try {
      // Create FormData for API call
      const formData = new FormData();

      // Add text fields
      formData.append('title', assignmentTitle);
      formData.append('description', description || '');
      formData.append('instructions', instructions || '');

      formData.append('isUngraded', isUngraded ? 'true' : 'false');
      formData.append('isActive', 'true');
      formData.append('allowLateSubmissions', 'true');

      if (selectedModule) {
        formData.append('module', selectedModule);
      }

      if (dueDate) {
        // Format due date with time
        const dueDateTime = `${dueDate}T${dueTime}:00`;
        formData.append('dueDate', dueDateTime);
      }

      // Add completeIn (time limit in minutes) if provided
      if (completeIn !== null && completeIn !== undefined && completeIn > 0) {
        formData.append('completeIn', completeIn.toString());
      }

      // Add questions as JSON string (empty array if no questions)
      const questionsToSend = questions.length > 0 ? questions.map((q, index) => {
        const questionData = {
          question: q.question,
          type: q.type,
          points: q.points || 0,
          score: q.score || q.points || 0,
        };

        if (q.bloomLevel) questionData.bloomLevel = q.bloomLevel;
        if (q.courseOutcome) questionData.courseOutcome = q.courseOutcome;
        if (q.order !== undefined) questionData.order = q.order;
        if (q.source) questionData.source = q.source;
        if (q.status) questionData.status = q.status;

        if (q.type === 'objective') {
          if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
            throw new Error(`Objective question "${q.question.substring(0, 50)}..." must have at least 2 options.`);
          }

          const validOptions = q.options.filter(opt => opt && opt.trim() !== '');
          if (validOptions.length < 2) {
            throw new Error(`Objective question "${q.question.substring(0, 50)}..." must have at least 2 non-empty options.`);
          }

          if (!q.correctAnswer || q.correctAnswer.trim() === '') {
            throw new Error(`Objective question "${q.question.substring(0, 50)}..." must have a correct answer.`);
          }

          const correctAnswerExists = validOptions.some(opt => opt.trim() === q.correctAnswer.trim());
          if (!correctAnswerExists) {
            throw new Error(`Objective question "${q.question.substring(0, 50)}..." has a correct answer that doesn't match any of the options.`);
          }

          questionData.options = validOptions;
          questionData.correctAnswer = q.correctAnswer.trim();
        }

        return questionData;
      }) : [];

      if (attachments.length > 0) {
        const hasAutoQuestion = questionsToSend.some(q => q.source === 'attachment-auto');
        if (!hasAutoQuestion) {
          const existingTotal = questionsToSend.reduce((sum, q) => sum + (q.score || q.points || 0), 0);
          const autoQuestionScore = isUngraded ? 0 : (totalPoints - existingTotal > 0 ? totalPoints - existingTotal : totalPoints);

          const autoQuestion = {
            question: "Solve the given assignment questions in the attached sheet(s).",
            type: "subjective",
            points: autoQuestionScore,
            score: autoQuestionScore,
            source: "attachment-auto"
          };
          questionsToSend.push(autoQuestion);
        }
      }

      let finalTotalPoints = isUngraded ? 0 : totalPoints;
      if (!isUngraded && questionsToSend.length > 0) {
        finalTotalPoints = questionsToSend.reduce((sum, q) => sum + (q.score || 0), 0);
      }

      formData.append('totalPoints', finalTotalPoints.toString());
      formData.append('questions', JSON.stringify(questionsToSend));

      const filesToUpload = attachments.filter(file => file instanceof File);

      if (filesToUpload.length > 0) {
        filesToUpload.forEach((file) => {
          formData.append('attachments', file);
        });
      }

      // Add CA plan category metadata if provided (for auto-linking)
      if (categoryRef) {
        formData.append('categoryRef', categoryRef);
        formData.append('configuredMarks', String(configuredMarks || 0));
      }

      // Create assignment via API
      const response = await createAssignment(finalCourseID, formData);
      const created = response.assignment;

      onSave?.(created);

      setTimeout(() => {
        onBack?.();
      }, 500);
    } catch (error) {
      console.error('Error creating assignment:', error);
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create assignment. Please check the console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={inModal ? "bg-gray-50" : "bg-gray-50 min-h-screen"}>
      {/* Header */}
      {!inModal && (
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={onBack}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                  title="Go back"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-gray-800 transition-colors" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-gray-900">{headerTitle}</h1>
                    {isCAMode && configuredMarks && (
                      <span className="px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        {configuredMarks} marks
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{headerSubtitle}</p>
                </div>
              </div>
              {/* Step summary pills */}
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
                {steps.map((step, i) => (
                  <React.Fragment key={step.number}>
                    <button
                      onClick={() => handleStepClick(step.number)}
                      disabled={step.number > currentStep}
                      className={`px-3 py-1.5 rounded-full font-medium transition-all ${
                        step.number === currentStep
                          ? 'bg-blue-100 text-blue-700'
                          : step.number < currentStep
                          ? 'bg-green-100 text-green-700 cursor-pointer hover:bg-green-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {step.title}
                    </button>
                    {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={inModal ? "py-4" : "px-6 py-6"}>
        <div className="max-w-7xl mx-auto">
          {/* Step Indicator - now clickable */}
          <StepIndicator steps={steps} currentStep={currentStep} onStepClick={handleStepClick} />

          <div className="mt-8">
            {currentStep === 1 && (
              <AssignmentDetailsStep
                assignmentTitle={assignmentTitle}
                setAssignmentTitle={setAssignmentTitle}
                description={description}
                setDescription={setDescription}
                instructions={instructions}
                setInstructions={setInstructions}
                selectedModule={selectedModule}
                setSelectedModule={setSelectedModule}
                totalPoints={totalPoints}
                setTotalPoints={setTotalPoints}
                dueDate={dueDate}
                setDueDate={setDueDate}
                dueTime={dueTime}
                setDueTime={setDueTime}
                courseData={courseData}
                isUngraded={isUngraded}
                setIsUngraded={setIsUngraded}
                completeIn={completeIn}
                setCompleteIn={setCompleteIn}
                isCAMode={isCAMode}
                autoTitle={autoTitle}
                configuredMarks={configuredMarks}
              />
            )}
            {currentStep === 2 && (
              <QuestionsStep
                questions={questions}
                setQuestions={setQuestions}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                courseData={courseData}
                assignmentType={assignmentType}
                attachments={attachments}
                setAttachments={setAttachments}
                totalPoints={totalPoints}
                isUngraded={isUngraded}
              />
            )}
            {currentStep === 3 && (
              <ReviewStep
                questions={questions}
                assignmentTitle={assignmentTitle}
                description={description}
                selectedModule={selectedModule}
                totalPoints={totalPoints}
                dueDate={dueDate}
                dueTime={dueTime}
                loading={loading}
                handleSave={handleSave}
                courseData={courseData}
                isUngraded={isUngraded}
                attachments={attachments}
                onPrevious={handlePrevious}
                completeIn={completeIn}
              />
            )}
          </div>

          {/* Navigation buttons */}
          {currentStep < 3 && (
            <div className="flex justify-between mt-10 mx-auto">
              <button
                onClick={currentStep === 1 ? onBack : handlePrevious}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                {currentStep === 1 ? 'Back' : 'Previous'}
              </button>
              <button
                onClick={handleNext}
                disabled={currentStep === 1 && (!assignmentTitle || !selectedModule || !dueDate)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium shadow-sm"
              >
                Next Step
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AssignmentSectionRevamp({
  onSave, onCancel, onBack, courseID, inModal = false, assignmentType = 'subjective',
  categoryRef = null, configuredMarks = null, categoryName = '', assignmentIndex = null
}) {
  return (
    <AssignmentCreator
      onBack={onBack || onCancel}
      onSave={(data) => {
        console.log('Assignment saved:', data);
        onSave?.(data);
      }}
      courseID={courseID}
      inModal={inModal}
      assignmentType={assignmentType}
      categoryRef={categoryRef}
      configuredMarks={configuredMarks}
      categoryName={categoryName}
      assignmentIndex={assignmentIndex}
    />
  );
}
