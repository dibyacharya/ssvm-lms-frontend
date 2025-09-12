import React, { useState } from "react";
import { Save } from "lucide-react";
import { updateCourse } from "../services/course.service";
import { useCourse } from "../context/CourseContext";
import toast from "react-hot-toast";

const SaveButton = ({ urlId, className = "" }) => {
  const { courseData, setCourseData } = useCourse();
  const [isSaving, setIsSaving] = useState(false);
  const handleSaveCourse = async () => {
    const courseId = urlId || extractCourseIdFromPath();

    if (!courseId) {
      toast.error("No course ID found");
      return;
    }

    try {
      setIsSaving(true);

      // Call the API to update the course
      const updatedCourse = await updateCourse(courseId, courseData);

      // Update the context with the response

      setCourseData({ ...updatedCourse, ["students"]: courseData.students });

      toast.success("Course saved successfully!");
    } catch (error) {
      console.error("Error saving course:", error);
      toast.error("Failed to save course");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button
      onClick={handleSaveCourse}
      disabled={isSaving}
      className={`flex  items-center gap-2 bg-primary/80 hover:bg-primary text-white py-2 px-4 rounded-md transition-colors my-4 ${
        isSaving ? "opacity-70 cursor-not-allowed" : ""
      } ${className}`}
    >
      {isSaving ? (
        <>
          <span className="animate-spin">
            <Save size={16} />
          </span>
          <span>Saving...</span>
        </>
      ) : (
        <>
          <Save size={16} />
          <span>Save Changes</span>
        </>
      )}
    </button>
  );
};

export default SaveButton;
