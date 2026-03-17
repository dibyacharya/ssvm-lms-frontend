/**
 * Calculate attendance for a specific student across all courses
 * @param {string} studentId - The student ID to check attendance for
 * @param {Array} coursesData - The array of course data objects
 * @returns {Object} - The attendance statistics for the student
 */
function calculateAttendance(studentId, coursesData) {
  // Create result object structure
  const result = {
    studentId,
    attendanceByCourse: {},
    overall: {
      totalSessions: 0,
      presentCount: 0,
      attendancePercentage: 0,
    },
  };

  // Track overall counts
  let totalSessionsCount = 0;
  let totalPresentCount = 0;

  // Process each course
  coursesData.forEach((course) => {
    const courseName = course.title;
    const attendance = course.attendance; // This can be undefined

    // Initialize course statistics
    result.attendanceByCourse[courseName] = {
      totalSessions: 0,
      presentCount: 0,
      attendancePercentage: 0,
      sessionDates: [],
    };

    // Process attendance only if it exists for the course
    if (attendance && typeof attendance === 'object') {
      // Build current timestamp key for comparison (filter out future sessions)
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const nowTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const nowKey = `${todayStr}_${nowTimeStr}`;

      // Count only non-empty, past sessions
      Object.entries(attendance).forEach(([sessionKey, students]) => {
        // Skip future sessions
        if (sessionKey > nowKey) return;
        // The 'students' array can be null or not an array, so check it
        if (Array.isArray(students) && students.length > 0) {
          // This is a valid session with at least one student present
          result.attendanceByCourse[courseName].totalSessions++;
          totalSessionsCount++;

          // Check if this student was present
          if (students.includes(studentId)) {
            result.attendanceByCourse[courseName].presentCount++;
            totalPresentCount++;

            // Add this date to the list of dates attended
            const dateValue = sessionKey.split("_")[0]; // Extract date part
            result.attendanceByCourse[courseName].sessionDates.push(dateValue);
          }
        }
      });

      // Calculate percentage for this course
      const sessionCount = result.attendanceByCourse[courseName].totalSessions;
      if (sessionCount > 0) {
        result.attendanceByCourse[courseName].attendancePercentage = (
          (result.attendanceByCourse[courseName].presentCount / sessionCount) *
          100
        ).toFixed(2);
      }
    }
  });

  // Calculate overall attendance percentage
  if (totalSessionsCount > 0) {
    result.overall.totalSessions = totalSessionsCount;
    result.overall.presentCount = totalPresentCount;
    result.overall.attendancePercentage = (
      (totalPresentCount / totalSessionsCount) *
      100
    ).toFixed(2);
  }

  return result;
}

export default calculateAttendance;