import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Book,
  Award,
  Clock,
  Calendar,
  GraduationCap,
  Briefcase,
  FileText,
  Bookmark,
  User,
  Globe,
  Edit,
  Save,
  X,
} from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import api from "../../../../services/api";

const TeacherProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  // State for teacher details
  const [teacherDetails, setTeacherDetails] = useState({
    name: "",
    department: "",
    position: "",
    facultyId: "",
    email: "",
    phone: "",
    officeLocation: "",
    specialization: "",
  });

  useEffect(() => {
    if (user) {
      setTeacherDetails((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.mobileNo || prev.phone,
        position: user.role || prev.position,
      }));
    }
  }, [user]);

  const userInitials = useMemo(() => {
    const n = user?.name || "";
    return n
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("");
  }, [user]);

  // State for academic details
  const [academicDetails, setAcademicDetails] = useState({
    education: "Ph.D. in Concrete Technology, Stanford University",
    experience: "12 years of teaching experience",
    research: "Machine Learning, Natural Language Processing, Computer Vision",
    publications: "25+ research papers in international journals",
  });

  // State for office hours
  const [officeHours, setOfficeHours] = useState({
    monday: "10:00 AM - 12:00 PM",
    wednesday: "2:00 PM - 4:00 PM",
    friday: "1:00 PM - 3:00 PM",
    byAppointment: "Available upon request via email",
  });

  // New state for mentor details
  const [mentorDetails, setMentorDetails] = useState({
    profTitle: "",
    profDesc: "",
    googleScholarLink: "",
    scopusLink: "",
    linkedInLink: "",
  });

  // Load mentor details from user object if available
  useEffect(() => {
    if (user) {
      setMentorDetails((prev) => ({
        ...prev,
        profTitle: user.profTitle || "",
        profDesc: user.profDesc || "",
        googleScholarLink: user.googleScholarLink || "",
        scopusLink: user.scopusLink || "",
        linkedInLink: user.linkedInLink || "",
      }));
    }
  }, [user]);

  // Edit mode states
  const [editingSection, setEditingSection] = useState(null);

  // Toggle edit mode for sections
  const toggleEdit = (section) => {
    if (editingSection === section) {
      setEditingSection(null);
    } else {
      setEditingSection(section);
    }
  };

  // Handle input change for mentor details
  const handleMentorChange = (e) => {
    const { name, value } = e.target;
    setMentorDetails({
      ...mentorDetails,
      [name]: value,
    });
  };

  // Update teacher profile API function
  const updateTeacherProfile = async (profileData) => {
    try {
      const response = await api.put("/teachers/profile", profileData);
      const data = response.data;

      if (data.success) {
        alert("Profile updated successfully!");
        return data.teacher;
      } else {
        alert(`Error: ${data.message || "Failed to update profile"}`);
        return null;
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to update profile. Please try again.";
      alert(errorMessage);
      return null;
    }
  };

  // Save mentor details changes
  const saveMentorDetails = async () => {
    const profileData = {
      profTitle: mentorDetails.profTitle,
      profDesc: mentorDetails.profDesc,
      googleScholarLink: mentorDetails.googleScholarLink,
      scopusLink: mentorDetails.scopusLink,
      linkedInLink: mentorDetails.linkedInLink,
    };

    const updatedTeacher = await updateTeacherProfile(profileData);
    if (updatedTeacher) {
      setEditingSection(null);
      // Update local state with the updated data
      setMentorDetails((prev) => ({
        ...prev,
        profTitle: updatedTeacher.profTitle || prev.profTitle,
        profDesc: updatedTeacher.profDesc || prev.profDesc,
        googleScholarLink: updatedTeacher.googleScholarLink || prev.googleScholarLink,
        scopusLink: updatedTeacher.scopusLink || prev.scopusLink,
        linkedInLink: updatedTeacher.linkedInLink || prev.linkedInLink,
      }));
      // Update the user data in AuthContext/store
      updateUser({
        profTitle: updatedTeacher.profTitle,
        profDesc: updatedTeacher.profDesc,
        googleScholarLink: updatedTeacher.googleScholarLink,
        scopusLink: updatedTeacher.scopusLink,
        linkedInLink: updatedTeacher.linkedInLink,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-6 ">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 rounded-lg hover:bg-primary/10 text-green-600 hover:text-green-700 mb-4 justify-start p-2 border-2 border-primary"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        {/* Profile Header Row */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 h-16"></div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-36 h-40 rounded-lg overflow-hidden shadow-lg bg-gray-200 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-bold text-gray-700">
                  {userInitials || "T"}
                </div>
              </div>
              <div className="flex-grow">
                <h1 className="text-2xl text-center md:text-left font-bold text-gray-800">
                  {teacherDetails.name}
                </h1>
                <div className="flex flex-col md:flex-row items-center gap-4 mt-2 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-green-600" />
                    <span>{teacherDetails.department}</span>
                  </div>
                  <span className="text-green-600 font-semibold">
                    Professor
                  </span>
                  
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* New Mentor Details Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-green-600" />
              Mentor Details
            </h2>
            <button
              onClick={() => toggleEdit("mentor")}
              className="text-green-600 hover:text-green-700"
            >
              {editingSection === "mentor" ? (
                <X className="w-5 h-5" />
              ) : (
                <Edit className="w-5 h-5" />
              )}
            </button>
          </div>

          {editingSection === "mentor" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Title
                </label>
                <input
                  type="text"
                  name="profTitle"
                  value={mentorDetails.profTitle}
                  onChange={handleMentorChange}
                  placeholder="e.g., Associate Professor of AI"
                  maxLength={200}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Description
                </label>
                <textarea
                  name="profDesc"
                  value={mentorDetails.profDesc}
                  onChange={handleMentorChange}
                  rows={4}
                  placeholder="Enter your professional bio/description"
                  maxLength={2000}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Social Links Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Social Links
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Google Scholar Link
                    </label>
                    <input
                      type="url"
                      name="googleScholarLink"
                      value={mentorDetails.googleScholarLink}
                      onChange={handleMentorChange}
                      placeholder="https://scholar.google.com/..."
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Scopus Link
                    </label>
                    <input
                      type="url"
                      name="scopusLink"
                      value={mentorDetails.scopusLink}
                      onChange={handleMentorChange}
                      placeholder="https://www.scopus.com/..."
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      LinkedIn Link
                    </label>
                    <input
                      type="url"
                      name="linkedInLink"
                      value={mentorDetails.linkedInLink}
                      onChange={handleMentorChange}
                      placeholder="https://www.linkedin.com/..."
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={saveMentorDetails}
                  className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {mentorDetails.profTitle && (
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-gray-700">{mentorDetails.profTitle}</p>
                </div>
              )}
              {mentorDetails.profDesc && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{mentorDetails.profDesc}</p>
                </div>
              )}
              {(mentorDetails.googleScholarLink ||
                mentorDetails.scopusLink ||
                mentorDetails.linkedInLink) && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="flex gap-2 flex-wrap">
                    {mentorDetails.googleScholarLink && (
                      <a
                        href={mentorDetails.googleScholarLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm hover:bg-blue-200"
                      >
                        Google Scholar
                      </a>
                    )}
                    {mentorDetails.scopusLink && (
                      <a
                        href={mentorDetails.scopusLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm hover:bg-blue-200"
                      >
                        Scopus
                      </a>
                    )}
                    {mentorDetails.linkedInLink && (
                      <a
                        href={mentorDetails.linkedInLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm hover:bg-blue-200"
                      >
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              )}
              {!mentorDetails.profTitle &&
                !mentorDetails.profDesc &&
                !mentorDetails.googleScholarLink &&
                !mentorDetails.scopusLink &&
                !mentorDetails.linkedInLink && (
                  <p className="text-gray-500 italic">
                    No mentor details available. Click edit to add information.
                  </p>
                )}
            </div>
          )}
        </div>

        {/* Contact Information Row */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-green-600" />
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
              <Mail className="w-5 h-5 text-green-600" />
              <span className="text-gray-600">{teacherDetails.email}</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
              <Phone className="w-5 h-5 text-green-600" />
              <span className="text-gray-600">{teacherDetails.phone}</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
              <MapPin className="w-5 h-5 text-green-600" />
              <span className="text-gray-600">
                {teacherDetails.officeLocation}
              </span>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Address
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium mb-1">Permanent Address</div>
              <div className="text-gray-700 break-words">{user?.fullPermanentAddress || "—"}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium mb-1">Correspondence Address</div>
              <div className="text-gray-700 break-words">{user?.fullCorrespondenceAddress || "—"}</div>
            </div>
          </div>
        </div>

        {/* Specialization Row */}
        {/* <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Book className="w-5 h-5 text-green-600" />
            Specialization
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <span className="text-gray-600">
              {teacherDetails.specialization}
            </span>
          </div>
        </div> */}

        {/* Academic Details Row */}
        

        {/* Office Hours Row */}
       
      </div>
    </div>
  );
};

export default TeacherProfilePage;
