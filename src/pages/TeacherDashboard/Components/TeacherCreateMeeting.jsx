import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Edit, Trash, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useMeetingsV2 } from '../../../context/MeetingV2Context';
import toast from 'react-hot-toast';
import { getAllCourses } from '../../../services/course.service';

export default function TeacherCreateMeeting() {
  // Get meeting functions from the new context
  const {
    getMeetingsForCourse,
    fetchMeetingsForCourse,
    createMeeting,
    updateMeeting,
    deleteMeeting,
  } = useMeetingsV2();
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [listCourseId, setListCourseId] = useState('');
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    startTime: '',
    endTime: '',
    instructor: '',
    roomNumber: '',
    color: '#4285F3',
    courseId: '',
    isRecurring: false,
    recurrenceFrequency: 'WEEKLY',
    recurrenceDays: [],
    recurrenceEndDate: '',
    recurrenceExceptions: [],
  });

  const meetings = listCourseId ? getMeetingsForCourse(listCourseId) || [] : [];

  const toUtcIso = (localDateTime) => {
    if (!localDateTime) return '';
    const date = new Date(localDateTime);
    return date.toISOString();
  };

  // Load teacher courses for dropdown
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setCoursesLoading(true);
        const data = await getAllCourses();
        setTeacherCourses(data.courses || []);
      } catch (err) {
        console.error("Failed to load teacher courses", err);
        toast.error("Failed to load courses for meetings.");
      } finally {
        setCoursesLoading(false);
      }
    };

    loadCourses();
  }, []);

  // --- FORM AND MODAL HANDLERS ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      description: '',
      startTime: '',
      endTime: '',
      instructor: user.name,
      roomNumber: '',
      color: '#4285F3',
      courseId: listCourseId || '',
      isRecurring: false,
      recurrenceFrequency: 'WEEKLY',
      recurrenceDays: [],
      recurrenceEndDate: '',
      recurrenceExceptions: [],
    });
    setCurrentMeeting(null);
  };

  const parseRecurrenceRule = (rule) => {
    if (!rule) return { frequency: 'WEEKLY', days: [] };
    const freqMatch = rule.match(/FREQ=(\w+)/);
    const bydayMatch = rule.match(/BYDAY=([^;]+)/);
    const frequency = freqMatch ? freqMatch[1] : 'WEEKLY';
    const days = bydayMatch ? bydayMatch[1].split(',') : [];
    return { frequency, days };
  };

  const openModal = (meeting = null) => {
    if (meeting) {
      const formatDate = (dateStr) => dateStr ? new Date(dateStr).toISOString().slice(0, 16) : '';
      setCurrentMeeting(meeting);
      const recurrence = parseRecurrenceRule(meeting.recurrenceRule);
      setFormData({
        subject: meeting.title || meeting.subject || '',
        description: meeting.description || '',
        startTime: formatDate(meeting.start || meeting.instanceStart),
        endTime: formatDate(meeting.end || meeting.instanceEnd),
        instructor: meeting.instructor || user.name,
        roomNumber: meeting.roomNumber || '',
        color: meeting.color || '#4285F3',
        courseId: meeting.course || meeting.courseId || listCourseId || '',
        isRecurring: !!meeting.isRecurring,
        recurrenceFrequency: recurrence.frequency,
        recurrenceDays: recurrence.days,
        recurrenceEndDate: meeting.recurrenceEndDate
          ? formatDate(meeting.recurrenceEndDate)
          : '',
        recurrenceExceptions: meeting.recurrenceExceptions || [],
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };
  
  // --- CONTEXT API HANDLERS ---
  
  const handleSubmit = async () => {
    if (!formData.courseId) {
      toast.error("Course ID is required.");
      return;
    }
    if (!currentMeeting && (!formData.startTime || !formData.endTime)) {
      toast.error("Start and end time are required.");
      return;
    }
    if (formData.isRecurring && !formData.recurrenceEndDate) {
      toast.error("Recurrence end date is required for recurring meetings.");
      return;
    }
    if (formData.isRecurring && formData.recurrenceFrequency === 'WEEKLY' && formData.recurrenceDays.length === 0) {
      toast.error("Please select at least one day of the week for weekly recurring meetings.");
      return;
    }

    if (currentMeeting) {
      // Logic for updating
      const updateData = {
        title: formData.subject,
        description: formData.description,
        roomNumber: formData.roomNumber,
        color: formData.color,
        courseId: formData.courseId,
        isRecurring: formData.isRecurring,
      };
      if (formData.isRecurring && formData.recurrenceEndDate) {
        let rule = `FREQ=${formData.recurrenceFrequency};INTERVAL=1`;
        if (formData.recurrenceFrequency === 'WEEKLY' && formData.recurrenceDays.length > 0) {
          rule += `;BYDAY=${formData.recurrenceDays.join(',')}`;
        }
        updateData.recurrenceRule = rule;
        updateData.recurrenceEndDate = toUtcIso(formData.recurrenceEndDate);
      }
      if (formData.recurrenceExceptions && formData.recurrenceExceptions.length > 0) {
        updateData.recurrenceExceptions = formData.recurrenceExceptions;
      }
      try {
        await updateMeeting(currentMeeting._id, updateData, formData.courseId);
        setShowModal(false);
        toast.success("Meeting updated successfully.");
      } catch (error) {
        const status = error?.response?.status;
        if (status === 409) {
          toast.error("You already have another meeting scheduled at this time.");
        } else {
          toast.error("Failed to update meeting. Please try again.");
        }
      }
    } else {
      // Logic for creating
      const startIso = toUtcIso(formData.startTime);
      const endIso = toUtcIso(formData.endTime);

      const meetingData = {
        courseId: formData.courseId,
        title: formData.subject,
        description: formData.description,
        start: startIso,
        end: endIso,
        timezone: "Asia/Kolkata",
        roomNumber: formData.roomNumber,
        color: formData.color,
        isRecurring: formData.isRecurring,
      };

      if (formData.isRecurring && formData.recurrenceEndDate) {
        let rule = `FREQ=${formData.recurrenceFrequency};INTERVAL=1`;
        if (formData.recurrenceFrequency === 'WEEKLY' && formData.recurrenceDays.length > 0) {
          rule += `;BYDAY=${formData.recurrenceDays.join(',')}`;
        }
        meetingData.recurrenceRule = rule;
        meetingData.recurrenceEndDate = toUtcIso(formData.recurrenceEndDate);
      }
      if (formData.recurrenceExceptions && formData.recurrenceExceptions.length > 0) {
        meetingData.recurrenceExceptions = formData.recurrenceExceptions;
      }

      try {
        await createMeeting(meetingData);
        setShowModal(false);
        toast.success("Meeting created successfully.");
        if (formData.courseId) {
          await fetchMeetingsForCourse(formData.courseId);
        }
      } catch (error) {
        const status = error?.response?.status;
        if (status === 409) {
          toast.error("You already have another meeting scheduled at this time.");
        } else {
          toast.error("Failed to create meeting. Please try again.");
        }
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        await deleteMeeting(id, listCourseId || formData.courseId);
        toast.success("Meeting deleted.");
      } catch {
        toast.error("Failed to delete meeting.");
      }
    }
  };
  
  // --- UTILITY FUNCTIONS ---

  const formatMeetingDuration = (startStr, endStr) => {
    if (!startStr || !endStr) return 'Not set';
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);
    const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    const formattedStartDate = startDate.toLocaleDateString(undefined, dateOptions);
    const formattedStartTime = startDate.toLocaleTimeString([], timeOptions);
    const formattedEndDate = endDate.toLocaleDateString(undefined, dateOptions);
    const formattedEndTime = endDate.toLocaleTimeString([], timeOptions);
    if (startDate.toDateString() === endDate.toDateString()) {
      return `${formattedStartDate} from ${formattedStartTime} to ${formattedEndTime}`;
    } else {
      return `${formattedStartDate}, ${formattedStartTime} to ${formattedEndDate}, ${formattedEndTime}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">Meeting Manager</h1>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={listCourseId}
              onChange={(e) => {
                const value = e.target.value;
                setListCourseId(value);
                setFormData((prev) => ({ ...prev, courseId: value }));
                if (value) {
                  fetchMeetingsForCourse(value).catch(() => {
                    toast.error("Failed to load meetings for this course.");
                  });
                }
              }}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white"
              disabled={coursesLoading}
            >
              <option value="">
                {coursesLoading ? "Loading courses..." : "Select course"}
              </option>
              {teacherCourses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.courseCode || course.code} - {course.title}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-primary/80 text-gray-900 px-4 py-2 rounded-md flex items-center hover:bg-primary"
          >
            <Plus className="w-4 h-4 mr-1" /> New Meeting
          </button>
        </header>

        {listCourseId && meetings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No meetings found. Click "New Meeting" to create one.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div key={meeting._id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2
                      className="text-xl font-semibold"
                      style={{ borderLeft: `4px solid ${meeting.color || '#4285F3'}`, paddingLeft: '8px' }}
                    >
                      {meeting.title || meeting.subject || 'Untitled Meeting'}
                    </h2>
                    <p className="text-gray-600 mt-1">{meeting.description || 'No description'}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => openModal(meeting)} className="text-gray-500 hover:text-primary p-1" title="Edit">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(meeting._id)} className="text-gray-500 hover:text-red-500 p-1" title="Delete">
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">
                    <span className="font-medium">When:</span> {formatMeetingDuration(
                      meeting.instanceStart || meeting.start, 
                      meeting.instanceEnd || meeting.end
                    )}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Room:</span> {meeting.roomNumber || 'Not assigned'}
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">Course:</span> {
                      teacherCourses.find(c => c._id === (meeting.course || meeting.courseId))?.title || 
                      meeting.course || 
                      meeting.courseId || 
                      'Not assigned'
                    }
                  </div>
                  {meeting.isRecurring && (
                    <div className="text-gray-600">
                      <span className="font-medium">Recurring:</span> Yes
                    </div>
                  )}
                  {meeting.status && (
                    <div className="text-gray-600">
                      <span className="font-medium">Status:</span> 
                      <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                        meeting.status === 'live' ? 'bg-red-100 text-red-700' :
                        meeting.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                        meeting.status === 'ended' ? 'bg-gray-100 text-gray-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-10">
          <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{currentMeeting ? 'Edit Meeting' : 'Create Meeting'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Form fields... */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              
              {!currentMeeting && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input type="datetime-local" id="startTime" name="startTime" value={formData.startTime} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input type="datetime-local" id="endTime" name="endTime" value={formData.endTime} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                  <input type="text" id="roomNumber" name="roomNumber" value={formData.roomNumber} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
                </div>
                <div>
                  <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <select
                    id="courseId"
                    name="courseId"
                    value={formData.courseId}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleInputChange(e);
                      setListCourseId(value);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white"
                  >
                    <option value="">Select course</option>
                    {teacherCourses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.courseCode || course.code} - {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700 font-medium">Video conference room will be automatically created when you schedule this class.</p>
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <select id="color" name="color" value={formData.color} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md bg-white">
                    <option value="#4285F3">Blue</option>
                    <option value="#4CAF50">Green</option>
                    <option value="#FBBC05">Yellow</option>
                    <option value="#EA4335">Red</option>
                    <option value="#9C27B0">Purple</option>
                    <option value="#FF9800">Orange</option>
                  </select>
                </div>
              </div>

              {/* Recurring Meeting Options */}
              {!currentMeeting && (
                <>
                  <div className="mt-4 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      name="isRecurring"
                      checked={formData.isRecurring}
                      onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                      Recurring Meeting
                    </label>
                  </div>

                  {formData.isRecurring && (
                    <div className="mt-3 space-y-4 rounded-md border border-gray-200 bg-gray-50 p-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                        <select
                          name="recurrenceFrequency"
                          value={formData.recurrenceFrequency}
                          onChange={(e) => setFormData({ ...formData, recurrenceFrequency: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md bg-white"
                        >
                          <option value="DAILY">Daily</option>
                          <option value="WEEKLY">Weekly</option>
                          <option value="MONTHLY">Monthly</option>
                        </select>
                      </div>

                      {formData.recurrenceFrequency === 'WEEKLY' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Days of Week</label>
                          <div className="flex flex-wrap gap-2">
                            {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map((day) => (
                              <label key={day} className="flex items-center space-x-1 rounded-full border border-gray-300 px-2 py-1 bg-white">
                                <input
                                  type="checkbox"
                                  checked={formData.recurrenceDays.includes(day)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData({
                                        ...formData,
                                        recurrenceDays: [...formData.recurrenceDays, day],
                                      });
                                    } else {
                                      setFormData({
                                        ...formData,
                                        recurrenceDays: formData.recurrenceDays.filter(d => d !== day),
                                      });
                                    }
                                  }}
                                  className="w-4 h-4"
                                />
                                <span className="text-xs text-gray-700 font-medium">
                                  {day === 'MO' ? 'Mon' : day === 'TU' ? 'Tue' : day === 'WE' ? 'Wed' : 
                                   day === 'TH' ? 'Thu' : day === 'FR' ? 'Fri' : day === 'SA' ? 'Sat' : 'Sun'}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <label htmlFor="recurrenceEndDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Recurrence End Date
                        </label>
                        <input
                          type="datetime-local"
                          id="recurrenceEndDate"
                          name="recurrenceEndDate"
                          value={formData.recurrenceEndDate}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-md bg-white"
                          required={formData.isRecurring}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">Cancel</button>
                <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-primary/80 text-gray-900 rounded-md hover:bg-primary">
                  {currentMeeting ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}