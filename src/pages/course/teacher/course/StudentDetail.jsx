import React, { useState, useEffect } from "react";
import { useCourse } from "../../../../context/CourseContext"; // Assuming the same path
import {
  ChevronUp,
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  GraduationCap,
} from "lucide-react";

/** Gradient section header (matches CourseDescription pattern) */
const SectionHeader = ({ icon: Icon, title, gradient, count }) => (
  <div className={`relative overflow-hidden px-6 py-4 ${gradient}`}>
    <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
    <div className="absolute -bottom-4 right-12 w-12 h-12 bg-white/5 rounded-full" />
    <div className="relative z-10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
      </div>
      {count != null && (
        <span className="px-2.5 py-1 text-xs font-bold text-white bg-white/20 rounded-full backdrop-blur-sm">
          {count}
        </span>
      )}
    </div>
  </div>
);

const StudentTable = () => {
  const { courseData } = useCourse();
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name", // Default sort by name
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Effect to load and sort data from context
  useEffect(() => {
    if (courseData?.students) {
      // Sort initial data based on the default sortConfig
      const sortedInitialData = [...(courseData?.students || [])].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return -1;
        if (a[sortConfig.key] > b[sortConfig.key]) return 1;
        return 0;
      });
      setData(sortedInitialData);
    }
  }, [courseData?.students]); // Rerun when student data changes

  // Sorting function
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedData = [...data].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setData(sortedData);
  };

  // Filtering function
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Column headers with sorting
  const SortableHeader = ({ label, sortKey }) => (
    <th
      className="px-4 py-3.5 cursor-pointer hover:bg-gray-200/60 transition-colors duration-200 text-left text-xs font-bold text-gray-600 uppercase tracking-wider"
      onClick={() => requestSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {sortConfig.key === sortKey && (
          <div className="flex flex-col">
            <ChevronUp
              className={`w-4 h-4 ${
                sortConfig.direction === "asc"
                  ? "text-emerald-600"
                  : "text-gray-300"
              }`}
            />
            <ChevronDown
              className={`w-4 h-4 ${
                sortConfig.direction === "desc"
                  ? "text-emerald-600"
                  : "text-gray-300"
              }`}
            />
          </div>
        )}
      </div>
    </th>
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8">
      {/* ============ Hero Header ============ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 p-8 shadow-lg">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Student List</h1>
              <p className="text-emerald-100 mt-1 text-sm">
                {data.length > 0
                  ? `${data.length} student${data.length !== 1 ? "s" : ""} enrolled in this course`
                  : "View and manage enrolled students"}
              </p>
            </div>
          </div>
          {data.length > 0 && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20">
              <GraduationCap className="w-4 h-4 text-white/80" />
              <span className="text-white font-semibold text-sm">{data.length} Students</span>
            </div>
          )}
        </div>
      </div>

      {/* ============ Table Card ============ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
        <SectionHeader
          icon={GraduationCap}
          title="Enrolled Students"
          gradient="bg-gradient-to-r from-sky-500 to-blue-600"
          count={filteredData.length}
        />

        <div className="p-6">
          {/* Search Bar */}
          <div className="mb-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students by name, roll number, or email..."
              className="pl-11 w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all duration-200 text-sm placeholder:text-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Sl. No.</th>
                  <SortableHeader label="Roll No." sortKey="rollNo" />
                  <SortableHeader label="Name" sortKey="name" />
                  <SortableHeader label="Email" sortKey="email" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {currentItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-emerald-50/50 transition-all duration-200">
                    <td className="px-4 py-3.5 text-center text-sm text-gray-500 font-medium">{indexOfFirstItem + index + 1}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-700">{item.rollNo || "—"}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-800">{item.name}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{item.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-5 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {filteredData.length > 0 ? indexOfFirstItem + 1 : 0}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-700">
                {Math.min(indexOfLastItem, filteredData.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">{filteredData.length}</span> entries
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-200 transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {/* Page number indicators */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    currentPage === page
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-200"
                      : "border border-gray-200 text-gray-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-200 transition-all duration-200"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTable;
