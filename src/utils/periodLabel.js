/**
 * Returns a human-readable label for a period type.
 * @param {string} periodType - One of: "semester", "term", "month", "week", "days"
 * @returns {string} Capitalized label (e.g., "Semester", "Term", "Month", "Week")
 */
export const getPeriodLabel = (periodType) => {
  if (!periodType) return "Semester";
  const labels = {
    semester: "Semester",
    term: "Term",
    month: "Month",
    week: "Week",
    days: "Day",
  };
  return labels[periodType.toLowerCase()] || periodType.charAt(0).toUpperCase() + periodType.slice(1);
};

/**
 * Returns the mid-period exam label based on period type.
 * E.g., "Mid-Semester Exam", "Mid-Term Exam", "Mid-Month Assessment"
 */
export const getMidExamLabel = (periodType) => {
  const labels = {
    semester: "Mid-Semester Exam",
    term: "Mid-Term Exam",
    month: "Mid-Month Assessment",
    week: "Mid-Week Assessment",
    days: "Mid Assessment",
  };
  return labels[periodType?.toLowerCase()] || "Mid-Term Exam";
};

/**
 * Returns the end-period exam label based on period type.
 * E.g., "End-Semester Exam", "End-Term Exam", "End-Month Assessment"
 */
export const getEndExamLabel = (periodType) => {
  const labels = {
    semester: "End-Semester Exam",
    term: "End-Term Exam",
    month: "End-Month Assessment",
    week: "End-Week Assessment",
    days: "End Assessment",
  };
  return labels[periodType?.toLowerCase()] || "End-Term Exam";
};

/**
 * Returns short mid/end labels (without "Exam"/"Assessment").
 * E.g., "Mid Term", "End Term"
 */
export const getMidExamShort = (periodType) => {
  const label = getPeriodLabel(periodType);
  return `Mid ${label}`;
};

export const getEndExamShort = (periodType) => {
  const label = getPeriodLabel(periodType);
  return `End ${label}`;
};
