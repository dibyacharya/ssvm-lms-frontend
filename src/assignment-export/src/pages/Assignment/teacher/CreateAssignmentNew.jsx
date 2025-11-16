import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAssignmentStore } from '../hooks/useAssignmentStore';
import AssignmentDetailsStep from '../components/AssignmentDetailsStep';
import QuestionsStep from '../components/QuestionsStep';
import ReviewStep from '../components/ReviewStep';
import StepIndicator from '../components/StepIndicator';
import { useCourse } from '../../../context/CourseContext';

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

const AssignmentCreator = ({ onBack, onSave, courseID }) => {
  const { courseData: contextCourseData } = useCourse();
  const courseData = contextCourseData || getDummyCourseData();
  const { createAssignment } = useAssignmentStore();
  
  // Use courseID from props if available, otherwise from courseData
  const finalCourseID = courseID || courseData.id || courseData._id || '68a42cbdefa0d4e7c4f41706';
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Assignment Details State
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [totalPoints, setTotalPoints] = useState(100);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');

  // Questions State
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('subjective');

  const steps = [
    { number: 1, title: 'Assignment Details', subtitle: 'Basic information and settings' },
    { number: 2, title: 'Questions', subtitle: 'Add subjective and objective questions' },
    { number: 3, title: 'Review & Publish', subtitle: 'Review and publish assignment' }
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      if (currentStep === 1 && !assignmentTitle) {
        alert('Please provide an assignment title');
        return;
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    if (!assignmentTitle || questions.length === 0) {
      alert('Please provide an assignment title and add at least one question before publishing.');
      return;
    }

    setLoading(true);
    
    try {
      const assignmentData = {
        title: assignmentTitle,
        description,
        instructions,
        module: selectedModule,
        totalPoints,
        dueDate: dueDate ? `${dueDate}T${dueTime}:00` : null,
        questions: questions.map(q => ({
          ...q,
          _id: q.id
        })),
        course: finalCourseID
      };
      
      // Save to localStorage store
      const created = createAssignment(assignmentData);
      console.log('Assignment created:', created);
      console.log('Course ID:', finalCourseID);
      
      // Call the onSave callback to refresh the list
      onSave?.(created);
      
      // Show success message
      alert('Assignment published successfully!');
      
      // Navigate back after a short delay
      setTimeout(() => {
        onBack?.();
      }, 500);
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Failed to create assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
              Back to Assignments
            </button>
            <div className="border-l border-gray-300 pl-4">
              <h1 className="text-2xl font-bold">Create Assignment</h1>
              <p className="text-gray-600">Design and configure your assignment</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
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
            <div className="flex justify-between mt-12 max-w-6xl mx-auto">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentStep === 1 && !assignmentTitle}
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

export default function AssignmentSectionRevamp({ onSave, onCancel, courseID }) {
  return (
    <AssignmentCreator 
      onBack={onCancel}
      onSave={(data) => {
        console.log('Assignment saved:', data);
        onSave?.(data);
      }}
      courseID={courseID}
    />
  );
}

