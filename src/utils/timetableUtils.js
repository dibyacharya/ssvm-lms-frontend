/**
 * Client-side timetable utilities for LMS teacher / student views.
 * Subset of helpers copied from admin frontend timetableUtils.js.
 */

const WEEKDAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const WEEKDAY_LABELS = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const WEEKDAY_SHORT = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

/**
 * Get the day-of-week key ('monday', 'tuesday', ...) for a given Date.
 */
export const getDayOfWeekKey = (dateValue) => {
  const d = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "";
  return WEEKDAY_KEYS[d.getDay()] || "";
};

/**
 * Day key → 'Monday'
 */
export const getDayLabel = (dayKey) => WEEKDAY_LABELS[dayKey] || dayKey;

/**
 * Day key → 'Mon'
 */
export const getDayShortLabel = (dayKey) => WEEKDAY_SHORT[dayKey] || dayKey;

/**
 * Format date to 'YYYY-MM-DD'.
 */
export const formatDateKey = (dateValue) => {
  if (!dateValue) return "";
  const d = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Format date for display: 'Mar 6'
 */
export const formatDateDisplay = (dateValue) => {
  if (!dateValue) return "";
  const d = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "";
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[d.getMonth()]} ${d.getDate()}`;
};

/**
 * Get the Monday of the week containing the given date.
 */
export const getWeekStartMonday = (dateValue) => {
  const d = dateValue instanceof Date ? new Date(dateValue) : new Date(dateValue);
  if (Number.isNaN(d.getTime())) return null;
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get the 7 dates (Mon–Sun) starting from a given Monday.
 */
export const getWeekDates = (mondayDate) => {
  const start = mondayDate instanceof Date ? new Date(mondayDate) : new Date(mondayDate);
  if (Number.isNaN(start.getTime())) return [];
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    d.setHours(0, 0, 0, 0);
    dates.push(d);
  }
  return dates;
};

/**
 * Format time from Date to 'HH:MM AM/PM'.
 */
export const formatTime = (dateValue) => {
  if (!dateValue) return "";
  const d = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "";
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
};

/**
 * Deterministic color palette for courses.
 * Takes a string (courseCode) and returns a tailwind-friendly color config.
 */
const COURSE_COLORS = [
  { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-800 dark:text-blue-300", border: "border-blue-300 dark:border-blue-700", dot: "bg-blue-500" },
  { bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-800 dark:text-purple-300", border: "border-purple-300 dark:border-purple-700", dot: "bg-purple-500" },
  { bg: "bg-green-100 dark:bg-green-900/40", text: "text-green-800 dark:text-green-300", border: "border-green-300 dark:border-green-700", dot: "bg-green-500" },
  { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-800 dark:text-orange-300", border: "border-orange-300 dark:border-orange-700", dot: "bg-orange-500" },
  { bg: "bg-pink-100 dark:bg-pink-900/40", text: "text-pink-800 dark:text-pink-300", border: "border-pink-300 dark:border-pink-700", dot: "bg-pink-500" },
  { bg: "bg-teal-100 dark:bg-teal-900/40", text: "text-teal-800 dark:text-teal-300", border: "border-teal-300 dark:border-teal-700", dot: "bg-teal-500" },
  { bg: "bg-indigo-100 dark:bg-indigo-900/40", text: "text-indigo-800 dark:text-indigo-300", border: "border-indigo-300 dark:border-indigo-700", dot: "bg-indigo-500" },
  { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-800 dark:text-amber-300", border: "border-amber-300 dark:border-amber-700", dot: "bg-amber-500" },
  { bg: "bg-cyan-100 dark:bg-cyan-900/40", text: "text-cyan-800 dark:text-cyan-300", border: "border-cyan-300 dark:border-cyan-700", dot: "bg-cyan-500" },
  { bg: "bg-rose-100 dark:bg-rose-900/40", text: "text-rose-800 dark:text-rose-300", border: "border-rose-300 dark:border-rose-700", dot: "bg-rose-500" },
];

export const getCourseColor = (courseCode) => {
  if (!courseCode) return COURSE_COLORS[0];
  let hash = 0;
  for (let i = 0; i < courseCode.length; i++) {
    hash = (hash * 31 + courseCode.charCodeAt(i)) | 0;
  }
  return COURSE_COLORS[Math.abs(hash) % COURSE_COLORS.length];
};
