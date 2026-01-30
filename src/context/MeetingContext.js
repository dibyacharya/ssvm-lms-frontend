import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext'; // To get the logged-in user
import { getAllCourses, getAllStudentCourses } from '../services/course.service'; // Import course services

// API URL - Use runtime config with fallback
const API_URL =
  (typeof window !== 'undefined' && window.RUNTIME_CONFIG && window.RUNTIME_CONFIG.BACKEND_URL)
    ? `${window.RUNTIME_CONFIG.BACKEND_URL}/meetings`
    : 'https://meeting-backend-theta.vercel.app/api/meetings';

const DEBUG = (typeof window !== 'undefined' && window.RUNTIME_CONFIG && window.RUNTIME_CONFIG.DEBUG_AUTH) || false;

// 1. Create the Context
const MeetingContext = createContext();

// 2. Create the Provider Component
export const MeetingProvider = ({ children }) => {
  const { user } = useAuth(); // Access user data
  const [meetings, setMeetings] = useState([]);
  const [userCourses, setUserCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user's courses based on their role
  const fetchUserCourses = useCallback(async () => {
    console.log(user);
    if (!user?._id || !user?.role) return;
    
    try {
      let courses = [];
      if (user.role === 'teacher') {
        courses = await getAllCourses(); // Teacher gets all courses they teach
      } else if (user.role === 'student') {
        courses = await getAllStudentCourses(); // Student gets enrolled courses
      }
      console.log(courses);
      setUserCourses(courses);
      return courses;
    } catch (err) {
      console.error('Error fetching user courses:', err);
      setError('Failed to fetch courses');
      return [];
    }
  }, [user?._id, user?.role]);

  // Fetch meetings for the user's courses
  const fetchMeetings = useCallback(async () => {
    if (!user?._id || !user?.role) return;
    
    setLoading(true);
    try {
      // First, get user's courses
      const courses = await fetchUserCourses();
      if (courses.length === 0) {
        setMeetings([]);
        setLoading(false);
        return;
      }

      // Get course IDs
     
      const courseIds = courses.courses.map(course => course._id);

      // Fetch all meetings
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch meetings');
      
      const allMeetings = await response.json();
      
      // Filter meetings based on courseIds
      console.log(allMeetings)
      const userMeetings = allMeetings.filter(meeting => 
        courseIds.includes(meeting.courseId)
      );
      
      setMeetings(userMeetings);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching meetings:', err);
    } finally {
      setLoading(false);
    }
  }, [user?._id, user?.role, fetchUserCourses]);

  // Run fetchMeetings when the component mounts or user changes
  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // Create a new meeting (only for teachers)
  const createMeeting = async (meetingData) => {
    if (user?.role !== 'teacher') {
      setError('Only teachers can create meetings');
      return false;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...meetingData,
          createdBy: user._id, // Track who created the meeting
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create meeting');
      
      await fetchMeetings(); // Refresh the list
      return true; // Indicate success
    } catch (err) {
      setError(err.message);
      return false; // Indicate failure
    }
  };

  // Update an existing meeting (only for teachers who created it)
  const updateMeeting = async (id, updateData) => {
    if (user?.role !== 'teacher') {
      setError('Only teachers can update meetings');
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) throw new Error('Failed to update meeting');
      
      await fetchMeetings(); // Refresh the list
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Delete a meeting (only for teachers who created it)
  const deleteMeeting = async (id) => {
    if (user?.role !== 'teacher') {
      setError('Only teachers can delete meetings');
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete meeting');
      
      await fetchMeetings(); // Refresh the list
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Get meetings for a specific course
  const getMeetingsByCourse = useCallback((courseId) => {
    return meetings.filter(meeting => meeting.courseId === courseId);
  }, [meetings]);

  // Check if user can manage meetings (create/edit/delete)
  const canManageMeetings = user?.role === 'teacher';

  // 3. Define the value to be passed to consumers
  const value = {
    meetings,
    userCourses,
    loading,
    error,
    fetchMeetings,
    createMeeting,
    updateMeeting,
    deleteMeeting,
    getMeetingsByCourse,
    canManageMeetings,
  };

  return (
    <MeetingContext.Provider value={value}>
      {children}
    </MeetingContext.Provider>
  );
};

// 4. Create a custom hook for easy consumption
export const useMeeting = () => {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error('useMeeting must be used within a MeetingProvider');
  }
  return context;
};