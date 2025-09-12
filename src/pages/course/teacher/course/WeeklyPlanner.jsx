import React, { useState } from "react";
import { useCourse } from "../../../../context/CourseContext";
import {
  Plus,
  X,
  ChevronDown,
  Calendar,
  Clock,
  Circle,
  CheckCircle,
  BookOpen,
  FilePlus,
  Calendar as CalendarIcon,
  AlertCircle,
} from "lucide-react";
import SaveButton from "../../../../utils/CourseSaveButton";
import { useParams } from "react-router-dom";

const WeeklyPlanner = () => {
  const { courseData, addWeek, updateWeek, removeWeek } = useCourse();
  const [newTopic, setNewTopic] = useState("");
  const [editingWeek, setEditingWeek] = useState(null);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const { courseID } = useParams();

  const handleAddTopic = (weekNumber) => {
    if (newTopic.trim()) {
      const week = courseData.weeklyPlan.find(
        (w) => w.weekNumber === weekNumber
      );
      const updatedTopics = [...week.topics, newTopic.trim()];
      updateWeek(weekNumber, updatedTopics);
      setNewTopic("");
    }
  };

  const handleRemoveTopic = (weekNumber, topicIndex) => {
    const week = courseData.weeklyPlan.find((w) => w.weekNumber === weekNumber);
    const updatedTopics = week.topics.filter(
      (_, index) => index !== topicIndex
    );
    updateWeek(weekNumber, updatedTopics);
  };

  const toggleWeekExpansion = (weekNumber) => {
    setExpandedWeek(expandedWeek === weekNumber ? null : weekNumber);
    if (editingWeek === weekNumber && expandedWeek !== weekNumber) {
      setEditingWeek(null);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      <div className="flex justify-between items-center absolute -top-10 right-36">
        <SaveButton urlId={courseID} />
      </div>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Weekly Delivery Plan
          </h1>
          <p className="text-tertiary mt-1">
            Organize your course content by weekly schedule
          </p>
        </div>
      </div>

      {/* Weeks Grid */}
      <div className="grid grid-cols-1 gap-6">
        {courseData.weeklyPlan.map((week) => (
          <div
            key={week.weekNumber}
            className="bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden transition-all duration-300 hover:shadow-md"
          >
            <div
              className={`cursor-pointer transition-all duration-200 ${
                expandedWeek === week.weekNumber
                  ? "bg-primary/5 border-b border-primary/10"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => toggleWeekExpansion(week.weekNumber)}
            >
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>

                  <div className="flex flex-col">
                    <span className="font-medium text-primary bg-primary/10 px-3 py-1 rounded-full text-xs mb-1 w-fit">
                      Week {week.weekNumber}
                    </span>

                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-primary mr-2" />
                      <span className="text-primary font-medium">
                        {week.topics.length}{" "}
                        {week.topics.length === 1 ? "Topic" : "Topics"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeWeek(week.weekNumber);
                    }}
                    className="p-2 hover:bg-red-50 rounded-full text-red-500 transition-colors"
                    aria-label="Remove week"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div
                    className={`p-2 rounded-full bg-gray-100 transition-transform duration-300 ${
                      expandedWeek === week.weekNumber ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDown className="w-5 h-5 text-tertiary" />
                  </div>
                </div>
              </div>
            </div>

            {expandedWeek === week.weekNumber && (
              <div className="p-6 bg-white">
                <div className="space-y-4">
                  {week.topics.length > 0 ? (
                    week.topics.map((topic, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-tertiary/10 hover:border-primary/20 transition-colors duration-200 group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-none w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-primary font-medium">
                            {topic}
                          </span>
                        </div>

                        <button
                          onClick={() =>
                            handleRemoveTopic(week.weekNumber, index)
                          }
                          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-full text-red-500 transition-all duration-200"
                          aria-label="Remove topic"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FilePlus className="w-12 h-12 text-tertiary/30 mx-auto mb-4" />
                      <p className="text-tertiary/60 italic">
                        No topics added for this week yet. Add your first topic
                        below.
                      </p>
                    </div>
                  )}

                  {editingWeek === week.weekNumber ? (
                    <div className="flex items-center gap-4 mt-4">
                      <input
                        type="text"
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleAddTopic(week.weekNumber);
                          }
                        }}
                        placeholder="Enter new topic for this week"
                        className="flex-1 px-4 py-3 bg-white border border-tertiary/20 rounded-xl 
                          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                          text-primary placeholder-tertiary/50 transition-all duration-200"
                      />
                      <button
                        onClick={() => handleAddTopic(week.weekNumber)}
                        className="px-5 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 
                          transition-all duration-200 font-medium shadow-sm"
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingWeek(week.weekNumber)}
                      className="flex items-center justify-center w-full p-4 border-2 border-dashed border-tertiary/30 rounded-xl
                        text-tertiary hover:border-primary hover:text-primary hover:bg-primary/5
                        transition-all duration-200 mt-4"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      <span>Add New Topic</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {courseData.weeklyPlan.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-tertiary/10 p-12 text-center">
          <CalendarIcon className="w-16 h-16 text-tertiary/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-primary mb-2">
            No Weeks Created Yet
          </h3>
          <p className="text-tertiary mb-8 max-w-md mx-auto">
            Start building your weekly delivery plan by adding weeks and topics
            for your course schedule.
          </p>
        </div>
      )}

      <button
        onClick={addWeek}
        className="mt-8 flex items-center justify-center w-full bg-primary text-white px-6 py-4 rounded-xl 
          hover:bg-primary/90 transition-all duration-300 font-medium shadow-sm hover:shadow"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add New Week
      </button>

      <div className="flex items-start p-5 rounded-xl bg-primary/5 border border-primary/20 mt-6">
        <AlertCircle className="w-6 h-6 text-primary mt-0.5 mr-4 flex-shrink-0" />
        <div>
          <p className="text-primary font-medium mb-1">Week Definition</p>
          <p className="text-tertiary">
            Here "Week Plan" refers to a plan that covers the entire week,
            starting from Monday and ending on Sunday.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeeklyPlanner;
