import React, { useState, useEffect } from "react";
import { useCourse } from "../../../../context/CourseContext"; // Assuming the same path
import {
  ChevronUp,
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
      const sortedInitialData = [...courseData.students].sort((a, b) => {
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
      className="px-4 py-3 cursor-pointer text-black hover:bg-accent2 transition-colors dark:text-white"
      onClick={() => requestSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {sortConfig.key === sortKey && (
          <div className="flex flex-col">
            <ChevronUp
              className={`w-4 h-4 ${
                sortConfig.direction === "asc"
                  ? "text-black dark:text-white"
                  : "text-accent1"
              }`}
            />
            <ChevronDown
              className={`w-4 h-4 ${
                sortConfig.direction === "desc"
                  ? "text-black dark:text-white"
                  : "text-accent1"
              }`}
            />
          </div>
        )}
      </div>
    </th>
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Search Bar */}
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search students..."
          className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-accent2  dark:text-white">
            <tr>
              <th className="px-4 py-3">Sl. No.</th>
              {/* <SortableHeader label="Roll No." sortKey="rollNo" /> */}
              <SortableHeader label="Name" sortKey="name" />
              <SortableHeader label="Email" sortKey="email" />
              {/* <SortableHeader label="Program" sortKey="program" /> */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-center">{indexOfFirstItem + index + 1}</td>
                {/* <td className="px-4 py-3">{item.rollNo}</td> */}
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{item.email}</td>
                {/* <td className="px-4 py-3">{item.program}</td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {filteredData.length > 0 ? indexOfFirstItem + 1 : 0} to{" "}
          {Math.min(indexOfLastItem, filteredData.length)} of{" "}
          {filteredData.length} entries
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentTable;