import api from "./api";

// Types in comments for reference only (not enforced at runtime)
// type MeetingStatus = "upcoming" | "live" | "ended" | "cancelled";
// type MeetingProvider = "gmeet" | "zoom" | "teams" | "other";
// type MeetingInstance = {
//   _id: string;
//   course: string;
//   title: string;
//   description?: string;
//   start: string;
//   end: string;
//   timezone: string;
//   link: string;
//   provider: MeetingProvider;
//   createdBy: string;
//   isRecurring: boolean;
//   recurrenceRule?: string | null;
//   recurrenceEndDate?: string | null;
//   recurrenceExceptions?: string[];
//   instanceOverrides?: Array<{
//     date: string;
//     isCancelled?: boolean;
//     start?: string;
//     end?: string;
//   }>;
//   isCancelled: boolean;
//   status: MeetingStatus;
//   roomNumber?: string;
//   color?: string;
//   createdAt: string;
//   updatedAt: string;
//   instanceStart: string;
//   instanceEnd: string;
//   instanceId: string;
// };

/**
 * Fetch expanded meeting instances for a given course and optional time window.
 *
 * @param {string} courseId
 * @param {{ from?: string; to?: string }} [options]
 */
export const getCourseMeetings = async (courseId, options = {}) => {
  const params = {
    courseId,
    ...(options.from ? { from: options.from } : {}),
    ...(options.to ? { to: options.to } : {}),
  };

  const response = await api.get("/meetings", { params });
  return response.data;
};

/**
 * Create a new meeting (series-level).
 * Body should follow the backend spec; caller is responsible for converting
 * local datetime values to UTC ISO strings and including timezone.
 *
 * @param {Object} meetingData
 */
export const createMeeting = async (meetingData) => {
  const response = await api.post("/meetings", meetingData);
  return response.data;
};

/**
 * Update an existing meeting (series-level).
 *
 * @param {string} meetingId
 * @param {Object} updateData
 */
export const updateMeeting = async (meetingId, updateData) => {
  const response = await api.put(`/meetings/${meetingId}`, updateData);
  return response.data;
};

/**
 * Soft-cancel a meeting/series.
 *
 * @param {string} meetingId
 */
export const cancelMeeting = async (meetingId) => {
  const response = await api.post(`/meetings/${meetingId}/cancel`);
  return response.data;
};

/**
 * Hard-delete a meeting/series.
 *
 * @param {string} meetingId
 */
export const deleteMeeting = async (meetingId) => {
  const response = await api.delete(`/meetings/${meetingId}`);
  return response.data;
};



