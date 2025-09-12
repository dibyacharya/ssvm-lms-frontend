import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaSave,
  FaEye,
  FaCog,
  FaCheck,
  FaArrowUp,
  FaArrowDown,
  FaClone,
  FaQuestionCircle,
  FaDownload,
  FaUpload,
} from "react-icons/fa";

const QuizCreator = () => {
  // Default quiz template
  const defaultQuiz = {
    title: "My New Quiz",
    description: "A custom quiz created with Quiz Creator Tool",
    timeLimit: 300, // 5 minutes in seconds
    questions: [
      {
        id: Date.now(),
        text: "Sample question text",
        options: [
          { id: "a", text: "Option A" },
          { id: "b", text: "Option B" },
          { id: "c", text: "Option C" },
          { id: "d", text: "Option D" },
        ],
        correctAnswer: "a",
      },
    ],
  };

  // States
  const [quiz, setQuiz] = useState(defaultQuiz);
  const [currentTab, setCurrentTab] = useState("edit"); // 'edit' or 'preview'
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editingQuestionData, setEditingQuestionData] = useState(null);

  useEffect(() => {
    // Load last saved quiz from localStorage if exists
    const savedQuiz = localStorage.getItem("savedQuiz");
    if (savedQuiz) {
      try {
        setQuiz(JSON.parse(savedQuiz));
      } catch (e) {
        console.error("Failed to load saved quiz", e);
      }
    }
  }, []);

  // Save quiz to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("savedQuiz", JSON.stringify(quiz));
  }, [quiz]);

  // Helper functions
  const generateQuestionId = () => Date.now();

  const addNewQuestion = () => {
    const newQuestion = {
      id: generateQuestionId(),
      text: "New question",
      options: [
        { id: "a", text: "Option A" },
        { id: "b", text: "Option B" },
        { id: "c", text: "Option C" },
        { id: "d", text: "Option D" },
      ],
      correctAnswer: "a",
    };

    setQuiz({
      ...quiz,
      questions: [...quiz.questions, newQuestion],
    });
  };

  const deleteQuestion = (questionId) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.filter((q) => q.id !== questionId),
    });
  };

  const startEditingQuestion = (question) => {
    setEditingQuestionData({ ...question });
    setIsEditingQuestion(true);
  };

  const updateEditingQuestionField = (field, value) => {
    setEditingQuestionData({
      ...editingQuestionData,
      [field]: value,
    });
  };

  const updateOptionText = (optionId, newText) => {
    setEditingQuestionData({
      ...editingQuestionData,
      options: editingQuestionData.options.map((opt) =>
        opt.id === optionId ? { ...opt, text: newText } : opt
      ),
    });
  };

  const saveQuestion = () => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.map((q) =>
        q.id === editingQuestionData.id ? editingQuestionData : q
      ),
    });
    setIsEditingQuestion(false);
  };

  const moveQuestion = (questionId, direction) => {
    const currentIndex = quiz.questions.findIndex((q) => q.id === questionId);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === quiz.questions.length - 1)
    ) {
      return;
    }

    const newQuestions = [...quiz.questions];
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    // Swap questions
    [newQuestions[currentIndex], newQuestions[targetIndex]] = [
      newQuestions[targetIndex],
      newQuestions[currentIndex],
    ];

    setQuiz({
      ...quiz,
      questions: newQuestions,
    });
  };

  const duplicateQuestion = (questionId) => {
    const questionToDuplicate = quiz.questions.find((q) => q.id === questionId);
    const duplicatedQuestion = {
      ...questionToDuplicate,
      id: generateQuestionId(),
    };

    setQuiz({
      ...quiz,
      questions: [...quiz.questions, duplicatedQuestion],
    });
  };

  const updateQuizSettings = (field, value) => {
    setQuiz({
      ...quiz,
      [field]: value,
    });
  };

  const exportQuiz = () => {
    // Create a JSON file and trigger download
    const dataStr = JSON.stringify(quiz, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`;

    const exportFileDefaultName = `${quiz.title
      .replace(/\s+/g, "_")
      .toLowerCase()}_quiz.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const importQuiz = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedQuiz = JSON.parse(e.target.result);
        // Basic validation
        if (importedQuiz.title && Array.isArray(importedQuiz.questions)) {
          setQuiz(importedQuiz);
        } else {
          alert("Invalid quiz file format");
        }
      } catch (error) {
        alert("Error importing quiz: " + error.message);
      }
    };
    reader.readAsText(file);
    // Reset the input value so the same file can be uploaded again if needed
    event.target.value = null;
  };

  // Render functions
  const renderEditorTab = () => (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-tertiary mb-1">
            Quiz Title
          </label>
          <input
            type="text"
            className="border-b border-gray-300 focus:border-primary focus:outline-none px-1 py-1 w-full text-2xl font-bold text-primary"
            value={quiz.title}
            onChange={(e) => updateQuizSettings("title", e.target.value)}
          />
        </div>
        <div className="ml-4">
          <button
            onClick={addNewQuestion}
            className="py-2 px-4 bg-primary text-white rounded-md hover:bg-green-700 transition flex items-center"
          >
            <FaPlus className="mr-2" /> Add Question
          </button>
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <div className="w-1/2">
          <label className="block text-sm font-medium text-tertiary mb-1">
            Quiz Description
          </label>
          <textarea
            value={quiz.description}
            onChange={(e) => updateQuizSettings("description", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            rows={2}
          />
        </div>
        <div className="w-1/2">
          <label className="block text-sm font-medium text-tertiary mb-1">
            Time Limit (seconds)
          </label>
          <input
            type="number"
            value={quiz.timeLimit}
            onChange={(e) =>
              updateQuizSettings("timeLimit", parseInt(e.target.value) || 0)
            }
            min={30}
            step={30}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-sm text-tertiary mt-1">
            {Math.floor(quiz.timeLimit / 60)} minutes {quiz.timeLimit % 60}{" "}
            seconds
          </p>
        </div>
      </div>

      {quiz.questions.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <FaQuestionCircle className="mx-auto text-4xl text-tertiary mb-3" />
          <p className="text-tertiary">
            No questions added yet. Click "Add Question" to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {quiz.questions.map((question, index) => (
            <div
              key={question.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-primary transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    {index + 1}
                  </span>
                  <div className="w-full">
                    <p className="font-medium text-secondary truncate pr-4">
                      {question.text}
                    </p>
                    <p className="text-sm text-tertiary mt-1">
                      Correct Answer: {question.correctAnswer.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => moveQuestion(question.id, "up")}
                    disabled={index === 0}
                    className={`p-2 rounded-md ${
                      index === 0
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-tertiary hover:bg-gray-100"
                    }`}
                    title="Move Up"
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    onClick={() => moveQuestion(question.id, "down")}
                    disabled={index === quiz.questions.length - 1}
                    className={`p-2 rounded-md ${
                      index === quiz.questions.length - 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-tertiary hover:bg-gray-100"
                    }`}
                    title="Move Down"
                  >
                    <FaArrowDown />
                  </button>
                  <button
                    onClick={() => startEditingQuestion(question)}
                    className="p-2 text-tertiary hover:bg-gray-100 rounded-md"
                    title="Edit Question"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => duplicateQuestion(question.id)}
                    className="p-2 text-tertiary hover:bg-gray-100 rounded-md"
                    title="Duplicate Question"
                  >
                    <FaClone />
                  </button>
                  <button
                    onClick={() => deleteQuestion(question.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                    title="Delete Question"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Question Edit Modal */}
      {isEditingQuestion && editingQuestionData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <h3 className="text-xl font-bold mb-4 text-secondary">
              Edit Question
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-tertiary mb-1">
                Question Text
              </label>
              <textarea
                value={editingQuestionData.text}
                onChange={(e) =>
                  updateEditingQuestionField("text", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-tertiary mb-2">
                Answer Options
              </label>
              <div className="space-y-3">
                {editingQuestionData.options.map((option) => (
                  <div key={option.id} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full border flex items-center justify-center mr-3 ${
                        editingQuestionData.correctAnswer === option.id
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 bg-gray-100"
                      }`}
                    >
                      {option.id.toUpperCase()}
                    </div>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) =>
                        updateOptionText(option.id, e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={() =>
                        updateEditingQuestionField("correctAnswer", option.id)
                      }
                      className={`ml-3 p-2 rounded-md ${
                        editingQuestionData.correctAnswer === option.id
                          ? "text-primary"
                          : "text-gray-400 hover:text-primary"
                      }`}
                      title="Set as correct answer"
                    >
                      <FaCheck />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsEditingQuestion(false)}
                className="py-2 px-4 border border-gray-300 text-tertiary rounded-md hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveQuestion}
                className="py-2 px-4 bg-primary text-white rounded-md hover:bg-green-700 transition flex items-center"
              >
                <FaSave className="mr-2" /> Save Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export/Import Actions */}
      <div className="flex flex-wrap gap-3 justify-center mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={exportQuiz}
          className="py-2 px-4 bg-secondary text-white rounded-md hover:bg-gray-800 transition flex items-center"
        >
          <FaDownload className="mr-2" /> Export Quiz
        </button>

        <label className="py-2 px-4 bg-secondary text-white rounded-md hover:bg-gray-800 transition flex items-center cursor-pointer">
          <FaUpload className="mr-2" /> Import Quiz
          <input
            type="file"
            onChange={importQuiz}
            accept=".json"
            className="hidden"
          />
        </label>
      </div>
    </div>
  );

  // Create preview of the quiz app
  const renderPreviewTab = () => {
    // This is a simplified version of the Quiz App to preview the created quiz
    return (
      <div className="bg-white rounded-lg shadow-lg">
        {/* Quiz header */}
        <div className="bg-primary p-4 rounded-t-lg text-white flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">{quiz.title}</h2>
            <p className="text-sm">Student: [Preview Mode]</p>
          </div>
          <div className="flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-md">
            <span className="font-mono">
              {Math.floor(quiz.timeLimit / 60)}:
              {(quiz.timeLimit % 60).toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Question preview */}
        <div className="p-6">
          {quiz.questions.length > 0 ? (
            <>
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
                    1
                  </span>
                  <span className="text-sm text-tertiary">
                    Question 1 of {quiz.questions.length}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-secondary">
                  {quiz.questions[0].text}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {quiz.questions[0].options.map((option) => (
                  <div
                    key={option.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary transition duration-200"
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center mr-3">
                        {option.id.toUpperCase()}
                      </div>
                      <span className="text-secondary">{option.text}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button className="py-2 px-6 bg-primary text-white rounded-md hover:bg-green-700 transition duration-300">
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <FaQuestionCircle className="mx-auto text-4xl text-tertiary mb-3" />
              <p className="text-tertiary">
                No questions to preview. Add questions in the Edit tab.
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-b-lg border-t border-gray-200">
          <p className="text-sm text-tertiary text-center">
            Preview mode - This shows how your quiz will appear to students.
          </p>
        </div>
      </div>
    );
  };

  // Main render function with tabs
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Quiz Creator Tool</h1>
        </div>

        {/* Tab navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex">
            <button
              className={`flex-1 py-3 font-medium ${
                currentTab === "edit"
                  ? "text-primary border-b-2 border-primary"
                  : "text-tertiary hover:text-primary"
              }`}
              onClick={() => setCurrentTab("edit")}
            >
              <FaEdit className="inline mr-2" /> Create Quiz
            </button>
            <button
              className={`flex-1 py-3 font-medium ${
                currentTab === "preview"
                  ? "text-primary border-b-2 border-primary"
                  : "text-tertiary hover:text-primary"
              }`}
              onClick={() => setCurrentTab("preview")}
            >
              <FaEye className="inline mr-2" /> Preview Quiz
            </button>
          </div>
        </div>

        {/* Tab content */}
        {currentTab === "edit" && renderEditorTab()}
        {currentTab === "preview" && renderPreviewTab()}
      </div>
    </div>
  );
};

export default QuizCreator;
