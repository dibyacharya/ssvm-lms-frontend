import { ArrowLeft, User as UserIcon } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const StudentProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const labelClass = "text-sm text-gray-500 dark:text-gray-400 font-medium";
  const valueClass = "text-gray-800 dark:text-gray-700";

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent1/10 to-accent/20 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-accent1 dark:text-accent2 hover:text-accent1 dark:hover:text-accent1 border-2 rounded-lg border-accent1 dark:border-accent1/70 p-2 hover:border-accent1 dark:hover:border-accent1/40 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
        </div>

        {/* Profile Header */}
        <div className="bg-white dark:bg-white rounded-xl shadow-lg dark:shadow-xl overflow-hidden border border-gray-200 dark:border-gray-300">
          <div className="bg-gradient-to-r from-accent1/80 to-accent1 dark:from-accent1/70 dark:to-accent1/90 h-16"></div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-36 h-40 rounded-lg overflow-hidden shadow-lg dark:shadow-xl flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                <UserIcon className="w-20 h-20 text-gray-400" />
              </div>
              <div className="flex-grow text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-900">
                  {user?.name || "User"}
                </h1>
                <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-3 text-gray-600 dark:text-gray-600 text-sm">
                  <span className="flex items-center gap-1">{user?.role || "student"}</span>
                  <span className="text-gray-500">ID: {user?.id || user?._id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white dark:bg-white rounded-xl shadow-lg dark:shadow-xl p-6 space-y-4 border border-gray-200 dark:border-gray-300">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-900">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-300">
              <div className={labelClass}>Name</div>
              <div className={valueClass}>{user?.name}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-300">
              <div className={labelClass}>Email</div>
              <div className={valueClass}>{user?.email}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-300">
              <div className={labelClass}>Mobile</div>
              <div className={valueClass}>{user?.mobileNo}</div>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white dark:bg-white rounded-xl shadow-lg dark:shadow-xl p-6 space-y-4 border border-gray-200 dark:border-gray-300">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-900">Personal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-300">
              <div className={labelClass}>Gender</div>
              <div className={valueClass}>{user?.gender}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-300">
              <div className={labelClass}>Age (as on 2025)</div>
              <div className={valueClass}>{user?.ageAsOn2025}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-300">
              <div className={labelClass}>Nationality</div>
              <div className={valueClass}>{user?.nationality}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-300">
              <div className={labelClass}>Mother Tongue</div>
              <div className={valueClass}>{user?.motherTongue}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-300">
              <div className={labelClass}>Religion</div>
              <div className={valueClass}>{user?.religion}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-300">
              <div className={labelClass}>Category</div>
              <div className={valueClass}>{user?.category}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-300">
              <div className={labelClass}>Physically Challenged</div>
              <div className={valueClass}>{user?.areYouPhysicallyChallenged ? "Yes" : "No"}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-300">
              <div className={labelClass}>Blood Group</div>
              <div className={valueClass}>{user?.bloodGroup}</div>
            </div>
          </div>
        </div>

        {/* Identification */}
        <div className="bg-white dark:bg-white rounded-xl shadow-lg dark:shadow-xl p-6 space-y-4 border border-gray-200 dark:border-gray-300">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-900">Identification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-300">
              <div className={labelClass}>Aadhaar Number</div>
              <div className={valueClass}>{user?.aadhaarNumber}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-300">
              <div className={labelClass}>Passport Number</div>
              <div className={valueClass}>{user?.passportNumber}</div>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="bg-white dark:bg-white rounded-xl shadow-lg dark:shadow-xl p-6 space-y-4 border border-gray-200 dark:border-gray-300">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-900">Addresses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-300">
              <div className={labelClass}>Permanent Address</div>
              <div className={valueClass}>{user?.fullPermanentAddress}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-300">
              <div className={labelClass}>Correspondence Address</div>
              <div className={valueClass}>{user?.fullCorrespondenceAddress}</div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-300">
            <div className={labelClass}>Is Correspondence same as Permanent?</div>
            <div className={valueClass}>{user?.isYourCorrespondenceAddressSameAsPermanentAddress ? "Yes" : "No"}</div>
          </div>
        </div>

        {/* Guardian */}
        <div className="bg-white dark:bg-white rounded-xl shadow-lg dark:shadow-xl p-6 space-y-2 border border-gray-200 dark:border-gray-300">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-900">Parent/Guardian</h2>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-300">
            <div className={labelClass}>Name</div>
            <div className={valueClass}>{user?.parentGuardianDetails}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;