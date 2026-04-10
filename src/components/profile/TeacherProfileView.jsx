import React, { useState, useEffect } from "react";
import { Camera, Loader2, Trash2, User, BookOpen } from "lucide-react";
import { TEACHER_PROFILE_SECTIONS } from "./profileTemplates";

const SectionHeader = ({ icon: Icon, title, gradient }) => (
  <div className={`relative overflow-hidden px-6 py-4 ${gradient}`}>
    <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
    <div className="absolute -bottom-4 right-12 w-12 h-12 bg-white/5 rounded-full" />
    <div className="relative z-10 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
        <Icon className="w-5 h-5 text-gray-900" />
      </div>
      <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>
    </div>
  </div>
);

const TeacherProfileView = ({
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
}) => {
  const [photoError, setPhotoError] = useState(false);

  // Reset photo error when URL changes (e.g. after new upload)
  useEffect(() => {
    setPhotoError(false);
  }, [profilePhotoUrl]);

  return (
    <>
      <section className="bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden dark:bg-white dark:shadow-lg">
        <SectionHeader
          icon={User}
          title="Teacher Profile"
          gradient="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 rounded-t-2xl"
        />

        <div className="grid gap-5 p-5 lg:grid-cols-[1.6fr_0.9fr]">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {headerFields.map((field) => (
              <div key={field.label} className="rounded-lg border border-gray-200 dark:border-gray-200 bg-gray-50 dark:bg-white p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {field.label}
                </div>
                {field.label === "Tags" && field.value ? (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {String(field.value).split(", ").map((tag) => (
                      <span
                        key={tag}
                        className="inline-block rounded-full bg-blue-100 dark:bg-blue-900/40 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-700">
                    {toDisplay(field.value)}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-200 bg-gray-50 dark:bg-white p-4">
            <div className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-600">Profile Photo</div>
            <div className="mb-4 flex justify-center">
              {profilePhotoUrl && !photoError ? (
                <img
                  src={profilePhotoUrl}
                  alt="Profile"
                  className="h-36 w-36 rounded-full border border-gray-200 dark:border-gray-300 object-cover"
                  onError={() => setPhotoError(true)}
                />
              ) : (
                <div className="flex h-36 w-36 items-center justify-center rounded-full border border-dashed border-gray-300 dark:border-gray-300 bg-gray-50 dark:bg-gray-700 text-sm text-gray-500 dark:text-gray-400">
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
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-300 bg-white dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-700 disabled:opacity-60"
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
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-gray-700 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-600 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden dark:bg-white dark:shadow-lg">
        <SectionHeader
          icon={BookOpen}
          title="Teacher Details"
          gradient="bg-gradient-to-r from-blue-500 to-blue-700 rounded-t-2xl"
        />

        {saveError ? (
          <div className="mx-5 mt-4 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-red-50 px-3 py-2 text-sm text-red-700 dark:text-red-600">
            {saveError}
          </div>
        ) : null}

        <div className="space-y-5 p-5">
          {TEACHER_PROFILE_SECTIONS.map((section) => (
            <div key={section.title} className="rounded-lg border border-gray-200 dark:border-gray-200 bg-gray-50 dark:bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                {section.title}
              </h3>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {section.fields.map((field) => {
                  const value = String(editDraft[field] || "").trim();
                  const showViewLink = !editMode && isHttpUrl(value);
                  const canEdit = isFieldEditable(field);

                  return (
                    <div key={field} className="rounded-lg border border-gray-200 dark:border-gray-200 bg-white dark:bg-white p-3">
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {field}
                      </label>

                      {!editMode ? (
                        <div className="text-sm text-gray-800 dark:text-gray-700">
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
                          className={`w-full rounded-lg border px-3 py-2 text-sm text-gray-800 dark:text-gray-700 focus:outline-none ${
                            canEdit
                              ? "border-gray-300 dark:border-gray-300 bg-white dark:bg-gray-700 focus:border-blue-400"
                              : "border-gray-200 dark:border-gray-200 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
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

export default TeacherProfileView;
