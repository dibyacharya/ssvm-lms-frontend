import React, { useState } from 'react';
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

const AssignmentCreator = ({ onBack, onSave, courseID, inModal = false, assignmentType = 'subjective' }) => {
  const { courseData: contextCourseData } = useCourse();
  const courseData = contextCourseData || getDummyCourseData();
  
  // Use courseID from props if available, otherwise from courseData
  const finalCourseID = courseID || courseData.id || courseData._id;
  
  if (!finalCourseID) {
    console.error('Course ID is required to create an assignment');
  }
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);

  // Assignment Details State
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [totalPoints, setTotalPoints] = useState(100);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [isUngraded, setIsUngraded] = useState(false);
  const [completeIn, setCompleteIn] = useState(null);

  // Questions State - set activeTab based on assignmentType
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState(assignmentType);

  const steps = [
    { number: 1, title: 'Assignment Details', subtitle: 'Basic information and settings' },
    { number: 2, title: 'Questions', subtitle: 'Add assignment questions' },
    { number: 3, title: 'Review & Publish', subtitle: 'Review and publish assignment' }
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      if (currentStep === 1) {
        if (!assignmentTitle) {
          toast.error('Please provide an assignment title');
          return;
        }
        if (!description || description.trim() === '') {
          toast.error('Please provide an assignment description');
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
      // First pass: prepare question data and collect attachments
      const questionsToSend = questions.length > 0 ? questions.map((q, index) => {
        const questionData = {
          question: q.question,
          type: q.type,
          points: q.points || 0,
          score: q.score || q.points || 0, // Add score field (per-question scoring)
        };
        
        // Add optional fields
        if (q.bloomLevel) questionData.bloomLevel = q.bloomLevel;
        if (q.courseOutcome) questionData.courseOutcome = q.courseOutcome;
        if (q.order !== undefined) questionData.order = q.order;
        if (q.source) questionData.source = q.source;
        if (q.status) questionData.status = q.status;
        
        // For objective questions, options and correctAnswer are REQUIRED
        if (q.type === 'objective') {
          // Validate that options exist and have at least 2 items
          if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
            throw new Error(`Objective question "${q.question.substring(0, 50)}..." must have at least 2 options.`);
          }
          
          // Filter out empty options
          const validOptions = q.options.filter(opt => opt && opt.trim() !== '');
          if (validOptions.length < 2) {
            throw new Error(`Objective question "${q.question.substring(0, 50)}..." must have at least 2 non-empty options.`);
          }
          
          // Validate that correctAnswer exists
          if (!q.correctAnswer || q.correctAnswer.trim() === '') {
            throw new Error(`Objective question "${q.question.substring(0, 50)}..." must have a correct answer.`);
          }
          
          // Validate that correctAnswer matches one of the options exactly
          const correctAnswerExists = validOptions.some(opt => opt.trim() === q.correctAnswer.trim());
          if (!correctAnswerExists) {
            throw new Error(`Objective question "${q.question.substring(0, 50)}..." has a correct answer that doesn't match any of the options. Please ensure the correct answer exactly matches one of the options.`);
          }
          
          // Always include options and correctAnswer for objective questions (REQUIRED by backend)
          questionData.options = validOptions;
          questionData.correctAnswer = q.correctAnswer.trim();
        }
        
        return questionData;
      }) : [];
      
      // If attachments exist, add auto-generated question for attachments
      if (attachments.length > 0) {
        // Check if auto-generated question already exists
        const hasAutoQuestion = questionsToSend.some(q => q.source === 'attachment-auto');
        if (!hasAutoQuestion) {
          // Calculate total from existing questions first
          const existingTotal = questionsToSend.reduce((sum, q) => sum + (q.score || q.points || 0), 0);
          const autoQuestionScore = isUngraded ? 0 : (totalPoints - existingTotal > 0 ? totalPoints - existingTotal : totalPoints);
          
          const autoQuestion = {
            question: "Solve the given assignment questions in the attached sheet(s).",
            type: "subjective",
            points: autoQuestionScore,
            score: autoQuestionScore, // Add score field
            source: "attachment-auto"
          };
          questionsToSend.push(autoQuestion);
        }
      }
      
      // Calculate total points from question scores if not ungraded
      let finalTotalPoints = isUngraded ? 0 : totalPoints;
      if (!isUngraded && questionsToSend.length > 0) {
        finalTotalPoints = questionsToSend.reduce((sum, q) => sum + (q.score || 0), 0);
      }
      
      formData.append('totalPoints', finalTotalPoints.toString());
      formData.append('questions', JSON.stringify(questionsToSend));
      
      // Add assignment-level attachment files
      // Filter and append only actual File objects (not existing attachment objects with _id)
      const filesToUpload = attachments.filter(file => file instanceof File);
      
      if (filesToUpload.length > 0) {
        filesToUpload.forEach((file) => {
          formData.append('attachments', file);
        });
        console.log(`Adding ${filesToUpload.length} attachment file(s) to FormData`);
      } else if (attachments.length > 0) {
        console.warn('Attachments array has items but none are File objects:', attachments);
      }
      
      // Log FormData for debugging
      console.log('FormData being sent:');
      console.log('Total attachments in state:', attachments.length);
      console.log('File objects to upload:', filesToUpload.length);
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: File - ${pair[1].name} (${pair[1].size} bytes, type: ${pair[1].type})`);
        } else {
          // Truncate long strings for readability
          const value = typeof pair[1] === 'string' && pair[1].length > 100 
            ? pair[1].substring(0, 100) + '...' 
            : pair[1];
          console.log(`${pair[0]}: ${value}`);
        }
      }
      
      // Create assignment via API
      const response = await createAssignment(finalCourseID, formData);
      const created = response.assignment;
      
      console.log('Assignment created:', created);
      
      // Call the onSave callback to refresh the list
      onSave?.(created);
      
      // Success message is handled in the service
      
      // Navigate back after a short delay
      setTimeout(() => {
        onBack?.();
      }, 500);
    } catch (error) {
      console.error('Error creating assignment:', error);
      // Show validation errors to the user
      if (error.message) {
        toast.error(error.message);
      } else {
        // Error is already handled in the service with toast
        toast.error('Failed to create assignment. Please check the console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={inModal ? "bg-gray-50" : "bg-gray-50"}>
      {!inModal && (
        <div className="bg-transparent px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div>
              <h1 className="text-2xl font-bold">Create Assignment</h1>
              <p className="text-gray-600">Design and configure your assignment</p>
            </div>
            <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
              Back
            </button>
          </div>
        </div>
      )}

      <div className={inModal ? "py-4" : "px-6 py-8"}>
        <div className="max-w-7xl mx-auto">
          <StepIndicator steps={steps} currentStep={currentStep} />
          
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

          {currentStep < 3 && (
            <div className="flex justify-between mt-12  mx-auto ">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentStep === 1 && (!assignmentTitle || !description?.trim() || !selectedModule || !dueDate)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                Next Step
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AssignmentSectionRevamp({ onSave, onCancel, courseID, inModal = false, assignmentType = 'subjective' }) {
  return (
    <AssignmentCreator 
      onBack={onCancel}
      onSave={(data) => {
        console.log('Assignment saved:', data);
        onSave?.(data);
      }}
      courseID={courseID}
      inModal={inModal}
      assignmentType={assignmentType}
    />
  );
}

