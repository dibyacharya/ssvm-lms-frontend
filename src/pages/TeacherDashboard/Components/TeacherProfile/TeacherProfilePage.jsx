import React, { useState } from "react";
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
  Plus,
} from "lucide-react";

const TeacherProfilePage = () => {
  const navigate = useNavigate();

  // State for teacher details
  const [teacherDetails, setTeacherDetails] = useState({
    name: "Prof. Ipsita Mohanty",
    department: "Concrete Technology",
    position: "Associate Professor",
    facultyId: "CSF2015021",
    email: "michael.roberts@university.edu",
    phone: "+1 (555) 987-6543",
    officeLocation: "University Campus, Faculty Building A, Room 304",
    specialization: "Artificial Intelligence & Data Science",
  });

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
    title: "Professor of AI & Machine Learning at Harvard University",
    bio: "Prof. Ipsita Mohanty is a leading researcher in Artificial Intelligence and has published over 50 research papers. He specializes in deep learning, neural networks, and AI ethics. With 15+ years of experience, he has mentored numerous PhD students and contributed to AI policy discussions globally.",
    socialLinks: [
      { name: "LinkedIn", url: "#" },
      { name: "Scopus", url: "#" },
      { name: "Google Scholar", url: "#" },
    ],
  });

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

  // Handle social link change
  const handleSocialLinkChange = (index, field, value) => {
    const updatedLinks = [...mentorDetails.socialLinks];
    updatedLinks[index] = {
      ...updatedLinks[index],
      [field]: value,
    };
    setMentorDetails({
      ...mentorDetails,
      socialLinks: updatedLinks,
    });
  };

  // Add new social link
  const handleAddSocialLink = () => {
    setMentorDetails({
      ...mentorDetails,
      socialLinks: [...mentorDetails.socialLinks, { name: "", url: "" }],
    });
  };

  // Remove social link
  const handleRemoveSocialLink = (index) => {
    const updatedLinks = [...mentorDetails.socialLinks];
    updatedLinks.splice(index, 1);
    setMentorDetails({
      ...mentorDetails,
      socialLinks: updatedLinks,
    });
  };

  // Save mentor details changes
  const saveMentorDetails = () => {
    setEditingSection(null);
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
              <div className="w-36 h-40 rounded-lg overflow-hidden shadow-lg">
                <img
                  src="https://t4.ftcdn.net/jpg/03/78/43/25/360_F_378432516_6IlKiCLDAqSCGcfc6o8VqWhND51XqfFm.jpg"
                  alt="Teacher Profile"
                  className="w-full h-full object-cover"
                />
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
                    {teacherDetails.position}
                  </span>
                  <span className="text-gray-500">
                    ID: {teacherDetails.facultyId}
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
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={mentorDetails.title}
                  onChange={handleMentorChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={mentorDetails.bio}
                  onChange={handleMentorChange}
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Social Links Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Social Links
                </label>
                {mentorDetails.socialLinks.map((link, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={link.name}
                      onChange={(e) =>
                        handleSocialLinkChange(index, "name", e.target.value)
                      }
                      placeholder="Platform Name"
                      className="p-2 border border-gray-300 rounded-md w-1/3"
                    />
                    <input
                      type="text"
                      value={link.url}
                      onChange={(e) =>
                        handleSocialLinkChange(index, "url", e.target.value)
                      }
                      placeholder="URL"
                      className="p-2 border border-gray-300 rounded-md flex-grow"
                    />
                    <button
                      onClick={() => handleRemoveSocialLink(index)}
                      className="bg-red-100 text-red-600 p-2 rounded-md hover:bg-red-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddSocialLink}
                  className="mt-2 bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm hover:bg-blue-200 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Link
                </button>
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
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-gray-700">{mentorDetails.title}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{mentorDetails.bio}</p>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex gap-2">
                  {mentorDetails.socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm hover:bg-blue-200"
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>
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

        {/* Specialization Row */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Book className="w-5 h-5 text-green-600" />
            Specialization
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <span className="text-gray-600">
              {teacherDetails.specialization}
            </span>
          </div>
        </div>

        {/* Academic Details Row */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-green-600" />
            Academic Background
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
              <GraduationCap className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <div className="text-sm text-green-600 font-medium">
                  Education
                </div>
                <div className="text-gray-700">{academicDetails.education}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
              <Briefcase className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <div className="text-sm text-green-600 font-medium">
                  Experience
                </div>
                <div className="text-gray-700">
                  {academicDetails.experience}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
              <Book className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <div className="text-sm text-green-600 font-medium">
                  Research Areas
                </div>
                <div className="text-gray-700">{academicDetails.research}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
              <FileText className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <div className="text-sm text-green-600 font-medium">
                  Publications
                </div>
                <div className="text-gray-700">
                  {academicDetails.publications}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Office Hours Row */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />
            Office Hours
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
              <div>
                <span className="text-sm text-green-600 font-medium">
                  Monday:{" "}
                </span>
                <span className="text-gray-700">{officeHours.monday}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
              <div>
                <span className="text-sm text-green-600 font-medium">
                  Wednesday:{" "}
                </span>
                <span className="text-gray-700">{officeHours.wednesday}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
              <div>
                <span className="text-sm text-green-600 font-medium">
                  Friday:{" "}
                </span>
                <span className="text-gray-700">{officeHours.friday}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
              <Mail className="w-5 h-5 text-green-600" />
              <div>
                <span className="text-sm text-green-600 font-medium">
                  By Appointment:{" "}
                </span>
                <span className="text-gray-700">
                  {officeHours.byAppointment}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfilePage;
