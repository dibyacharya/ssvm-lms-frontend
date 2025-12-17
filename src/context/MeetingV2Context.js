import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import {
  getCourseMeetings,
  createMeeting as apiCreateMeeting,
  updateMeeting as apiUpdateMeeting,
  cancelMeeting as apiCancelMeeting,
  deleteMeeting as apiDeleteMeeting,
} from "../services/meeting.service";

// Simple toast-free context; UI layers can add toasts based on error strings.

const MeetingV2Context = createContext(null);

export const MeetingV2Provider = ({ children }) => {
  const [meetingsByCourse, setMeetingsByCourse] = useState({});
  const [loadingByCourse, setLoadingByCourse] = useState({});
  const [errorByCourse, setErrorByCourse] = useState({});
  
  // Track ongoing fetches to prevent recursion/duplicate calls
  const fetchingRef = useRef(new Set());

  const setCourseState = useCallback((courseId, { meetings, loading, error }) => {
    if (meetings !== undefined) {
      setMeetingsByCourse((prev) => ({ ...prev, [courseId]: meetings }));
    }
    if (loading !== undefined) {
      setLoadingByCourse((prev) => ({ ...prev, [courseId]: loading }));
    }
    if (error !== undefined) {
      setErrorByCourse((prev) => ({ ...prev, [courseId]: error }));
    }
  }, []);

  const fetchMeetingsForCourse = useCallback(
    async (courseId, options) => {
      if (!courseId) return;
      
      // Prevent concurrent fetches for the same course
      if (fetchingRef.current.has(courseId)) {
        // Already fetching, return empty array to avoid recursion
        return [];
      }
      
      fetchingRef.current.add(courseId);
      setCourseState(courseId, { loading: true, error: null });
      
      try {
        const data = await getCourseMeetings(courseId, options);
        setCourseState(courseId, { meetings: data, loading: false, error: null });
        return data;
      } catch (err) {
        const message =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load meetings.";
        setCourseState(courseId, { loading: false, error: message });
        throw err;
      } finally {
        fetchingRef.current.delete(courseId);
      }
    },
    [setCourseState]
  );

  const createMeeting = useCallback(
    async (payload) => {
      const { courseId } = payload || {};
      const created = await apiCreateMeeting(payload);
      if (courseId) {
        // Refresh instances for this course after create
        await fetchMeetingsForCourse(courseId);
      }
      return created;
    },
    [fetchMeetingsForCourse]
  );

  const updateMeeting = useCallback(
    async (meetingId, payload, courseId) => {
      const updated = await apiUpdateMeeting(meetingId, payload);
      const targetCourse = courseId || updated.course || payload.courseId;
      if (targetCourse) {
        await fetchMeetingsForCourse(targetCourse);
      }
      return updated;
    },
    [fetchMeetingsForCourse]
  );

  const cancelMeeting = useCallback(
    async (meetingId, courseId) => {
      const updated = await apiCancelMeeting(meetingId);
      const targetCourse = courseId || updated.course;
      if (targetCourse) {
        await fetchMeetingsForCourse(targetCourse);
      }
      return updated;
    },
    [fetchMeetingsForCourse]
  );

  const deleteMeeting = useCallback(
    async (meetingId, courseId) => {
      await apiDeleteMeeting(meetingId);
      if (courseId) {
        await fetchMeetingsForCourse(courseId);
      }
    },
    [fetchMeetingsForCourse]
  );

  const getMeetingsForCourse = useCallback(
    (courseId) => meetingsByCourse[courseId] || [],
    [meetingsByCourse]
  );

  const value = {
    meetingsByCourse,
    loadingByCourse,
    errorByCourse,
    fetchMeetingsForCourse,
    createMeeting,
    updateMeeting,
    cancelMeeting,
    deleteMeeting,
    getMeetingsForCourse,
  };

  return <MeetingV2Context.Provider value={value}>{children}</MeetingV2Context.Provider>;
};

export const useMeetingsV2 = () => {
  const ctx = useContext(MeetingV2Context);
  if (!ctx) {
    throw new Error("useMeetingsV2 must be used within a MeetingV2Provider");
  }
  return ctx;
};


