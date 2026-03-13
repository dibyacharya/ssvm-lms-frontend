import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Edit3,
  Loader2,
  RefreshCw,
  Save,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import profileService from "../../services/profile.service";
import StudentProfileView from "../../components/profile/StudentProfileView";
import TeacherProfileView from "../../components/profile/TeacherProfileView";
import { getPeriodLabel } from "../../utils/periodLabel";
import {
  STUDENT_CANONICAL_FIELDS,
  STUDENT_EDITABLE_FIELDS,
  STUDENT_ALIASES,
  TEACHER_CANONICAL_FIELDS,
  TEACHER_EDITABLE_FIELDS,
  TEACHER_ALIASES,
  normalizeTemplateValues,
} from "../../components/profile/profileTemplates";

const EMAIL_REGEX = /^[\w.-]+@([\w-]+\.)+[\w-]{2,}$/i;

const isPlainObject = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const getErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallbackMessage;

const normalizeRole = (profile) =>
  String(profile?.user?.userType || profile?.user?.role || "")
    .trim()
    .toLowerCase();

const isTeacherProfileData = (profile) => normalizeRole(profile) === "teacher";

const toDisplay = (value) => {
  if (value === undefined || value === null) return "-";
  const normalized = String(value).trim();
  return normalized || "-";
};

const toDateDisplay = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return toDisplay(value);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const toGpaDisplay = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "-";
  return numeric.toFixed(2);
};

const toSemesterLabel = (value) => {
  const semesterNo = Number(value);
  if (!Number.isFinite(semesterNo) || semesterNo <= 0) return "-";
  const mod10 = semesterNo % 10;
  const mod100 = semesterNo % 100;
  let suffix = "th";
  if (mod10 === 1 && mod100 !== 11) suffix = "st";
  else if (mod10 === 2 && mod100 !== 12) suffix = "nd";
  else if (mod10 === 3 && mod100 !== 13) suffix = "rd";
  return `${semesterNo}${suffix}`;
};

const isHttpUrl = (value) => /^https?:\/\//i.test(String(value || "").trim());

const normalizeProgressPayload = (payload) => {
  const sources = [
    payload?.semesters,
    payload?.data?.semesters,
    payload?.data?.data?.semesters,
    payload?.progress?.semesters,
  ];
  const semesters = sources.find((entry) => Array.isArray(entry));
  if (!Array.isArray(semesters)) return [];

  return semesters
    .map((semester) => ({
      ...semester,
      semesterNo: Number(semester?.semesterNo),
      courses: Array.isArray(semester?.courses) ? semester.courses : [],
    }))
    .filter((semester) => Number.isFinite(semester.semesterNo) && semester.semesterNo > 0)
    .sort((a, b) => a.semesterNo - b.semesterNo);
};

const buildTeacherDisplayName = (details = {}, fallbackName = "") => {
  const parts = [details["Title"], details["First"], details["Middle"], details["Last"]]
    .map((entry) => String(entry || "").trim())
    .filter(Boolean);
  if (parts.length) return parts.join(" ");
  return String(fallbackName || "").trim();
};

