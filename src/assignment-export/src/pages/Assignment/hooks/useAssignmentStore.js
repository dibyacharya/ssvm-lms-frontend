import { useState, useCallback, useEffect } from 'react';

// Storage keys
const STORAGE_KEY_ASSIGNMENTS = 'lms_assignments';
const STORAGE_KEY_STUDENTS = 'lms_students';

// Default dummy data
const defaultAssignments = [
  {
    _id: 'assign_1',
    title: 'Probability and Statistics Assignment 1',
    description: 'Complete the following questions on probability theory',
    instructions: 'Show all your work and submit as PDF',
    course: '68a42cbdefa0d4e7c4f41706',
    module: '68a42cbdefa0d4e7c4f41714',
    totalPoints: 100,
    dueDate: '2024-12-31T23:59:00',
    isActive: true,
    questions: [
      {
        _id: 'q1',
        question: 'What is the difference between population and sample in statistics?',
        type: 'subjective',
        points: 20,
        bloomLevel: 'understand',
        courseOutcome: 'CO1',
        options: null,
        correctAnswer: null
      },
      {
        _id: 'q2',
        question: 'Calculate the mean of the following dataset: 5, 10, 15, 20, 25',
        type: 'subjective',
        points: 20,
        bloomLevel: 'apply',
        courseOutcome: 'CO1',
        options: null,
        correctAnswer: null
      },
      {
        _id: 'q3',
        question: 'Which of the following is a measure of central tendency?',
        type: 'objective',
        points: 10,
        bloomLevel: 'remember',
        courseOutcome: 'CO1',
        options: ['Mean', 'Range', 'Variance', 'Standard Deviation'],
        correctAnswer: 'Mean'
      },
      {
        _id: 'q4',
        question: 'The probability of an impossible event is:',
        type: 'objective',
        points: 10,
        bloomLevel: 'remember',
        courseOutcome: 'CO2',
        options: ['0', '1', '0.5', 'Infinity'],
        correctAnswer: '0'
      }
    ],
    submissions: [],
    createdAt: new Date().toISOString()
  }
];

// Consistent dummy student for testing - used across both teacher and student views
export const DUMMY_STUDENT = {
  id: 'student_1',
  name: 'John Doe',
  rollNo: 'CS001'
};

const defaultStudents = [
  DUMMY_STUDENT,
  { id: 'student_2', name: 'Jane Smith', rollNo: 'CS002' },
  { id: 'student_3', name: 'Bob Johnson', rollNo: 'CS003' }
];

