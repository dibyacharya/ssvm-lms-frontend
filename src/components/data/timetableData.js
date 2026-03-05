/**
 * Timetable Data for Multiple Semesters
 * This file contains the weekly class schedule for different semesters.
 * Structure: Array of semester timetable objects
 */
import { getPeriodLabel } from '../../utils/periodLabel';

// Subject color mapping for calendar visualization (common across all semesters)
export const subjectColors = {
  // Semester 4 colors
  QSEC: '#4CAF50',      // Green
  CSRM: '#2196F3',      // Blue
  IE: '#FF9800',        // Orange
  PCT: '#9C27B0',       // Purple
  'Lab-CAC': '#F44336', // Red
  // Semester 2 colors
  SMH: '#4CAF50',       // Green
  SSCT: '#2196F3',      // Blue
  CPCM: '#9C27B0',      // Purple
  MOS: '#FF9800',       // Orange
  'Smart Surveying': '#F44336', // Red
  // Semester 6 colors
  SD: '#4CAF50',        // Green
  EE: '#2196F3',        // Blue
  FRRS: '#9C27B0',      // Purple
  'Minor Project': '#FF9800' // Orange
};

/**
 * Semester Timetable Data Structure
 * Each semester has its own weekday and weekend schedule
 */
export const semesterTimetables = [
  // Semester 2 Timetable
  {
    semester: 2,
    weekdayTimetable: [
      {
        day: 'Monday',
        slots: [
          {
            subject: 'SMH',
            startTime: '17:30', // 5:30 PM
            endTime: '18:30',   // 6:30 PM
            color: subjectColors.SMH
          },
          {
            subject: 'SSCT',
            startTime: '18:30', // 6:30 PM
            endTime: '19:30',   // 7:30 PM
            color: subjectColors.SSCT
          }
        ]
      },
      {
        day: 'Tuesday',
        slots: [
          {
            subject: 'SSCT',
            startTime: '17:30',
            endTime: '18:30',
            color: subjectColors.SSCT
          },
          {
            subject: 'SMH',
            startTime: '18:30',
            endTime: '19:30',
            color: subjectColors.SMH
          }
        ]
      },
      {
        day: 'Wednesday',
        slots: [
          {
            subject: 'CPCM',
            startTime: '17:30',
            endTime: '18:30',
            color: subjectColors.CPCM
          },
          {
            subject: 'CPCM',
            startTime: '18:30',
            endTime: '19:30',
            color: subjectColors.CPCM
          }
        ]
      },
      {
        day: 'Thursday',
        slots: [
          {
            subject: 'MOS',
            startTime: '17:30',
            endTime: '18:30',
            color: subjectColors.MOS
          },
          {
            subject: 'MOS',
            startTime: '18:30',
            endTime: '19:30',
            color: subjectColors.MOS
          }
        ]
      },
      {
        day: 'Friday',
        slots: [
          {
            subject: 'SSCT',
            startTime: '17:30',
            endTime: '18:30',
            color: subjectColors.SSCT
          },
          {
            subject: 'Smart Surveying',
            startTime: '18:30',
            endTime: '19:30',
            color: subjectColors['Smart Surveying']
          }
        ]
      }
    ],
    weekendTimetable: [
      {
        day: 'Saturday',
        slots: [
          {
            subject: 'SMH',
            startTime: '13:30', // 1:30 PM
            endTime: '14:30',   // 2:30 PM
            color: subjectColors.SMH
          },
          {
            subject: 'SMH',
            startTime: '14:30', // 2:30 PM
            endTime: '15:30',   // 3:30 PM
            color: subjectColors.SMH
          },
          {
            subject: 'MOS',
            startTime: '15:30', // 3:30 PM
            endTime: '16:30',   // 4:30 PM
            color: subjectColors.MOS
          },
          {
            subject: 'MOS',
            startTime: '16:30', // 4:30 PM
            endTime: '17:30',   // 5:30 PM
            color: subjectColors.MOS
          },
          {
            subject: 'SSCT',
            startTime: '17:30', // 5:30 PM
            endTime: '18:30',   // 6:30 PM
            color: subjectColors.SSCT
          },
          {
            subject: 'CPCM',
            startTime: '18:30', // 6:30 PM
            endTime: '19:30',   // 7:30 PM
            color: subjectColors.CPCM
          },
          {
            subject: 'CPCM',
            startTime: '19:30', // 7:30 PM
            endTime: '20:30',   // 8:30 PM
            color: subjectColors.CPCM
          }
        ]
      }
    ]
  },
  
  // Semester 4 Timetable
  {
    semester: 4,
    weekdayTimetable: [
      {
        day: 'Monday',
        slots: [
          {
            subject: 'QSEC',
            startTime: '17:30', // 5:30 PM
            endTime: '18:30',   // 6:30 PM
            color: subjectColors.QSEC
          },
          {
            subject: 'CSRM',
            startTime: '18:30', // 6:30 PM
            endTime: '19:30',   // 7:30 PM
            color: subjectColors.CSRM
          }
        ]
      },
      {
        day: 'Tuesday',
        slots: [
          {
            subject: 'IE',
            startTime: '17:30',
            endTime: '18:30',
            color: subjectColors.IE
          },
          {
            subject: 'CSRM',
            startTime: '18:30',
            endTime: '19:30',
            color: subjectColors.CSRM
          }
        ]
      },
      {
        day: 'Wednesday',
        slots: [
          {
            subject: 'QSEC',
            startTime: '17:30',
            endTime: '18:30',
            color: subjectColors.QSEC
          },
          {
            subject: 'PCT',
            startTime: '18:30',
            endTime: '19:30',
            color: subjectColors.PCT
          }
        ]
      },
      {
        day: 'Thursday',
        slots: [
          {
            subject: 'PCT',
            startTime: '17:30',
            endTime: '18:30',
            color: subjectColors.PCT
          },
          {
            subject: 'IE',
            startTime: '18:30',
            endTime: '19:30',
            color: subjectColors.IE
          }
        ]
      },
      {
        day: 'Friday',
        slots: [
          {
            subject: 'Lab-CAC',
            startTime: '17:30',
            endTime: '18:30',
            color: subjectColors['Lab-CAC']
          },
          {
            subject: 'IE',
            startTime: '18:30',
            endTime: '19:30',
            color: subjectColors.IE
          }
        ]
      }
    ],
    weekendTimetable: [
      {
        day: 'Saturday',
        slots: [
          {
            subject: 'CSRM',
            startTime: '13:30', // 1:30 PM
            endTime: '14:30',   // 2:30 PM
            color: subjectColors.CSRM
          },
          {
            subject: 'CSRM',
            startTime: '14:30', // 2:30 PM
            endTime: '15:30',   // 3:30 PM
            color: subjectColors.CSRM
          },
          {
            subject: 'QSEC',
            startTime: '15:30', // 3:30 PM
            endTime: '16:30',   // 4:30 PM
            color: subjectColors.QSEC
          },
          {
            subject: 'QSEC',
            startTime: '16:30', // 4:30 PM
            endTime: '17:30',   // 5:30 PM
            color: subjectColors.QSEC
          },
          {
            subject: 'IE',
            startTime: '17:30', // 5:30 PM
            endTime: '18:30',   // 6:30 PM
            color: subjectColors.IE
          },
          {
            subject: 'PCT',
            startTime: '18:30', // 6:30 PM
            endTime: '19:30',   // 7:30 PM
            color: subjectColors.PCT
          },
          {
            subject: 'PCT',
            startTime: '19:30', // 7:30 PM
            endTime: '20:30',   // 8:30 PM
            color: subjectColors.PCT
          }
        ]
      }
    ]
  },
  
  // Semester 6 Timetable
  {
    semester: 6,
    weekdayTimetable: [
      {
        day: 'Monday',
        slots: [
          {
            subject: 'SD',
            startTime: '17:30', // 5:30 PM
            endTime: '18:30',   // 6:30 PM
            color: subjectColors.SD
          },
          {
            subject: 'SD',
            startTime: '18:30', // 6:30 PM
            endTime: '19:30',   // 7:30 PM
            color: subjectColors.SD
          }
        ]
      },
      {
        day: 'Tuesday',
        slots: [
          {
            subject: 'EE',
            startTime: '17:30',
            endTime: '18:30',
            color: subjectColors.EE
          },
          {
            subject: 'EE',
            startTime: '18:30',
            endTime: '19:30',
            color: subjectColors.EE
          }
        ]
      },
      {
        day: 'Wednesday',
        slots: [
          {
            subject: 'IE',
            startTime: '17:30',
            endTime: '18:30',
            color: subjectColors.IE
          },
          {
            subject: 'IE',
            startTime: '18:30',
            endTime: '19:30',
            color: subjectColors.IE
          }
        ]
      },
      {
        day: 'Thursday',
        slots: [
          {
            subject: 'FRRS',
            startTime: '17:30',
            endTime: '18:30',
            color: subjectColors.FRRS
          },
          {
            subject: 'FRRS',
            startTime: '18:30',
            endTime: '19:30',
            color: subjectColors.FRRS
          }
        ]
      },
      {
        day: 'Friday',
        slots: [
          {
            subject: 'EE',
            startTime: '17:30',
            endTime: '18:30',
            color: subjectColors.EE
          },
          {
            subject: 'EE',
            startTime: '18:30',
            endTime: '19:30',
            color: subjectColors.EE
          }
        ]
      }
    ],
    weekendTimetable: [
      {
        day: 'Saturday',
        slots: [
          {
            subject: 'Minor Project',
            startTime: '13:30', // 1:30 PM
            endTime: '14:30',   // 2:30 PM
            color: subjectColors['Minor Project']
          },
          {
            subject: 'SD',
            startTime: '14:30', // 2:30 PM
            endTime: '15:30',   // 3:30 PM
            color: subjectColors.SD
          },
          {
            subject: 'SD',
            startTime: '15:30', // 3:30 PM
            endTime: '16:30',   // 4:30 PM
            color: subjectColors.SD
          },
          {
            subject: 'IE',
            startTime: '16:30', // 4:30 PM
            endTime: '17:30',   // 5:30 PM
            color: subjectColors.IE
          },
          {
            subject: 'IE',
            startTime: '17:30', // 5:30 PM
            endTime: '18:30',   // 6:30 PM
            color: subjectColors.IE
          },
          {
            subject: 'FRRS',
            startTime: '18:30', // 6:30 PM
            endTime: '19:30',   // 7:30 PM
            color: subjectColors.FRRS
          },
          {
            subject: 'FRRS',
            startTime: '19:30', // 7:30 PM
            endTime: '20:30',   // 8:30 PM
            color: subjectColors.FRRS
          }
        ]
      }
    ]
  }
];

