import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, FileText, CheckCircle2, XCircle, Search, Download, Paperclip, Maximize, X } from 'lucide-react';
import { 
  getAssignmentById, 
  getAllSubmissions, 
  gradeSubmission 
} from '../../../services/assignment.service';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../../utils/LoadingAnimation';
import { useCourse } from '../../../context/CourseContext';

const TeacherAssignmentGrading = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { courseData } = useCourse();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [grades, setGrades] = useState({});
  const [feedback, setFeedback] = useState({});
  const [sortBy, setSortBy] = useState('all'); // all, submitted, unsubmitted
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('answers'); // 'answers' or 'file'
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Fetch assignment and submissions
  const fetchData = useCallback(async () => {
    if (!assignmentId) {
      console.log('[TeacherAssignmentGrading] No assignmentId provided, skipping fetch');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('[TeacherAssignmentGrading] Starting to fetch assignment data for ID:', assignmentId);
      
      // Fetch assignment
      console.log('[TeacherAssignmentGrading] Fetching assignment by ID...');
      const assignmentResponse = await getAssignmentById({ assignmentID: assignmentId });
      const assign = assignmentResponse.assignment;
      console.log('[TeacherAssignmentGrading] Assignment fetched:', {
        id: assign._id,
        title: assign.title,
        questionsCount: assign.questions?.length || 0
      });
      setAssignment(assign);
      
      // Fetch all submissions (without filters - filtering will be done on frontend)
      console.log('[TeacherAssignmentGrading] Fetching all submissions...');
      const submissionsResponse = await getAllSubmissions(assignmentId, {});
      const subs = submissionsResponse.submissions || [];
      console.log('[TeacherAssignmentGrading] Submissions fetched:', {
        count: subs.length,
        submissions: subs.map(sub => ({
          id: sub._id,
          userId: sub.userId,
          studentId: sub.studentId,
          userName: sub.userName,
          userEmail: sub.userEmail
        }))
      });
      setSubmissions(subs);
      
      // Initialize grades and feedback from existing submissions
      const objectiveQuestions = assign.questions?.filter(q => q.type === 'objective') || [];
      const subjectiveQuestions = assign.questions?.filter(q => q.type === 'subjective') || [];
      const initialGrades = {};
      const initialFeedback = {};
      
      console.log('[TeacherAssignmentGrading] Processing submissions for grades and feedback...');
      subs.forEach(sub => {
        // Use userId or studentId from submission
        const studentId = sub.userId || sub.studentId;
        console.log('[TeacherAssignmentGrading] Processing submission:', {
          submissionId: sub._id,
          userId: sub.userId,
          studentId: sub.studentId,
          userName: sub.userName,
          grade: sub.grade,
          feedback: sub.feedback
        });
        
        // Use grade field as total grade
        if (sub.grade !== null && sub.grade !== undefined) {
          initialGrades[studentId] = sub.grade;
          console.log('[TeacherAssignmentGrading] Found grade:', { studentId, grade: sub.grade });
        }
        
        // Use feedback field
        if (sub.feedback) {
          initialFeedback[studentId] = sub.feedback;
          console.log('[TeacherAssignmentGrading] Found feedback for student:', studentId);
        }
      });
      
      console.log('[TeacherAssignmentGrading] Initial grades:', initialGrades);
      console.log('[TeacherAssignmentGrading] Initial feedback:', Object.keys(initialFeedback).length, 'students');
      setGrades(initialGrades);
      setFeedback(initialFeedback);
    } catch (error) {
      console.error('[TeacherAssignmentGrading] Error fetching assignment data:', error);
      toast.error('Failed to load assignment data');
    } finally {
      setIsLoading(false);
      console.log('[TeacherAssignmentGrading] Fetch completed');
    }
  }, [assignmentId]); // Only depends on assignmentId, not filters

  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData is memoized and only changes when assignmentId changes

  // Helper function to get the grade key for a student (from submission userId/studentId)
  const getGradeKey = (student) => {
    if (!student?.submission) return student?.id;
    return student.submission.userId || student.submission.studentId || student.id;
  };

  // Sync grades and feedback from submission data when selectedStudent changes
  useEffect(() => {
    if (selectedStudent?.submission) {
      const gradeKey = getGradeKey(selectedStudent);
      const submissionGrade = selectedStudent.submission.grade;
      const submissionFeedback = selectedStudent.submission.feedback;
      
      console.log('[TeacherAssignmentGrading] Syncing grades/feedback from submission:', {
        gradeKey,
        submissionGrade,
        submissionFeedback
      });
      
      // Update grades if not already set or if submission has a grade
      if (submissionGrade !== null && submissionGrade !== undefined) {
        setGrades(prev => {
          if (prev[gradeKey] === undefined || prev[gradeKey] === null) {
            return { ...prev, [gradeKey]: submissionGrade };
          }
          return prev;
        });
      }
      
      // Update feedback if not already set or if submission has feedback
      if (submissionFeedback) {
        setFeedback(prev => {
          if (!prev[gradeKey]) {
            return { ...prev, [gradeKey]: submissionFeedback };
          }
          return prev;
        });
      }
    }
  }, [selectedStudent]);

  // Determine assignment type from first question
  const assignmentType = assignment?.questions?.[0]?.type || null;
  const subjectiveQuestions = assignment?.questions?.filter(q => q.type === 'subjective') || [];
  const objectiveQuestions = assignment?.questions?.filter(q => q.type === 'objective') || [];
  
  console.log('[TeacherAssignmentGrading] Assignment type determined from first question:', assignmentType);
  console.log('[TeacherAssignmentGrading] Subjective questions:', subjectiveQuestions.length);
  console.log('[TeacherAssignmentGrading] Objective questions:', objectiveQuestions.length);

  // Helper function to get file type from submission file URL
  const getFileType = (fileUrl) => {
    if (!fileUrl) return 'unknown';
    const url = fileUrl.toLowerCase();
    if (url.endsWith('.pdf')) return 'pdf';
    if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) return 'image';
    if (url.endsWith('.ppt') || url.endsWith('.pptx')) return 'ppt';
    if (url.endsWith('.doc') || url.endsWith('.docx')) return 'doc';
    return 'other';
  };

  // Render file viewer content
  const renderFileViewer = (fileUrl, fileName, showFullscreenButton = false) => {
    if (!fileUrl) return null;
    
    const fileType = getFileType(fileUrl);

    if (fileType === 'pdf') {
      return (
        <div className="relative w-full h-full">
          {showFullscreenButton && (
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute top-4 right-4 z-10 bg-white p-2 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
              title="Fullscreen"
            >
              <Maximize className="h-5 w-5 text-gray-700" />
            </button>
          )}
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=1`}
            className="w-full h-full border-0"
            title={fileName}
          />
        </div>
      );
    } else if (fileType === 'image') {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100 p-4 relative">
          {showFullscreenButton && (
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute top-4 right-4 z-10 bg-white p-2 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
              title="Fullscreen"
            >
              <Maximize className="h-5 w-5 text-gray-700" />
            </button>
          )}
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
          />
        </div>
      );
    } else if (fileType === 'ppt' || fileType === 'pptx') {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-100 p-6">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-orange-500 text-white text-sm flex items-center justify-center w-10 h-10 rounded">
                PPT
              </div>
              <h3 className="ml-3 font-semibold text-lg">{fileName}</h3>
            </div>
            <p className="text-gray-600 mb-6">
              PowerPoint presentations cannot be previewed directly. You can download the file to view it.
            </p>
            <div className="flex justify-center">
              <a
                href={fileUrl}
                download={fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
              >
                <FileText className="h-5 w-5" />
                Download Presentation
              </a>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-100 p-6">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gray-500 text-white text-sm flex items-center justify-center w-10 h-10 rounded">
                FILE
              </div>
              <h3 className="ml-3 font-semibold text-lg">{fileName}</h3>
            </div>
            <p className="text-gray-600 mb-6">
              This file type cannot be previewed. You can download it to view.
            </p>
            <div className="flex justify-center">
              <a
                href={fileUrl}
                download={fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
              >
                <FileText className="h-5 w-5" />
                Download File
              </a>
            </div>
          </div>
        </div>
      );
    }
  };

  // Reset tab when student changes
  useEffect(() => {
    if (selectedStudent?.submission?.submissionFile) {
      setActiveTab('file'); // Default to file tab if file exists
    } else {
      setActiveTab('answers');
    }
  }, [selectedStudent?.id]);

  // Get students from courseData and map with their submissions
  // Match student.id from courseData.students with submission.userId or submission.studentId
  console.log('[TeacherAssignmentGrading] Mapping students with submissions...');
  console.log('[TeacherAssignmentGrading] courseData.students:', courseData?.students);
  console.log('[TeacherAssignmentGrading] submissions:', submissions.map(sub => ({
    id: sub._id,
    userId: sub.userId,
    studentId: sub.studentId,
    userName: sub.userName
  })));

  const studentSubmissions = (courseData?.students || []).map(student => {
    console.log('[TeacherAssignmentGrading] Processing student:', {
      studentId: student.id,
      studentName: student.name,
      studentRollNo: student.rollNo
    });

    // Find submission by matching student.id with submission.userId or submission.studentId
    const submission = submissions.find(sub => {
      const matchesUserId = sub.userId === student.id;
      const matchesStudentId = sub.studentId === student.id;
      const match = matchesUserId || matchesStudentId;
      
      if (match) {
        console.log('[TeacherAssignmentGrading] Found matching submission for student:', {
          studentId: student.id,
          studentName: student.name,
          submissionId: sub._id,
          submissionUserId: sub.userId,
          submissionStudentId: sub.studentId,
          matchedBy: matchesUserId ? 'userId' : 'studentId'
        });
      }
      
      return match;
    });

    const hasGrade = submission && (submission.status === 'graded' || (submission.grade !== null && submission.grade !== undefined));
    
    console.log('[TeacherAssignmentGrading] Student submission mapping result:', {
      studentId: student.id,
      studentName: student.name,
      hasSubmission: !!submission,
      submissionId: submission?._id,
      hasGrade: hasGrade
    });

    return {
      id: student.id,
      name: student.name || 'Unknown Student',
      rollNo: student.rollNo || student.email || '',
      email: student.email || '',
      submission: submission || null,
      status: submission ? 'submitted' : 'not_submitted',
      hasGrade: hasGrade
    };
  });

  console.log('[TeacherAssignmentGrading] Final studentSubmissions:', studentSubmissions.map(s => ({
    id: s.id,
    name: s.name,
    hasSubmission: !!s.submission,
    status: s.status
  })));

  // Filter students
  const filteredStudents = studentSubmissions.filter(student => {
    // Search filter - search by name, email, or rollNo
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesName = student.name.toLowerCase().includes(searchLower);
      const matchesEmail = student.email.toLowerCase().includes(searchLower);
      const matchesRollNo = student.rollNo && student.rollNo.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesEmail && !matchesRollNo) {
        return false;
      }
    }
    
    // Sort filter
    if (sortBy === 'submitted' && !student.submission) return false;
    if (sortBy === 'unsubmitted' && student.submission) return false;
    
    return true;
  });

  console.log('[TeacherAssignmentGrading] Filtered students:', {
    total: studentSubmissions.length,
    filtered: filteredStudents.length,
    searchTerm,
    sortBy
  });
  console.log(courseData,assignment?.submissions);
  const handleGradeChange = (studentId, value) => {
    console.log('[TeacherAssignmentGrading] Grade changed:', { studentId, value });
    setGrades(prev => {
      const newGrades = {
        ...prev,
        [studentId]: value ? parseFloat(value) : null
      };
      console.log('[TeacherAssignmentGrading] Updated grades:', newGrades);
      return newGrades;
    });
  };

  const handleFeedbackChange = (studentId, value) => {
    console.log('[TeacherAssignmentGrading] Feedback changed:', { studentId, valueLength: value?.length });
    setFeedback(prev => {
      const newFeedback = {
        ...prev,
        [studentId]: value
      };
      console.log('[TeacherAssignmentGrading] Updated feedback:', Object.keys(newFeedback).length, 'students');
      return newFeedback;
    });
  };

  const handleSaveGrade = async (student) => {
    console.log('[TeacherAssignmentGrading] Saving grade for student:', {
      studentId: student.id,
      studentName: student.name,
      hasSubmission: !!student.submission
    });

    // Check if assignment is ungraded
    if (assignment.isUngraded) {
      console.log('[TeacherAssignmentGrading] Cannot save grade - assignment is ungraded');
      toast.error('This assignment is ungraded and cannot be scored');
      return;
    }

    if (!student.submission) {
      console.log('[TeacherAssignmentGrading] Cannot save grade - student has not submitted');
      toast.error('Student has not submitted the assignment');
      return;
    }

    const submissionId = student.submission._id;
    const gradeKey = getGradeKey(student);
    const totalGrade = grades[gradeKey] ?? student.submission?.grade;
    const studentFeedback = feedback[gradeKey] ?? student.submission?.feedback ?? '';
    
    console.log('[TeacherAssignmentGrading] Grade data to save:', {
      submissionId,
      studentId: student.id,
      gradeKey,
      grade: totalGrade,
      feedback: studentFeedback,
      submissionGrade: student.submission?.grade,
      submissionFeedback: student.submission?.feedback
    });
    
    // Validate that teacher has entered a grade for subjective assignments
    if (assignmentType === 'subjective' && subjectiveQuestions.length > 0 && (totalGrade === null || totalGrade === undefined || totalGrade === '')) {
      console.log('[TeacherAssignmentGrading] Validation failed - no grade entered for subjective questions');
      toast.error('Please enter a grade for the subjective questions');
      return;
    }
    
    // For objective assignments, grade is optional (can use auto-calculated score or override)
    // No validation needed for objective assignments

    try {
      setIsLoading(true);
      console.log('[TeacherAssignmentGrading] Calling gradeSubmission API...');
      
      // Prepare grade data - use grade field for total grade
      const gradeData = {
        grade: totalGrade || 0,
        feedback: studentFeedback,
      };
      
      console.log('[TeacherAssignmentGrading] Grade data payload:', gradeData);
      
      // Optionally set total grade if needed (backend will calculate if not provided)
      // The backend calculates: grade = objectiveScore + subjectiveGrade (or uses provided grade)
      
      await gradeSubmission(assignmentId, submissionId, gradeData);
      console.log('[TeacherAssignmentGrading] Grade saved successfully');
      
      // Refresh data
      console.log('[TeacherAssignmentGrading] Refreshing data after save...');
      await fetchData();
      
      // Success message is handled in the service
    } catch (error) {
      console.error('[TeacherAssignmentGrading] Error saving grade:', error);
      // Error is already handled in the service with toast
    } finally {
      setIsLoading(false);
      console.log('[TeacherAssignmentGrading] Save grade operation completed');
    }
  };

  const calculateObjectiveScore = (submission) => {
    if (!submission) {
      console.log('[TeacherAssignmentGrading] calculateObjectiveScore: No submission provided');
      return 0;
    }
    // Use stored objectiveScore from API (auto-calculated on submission)
    const score = submission.objectiveScore || 0;
    console.log('[TeacherAssignmentGrading] calculateObjectiveScore:', { submissionId: submission._id, score });
    return score;
  };

  const getTotalObjectivePoints = () => {
    return objectiveQuestions.reduce((sum, q) => sum + (q.points || 0), 0);
  };

  if (isLoading || !assignment) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold">{assignment.title}</h1>
            <p className="text-gray-600">Grade student submissions</p>
          </div>
          <button
            onClick={() => {
              // Get courseID from assignment or courseData
              const courseId = assignment?.course || courseData?._id || courseData?.id;
              
              if (courseId) {
                // Navigate back to the course page
                // The CourseManagement component will read from localStorage to restore the section
                navigate(`/teacher/course/${courseId}`);
              } else {
                // Fallback to browser back
                navigate(-1);
              }
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border p-4">
            <div className="mb-4">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2 text-sm">
                <button
                  onClick={() => setSortBy('all')}
                  className={`px-3 py-1 rounded ${sortBy === 'all' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setSortBy('submitted')}
                  className={`px-3 py-1 rounded ${sortBy === 'submitted' ? 'bg-green-100 text-green-600' : 'text-gray-600'}`}
                >
                  Submitted
                </button>
                <button
                  onClick={() => setSortBy('unsubmitted')}
                  className={`px-3 py-1 rounded ${sortBy === 'unsubmitted' ? 'bg-yellow-100 text-yellow-600' : 'text-gray-600'}`}
                >
                  Unsubmitted
                </button>
              </div>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No students found</p>
                  {courseData?.students?.length === 0 && (
                    <p className="text-xs mt-2">No students in course data</p>
                  )}
                </div>
              ) : (
                filteredStudents.map(student => {
                  console.log('[TeacherAssignmentGrading] Rendering student in list:', {
                    id: student.id,
                    name: student.name,
                    status: student.status,
                    hasGrade: student.hasGrade
                  });
                  
                  return (
                    <div
                      key={student.id}
                      onClick={() => {
                        console.log('[TeacherAssignmentGrading] Student selected:', {
                          id: student.id,
                          name: student.name,
                          hasSubmission: !!student.submission
                        });
                        setSelectedStudent(student);
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedStudent?.id === student.id
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.rollNo}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {student.status === 'submitted' ? (
                            <CheckCircle2 size={16} className="text-green-600" />
                          ) : (
                            <XCircle size={16} className="text-red-500" />
                          )}
                          {student.hasGrade && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Graded
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Grading Area */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-6">
            {assignment.isUngraded && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <XCircle size={20} />
                  <div>
                    <p className="font-medium">This assignment is ungraded</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      This assignment is for practice only and cannot be scored or graded.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {!selectedStudent ? (
              <div className="text-center py-12 text-gray-500">
                Select a student to view their submission
              </div>
            ) : assignmentType === 'subjective' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedStudent.name}</h2>
                    <p className="text-sm text-gray-600">{selectedStudent.rollNo}</p>
                  </div>
                  {selectedStudent.submission && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Submitted
                    </span>
                  )}
                </div>

                {!selectedStudent.submission ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <XCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-600">Student has not submitted the assignment</p>
                  </div>
                ) : (
                  <>
                    {/* Tabs Section - Show if submission file exists */}
                    {selectedStudent.submission.submissionFile && (
                      <div className="border-b border-gray-200 mb-4">
                        <nav className="flex space-x-1" aria-label="Tabs">
                          <button
                            onClick={() => setActiveTab('answers')}
                            className={`px-4 py-3 text-sm font-medium transition-colors ${
                              activeTab === 'answers'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            Answers
                          </button>
                          <button
                            onClick={() => setActiveTab('file')}
                            className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                              activeTab === 'file'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <Paperclip className="h-4 w-4" />
                            Submission File
                          </button>
                        </nav>
                      </div>
                    )}

                    {/* Submission File Tab */}
                    {activeTab === 'file' && selectedStudent.submission.submissionFile && (
                      <div className="bg-white rounded-lg shadow-sm border" style={{ height: 'calc(100vh - 400px)', minHeight: '500px' }}>
                        <div className="flex flex-col h-full">
                          {/* File Info Header */}
                          <div className="border-b border-gray-200 p-4 bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="text-blue-600" size={20} />
                                <div>
                                  <span className="font-medium text-gray-900">
                                    {selectedStudent.submission.submissionFile.split('/').pop()}
                                  </span>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Submitted on: {new Date(selectedStudent.submission.submissionDate).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <a
                                href={selectedStudent.submission.submissionFile}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-50"
                              >
                                <Download size={16} />
                                Download
                              </a>
                            </div>
                          </div>

                          {/* File Viewer */}
                          <div className="flex-1 relative overflow-hidden">
                            {(() => {
                              const fileUrl = selectedStudent.submission.submissionFile;
                              const fileName = fileUrl.split('/').pop();
                              return renderFileViewer(fileUrl, fileName, true);
                            })()}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Answers Tab */}
                    {activeTab === 'answers' && (
                      <div className="space-y-6">

                    {subjectiveQuestions.map((q, index) => {
                      const answer = selectedStudent.submission.answers?.subjective?.[q._id] || '';
                      return (
                        <div key={q._id} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded font-medium">
                              Q{index + 1}
                            </span>
                            <span className="text-sm text-gray-500">{q.points || 20} points</span>
                          </div>
                          <p className="font-medium text-gray-900 mb-3">{q.question}</p>
                          <div className="bg-gray-50 rounded-lg p-4 mb-3">
                            {answer ? (
                              <p className="text-gray-700 whitespace-pre-wrap">{answer}</p>
                            ) : selectedStudent.submission?.submissionFile ? (
                              <p className="text-blue-600 font-medium italic">Please view submitted file</p>
                            ) : (
                              <p className="text-gray-700">No answer provided</p>
                            )}
                          </div>
                          {!assignment.isUngraded ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                placeholder="Points"
                                min="0"
                                max={q.points || 20}
                                value={grades[`${selectedStudent.id}_${q._id}`] || ''}
                                onChange={(e) => setGrades(prev => ({
                                  ...prev,
                                  [`${selectedStudent.id}_${q._id}`]: e.target.value ? parseFloat(e.target.value) : null
                                }))}
                                className="w-20 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-500">/ {q.points || 20}</span>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">Ungraded assignment - no scoring</p>
                          )}
                        </div>
                      );
                    })}

                    <div className="border-t pt-4">
                      {/* Show Objective Score if available */}
                      {objectiveQuestions.length > 0 && selectedStudent.submission && (
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="block text-sm font-medium text-blue-900 mb-1">
                                Auto-Calculated Objective Score
                              </label>
                              <p className="text-xs text-blue-700">
                                This score is automatically calculated from MCQ answers
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">
                                {calculateObjectiveScore(selectedStudent.submission) || 0}
                              </div>
                              <div className="text-sm text-blue-600">
                                / {selectedStudent.submission.totalObjectivePoints || getTotalObjectivePoints()}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {!assignment.isUngraded ? (
                        <>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Total Grade
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                placeholder="Total grade"
                                min="0"
                                max={assignment.totalPoints}
                                value={grades[getGradeKey(selectedStudent)] || selectedStudent.submission?.grade || ''}
                                onChange={(e) => handleGradeChange(getGradeKey(selectedStudent), e.target.value)}
                                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-500">
                                / {assignment.totalPoints}
                              </span>
                            </div>
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Feedback
                            </label>
                            <textarea
                              value={feedback[getGradeKey(selectedStudent)] || selectedStudent.submission?.feedback || ''}
                              onChange={(e) => handleFeedbackChange(getGradeKey(selectedStudent), e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              rows="4"
                              placeholder="Add feedback for the student..."
                            />
                          </div>
                          <button
                            onClick={() => handleSaveGrade(selectedStudent)}
                            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                          >
                            Save Grade
                          </button>
                        </>
                      ) : (
                        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-600">
                            This assignment is ungraded. You can still provide feedback to students, but no scores will be recorded.
                          </p>
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Feedback (Optional)
                            </label>
                            <textarea
                              value={feedback[getGradeKey(selectedStudent)] || selectedStudent.submission?.feedback || ''}
                              onChange={(e) => handleFeedbackChange(getGradeKey(selectedStudent), e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              rows="4"
                              placeholder="Add feedback for the student..."
                            />
                          </div>
                        </div>
                      )}
                    </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : assignmentType === 'objective' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedStudent.name}</h2>
                    <p className="text-sm text-gray-600">{selectedStudent.rollNo}</p>
                  </div>
                  {selectedStudent.submission && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {calculateObjectiveScore(selectedStudent.submission) || 0}
                      </div>
                      <div className="text-sm text-gray-500">
                        / {selectedStudent.submission.totalObjectivePoints || getTotalObjectivePoints()} points
                      </div>
                      {selectedStudent.submission.objectiveScore !== undefined && (
                        <div className="text-xs text-green-600 mt-1">
                          (Auto-calculated)
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {!selectedStudent.submission ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <XCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-600">Student has not submitted the assignment</p>
                  </div>
                ) : (
                  <>
                    {/* Tabs Section - Show if submission file exists */}
                    {selectedStudent.submission.submissionFile && (
                      <div className="border-b border-gray-200 mb-4">
                        <nav className="flex space-x-1" aria-label="Tabs">
                          <button
                            onClick={() => setActiveTab('answers')}
                            className={`px-4 py-3 text-sm font-medium transition-colors ${
                              activeTab === 'answers'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            Answers
                          </button>
                          <button
                            onClick={() => setActiveTab('file')}
                            className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                              activeTab === 'file'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <Paperclip className="h-4 w-4" />
                            Submission File
                          </button>
                        </nav>
                      </div>
                    )}

                    {/* Submission File Tab */}
                    {activeTab === 'file' && selectedStudent.submission.submissionFile && (
                      <div className="bg-white rounded-lg shadow-sm border mb-6" style={{ height: 'calc(100vh - 400px)', minHeight: '500px' }}>
                        <div className="flex flex-col h-full">
                          {/* File Info Header */}
                          <div className="border-b border-gray-200 p-4 bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileText className="text-blue-600" size={20} />
                                <div>
                                  <span className="font-medium text-gray-900">
                                    {selectedStudent.submission.submissionFile.split('/').pop()}
                                  </span>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Submitted on: {new Date(selectedStudent.submission.submissionDate).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <a
                                href={selectedStudent.submission.submissionFile}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-50"
                              >
                                <Download size={16} />
                                Download
                              </a>
                            </div>
                          </div>

                          {/* File Viewer */}
                          <div className="flex-1 relative overflow-hidden">
                            {(() => {
                              const fileUrl = selectedStudent.submission.submissionFile;
                              const fileName = fileUrl.split('/').pop();
                              return renderFileViewer(fileUrl, fileName, true);
                            })()}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Answers Tab */}
                    {activeTab === 'answers' && (
                      <div className="space-y-6">
                      <div className="space-y-4">
                      {objectiveQuestions.map((q, index) => {
                        const qId = q._id || q.id;
                        const studentAnswer = selectedStudent.submission.answers?.objective?.[qId];
                        const isCorrect = studentAnswer === q.correctAnswer;
                        
                        return (
                          <div
                            key={q._id}
                            className={`border rounded-lg p-4 ${
                              isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded font-medium">
                                Q{index + 1}
                              </span>
                              <span className="text-sm text-gray-500">{q.points || 10} points</span>
                              {isCorrect ? (
                                <span className="ml-auto px-2 py-1 bg-green-200 text-green-800 rounded text-xs font-medium">
                                  Correct
                                </span>
                              ) : (
                                <span className="ml-auto px-2 py-1 bg-red-200 text-red-800 rounded text-xs font-medium">
                                  Incorrect
                                </span>
                              )}
                            </div>
                            <p className="font-medium text-gray-900 mb-3">{q.question}</p>
                            <div className="space-y-2">
                              {q.options?.map((option, optIndex) => {
                                const isSelected = studentAnswer === option;
                                const isCorrectOption = q.correctAnswer === option;
                                
                                return (
                                  <div
                                    key={optIndex}
                                    className={`p-3 rounded-lg border ${
                                      isCorrectOption
                                        ? 'bg-green-100 border-green-300'
                                        : isSelected
                                        ? 'bg-red-100 border-red-300'
                                        : 'bg-gray-50 border-gray-200'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">
                                        {String.fromCharCode(65 + optIndex)}.
                                      </span>
                                      <span>{option}</span>
                                      {isCorrectOption && (
                                        <CheckCircle2 className="ml-auto text-green-600" size={16} />
                                      )}
                                      {isSelected && !isCorrectOption && (
                                        <XCircle className="ml-auto text-red-600" size={16} />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="mt-3 text-sm">
                              <span className="text-gray-600">Student Answer: </span>
                              <span className={`font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                {studentAnswer || 'Not answered'}
                              </span>
                              {!isCorrect && (
                                <>
                                  <span className="text-gray-600 ml-3">Correct Answer: </span>
                                  <span className="font-medium text-green-600">{q.correctAnswer}</span>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      </div>

                      <div className="border-t pt-4">
                      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="block text-sm font-medium text-blue-900 mb-1">
                              Auto-Calculated Objective Score
                            </label>
                            <p className="text-xs text-blue-700">
                              This score is automatically calculated from MCQ answers
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              {calculateObjectiveScore(selectedStudent.submission) || 0}
                            </div>
                            <div className="text-sm text-blue-600">
                              / {selectedStudent.submission.totalObjectivePoints || getTotalObjectivePoints()}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Grade
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="Total grade"
                            min="0"
                            max={assignment.totalPoints}
                            value={grades[getGradeKey(selectedStudent)] || selectedStudent.submission?.grade || ''}
                            onChange={(e) => handleGradeChange(getGradeKey(selectedStudent), e.target.value)}
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-500">
                            / {assignment.totalPoints}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Feedback
                        </label>
                        <textarea
                          value={feedback[getGradeKey(selectedStudent)] || selectedStudent.submission?.feedback || ''}
                          onChange={(e) => handleFeedbackChange(getGradeKey(selectedStudent), e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          rows="4"
                          placeholder="Add feedback for the student..."
                        />
                      </div>
                      <button
                        onClick={() => handleSaveGrade(selectedStudent)}
                        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                      >
                        Save Grade
                      </button>
                      </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && selectedStudent?.submission?.submissionFile && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">
                {selectedStudent.submission.submissionFile.split('/').pop()}
              </h3>
              <span className="text-sm text-gray-300">
                {selectedStudent.name} - {selectedStudent.rollNo}
              </span>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Exit Fullscreen (Esc)"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Fullscreen Viewer */}
          <div className="flex-1 overflow-auto">
            {renderFileViewer(
              selectedStudent.submission.submissionFile,
              selectedStudent.submission.submissionFile.split('/').pop(),
              false
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAssignmentGrading;