// Helper functions for localStorage
const loadFromStorage = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
  }
  return defaultValue;
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export const useAssignmentStore = () => {
  // Initialize from localStorage or use defaults
  const [assignments, setAssignments] = useState(() => {
    const loaded = loadFromStorage(STORAGE_KEY_ASSIGNMENTS, defaultAssignments);
    console.log('Initialized assignments from storage:', loaded);
    return loaded;
  });
  const [students] = useState(() => 
    loadFromStorage(STORAGE_KEY_STUDENTS, defaultStudents)
  );

  // Save to localStorage whenever assignments change
  useEffect(() => {
    console.log('Saving assignments to storage:', assignments);
    saveToStorage(STORAGE_KEY_ASSIGNMENTS, assignments);
  }, [assignments]);

  // Initialize localStorage on first load if empty
  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY_ASSIGNMENTS)) {
      saveToStorage(STORAGE_KEY_ASSIGNMENTS, defaultAssignments);
      console.log('Initialized default assignments in localStorage');
    }
    if (!localStorage.getItem(STORAGE_KEY_STUDENTS)) {
      saveToStorage(STORAGE_KEY_STUDENTS, defaultStudents);
      console.log('Initialized default students in localStorage');
    }
    // Initialize dummy student ID if not set
    if (!localStorage.getItem('current_student_id')) {
      localStorage.setItem('current_student_id', DUMMY_STUDENT.id);
      console.log('Initialized dummy student ID:', DUMMY_STUDENT.id);
    }
  }, []);

  const createAssignment = useCallback((assignmentData) => {
    console.log('Creating assignment with data:', assignmentData);
    const newAssignment = {
      _id: `assign_${Date.now()}`,
      ...assignmentData,
      submissions: assignmentData.submissions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: assignmentData.isActive !== undefined ? assignmentData.isActive : true
    };
    console.log('New assignment object:', newAssignment);
    setAssignments(prev => {
      const updated = [...prev, newAssignment];
      console.log('Updated assignments array:', updated);
      saveToStorage(STORAGE_KEY_ASSIGNMENTS, updated);
      console.log('Saved to localStorage');
      return updated;
    });
    return newAssignment;
  }, []);

  const updateAssignment = useCallback((assignmentId, updates) => {
    setAssignments(prev => {
      const updated = prev.map(assign => 
        assign._id === assignmentId 
          ? { ...assign, ...updates, updatedAt: new Date().toISOString() }
          : assign
      );
      saveToStorage(STORAGE_KEY_ASSIGNMENTS, updated);
      return updated;
    });
  }, []);

  const deleteAssignment = useCallback((assignmentId) => {
    setAssignments(prev => {
      const updated = prev.filter(assign => assign._id !== assignmentId);
      saveToStorage(STORAGE_KEY_ASSIGNMENTS, updated);
      return updated;
    });
  }, []);

  const getAssignmentById = useCallback((assignmentId) => {
    // Read directly from localStorage to get the latest data
    const allAssignments = loadFromStorage(STORAGE_KEY_ASSIGNMENTS, defaultAssignments);
    return allAssignments.find(assign => assign._id === assignmentId);
  }, []);

  const getAssignmentsByCourse = useCallback((courseId) => {
    // Read directly from localStorage to get the latest data
    const allAssignments = loadFromStorage(STORAGE_KEY_ASSIGNMENTS, defaultAssignments);
    console.log('Getting assignments for course:', courseId);
    console.log('All assignments from storage:', allAssignments);
    
    // If no courseId provided, return all active assignments (for testing)
    if (!courseId) {
      console.log('No courseId provided, returning all active assignments');
      return allAssignments.filter(assign => assign.isActive !== false);
    }
    
    const filtered = allAssignments.filter(assign => {
      // Try multiple matching strategies
      const courseIdStr = String(courseId);
      const assignCourseStr = String(assign.course || '');
      const matches = assignCourseStr === courseIdStr || 
                     assign.course === courseId || 
                     assignCourseStr.includes(courseIdStr) ||
                     courseIdStr.includes(assignCourseStr);
      console.log(`Assignment ${assign._id}: course=${assign.course} (${assignCourseStr}), requested=${courseId} (${courseIdStr}), matches=${matches}`);
      return matches && (assign.isActive !== false);
    });
    console.log('Filtered assignments:', filtered);
    return filtered;
  }, []);

  const addSubmission = useCallback((assignmentId, submission) => {
    setAssignments(prev => {
      const updated = prev.map(assign => {
        if (assign._id === assignmentId) {
          return {
            ...assign,
            submissions: [...(assign.submissions || []), submission],
            updatedAt: new Date().toISOString()
          };
        }
        return assign;
      });
      saveToStorage(STORAGE_KEY_ASSIGNMENTS, updated);
      return updated;
    });
  }, []);

  const updateSubmission = useCallback((assignmentId, submissionId, updates) => {
    setAssignments(prev => {
      const updated = prev.map(assign => {
        if (assign._id === assignmentId) {
          return {
            ...assign,
            submissions: (assign.submissions || []).map(sub => 
              sub._id === submissionId ? { ...sub, ...updates } : sub
            ),
            updatedAt: new Date().toISOString()
          };
        }
        return assign;
      });
      saveToStorage(STORAGE_KEY_ASSIGNMENTS, updated);
      return updated;
    });
  }, []);

  // Clear all data (useful for testing)
  const clearAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_ASSIGNMENTS);
    localStorage.removeItem(STORAGE_KEY_STUDENTS);
    setAssignments(defaultAssignments);
    saveToStorage(STORAGE_KEY_ASSIGNMENTS, defaultAssignments);
    saveToStorage(STORAGE_KEY_STUDENTS, defaultStudents);
  }, []);

  // Helper function to get current student ID (for testing purposes)
  // In production, this would come from AuthContext
  const getCurrentStudentId = useCallback(() => {
    // Try to get from localStorage first (for testing)
    const storedStudentId = localStorage.getItem('current_student_id');
    if (storedStudentId) {
      return storedStudentId;
    }
    // Default to dummy student
    return DUMMY_STUDENT.id;
  }, []);

  // Helper function to set current student ID (for testing)
  const setCurrentStudentId = useCallback((studentId) => {
    localStorage.setItem('current_student_id', studentId);
  }, []);

  return {
    assignments,
    students,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getAssignmentById,
    getAssignmentsByCourse,
    addSubmission,
    updateSubmission,
    clearAllData,
    getCurrentStudentId,
    setCurrentStudentId,
    DUMMY_STUDENT
  };
};

