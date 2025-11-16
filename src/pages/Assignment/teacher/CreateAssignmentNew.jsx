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

  // Questions State - set activeTab based on assignmentType
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState(assignmentType);

  const steps = [
    { number: 1, title: 'Assignment Details', subtitle: 'Basic information and settings' },
    { number: 2, title: 'Questions', subtitle: 'Add subjective and objective questions' },
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
    if (!assignmentTitle || questions.length === 0) {
      toast.error('Please provide an assignment title and add at least one question before publishing.');
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
      formData.append('totalPoints', totalPoints.toString());
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
      
      // Add questions as JSON string
      const questionsToSend = questions.map(q => {
        const questionData = {
          question: q.question,
          type: q.type,
          points: q.points || 0,
        };
        
        // Add optional fields
        if (q.bloomLevel) questionData.bloomLevel = q.bloomLevel;
        if (q.courseOutcome) questionData.courseOutcome = q.courseOutcome;
        if (q.order !== undefined) questionData.order = q.order;
        if (q.source) questionData.source = q.source;
        if (q.status) questionData.status = q.status;
        
        // For objective questions, add options and correctAnswer
        if (q.type === 'objective') {
          if (q.options && q.options.length >= 2) {
            questionData.options = q.options;
          }
          if (q.correctAnswer) {
            questionData.correctAnswer = q.correctAnswer;
          }
        }
        
        return questionData;
      });
      
      formData.append('questions', JSON.stringify(questionsToSend));
      
      // Add attachment files
      attachments.forEach((file) => {
        if (file instanceof File) {
          formData.append('attachments', file);
        }
      });
      
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
      // Error is already handled in the service with toast
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

