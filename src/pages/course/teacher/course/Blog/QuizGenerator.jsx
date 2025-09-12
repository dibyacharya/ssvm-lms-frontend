import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

const QuizGenerator = ({
  existingQuizzes = [],
  onAddQuiz,
  onUpdateQuizzes,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [currentQuiz, setCurrentQuiz] = useState({
    question: "",
    options: ["", "", "", ""],
    correctOption: 0,
  });

  // Handle adding a new quiz
  const handleAddQuiz = (e) => {
    e.preventDefault();

    // Form validation
    if (!currentQuiz.question.trim()) {
      alert("Please enter a question");
      return;
    }

    if (currentQuiz.options.some((opt) => !opt.trim())) {
      alert("Please fill all options");
      return;
    }

    if (editIndex >= 0) {
      // We're editing an existing quiz
      const updatedQuizzes = [...existingQuizzes];
      updatedQuizzes[editIndex] = { ...currentQuiz };
      onUpdateQuizzes(updatedQuizzes);
      setEditIndex(-1);
    } else {
      // We're adding a new quiz
      onAddQuiz({ ...currentQuiz });
    }

    // Reset form
    setCurrentQuiz({
      question: "",
      options: ["", "", "", ""],
      correctOption: 0,
    });
    setShowForm(false);
  };

  // Edit an existing quiz
  const handleEditQuiz = (index) => {
    setCurrentQuiz({ ...existingQuizzes[index] });
    setEditIndex(index);
    setShowForm(true);
  };

  // Delete a quiz
  const handleDeleteQuiz = (index) => {
    if (window.confirm("Are you sure you want to delete this quiz question?")) {
      const updatedQuizzes = [...existingQuizzes];
      updatedQuizzes.splice(index, 1);
      onUpdateQuizzes(updatedQuizzes);
    }
  };

  // Update option text
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...currentQuiz.options];
    updatedOptions[index] = value;
    setCurrentQuiz({ ...currentQuiz, options: updatedOptions });
  };

  return (
    <div className="border-t pt-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Quiz Questions</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditIndex(-1);
            if (!showForm) {
              setCurrentQuiz({
                question: "",
                options: ["", "", "", ""],
                correctOption: 0,
              });
            }
          }}
          className="flex items-center bg-purple-600 text-white px-3 py-1.5 rounded-md hover:bg-purple-700 transition text-sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          {showForm ? "Cancel" : "Add Quiz Question"}
        </button>
      </div>

      {/* Existing quizzes list */}
      {existingQuizzes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Current Questions:
          </h3>
          <div className="space-y-2">
            {existingQuizzes.map((quiz, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-md border"
              >
                <div className="flex-1">
                  <p className="font-medium">{quiz.question}</p>
                  <p className="text-sm text-green-600">
                    Correct answer: {quiz.options[quiz.correctOption]}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditQuiz(index)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(index)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz form */}
      {showForm && (
        <form
          onSubmit={handleAddQuiz}
          className="bg-gray-50 p-4 rounded-md border"
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question
            </label>
            <input
              type="text"
              value={currentQuiz.question}
              onChange={(e) =>
                setCurrentQuiz({ ...currentQuiz, question: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your question here"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Options
            </label>
            {currentQuiz.options.map((option, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="radio"
                  name="correctOption"
                  checked={currentQuiz.correctOption === index}
                  onChange={() =>
                    setCurrentQuiz({ ...currentQuiz, correctOption: index })
                  }
                  className="mr-2"
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Option ${index + 1}`}
                  required
                />
              </div>
            ))}
            <p className="text-sm text-gray-500 mt-1">
              Select the radio button next to the correct answer
            </p>
          </div>

          <div>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              {editIndex >= 0 ? "Update Question" : "Add Question"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default QuizGenerator;