/**
 * Helper function to convert day name to day number (0 = Sunday, 1 = Monday, etc.)
 */
export const dayNameToNumber = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6
};

/**
 * Get timetable data for a specific semester
 * @param {number} semester - Semester number (e.g., 2, 4)
 * @returns {Object|null} Timetable object for the semester or null if not found
 */
export const getTimetableForSemester = (semester) => {
  return semesterTimetables.find(timetable => timetable.semester === semester) || null;
};

/**
 * Get list of semesters that have timetable data
 * @returns {Array} Array of semester numbers
 */
export const getAvailableSemesters = () => {
  return semesterTimetables.map(timetable => timetable.semester);
};

/**
 * Get full timetable (weekdays + weekend) for a specific semester
 * @param {number} semester - Semester number
 * @returns {Array|null} Full timetable array or null if not found
 */
export const getFullTimetableForSemester = (semester) => {
  const timetable = getTimetableForSemester(semester);
  if (!timetable) return null;
  return [...timetable.weekdayTimetable, ...timetable.weekendTimetable];
};

/**
 * Generate recurring events for the timetable
 * @param {number} semester - Semester number
 * @param {Date} startDate - Start date for generating events
 * @param {Date} endDate - End date for generating events
 * @returns {Array} Array of calendar events
 */
