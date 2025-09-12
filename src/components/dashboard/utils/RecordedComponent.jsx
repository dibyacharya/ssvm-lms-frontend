import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Video } from "lucide-react";
import { getAllStudentLectures } from "../../../services/lecture.service";
import LoadingSpinner from "../../../utils/LoadingAnimation";
import LecturePanel from "../../../pages/lecture/LecturePanel";

const LectureContent = () => {
  const { courseID } = useParams();
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLecturePanel, setShowLecturePanel] = useState(false); 

  const fetchLectures = async () => {
    try {
      setLoading(true);
      const lecturesData = await getAllStudentLectures(courseID);
      setLectures(lecturesData);
      setLoading(false);
    } catch (err) {
      setError("Failed to load lectures. Please try again later.");
      setLoading(false);
      console.error("Error fetching lectures:", err);
    }
  };

  useEffect(() => {
    if (courseID) {
      fetchLectures();
    }
  }, [courseID]);

  if (loading)
    return (
      <div className="text-center py-4">
        <LoadingSpinner />
      </div>
    );
  if (error)
    return <div className="text-center py-4 text-red-500">{error}</div>;

  if (showLecturePanel) {
    return <LecturePanel />;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold mb-4">Recorded Content</h2>
        <button
          onClick={() => setShowLecturePanel(true)} 
          className="underline text-green-600 hover:text-green-700"
        >
          View All
        </button>
      </div>
      <div className="space-y-4">
        {lectures?.length > 0 ? (
          lectures.map((lecture, index) => (
            <div
              key={lecture._id}
              className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg"
            >
              <Video className="h-6 w-6 text-green-600 mt-1" />
              <div className="w-full flex justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{lecture.title}</h3>
                  <p className="text-gray-600">{lecture.content}</p>
                </div>
                <Link
                  to={`/lectures/${courseID}/${index}`}
                  className="text-green-500 hover:text-green-600 inline-block mt-2"
                >
                  Watch Video
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No lectures available.</p>
        )}
      </div>
    </div>
  );
};

export default LectureContent;