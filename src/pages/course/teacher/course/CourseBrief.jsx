import React, { useState, useEffect } from "react";
import {
  Pencil,
  Save,
  X,
  Plus,
  RefreshCcw,
  BookOpen,
  Award,
  Target,
  GraduationCap,
  BookMarked,
  FileText,
  Layout,
  Star,
  Circle,
} from "lucide-react";
import { useCourse } from "../../../../context/CourseContext";
import SaveButton from "../../../../utils/CourseSaveButton";
import { useParams } from "react-router-dom";

const CourseBrief = () => {
  const {
    courseData,
    totalCredits,
    updateAboutCourse,
    updateCreditPoints,
    addLearningOutcome,
    updateLearningOutcome,
    removeLearningOutcome,
  } = useCourse();

  const [activeSection, setActiveSection] = useState(null);
  const [tempAboutCourse, setTempAboutCourse] = useState(
    courseData.aboutCourse
  );
  const [tempCreditPoints, setTempCreditPoints] = useState({
    ...courseData.creditPoints,
  });
  const [tempOutcomes, setTempOutcomes] = useState([]);
  const { courseID } = useParams();
  useEffect(() => {
    if (activeSection === "outcomes") {
      setTempOutcomes([...courseData.learningOutcomes]);
    }
  }, [activeSection, courseData.learningOutcomes]);

  const handleSave = (section) => {
    switch (section) {
      case "about":
        updateAboutCourse(tempAboutCourse);
        break;
      case "credits":
        Object.entries(tempCreditPoints).forEach(([type, value]) => {
          updateCreditPoints(type, parseInt(value));
        });
        break;
      case "outcomes":
        tempOutcomes.forEach((outcome, index) => {
          if (index < courseData.learningOutcomes.length) {
            updateLearningOutcome(index, outcome);
          } else {
            addLearningOutcome(outcome);
          }
        });
        for (
          let i = tempOutcomes.length;
          i < courseData.learningOutcomes.length;
          i++
        ) {
          removeLearningOutcome(i);
        }
        break;
    }
    setActiveSection(null);
  };

  const handleCancel = (section) => {
    switch (section) {
      case "about":
        setTempAboutCourse(courseData.aboutCourse);
        break;
      case "credits":
        setTempCreditPoints({ ...courseData.creditPoints });
        break;
      case "outcomes":
        setTempOutcomes([...courseData.learningOutcomes]);
        break;
    }
    setActiveSection(null);
  };

  const updateOutcomeNumbers = (outcomes) => {
    return outcomes.map((outcome, index) => {
      const outcomeText = outcome.replace(/^LO\d+:\s*/, "");
      return `LO${index + 1}: ${outcomeText}`;
    });
  };

  const handleDeleteOutcome = (index) => {
    setTempOutcomes((prev) => {
      const filteredOutcomes = prev.filter((_, i) => i !== index);
      return updateOutcomeNumbers(filteredOutcomes);
    });
  };

  const handleAddOutcome = () => {
    setTempOutcomes((prev) => {
      const newOutcomes = [...prev, `LO${prev.length + 1}: `];
      return updateOutcomeNumbers(newOutcomes);
    });
  };

  const handleUpdateOutcome = (index, value) => {
    setTempOutcomes((prev) => {
      const newOutcomes = [...prev];
      const outcomeText = value.replace(/^LO\d+:\s*/, "");
      newOutcomes[index] = `LO${index + 1}: ${outcomeText}`;
      return newOutcomes;
    });
  };

  const renderSectionHeader = (title, icon, section) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {icon}
        <h2 className="text-xl font-semibold text-primary">{title}</h2>
      </div>
      {activeSection !== section && (
        <button
          onClick={() => setActiveSection(section)}
          className="inline-flex items-center px-4 py-2 rounded-lg
            bg-primary/10 text-primary border border-primary/20
            hover:bg-primary/20 transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <Pencil className="w-4 h-4 mr-2" />
          <span>Edit</span>
        </button>
      )}
    </div>
  );

  const renderActionButtons = (section) => (
    <div className="flex justify-end space-x-3 mt-6">
      <button
        onClick={() => handleCancel(section)}
        className="inline-flex items-center px-4 py-2 rounded-lg
          border border-tertiary/30 bg-white text-tertiary
          hover:bg-tertiary/10 transition-all duration-200"
      >
        <X className="w-4 h-4 mr-2" />
        <span>Cancel</span>
      </button>
      <button
        onClick={() => handleSave(section)}
        className="inline-flex items-center px-4 py-2 rounded-lg
          bg-primary text-white
          hover:bg-primary/90 transition-all duration-200"
      >
        <RefreshCcw className="w-4 h-4 mr-2" />
        <span>Update</span>
      </button>
    </div>
  );

  const renderCreditItem = (type, value, isTotal = false) => (
    <div
      className={`flex flex-col items-center justify-center p-6 
        ${
          isTotal
            ? "bg-primary/5 border-2 border-primary/20"
            : "bg-white border border-tertiary/20"
        }  
        rounded-2xl shadow-sm hover:shadow-md transition-all duration-300`}
    >
      <div className="text-sm font-medium text-tertiary uppercase tracking-wider mb-2">
        {type}
      </div>
      {activeSection === "credits" && !isTotal ? (
        <input
          type="number"
          value={value}
          onChange={(e) =>
            setTempCreditPoints((prev) => ({
              ...prev,
              [type]: parseInt(e.target.value) || 0,
            }))
          }
          className="w-20 p-2 text-center text-2xl font-bold rounded-lg border border-tertiary/30
            focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
        />
      ) : (
        <div
          className={`text-4xl font-bold ${
            isTotal ? "text-primary" : "text-primary"
          }`}
        >
          {value}
        </div>
      )}
      <div className="mt-2 text-xs text-tertiary/60">
        {isTotal ? "Overall Credits" : "Credit Points"}
      </div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto  space-y-8">
      <div className="flex justify-between items-center absolute -top-10 right-36">
        <SaveButton urlId={courseID} />
      </div>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Course Overview</h1>
          <p className="text-tertiary mt-1">
            Manage your course information and learning outcomes
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column - About Course and Learning Outcomes */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* About Course Section */}
          <div className="bg-white rounded-2xl border border-tertiary/10 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-tertiary/10">
              {renderSectionHeader(
                "About The Course",
                <BookOpen className="w-6 h-6 text-primary" />,
                "about"
              )}
            </div>
            <div className="p-6">
              {activeSection === "about" ? (
                <div>
                  <textarea
                    value={tempAboutCourse}
                    onChange={(e) => setTempAboutCourse(e.target.value)}
                    className="w-full min-h-[200px] p-4 rounded-xl border border-tertiary/20
                      focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200
                      text-primary placeholder-tertiary/50"
                    placeholder="Enter course description..."
                  />
                  {renderActionButtons("about")}
                </div>
              ) : (
                <div className="prose max-w-none">
                  <p
                    className={`text-primary leading-relaxed ${
                      !courseData.aboutCourse && "text-tertiary/60 italic"
                    }`}
                  >
                    {courseData.aboutCourse ||
                      "No course description added yet. Click Edit to add content."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Learning Outcomes Section */}
          <div className="bg-white rounded-2xl border border-tertiary/10 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-tertiary/10">
              {renderSectionHeader(
                "Learning Outcomes",
                <Target className="w-6 h-6 text-primary" />,
                "outcomes"
              )}
            </div>
            <div className="p-6">
              {activeSection === "outcomes" ? (
                <div className="space-y-4">
                  {tempOutcomes.map((outcome, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex-none w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {index + 1}
                        </span>
                      </div>
                      <input
                        value={outcome}
                        onChange={(e) =>
                          handleUpdateOutcome(index, e.target.value)
                        }
                        className="flex-1 p-3 rounded-xl border border-tertiary/20
                          focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                      />
                      <button
                        onClick={() => handleDeleteOutcome(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleAddOutcome}
                    className="w-full py-3 border-2 border-dashed border-tertiary/30 rounded-xl
                      text-tertiary hover:border-primary hover:text-primary hover:bg-primary/5
                      transition-all duration-200 flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    <span>Add Learning Outcome</span>
                  </button>
                  {renderActionButtons("outcomes")}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {courseData.learningOutcomes.map((outcome, index) => (
                    <div
                      key={index}
                      className="flex items-start p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex-none w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <span className="text-sm font-semibold text-primary">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-primary">{outcome}</p>
                    </div>
                  ))}
                  {courseData.learningOutcomes.length === 0 && (
                    <div className="text-center py-12">
                      <Target className="w-12 h-12 text-tertiary/30 mx-auto mb-4" />
                      <p className="text-tertiary/60 italic">
                        No learning outcomes added yet. Click Edit to add
                        outcomes.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Credit Points */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white rounded-2xl border border-tertiary/10 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-tertiary/10">
              {renderSectionHeader(
                "Credit Points",
                <Award className="w-6 h-6 text-primary" />,
                "credits"
              )}
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(
                  activeSection === "credits"
                    ? tempCreditPoints
                    : courseData.creditPoints
                ).map(([type, value]) => (
                  <div key={type}>{renderCreditItem(type, value)}</div>
                ))}
                <div className="col-span-2">
                  {renderCreditItem(
                    "total",
                    activeSection === "credits"
                      ? Object.values(tempCreditPoints).reduce(
                          (sum, val) => sum + (parseInt(val) || 0),
                          0
                        )
                      : totalCredits,
                    true
                  )}
                </div>
              </div>
              {activeSection === "credits" && renderActionButtons("credits")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseBrief;