export const generateTimetableEvents = (semester, startDate = new Date(), endDate = null, periodLabel = 'Semester') => {
  const timetable = getTimetableForSemester(semester);
  
  if (!timetable) {
    console.warn(`No timetable data found for semester ${semester}`);
    return [];
  }
  
  const events = [];
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  // Default end date: 3 months from start, or use provided endDate
  const end = endDate ? new Date(endDate) : new Date(start);
  if (!endDate) {
    end.setMonth(end.getMonth() + 3);
  }
  end.setHours(23, 59, 59, 999);
  
  // Get full timetable (weekdays + weekend)
  const fullTimetable = [...timetable.weekdayTimetable, ...timetable.weekendTimetable];
  
  // Current date iterator
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Check if this day is in the timetable
    const daySchedule = fullTimetable.find(schedule => schedule.day === dayName);
    
    if (daySchedule) {
      daySchedule.slots.forEach((slot, index) => {
        const [hours, minutes] = slot.startTime.split(':').map(Number);
        const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
        
        const eventStart = new Date(currentDate);
        eventStart.setHours(hours, minutes, 0, 0);
        
        const eventEnd = new Date(currentDate);
        eventEnd.setHours(endHours, endMinutes, 0, 0);
        
        events.push({
          _id: `timetable-sem${semester}-${dayName}-${slot.startTime}-${eventStart.getTime()}`,
          title: slot.subject,
          subject: slot.subject,
          start: eventStart,
          end: eventEnd,
          date: new Date(currentDate),
          color: slot.color,
          semester: semester,
          isTimetable: true, // Flag to identify timetable events
          periodLabel: periodLabel || getPeriodLabel(),
          description: `${periodLabel || getPeriodLabel()} ${semester} - Regular class schedule for ${slot.subject}`,
          instructor: 'Scheduled Class',
          roomNumber: 'TBD',
          participants: 0,
          link: '#'
        });
      });
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return events;
};

// Legacy exports for backward compatibility (deprecated)
/**
 * @deprecated Use getTimetableForSemester(4) instead
 */
export const weekdayTimetable = semesterTimetables.find(t => t.semester === 4)?.weekdayTimetable || [];

/**
 * @deprecated Use getTimetableForSemester(4) instead
 */
export const weekendTimetable = semesterTimetables.find(t => t.semester === 4)?.weekendTimetable || [];

/**
 * @deprecated Use getFullTimetableForSemester(4) instead
 */
export const fullTimetable = getFullTimetableForSemester(4) || [];