import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { scheduleVconfMeeting } from '../../services/vconf.service';
function VconfSchedule() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    course: 'CS101: Introduction to Computer Science',
    program: 'B.Tech',
    batch: '2024',
    semester: 'Period 1',
    section: 'Section A',
    contributionType: 'Lecture',
    contributionNumber: '',
    agenda: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    mode: 'hybrid',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
        throw new Error("Start and End Date/Time are required.");
      }

      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`).toISOString();
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`).toISOString();

      const fullTitle = `${formData.course} - ${formData.contributionType} ${formData.contributionNumber}`;

      console.log("[Schedule] Submitting scheduling payload:", {
        title: fullTitle,
        description: formData.agenda,
        mode: formData.mode,
        scheduled_start: startDateTime,
        scheduled_end: endDateTime,
      });

      const meeting = await scheduleVconfMeeting({
        title: fullTitle,
        description: formData.agenda,
        mode: formData.mode,
        scheduled_start: startDateTime,
        scheduled_end: endDateTime,
      });

      console.log("[Schedule] Meeting scheduled successfully! Response:", meeting);

      alert(`Meeting Scheduled Successfully!\nJoin Link: ${window.location.origin}/vconf/meeting/${meeting.id}`);

      navigate('/vconf/schedule');
    } catch (err) {
      console.error("[Schedule] Failed to schedule meeting:", err);
      setError(err.message || 'Failed to schedule meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/vconf/schedule');
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      {/* Modal Container */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-card-sm border border-gray-200 w-full max-w-3xl overflow-hidden flex flex-col relative">

        {/* Header */}
        <div className="p-6 pb-4 flex justify-between items-start border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create New Session</h2>
            <p className="text-sm text-gray-500 mt-1">Schedule a new live class or tutorial.</p>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-50 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 text-red-600 rounded-xl text-sm border border-red-800">
              {error}
            </div>
          )}

          <form id="schedule-form" onSubmit={handleSubmit} className="space-y-6">

            {/* Course Row */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-600">Course</label>
              <select
                className="w-full px-4 py-2.5 bg-white/40 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm text-gray-900 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%2394A3B8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center]"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              >
                <option value="CS101: Introduction to Computer Science">CS101: Introduction to Computer Science</option>
                <option value="CS201: Data Structures">CS201: Data Structures</option>
                <option value="MA101: Engineering Mathematics">MA101: Engineering Mathematics</option>
              </select>
            </div>

            {/* 4-Column Grid: Program, Batch, Semester, Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-600">Program</label>
                <select
                  className="w-full px-3 py-2.5 bg-white/40 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm text-gray-900 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%2394A3B8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_8px_center] pr-8"
                  value={formData.program}
                  onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                >
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="BCA">BCA</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-600">Batch</label>
                <select
                  className="w-full px-3 py-2.5 bg-white/40 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm text-gray-900 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%2394A3B8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_8px_center] pr-8"
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-600">Period</label>
                <select
                  className="w-full px-3 py-2.5 bg-white/40 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm text-gray-900 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%2394A3B8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_8px_center] pr-8"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                >
                  <option value="Period 1">Period 1</option>
                  <option value="Period 2">Period 2</option>
                  <option value="Period 3">Period 3</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-600">Section</label>
                <select
                  className="w-full px-3 py-2.5 bg-white/40 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm text-gray-900 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%2394A3B8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_8px_center] pr-8"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                >
                  <option value="Section A">Section A</option>
                  <option value="Section B">Section B</option>
                  <option value="Section C">Section C</option>
                </select>
              </div>
            </div>

            {/* Contribution Type & Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-600">Contribution Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setFormData({ ...formData, contributionType: 'Lecture' })}
                    className={clsx(
                      "cursor-pointer p-3 rounded-lg border flex flex-col items-start transition-all",
                      formData.contributionType === 'Lecture'
                        ? "border-primary-500 bg-primary-50 text-primary-600 ring-1 ring-primary-500 ring-offset-1 ring-offset-surface-950"
                        : "border-gray-200 hover:border-white/[0.15] text-gray-500 bg-white/40"
                    )}
                  >
                    <div className="flex justify-between w-full items-center mb-1">
                      <span className="font-semibold text-sm drop-shadow-sm">Lecture</span>
                      {formData.contributionType === 'Lecture' && (
                        <div className="w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <span className="text-xs opacity-70">Theory focused</span>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, contributionType: 'Tutorial' })}
                    className={clsx(
                      "cursor-pointer p-3 rounded-lg border flex flex-col items-start transition-all",
                      formData.contributionType === 'Tutorial'
                        ? "border-primary-500 bg-primary-50 text-primary-600 ring-1 ring-primary-500 ring-offset-1 ring-offset-surface-950"
                        : "border-gray-200 hover:border-white/[0.15] text-gray-500 bg-white/40"
                    )}
                  >
                    <div className="flex justify-between w-full items-center mb-1">
                      <span className="font-semibold text-sm drop-shadow-sm">Tutorial</span>
                      {formData.contributionType === 'Tutorial' && (
                        <div className="w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <span className="text-xs opacity-70">Practice focused</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-600">Contribution Number</label>
                <input
                  type="text"
                  placeholder="e.g. 12"
                  className="w-full px-4 py-3 bg-white/40 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm text-gray-900 transition-all font-medium h-[62px]"
                  value={formData.contributionNumber}
                  onChange={(e) => setFormData({ ...formData, contributionNumber: e.target.value })}
                />
              </div>
            </div>

            {/* Agenda / Topic */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-600">Agenda / Topic</label>
              <textarea
                placeholder="Enter the main topics to be covered..."
                className="w-full px-4 py-3 bg-white/40 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm text-gray-900 transition-all min-h-[80px] resize-y"
                value={formData.agenda}
                onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
              />
            </div>

            {/* Time Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-600">Start Time</label>
                <div className="flex rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-primary-500 bg-white/40 overflow-hidden transition-all">
                  <input
                    type="date"
                    className="px-3 py-2.5 border-r border-gray-100 focus:outline-none text-sm text-gray-900 bg-transparent flex-1"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                  <input
                    type="time"
                    className="px-3 py-2.5 focus:outline-none text-sm text-gray-900 bg-transparent flex-1"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-600">End Time</label>
                <div className="flex rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-primary-500 bg-white/40 overflow-hidden transition-all">
                  <input
                    type="date"
                    className="px-3 py-2.5 border-r border-gray-100 focus:outline-none text-sm text-gray-900 bg-transparent flex-1"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                  <input
                    type="time"
                    className="px-3 py-2.5 focus:outline-none text-sm text-gray-900 bg-transparent flex-1"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-4 border-t border-gray-200 bg-white/40 flex justify-end items-center space-x-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2.5 text-sm font-semibold text-gray-500 bg-white/40 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="schedule-form"
            disabled={loading}
            className="px-6 py-2.5 text-sm font-semibold text-gray-900 bg-primary-600 rounded-lg shadow-card-sm hover:bg-primary-500 transition-colors disabled:opacity-70 disabled:pointer-events-none"
          >
            {loading ? 'Scheduling...' : 'Schedule Session'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default VconfSchedule;