const validateDraft = (draft, isTeacherProfile) => {
  const getDigits = (field) => String(draft[field] || "").replace(/\D/g, "");
  const validatePhone = (field, label) => {
    const value = getDigits(field);
    if (!value) return "";
    if (value.length < 10 || value.length > 15) {
      return `${label} must be 10 to 15 digits.`;
    }
    return "";
  };

  if (isTeacherProfile) {
    const personalEmail = String(draft["Personal Email ID"] || "").trim();
    if (personalEmail && !EMAIL_REGEX.test(personalEmail)) {
      return "Personal Email ID is invalid.";
    }
    for (const [field, label] of [
      ["Mobile Number", "Mobile Number"],
      ["WhatsApp Number", "WhatsApp Number"],
      ["Personal Number", "Personal Number"],
    ]) {
      const phoneError = validatePhone(field, label);
      if (phoneError) return phoneError;
    }
    for (const yearField of ["PhD Year", "PG Year", "UG Year", "Any other Year"]) {
      const year = String(draft[yearField] || "").trim();
      if (year && !/^\d{4}$/.test(year)) {
        return `${yearField} must be a 4-digit year.`;
      }
    }
    return "";
  }

  const altEmail = String(draft["Alternate Email Id"] || "").trim();
  if (altEmail && !EMAIL_REGEX.test(altEmail)) {
    return "Alternate Email Id is invalid.";
  }
  const mobileError = validatePhone("Mobile Number", "Mobile Number");
  if (mobileError) return mobileError;
  const whatsappError = validatePhone("Whatsapp Number", "Whatsapp Number");
  if (whatsappError) return whatsappError;
  const workExperience = String(draft["Work Experience (Years)"] || "").trim();
  if (workExperience && !/^\d+(\.\d+)?$/.test(workExperience)) {
    return "Work Experience (Years) must be a valid number.";
  }
  return "";
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileData, setProfileData] = useState({});
  const [programProgress, setProgramProgress] = useState([]);
  const [programProgressError, setProgramProgressError] = useState("");
  const [expandedSemesters, setExpandedSemesters] = useState([]);
  const [periodLabel, setPeriodLabel] = useState(getPeriodLabel());

  const [editMode, setEditMode] = useState(false);
  const [editDraft, setEditDraft] = useState({});
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const [photoBusy, setPhotoBusy] = useState(false);
  const photoInputRef = useRef(null);
  const requestIdRef = useRef(0);

  const isTeacherProfile = useMemo(
    () => isTeacherProfileData(profileData),
    [profileData]
  );

  const normalizeProfileForUI = useCallback((profile) => {
    const teacher = isTeacherProfileData(profile);
    const canonicalFields = teacher ? TEACHER_CANONICAL_FIELDS : STUDENT_CANONICAL_FIELDS;
    const aliases = teacher ? TEACHER_ALIASES : STUDENT_ALIASES;
    const normalizedPersonalDetails = normalizeTemplateValues(
      profile?.personalDetails || {},
      canonicalFields,
      aliases
    );

    return {
      teacher,
      profile: {
        ...profile,
        personalDetails: normalizedPersonalDetails,
      },
    };
  }, []);

  const loadPage = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setError("");
    setProgramProgressError("");

    try {
      const profileResponse = await profileService.getMyProfile();
      if (requestId !== requestIdRef.current) return;

      const { teacher, profile } = normalizeProfileForUI(profileResponse);
      setProfileData(profile);
      setEditDraft(profile.personalDetails || {});
      setEditMode(false);
      setSaveError("");

      if (teacher) {
        setProgramProgress([]);
        setExpandedSemesters([]);
        setProgramProgressError("");
      } else {
        try {
          const progressResponse = await profileService.getMyProgress();
          if (requestId !== requestIdRef.current) return;
          const semesters = normalizeProgressPayload(progressResponse);
          setProgramProgress(semesters);
          // Extract periodType from progress response (backend now sends it)
          const pt = progressResponse?.periodType
            || progressResponse?.data?.periodType
            || "semester";
          setPeriodLabel(getPeriodLabel(pt));
          setExpandedSemesters((prev) =>
            prev.filter((semesterNo) =>
              semesters.some((semester) => semester.semesterNo === semesterNo)
            )
          );
        } catch (progressError) {
          if (requestId !== requestIdRef.current) return;
          setProgramProgress([]);
          setExpandedSemesters([]);
          setProgramProgressError(
            getErrorMessage(progressError, "Failed to load program progress.")
          );
        }
      }
    } catch (profileError) {
      if (requestId !== requestIdRef.current) return;
      setProfileData({});
      setProgramProgress([]);
      setExpandedSemesters([]);
      setError(getErrorMessage(profileError, "Failed to load profile."));
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [normalizeProfileForUI]);

  const reloadProfileOnly = useCallback(async () => {
    const profileResponse = await profileService.getMyProfile();
    const { profile } = normalizeProfileForUI(profileResponse);
    setProfileData(profile);
    setEditDraft(profile.personalDetails || {});
  }, [normalizeProfileForUI]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    if (String(user?.role || "").toLowerCase() === "teacher") {
      navigate("/teacher/dashboard");
      return;
    }
    navigate("/student/dashboard");
  };

  const handleEditToggle = () => {
    const { profile } = normalizeProfileForUI(profileData);
    setEditDraft(profile.personalDetails || {});
    setSaveError("");
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    const { profile } = normalizeProfileForUI(profileData);
    setEditDraft(profile.personalDetails || {});
    setSaveError("");
    setEditMode(false);
  };

  const handleSave = async () => {
    const validationMessage = validateDraft(editDraft, isTeacherProfile);
    if (validationMessage) {
      setSaveError(validationMessage);
      return;
    }

    const editablePersonalDetails = Object.entries(editDraft || {}).reduce(
      (acc, [field, value]) => {
        if (isFieldEditable(field)) {
          acc[field] = value;
        }
        return acc;
      },
      {}
    );
    if (Object.keys(editablePersonalDetails).length === 0) {
      setSaveError("No editable fields to update.");
      return;
    }

    setSaving(true);
    setSaveError("");
    try {
      await profileService.updateMyProfile({
        personalDetails: editablePersonalDetails,
        updateReason: "self update",
      });
      await loadPage();
      toast.success("Profile updated successfully.");
    } catch (saveErrorResponse) {
      setSaveError(getErrorMessage(saveErrorResponse, "Failed to update profile."));
      toast.error(getErrorMessage(saveErrorResponse, "Failed to update profile."));
    } finally {
      setSaving(false);
    }
  };

  const setDraftValue = (field, value) => {
    setEditDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhotoUpload = async (event) => {
    const file = event?.target?.files?.[0];
    event.target.value = "";
    if (!file) return;
    setPhotoBusy(true);
    try {
      await profileService.uploadMyProfilePhoto(file, "self profile photo update");
      await reloadProfileOnly();
      toast.success("Profile photo updated successfully.");
    } catch (uploadError) {
      toast.error(getErrorMessage(uploadError, "Failed to upload profile photo."));
    } finally {
      setPhotoBusy(false);
    }
  };

  const handlePhotoDelete = async () => {
    setPhotoBusy(true);
    try {
      await profileService.deleteMyProfilePhoto("self profile photo delete");
      await reloadProfileOnly();
      toast.success("Profile photo removed successfully.");
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError, "Failed to remove profile photo."));
    } finally {
      setPhotoBusy(false);
    }
  };

  const toggleSemester = (semesterNo) => {
    setExpandedSemesters((prev) =>
      prev.includes(semesterNo)
        ? prev.filter((entry) => entry !== semesterNo)
        : [...prev, semesterNo]
    );
  };

  const profilePhotoUrl = useMemo(() => {
    let raw =
      profileData?.profilePhotoUrl ||
      profileData?.photoUrl ||
      profileData?.user?.photoUrl ||
      profileData?.personalDetails?.["Profile Photo"] ||
      "";
    if (!raw) return "";
    // If already a full URL (Azure or external), use as-is
    if (/^https?:\/\//i.test(raw)) return raw;
    // Strip any broken host prefix (e.g. "0.0.0.0:5000/uploads/..." → "/uploads/...")
    // This handles legacy URLs stored with incorrect host format
    const uploadsIdx = raw.indexOf("/uploads/");
    if (uploadsIdx > 0) {
      raw = raw.substring(uploadsIdx);
    }
    // Prepend backend base URL for relative paths
    const backendUrl =
      (typeof window !== "undefined" && window.RUNTIME_CONFIG?.BACKEND_URL) || "";
    return backendUrl ? `${backendUrl}${raw}` : raw;
  }, [profileData]);

  const headerFields = useMemo(() => {
    const details = isPlainObject(profileData?.personalDetails)
      ? profileData.personalDetails
      : {};

    if (isTeacherProfile) {
      // Build associated schools from backend (fetched from Program.school via courses)
      const backendSchools = Array.isArray(profileData?.associatedSchools)
        ? profileData.associatedSchools
        : [];
      const schoolValue =
        backendSchools.length > 0
          ? backendSchools.join(", ")
          : details["School Associated"] || "";

      // Build access role tags (DEAN, PROGRAM_COORDINATOR, etc.)
      const accessRoles = Array.isArray(profileData?.user?.accessRoles)
        ? profileData.user.accessRoles
        : [];
      const roleTags = accessRoles
        .filter((r) => r && r !== "TEACHER") // "TEACHER" is redundant since designation shows it
        .map((r) =>
          r
            .split("_")
            .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
            .join(" ")
        );

      const fields = [
        {
          label: "Name",
          value: buildTeacherDisplayName(details, profileData?.user?.name || ""),
        },
        {
          label: "Designation",
          value: details["Designation"] || profileData?.user?.designation || "Teacher",
        },
        {
          label: "School Associated",
          value: schoolValue,
        },
      ];

      if (roleTags.length > 0) {
        fields.push({
          label: "Tags",
          value: roleTags.join(", "),
        });
      }

      return fields;
    }

    const academic = isPlainObject(profileData?.academicSummary)
      ? profileData.academicSummary
      : {};
    const semester =
      academic.currentSemester !== undefined && academic.currentSemester !== null
        ? String(academic.currentSemester).trim()
        : "";

    return [
      {
        label: "Name",
        value:
          profileData?.user?.name ||
          profileData?.personalDetails?.["Applicant Full Name (As mentioned on AADHAR Card)"],
      },
      { label: "Roll No", value: academic.rollNo || academic.rollNumber || "" },
      { label: "Enrolment No", value: academic.enrolmentNo || academic.enrollmentNo || "" },
      {
        label: "Registration No",
        value: academic.registrationNo || academic.registrationNumber || "",
      },
      { label: "Program", value: academic.program || "" },
      { label: "Stream", value: academic.stream || "" },
      { label: "Batch", value: academic.batch || "" },
      {
        label: "Academic Year + Session",
        value: [academic.academicYear, academic.session]
          .filter((entry) => String(entry || "").trim())
          .join(" / "),
      },
      {
        label: "Stage",
        value: academic.currentStage || (semester ? `${periodLabel} ${semester}` : ""),
      },
    ];
  }, [isTeacherProfile, profileData, periodLabel]);

  const isFieldEditable = useCallback(
    (field) =>
      isTeacherProfile
        ? TEACHER_EDITABLE_FIELDS.has(field)
        : STUDENT_EDITABLE_FIELDS.has(field),
    [isTeacherProfile]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-base font-semibold text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Failed to load profile
          </div>
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={loadPage}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-700"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto w-full max-w-[1600px] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {!editMode ? (
            <button
              type="button"
              onClick={handleEditToggle}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50"
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm disabled:opacity-60"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 shadow-sm disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </button>
            </div>
          )}
        </div>

        {isTeacherProfile ? (
          <TeacherProfileView
            headerFields={headerFields}
            profilePhotoUrl={profilePhotoUrl}
            photoBusy={photoBusy}
            photoInputRef={photoInputRef}
            onPhotoUpload={handlePhotoUpload}
            onPhotoDelete={handlePhotoDelete}
            editMode={editMode}
            editDraft={editDraft}
            setDraftValue={setDraftValue}
            isFieldEditable={isFieldEditable}
            toDisplay={toDisplay}
            isHttpUrl={isHttpUrl}
            saveError={saveError}
          />
        ) : (
          <StudentProfileView
            headerFields={headerFields}
            profilePhotoUrl={profilePhotoUrl}
            photoBusy={photoBusy}
            photoInputRef={photoInputRef}
            onPhotoUpload={handlePhotoUpload}
            onPhotoDelete={handlePhotoDelete}
            editMode={editMode}
            editDraft={editDraft}
            setDraftValue={setDraftValue}
            isFieldEditable={isFieldEditable}
            toDisplay={toDisplay}
            isHttpUrl={isHttpUrl}
            saveError={saveError}
            programProgress={programProgress}
            programProgressError={programProgressError}
            expandedSemesters={expandedSemesters}
            toggleSemester={toggleSemester}
            toSemesterLabel={toSemesterLabel}
            toGpaDisplay={toGpaDisplay}
            periodLabel={periodLabel}
          />
        )}

        <div className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs text-gray-500 shadow-sm">
          Last updated: {toDateDisplay(profileData?.audit?.updatedAt)}
        </div>
      </div>
    </div>
  );
}
