import api from "./api";

/**
 * Fetch aggregated timetable for the logged-in teacher or student.
 * Returns all class entries across enrolled/assigned courses for the given week.
 *
 * @param {string} [from] - ISO date string for window start (default: current week Monday)
 * @param {string} [to]   - ISO date string for window end   (default: current week Sunday)
 * @returns {{ entries: Array, weekStart: string, weekEnd: string }}
 */
export const getMyTimetable = async (from, to) => {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  const response = await api.get("/meetings/my-timetable", { params });
  return response.data;
};
