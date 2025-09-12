import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Plus,
  MessageSquare,
  CheckCircle,
  RefreshCw,
  Clock,
  Search,
  Eye,
  Check,
  Edit,
  ChevronLeft,
  ChevronRight,
  X,
  Upload,
  Mail,
  Phone,
  ChevronDown,
  AlertTriangle,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const HelpdeskSection = () => {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState([
    {
      id: "TKT-12345",
      category: "Assessment",
      title: "Unable to grade student submissions",
      description:
        "The grading tool is not loading when I click on student submissions.",
      priority: "High",
      lastUpdate: "24-Apr 17:10",
      status: "In-Progress",
      assignee: "Support Team",
    },
    {
      id: "TKT-12346",
      category: "Live-Class Tech",
      title: "Audio issues during live session",
      description:
        "Students reported they couldn't hear me during the lecture yesterday.",
      priority: "Medium",
      lastUpdate: "23-Apr 14:30",
      status: "Resolved",
      assignee: "Tech Support",
    },
    {
      id: "TKT-12347",
      category: "Content Authoring",
      title: "Video upload failing",
      description:
        "Getting error code 403 when trying to upload lecture videos.",
      priority: "High",
      lastUpdate: "22-Apr 09:15",
      status: "Pending",
      assignee: "Unassigned",
    },
    {
      id: "TKT-12348",
      category: "Account & Access",
      title: "Can't access course materials",
      description:
        "Getting 'permission denied' when accessing restricted course content.",
      priority: "Low",
      lastUpdate: "20-Apr 11:45",
      status: "Resolved",
      assignee: "Admin Team",
    },
  ]);

  const categories =
    user.role === "teacher"
      ? [
          "Lecture Upload / Media",
          "Gradebook / Assessment",
          "Live-Class Tools",
          "Content Authoring",
          "Account & Access",
        ]
      : [
          "Academic Content",
          "Assessment",
          "Live-Class Tech",
          "Fee/Payment",
          "Misc",
        ];

  const handleRaiseTicket = () => {
    setShowModal(false);
    // Add animation for success notification
    const notification = document.getElementById("success-notification");
    notification.classList.remove("hidden");
    notification.classList.add("slide-in");

    setTimeout(() => {
      notification.classList.remove("slide-in");
      notification.classList.add("slide-out");
      setTimeout(() => {
        notification.classList.add("hidden");
        notification.classList.remove("slide-out");
      }, 500);
    }, 3000);
  };

  const filteredTickets = tickets.filter((ticket) => {
    // Filter by tab
    if (activeTab !== "all" && ticket.status.toLowerCase() !== activeTab) {
      return false;
    }

    // Filter by search
    if (searchQuery) {
      return (
        ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return true;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "in-progress":
        return "bg-blue-500";
      case "resolved":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Success Notification */}
        <div
          id="success-notification"
          className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 hidden transition-all duration-500"
        >
          <div className="flex items-center space-x-2">
            <Check size={20} />
            <span>Ticket raised successfully!</span>
          </div>
        </div>

        {/* Header Section with Back Button */}
        <div className="flex items-center mb-6">
          <button
            className="mr-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-200"
            onClick={() => {
              navigate(-1);
            }}
          >
            <ArrowLeft size={40} className="text-primary" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Helpdesk Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and track your support tickets
            </p>
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors duration-200 flex items-center space-x-2 shadow-md"
          >
            <Plus size={18} />
            <span>Raise Ticket</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">Total Tickets</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">
                  {tickets.length}
                </h3>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <span className="text-green-500">↑ 12%</span> from last week
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">Resolved</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">
                  {tickets.filter((t) => t.status === "Resolved").length}
                </h3>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <span className="text-green-500">↑ 8%</span> from last week
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">In Progress</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">
                  {tickets.filter((t) => t.status === "In-Progress").length}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <RefreshCw className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <span className="text-yellow-500">↔ 0%</span> from last week
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">SLA Compliance</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">95%</h3>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <span className="text-green-500">↑ 3%</span> from last week
            </div>
          </div>
        </div>

        {/* Ticket Management Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    activeTab === "all"
                      ? "bg-white text-primary shadow"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  All Tickets
                </button>
                <button
                  onClick={() => setActiveTab("pending")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    activeTab === "pending"
                      ? "bg-white text-primary shadow"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setActiveTab("in-progress")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    activeTab === "in-progress"
                      ? "bg-white text-primary shadow"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => setActiveTab("resolved")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    activeTab === "resolved"
                      ? "bg-white text-primary shadow"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Resolved
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search tickets..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3 border-b border-gray-200">
                      Ticket ID
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200">
                      Title/Description
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200">
                      Category
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200">
                      Priority
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200">
                      Assignee
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200">
                      Status
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTickets.length > 0 ? (
                    filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                          {ticket.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {ticket.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {ticket.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ticket.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-sm font-medium ${getPriorityColor(
                              ticket.priority
                            )}`}
                          >
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ticket.lastUpdate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ticket.assignee}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(
                              ticket.status
                            )}`}
                          >
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-primary hover:text-indigo-900">
                              <Eye size={18} />
                            </button>
                            {ticket.status !== "Resolved" && (
                              <button className="text-green-600 hover:text-green-900">
                                <Check size={18} />
                              </button>
                            )}
                            <button className="text-gray-600 hover:text-gray-900">
                              <Edit size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <AlertTriangle
                            size={40}
                            className="text-gray-400 mb-3"
                          />
                          <p>No tickets found matching your criteria.</p>
                          <button
                            onClick={() => {
                              setActiveTab("all");
                              setSearchQuery("");
                            }}
                            className="mt-2 text-primary hover:text-indigo-900"
                          >
                            Reset filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredTickets.length > 0 && (
              <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">1</span> to{" "}
                      <span className="font-medium">
                        {filteredTickets.length}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {filteredTickets.length}
                      </span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <a
                        href="#"
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft size={18} />
                      </a>
                      <a
                        href="#"
                        aria-current="page"
                        className="z-10 bg-indigo-50 border-indigo-500 text-primary relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                      >
                        1
                      </a>
                      <a
                        href="#"
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight size={18} />
                      </a>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Modal with Animation */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 -top-10">
            <div
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg m-4 animate-fadeIn"
              style={{
                maxHeight: "90dvh", // Ensures the modal doesn't exceed 90% of the viewport height
                overflowY: "auto", // Adds a scroll bar if the content exceeds the modal height
              }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Raise a Support Ticket
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ticket Title
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter a brief title for your issue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-primary"
                        name="priority"
                        value="low"
                      />
                      <span className="ml-2 text-gray-700">Low</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-primary"
                        name="priority"
                        value="medium"
                        defaultChecked
                      />
                      <span className="ml-2 text-gray-700">Medium</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-primary"
                        name="priority"
                        value="high"
                      />
                      <span className="ml-2 text-gray-700">High</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    rows="4"
                    placeholder="Provide detailed information about the issue..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Steps to Reproduce
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    rows="3"
                    placeholder="List the steps to reproduce this issue (if applicable)..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attach Files
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80"
                        >
                          <span>Upload files</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            multiple
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, PDF up to 10MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRaiseTicket}
                  className="px-4 py-2 bg-primary border border-transparent rounded-lg text-white shadow-sm hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Submit Ticket
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Knowledge Base Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Recent Knowledge Base Articles
            </h2>
            <div className="space-y-4">
              {[
                {
                  title: "How to troubleshoot audio issues in live classes",
                  category: "Live-Class Tech",
                  views: 532,
                  date: "15 Apr 2025",
                },
                {
                  title: "Understanding the grading system for assessments",
                  category: "Assessment",
                  views: 421,
                  date: "12 Apr 2025",
                },
                {
                  title: "Best practices for video content creation",
                  category: "Content Authoring",
                  views: 367,
                  date: "08 Apr 2025",
                },
              ].map((article, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium text-primary hover:underline cursor-pointer">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Category: {article.category}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{article.views} views</p>
                      <p>{article.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-right">
              <a
                href="#"
                className="text-primary hover:text-indigo-900 text-sm font-medium"
              >
                View all knowledge base articles →
              </a>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Help</h2>
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-lg">
                <h3 className="font-medium text-primary">
                  Need immediate assistance?
                </h3>
                <p className="text-sm text-primary mt-1">
                  Our support team is available from 8 AM to 8 PM.
                </p>
                <button className="mt-3 w-full flex justify-center items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors duration-200">
                  <MessageCircle size={16} />
                  <span>Live Chat</span>
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">
                  Popular Help Topics
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="flex items-center text-sm text-primary hover:text-indigo-900"
                    >
                      <ChevronRight size={16} className="mr-2" />
                      How to reset your password
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="flex items-center text-sm text-primary hover:text-indigo-900"
                    >
                      <ChevronRight size={16} className="mr-2" />
                      Troubleshooting upload errors
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="flex items-center text-sm text-primary hover:text-indigo-900"
                    >
                      <ChevronRight size={16} className="mr-2" />
                      Setting up virtual classrooms
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="flex items-center text-sm text-primary hover:text-indigo-900"
                    >
                      <ChevronRight size={16} className="mr-2" />
                      Student grading best practices
                    </a>
                  </li>
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium text-gray-700 mb-2">
                  Contact Support
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Can't find what you're looking for?
                </p>
                <div className="flex space-x-2">
                  <button className="flex-1 flex justify-center items-center space-x-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50">
                    <Mail size={16} />
                    <span>Email</span>
                  </button>
                  <button className="flex-1 flex justify-center items-center space-x-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50">
                    <Phone size={16} />
                    <span>Phone</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="bg-gradient-to-r from-primary to-primary/30 rounded-xl shadow-md p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold">
                Help us improve our support system
              </h2>
              <p className="mt-1 opacity-90">
                Your feedback helps us serve you better.
              </p>
            </div>
            <button className="px-6 py-2 bg-white text-primary rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium shadow-md">
              Give Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpdeskSection;
