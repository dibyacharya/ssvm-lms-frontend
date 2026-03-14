import React from "react";
import { User } from "lucide-react";

/**
 * e-Identity Card component for Online Program students.
 * Matches KIIT eXtension School ID card design.
 */
const EIDCard = ({
  name = "",
  program = "",
  programDuration = "",
  enrollmentNo = "",
  admissionBatch = "",
  photoUrl = "",
}) => {
  const durationLabel =
    programDuration && Number(programDuration) > 0
      ? `${programDuration} Year${Number(programDuration) > 1 ? "s" : ""}`
      : "";

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl overflow-hidden shadow-lg border-[3px] border-emerald-500 bg-white">
        {/* ── Header: University Branding ── */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 px-5 py-3 text-center">
          <h3 className="text-white text-[11px] font-bold tracking-wide uppercase">
            Kalinga Institute of Industrial Technology
          </h3>
          <p className="text-emerald-100 text-[9px] mt-0.5">
            Deemed to be University U/S 3 of UGC Act, 1956
          </p>
          <p className="text-white text-xs font-semibold mt-1">
            KIIT eXtension School
          </p>
          <p className="text-emerald-100 text-[9px]">
            Centre for Distance and Online Education
          </p>
        </div>

        {/* ── Title Bar ── */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-1.5">
          <h4 className="text-white text-sm font-bold text-center tracking-wide">
            IDENTITY CARD &ndash; Online Program
          </h4>
        </div>

        {/* ── Body: Info + Photo ── */}
        <div className="p-5 flex gap-4">
          {/* Left: Fields */}
          <div className="flex-1 space-y-2.5 min-w-0">
            <InfoRow label="NAME" value={name} highlight />
            <InfoRow label="Course" value={program} />
            {durationLabel && (
              <InfoRow label="Course Duration" value={durationLabel} />
            )}
            <InfoRow label="Enrollment No." value={enrollmentNo} />
            <InfoRow label="Batch of Admission" value={admissionBatch} />
          </div>

          {/* Right: Photo */}
          <div className="flex-shrink-0">
            <div className="w-[90px] h-[110px] rounded-lg border-2 border-emerald-300 overflow-hidden bg-emerald-50 flex items-center justify-center">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <div
                className={`flex flex-col items-center justify-center text-emerald-300 ${
                  photoUrl ? "hidden" : ""
                }`}
              >
                <User className="w-10 h-10" />
                <span className="text-[8px] mt-1 text-emerald-400">
                  No Photo
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer: Signature ── */}
        <div className="px-5 pb-4 flex justify-end">
          <div className="text-center">
            <div className="w-20 border-b border-gray-300 mb-1" />
            <p className="text-[10px] text-gray-400 italic">Dean</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Small helper for each row ── */
const InfoRow = ({ label, value, highlight = false }) => (
  <div>
    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
      {label}
    </span>
    <p
      className={`text-sm leading-tight truncate ${
        highlight ? "font-bold text-gray-900" : "font-semibold text-gray-700"
      }`}
    >
      {value || "—"}
    </p>
  </div>
);

export default EIDCard;
