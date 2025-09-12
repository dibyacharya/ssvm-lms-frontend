import React, { useState } from "react";
import { useCourse } from "../../../../context/CourseContext";
import {
  Pencil,
  X,
  Plus,
  ChevronDown,
  File,
  FileCog,
  Library,
  Layers,
} from "lucide-react";
import SaveButton from "../../../../utils/CourseSaveButton";
import { useParams } from "react-router-dom";

const SyllabusManager = () => {
  const {
    courseData,
    addModule,
    updateModuleTitle,
    addTopicToModule,
    updateTopic,
    removeTopic,
    removeModule,
  } = useCourse();

  const [editingModule, setEditingModule] = useState(null);
  const [editingTopic, setEditingTopic] = useState({
    moduleNumber: null,
    topicIndex: null,
  });
  const [expandedModule, setExpandedModule] = useState(null);
  const { courseID } = useParams();

  const handleModuleTitleEdit = (moduleNumber, newTitle) => {
    updateModuleTitle(moduleNumber, newTitle);
    setEditingModule(null);
  };

  const handleTopicEdit = (moduleNumber, topicIndex, newTopic) => {
    updateTopic(moduleNumber, topicIndex, newTopic);
    setEditingTopic({ moduleNumber: null, topicIndex: null });
  };

  // Guard against null or undefined syllabus/modules
  const modules = courseData?.syllabus?.modules || [];

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 bg-gray-50">
      <div className="flex justify-between items-center absolute -top-10 right-36">
        <SaveButton urlId={courseID} />
      </div>
      {/* Header Section */}
      <div className="flex items-center   justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Course Syllabus</h1>
          <p className="text-tertiary mt-1">
            Manage modules and topics for your course
          </p>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 gap-6">
        {modules.map((module) => (
          <div
            key={module.moduleNumber}
            className="bg-white rounded-2xl shadow-sm border border-tertiary/10 overflow-hidden transition-all duration-300 hover:shadow-md"
          >
            <div
              className={`cursor-pointer transition-all duration-200 ${
                expandedModule === module.moduleNumber
                  ? "bg-primary/5 border-b border-primary/10"
                  : "hover:bg-gray-50"
              }`}
              onClick={() =>
                setExpandedModule(
                  expandedModule === module.moduleNumber
                    ? null
                    : module.moduleNumber
                )
              }
            >
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-4 flex-grow">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <Layers className="w-6 h-6 text-primary" />
                  </div>

                  <div className="flex flex-col">
                    <span className="font-medium text-primary bg-primary/10 px-3 py-1 rounded-full text-xs mb-1 w-fit">
                      Module {module.moduleNumber}
                    </span>

                    {editingModule === module.moduleNumber ? (
                      <input
                        type="text"
                        className="border-b-2 border-primary/30 bg-transparent px-2 py-1 flex-grow focus:outline-none focus:border-primary transition-colors duration-200 text-lg"
                        defaultValue={module.moduleTitle}
                        onBlur={(e) =>
                          handleModuleTitleEdit(
                            module.moduleNumber,
                            e.target.value
                          )
                        }
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleModuleTitleEdit(
                              module.moduleNumber,
                              e.target.value
                            );
                          }
                        }}
                        autoFocus
                      />
                    ) : (
                      <h3 className="text-xl font-semibold text-primary">
                        {module.moduleTitle}
                      </h3>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingModule(module.moduleNumber);
                    }}
                    className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors"
                    aria-label="Edit module title"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeModule(module.moduleNumber);
                    }}
                    className="p-2 hover:bg-red-50 rounded-full text-red-500 transition-colors"
                    aria-label="Remove module"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div
                    className={`p-2 rounded-full bg-gray-100 transition-transform duration-300 ${
                      expandedModule === module.moduleNumber ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDown className="w-5 h-5 text-tertiary" />
                  </div>
                </div>
              </div>
            </div>

            {expandedModule === module.moduleNumber && (
              <div className="p-6 bg-white">
                <div className="space-y-4">
                  {module.topics.length > 0 ? (
                    module.topics.map((topic, topicIndex) => (
                      <div
                        key={topicIndex}
                        className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-tertiary/10 hover:border-primary/20 transition-colors duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-none w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <File className="w-4 h-4 text-primary" />
                          </div>

                          {editingTopic.moduleNumber === module.moduleNumber &&
                          editingTopic.topicIndex === topicIndex ? (
                            <input
                              type="text"
                              className="bg-white border-b-2 border-primary/30 px-2 py-1 flex-grow focus:outline-none focus:border-primary transition-colors duration-200 rounded"
                              defaultValue={topic}
                              onBlur={(e) =>
                                handleTopicEdit(
                                  module.moduleNumber,
                                  topicIndex,
                                  e.target.value
                                )
                              }
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  handleTopicEdit(
                                    module.moduleNumber,
                                    topicIndex,
                                    e.target.value
                                  );
                                }
                              }}
                              autoFocus
                            />
                          ) : (
                            <span className="text-primary font-medium">
                              {topic}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              setEditingTopic({
                                moduleNumber: module.moduleNumber,
                                topicIndex,
                              })
                            }
                            className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors"
                            aria-label="Edit topic"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              removeTopic(module.moduleNumber, topicIndex)
                            }
                            className="p-2 hover:bg-red-50 rounded-full text-red-500 transition-colors"
                            aria-label="Remove topic"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileCog className="w-12 h-12 text-tertiary/30 mx-auto mb-4" />
                      <p className="text-tertiary/60 italic">
                        No topics added yet. Add your first topic below.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => addTopicToModule(module.moduleNumber)}
                    className="flex items-center justify-center w-full p-4 border-2 border-dashed border-tertiary/30 rounded-xl
                      text-tertiary hover:border-primary hover:text-primary hover:bg-primary/5
                      transition-all duration-200"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    <span>Add New Topic</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {modules.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-tertiary/10 p-12 text-center">
          <Library className="w-16 h-16 text-tertiary/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-primary mb-2">
            No Modules Created Yet
          </h3>
          <p className="text-tertiary mb-8 max-w-md mx-auto">
            Start building your course syllabus by adding modules and topics
            that will help organize your course content.
          </p>
        </div>
      )}

      <button
        onClick={addModule}
        className="mt-8 flex items-center justify-center w-full bg-primary text-white px-6 py-4 rounded-xl 
          hover:bg-primary/90 transition-all duration-300 font-medium shadow-sm hover:shadow"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add New Module
      </button>
    </div>
  );
};

export default SyllabusManager;