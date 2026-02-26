import React from "react";
import { Camera, ChevronDown, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { STUDENT_PROFILE_SECTIONS } from "./profileTemplates";

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
}) => {
  return (
    <>
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Student Profile</h1>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[1.6fr_0.9fr]">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {headerFields.map((field) => (
              <div key={field.label} className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {field.label}
                </div>
                <div className="mt-1 text-sm font-medium text-gray-800">
                  {toDisplay(field.value)}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-3 text-sm font-semibold text-gray-700">Profile Photo</div>
            <div className="mb-4 flex justify-center">
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt="Profile"
                  className="h-36 w-36 rounded-full border border-gray-200 object-cover"
                />
              ) : (
                <div className="flex h-36 w-36 items-center justify-center rounded-full border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
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
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-60"
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
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Program Progress</h2>
        </div>

        {programProgressError ? (
          <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-700">
            {programProgressError}
          </div>
        ) : null}

        <div className="overflow-x-auto p-5">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="w-10 border border-gray-200 px-3 py-2" />
                <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Semester</th>
                <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Academic Year</th>
                <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Academic Season</th>
                <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Status</th>
                <th className="border border-gray-200 px-3 py-2 text-left font-semibold">Credit</th>
                <th className="border border-gray-200 px-3 py-2 text-left font-semibold">SGPA</th>
                <th className="border border-gray-200 px-3 py-2 text-left font-semibold">CGPA</th>
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
                          semester.hasBacklog ? "bg-red-50" : "bg-white"
                        } hover:bg-gray-50`}
                        onClick={() => toggleSemester(semester.semesterNo)}
                      >
                        <td className="border border-gray-200 px-3 py-2 text-gray-600">
                          {expanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-gray-800">
                          {toSemesterLabel(semester.semesterNo)}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-gray-800">
                          {toDisplay(semester.academicYear)}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-gray-800">
                          {toDisplay(semester.season)}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-gray-800">
                          {toDisplay(semester.status)}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-gray-800">
                          {toDisplay(semester.totalCredits)}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-gray-800">
                          {toGpaDisplay(semester.sgpa)}
                        </td>
                        <td className="border border-gray-200 px-3 py-2 text-gray-800">
                          {toGpaDisplay(semester.cgpa)}
                        </td>
                      </tr>

                      {expanded ? (
                        <tr className="bg-gray-50">
                          <td colSpan={8} className="border border-gray-200 px-3 py-3">
                            <div className="mb-2 text-sm font-semibold text-gray-700">
                              Semester Course Progress
                            </div>
                            <div className="overflow-x-auto">
                              <table className="min-w-full border-collapse text-sm">
                                <thead>
                                  <tr className="bg-white text-gray-700">
                                    <th className="border border-gray-200 px-3 py-2 text-left">Course Code</th>
                                    <th className="border border-gray-200 px-3 py-2 text-left">Course Name</th>
                                    <th className="border border-gray-200 px-3 py-2 text-left">Credit</th>
                                    <th className="border border-gray-200 px-3 py-2 text-left">Grade</th>
                                    <th className="border border-gray-200 px-3 py-2 text-left">Backlog Status</th>
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
                                          className="bg-white"
                                        >
                                          <td className="border border-gray-200 px-3 py-2 text-gray-800">
                                            {toDisplay(course?.courseCode)}
                                          </td>
                                          <td className="border border-gray-200 px-3 py-2 text-gray-800">
                                            {toDisplay(course?.courseName)}
                                          </td>
                                          <td className="border border-gray-200 px-3 py-2 text-gray-800">
                                            {toDisplay(course?.credit)}
                                          </td>
                                          <td className="border border-gray-200 px-3 py-2 text-gray-800">
                                            {toDisplay(course?.grade)}
                                          </td>
                                          <td className="border border-gray-200 px-3 py-2 text-gray-800">
                                            {backlog ? "Yes" : "No"}
                                          </td>
                                        </tr>
                                      );
                                    })
                                  ) : (
                                    <tr className="bg-white">
                                      <td
                                        colSpan={5}
                                        className="border border-gray-200 px-3 py-3 text-center text-gray-500"
                                      >
                                        No course progress found for this semester.
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
                <tr className="bg-white">
                  <td colSpan={8} className="border border-gray-200 px-3 py-4 text-center text-gray-500">
                    No academic progress data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Personal Details</h2>
        </div>

        {saveError ? (
          <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-700">
            {saveError}
          </div>
        ) : null}

        <div className="space-y-5 p-5">
          {STUDENT_PROFILE_SECTIONS.map((section) => (
            <div key={section.title} className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">
                {section.title}
              </h3>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {section.fields.map((field) => {
                  const value = String(editDraft[field] || "").trim();
                  const showViewLink = !editMode && isHttpUrl(value);
                  const canEdit = isFieldEditable(field);

                  return (
                    <div key={field} className="rounded-lg border border-gray-200 bg-white p-3">
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {field}
                      </label>

                      {!editMode ? (
                        <div className="text-sm text-gray-800">
                          {showViewLink ? (
                            <a
                              href={value}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-blue-700 underline"
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
                          className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 focus:outline-none ${
                            canEdit
                              ? "border-gray-300 bg-white focus:border-blue-400"
                              : "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
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
