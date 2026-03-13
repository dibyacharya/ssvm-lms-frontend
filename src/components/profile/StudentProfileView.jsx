import React, { useState } from "react";
import { Camera, ChevronDown, ChevronRight, Loader2, Trash2, User, BarChart2, FileText } from "lucide-react";
import { STUDENT_PROFILE_SECTIONS } from "./profileTemplates";

const SectionHeader = ({ icon: Icon, title, gradient }) => (
  <div className={`relative overflow-hidden px-6 py-4 ${gradient}`}>
    <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
    <div className="absolute -bottom-4 right-12 w-12 h-12 bg-white/5 rounded-full" />
    <div className="relative z-10 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
    </div>
  </div>
);

const StudentProfileView = ({
  headerFields = [],
  profilePhotoUrl = "",
  photoBusy = false,
  photoInputRef = null,
  onPhotoUpload = () => {},
  onPhotoDelete = () => {},
  editMode = false,
  editDraft = {},
  setDraftValue = () => {},
  isFieldEditable = () => false,
  toDisplay = (value) => (value ? value : "-"),
  isHttpUrl = () => false,
  saveError = "",
  programProgress = [],
  programProgressError = "",
  expandedSemesters = [],
  toggleSemester = () => {},
  toSemesterLabel = () => "-",
  toGpaDisplay = () => "-",
  periodLabel = "Semester",
}) => {
  const [photoError, setPhotoError] = useState(false);

  // Reset photo error when URL changes (e.g. after new upload)
  React.useEffect(() => {
    setPhotoError(false);
  }, [profilePhotoUrl]);

  return (
    <>
      <section className="bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden dark:bg-gray-800 dark:shadow-lg">
        <SectionHeader
          icon={User}
          title="Student Profile"
          gradient="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 rounded-t-2xl"
        />

        <div className="grid gap-5 p-5 lg:grid-cols-[1.6fr_0.9fr]">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {headerFields.map((field) => (
              <div key={field.label} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {field.label}
                </div>
                <div className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                  {toDisplay(field.value)}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
            <div className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Profile Photo</div>
            <div className="mb-4 flex justify-center">
              {profilePhotoUrl && !photoError ? (
                <img
                  src={profilePhotoUrl}
                  alt="Profile"
                  className="h-36 w-36 rounded-full border border-gray-200 dark:border-gray-600 object-cover"
                  onError={() => setPhotoError(true)}
                />
              ) : (
                <div className="flex h-36 w-36 items-center justify-center rounded-full border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-500 dark:text-gray-400">
                  No Photo
                </div>
              )}
            </div>

            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPhotoUpload}
            />

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => photoInputRef?.current?.click()}
                disabled={photoBusy}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 disabled:opacity-60"
              >
                {photoBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                Upload
              </button>
              <button
                type="button"
                onClick={onPhotoDelete}
                disabled={photoBusy || !profilePhotoUrl}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-gray-700 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden dark:bg-gray-800 dark:shadow-lg">
        <SectionHeader
          icon={BarChart2}
          title="Program Progress"
          gradient="bg-gradient-to-r from-violet-500 to-purple-600 rounded-t-2xl"
        />

        {programProgressError ? (
          <div className="mx-5 mt-4 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-red-900/30 px-3 py-2 text-sm text-red-700 dark:text-red-400">
            {programProgressError}
          </div>
        ) : null}

        <div className="overflow-x-auto p-5">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                <th className="w-10 border border-gray-200 dark:border-gray-600 px-3 py-2" />
                <th className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-left font-semibold">{periodLabel}</th>
                <th className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-left font-semibold">Academic Year</th>
                <th className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-left font-semibold">Academic Season</th>
                <th className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-left font-semibold">Status</th>
                <th className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-left font-semibold">Credit</th>
                <th className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-left font-semibold">SGPA</th>
                <th className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-left font-semibold">CGPA</th>
              </tr>
            </thead>
            <tbody>
              {programProgress.length ? (
                programProgress.map((semester) => {
                  const expanded = expandedSemesters.includes(semester.semesterNo);
                  return (
                    <React.Fragment key={`semester-${semester.semesterNo}`}>
                      <tr
                        className={`cursor-pointer ${
                          semester.hasBacklog ? "bg-red-50 dark:bg-red-900/20" : "bg-white dark:bg-gray-800"
                        } hover:bg-gray-50 dark:hover:bg-gray-700`}
                        onClick={() => toggleSemester(semester.semesterNo)}
                      >
                        <td className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-gray-600 dark:text-gray-400">
                          {expanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-gray-800 dark:text-gray-200">
                          {toSemesterLabel(semester.semesterNo)}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-gray-800 dark:text-gray-200">
                          {toDisplay(semester.academicYear)}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-gray-800 dark:text-gray-200">
                          {toDisplay(semester.season)}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-gray-800 dark:text-gray-200">
                          {toDisplay(semester.status)}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-gray-800 dark:text-gray-200">
                          {toDisplay(semester.totalCredits)}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-gray-800 dark:text-gray-200">
                          {toGpaDisplay(semester.sgpa)}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-gray-800 dark:text-gray-200">
                          {toGpaDisplay(semester.cgpa)}
                        </td>
                      </tr>

                      {expanded ? (
                        <tr className="bg-gray-50 dark:bg-gray-750 dark:bg-gray-900/50">
                          <td colSpan={8} className="border border-gray-200 dark:border-gray-600 px-3 py-3">
                            <div className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {periodLabel} Course Progress
                            </div>
                            <div className="overflow-x-auto">
                              <table className="min-w-full border-collapse text-sm">
                                <thead>
                                  <tr className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                    <th rowSpan={2} className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-left">Course Code</th>
                                    <th rowSpan={2} className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-left">Course Name</th>
                                    <th colSpan={4} className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-center">CREDITS</th>
                                    <th rowSpan={2} className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-left">Grade</th>
                                    <th rowSpan={2} className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-left">Backlog Status</th>
                                  </tr>
                                  <tr className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                    <th className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-center">L</th>
                                    <th className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-center">T</th>
                                    <th className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-center">P</th>
                                    <th className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-center">Cr</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Array.isArray(semester.courses) && semester.courses.length ? (
                                    semester.courses.map((course, idx) => {
                                      const backlog =
                                        course?.isBacklog === true ||
                                        String(course?.grade || "")
                                          .trim()
                                          .toUpperCase() === "F";
                                      return (
                                        <tr
                                          key={`${semester.semesterNo}-course-${idx}`}
                                          className="bg-white dark:bg-gray-800"
                                        >
                                          <td className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-gray-800 dark:text-gray-200">
                                            {toDisplay(course?.courseCode)}
                                          </td>
                                          <td className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-gray-800 dark:text-gray-200">
                                            {toDisplay(course?.courseName)}
                                          </td>
                                          <td className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-center text-gray-800 dark:text-gray-200">
                                            {course?.lecture ?? 0}
                                          </td>
                                          <td className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-center text-gray-800 dark:text-gray-200">
                                            {course?.tutorial ?? 0}
                                          </td>
                                          <td className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-center text-gray-800 dark:text-gray-200">
                                            {course?.practical ?? 0}
                                          </td>
                                          <td className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-center font-semibold text-gray-800 dark:text-gray-200">
                                            {toDisplay(course?.credit)}
                                          </td>
                                          <td className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-gray-800 dark:text-gray-200">
                                            {toDisplay(course?.grade)}
                                          </td>
                                          <td className="border border-gray-200 dark:border-gray-600 px-3 py-2 text-gray-800 dark:text-gray-200">
                                            {backlog ? "Yes" : "No"}
                                          </td>
                                        </tr>
                                      );
                                    })
                                  ) : (
                                    <tr className="bg-white dark:bg-gray-800">
                                      <td
                                        colSpan={8}
                                        className="border border-gray-200 dark:border-gray-600 px-3 py-3 text-center text-gray-500 dark:text-gray-400"
                                      >
                                        No course progress found for this {periodLabel.toLowerCase()}.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr className="bg-white dark:bg-gray-800">
                  <td colSpan={8} className="border border-gray-200 dark:border-gray-600 px-3 py-4 text-center text-gray-500 dark:text-gray-400">
                    No academic progress data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden dark:bg-gray-800 dark:shadow-lg">
        <SectionHeader
          icon={FileText}
          title="Personal Details"
          gradient="bg-gradient-to-r from-sky-500 to-blue-600 rounded-t-2xl"
        />

        {saveError ? (
          <div className="mx-5 mt-4 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-red-900/30 px-3 py-2 text-sm text-red-700 dark:text-red-400">
            {saveError}
          </div>
        ) : null}

        <div className="space-y-5 p-5">
          {STUDENT_PROFILE_SECTIONS.map((section) => (
            <div key={section.title} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                {section.title}
              </h3>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {section.fields.map((field) => {
                  const value = String(editDraft[field] || "").trim();
                  const showViewLink = !editMode && isHttpUrl(value);
                  const canEdit = isFieldEditable(field);

                  return (
                    <div key={field} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {field}
                      </label>

                      {!editMode ? (
                        <div className="text-sm text-gray-800 dark:text-gray-200">
                          {showViewLink ? (
                            <a
                              href={value}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-blue-700 dark:text-blue-400 underline"
                            >
                              View
                            </a>
                          ) : (
                            toDisplay(value)
                          )}
                        </div>
                      ) : (
                        <input
                          value={value}
                          onChange={(event) => setDraftValue(field, event.target.value)}
                          disabled={!canEdit}
                          className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:outline-none ${
                            canEdit
                              ? "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-blue-400"
                              : "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          }`}
                          placeholder={`Enter ${field}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default StudentProfileView;
