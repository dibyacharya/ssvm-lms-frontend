import React, { useState, useEffect } from "react";
import { getAllCourseAnnouncements } from "../../../../../services/announcement.service"; // Adjust the import path as needed
import { useParams } from "react-router-dom";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

const AllAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { courseID } = useParams();

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await getAllCourseAnnouncements({ courseID });
      setAnnouncements(response.announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    let filtered = announcements;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (announcement) =>
          announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date (if applicable)
    if (filter === "recent") {
      filtered = filtered.sort(
        (a, b) => new Date(b.publishDate) - new Date(a.publishDate)
      );
    }

    setFilteredAnnouncements(filtered);
  }, [searchTerm, filter, announcements]);

  // Group announcements by week
  const groupAnnouncementsByWeek = (announcements) => {
    const grouped = {};

    announcements.forEach((announcement) => {
      const publishDate = new Date(announcement.publishDate);
      const weekStart = startOfWeek(publishDate, { weekStartsOn: 1 }); // Week starts on Monday
      const weekEnd = endOfWeek(publishDate, { weekStartsOn: 1 });
      const weekRange = `${format(weekStart, "MMM d")} - ${format(
        weekEnd,
        "MMM d"
      )}`;

      if (!grouped[weekRange]) {
        grouped[weekRange] = [];
      }
      grouped[weekRange].push(announcement);
    });

    return grouped;
  };

  const groupedAnnouncements = groupAnnouncementsByWeek(filteredAnnouncements);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-lg border border-gray-100 dark:border-gray-600">
      <h1 className="text-2xl font-bold text-primary dark:text-blue-400 mb-4">
        All Announcements
      </h1>

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder="Search announcements..."
          className="w-full md:w-1/2 px-4 py-2 border border-tertiary/10 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="w-full md:w-1/4 px-4 py-2 border border-tertiary/10 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="recent">Most Recent</option>
        </select>
      </div>

      {/* Announcements List */}
      <div className="space-y-8">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-blue-400 mx-auto mb-4"></div>
            <p className="text-tertiary dark:text-gray-400">Loading announcements...</p>
          </div>
        ) : Object.keys(groupedAnnouncements).length > 0 ? (
          Object.keys(groupedAnnouncements).map((weekRange) => (
            <div key={weekRange}>
              <h2 className="text-lg font-semibold text-primary dark:text-blue-400 mb-4 border-b border-gray-200 dark:border-gray-600 pb-2">
                {weekRange}
              </h2>
              <div className="space-y-4">
                {groupedAnnouncements[weekRange].map((announcement) => (
                  <div
                    key={announcement._id}
                    className="p-4 border border-tertiary/10 dark:border-gray-600 rounded-lg hover:shadow-md dark:hover:shadow-lg transition-all bg-white dark:bg-gray-700"
                  >
                    <h3 className="text-lg font-semibold text-primary dark:text-white">
                      {announcement.title}
                    </h3>
                    <div className="text-sm text-tertiary dark:text-gray-400 mt-1">
                      {new Date(announcement.publishDate).toLocaleDateString()}{" "}
                      {new Date(announcement.publishDate).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                    {announcement.image?.imageUrl && (
                      <img
                        src={announcement.image.imageUrl}
                        alt={announcement.title}
                        className="mt-3 w-[50%] h-[300px] object-cover rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm dark:shadow-lg"
                      />
                    )}
                    <p className="mt-3 text-tertiary dark:text-gray-300 leading-relaxed">{announcement.content}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">No Announcements Found</h3>
            <p className="text-tertiary dark:text-gray-500">Try adjusting your search or filter to find more announcements.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllAnnouncements;