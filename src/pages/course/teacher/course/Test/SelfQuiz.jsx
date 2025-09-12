import React, { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaArrowRight,
  FaRedo,
  FaTrophy,
  FaQuestionCircle,
  FaClock,
} from "react-icons/fa";
import { useAuth } from "../../../../../context/AuthContext";

// Sample quiz questions about concrete
const quizQuestions = [
  {
    id: 1,
    question: "What is the main binding agent in concrete?",
    options: [
      { id: "a", text: "Portland cement" },
      { id: "b", text: "Sand" },
      { id: "c", text: "Gravel" },
      { id: "d", text: "Water" },
    ],
    correctAnswer: "a",
  },
  {
    id: 2,
    question:
      "Which of the following is NOT an ingredient in standard concrete?",
    options: [
      { id: "a", text: "Cement" },
      { id: "b", text: "Steel fibers" },
      { id: "c", text: "Water" },
      { id: "d", text: "Aggregates" },
    ],
    correctAnswer: "b",
  },
  {
    id: 3,
    question: "What is the typical water-cement ratio for standard concrete?",
    options: [
      { id: "a", text: "0.1 to 0.3" },
      { id: "b", text: "0.4 to 0.6" },
      { id: "c", text: "0.7 to 0.9" },
      { id: "d", text: "1.0 to 1.2" },
    ],
    correctAnswer: "b",
  },
  {
    id: 4,
    question:
      "Which test is commonly used to measure the workability of fresh concrete?",
    options: [
      { id: "a", text: "Compression test" },
      { id: "b", text: "Tensile test" },
      { id: "c", text: "Slump test" },
      { id: "d", text: "Deflection test" },
    ],
    correctAnswer: "c",
  },
  {
    id: 5,
    question:
      "What does a higher PSI (pounds per square inch) rating indicate about concrete?",
    options: [
      { id: "a", text: "Lower density" },
      { id: "b", text: "Lower strength" },
      { id: "c", text: "Higher porosity" },
      { id: "d", text: "Higher compressive strength" },
    ],
    correctAnswer: "d",
  },
  {
    id: 6,
    question: "What is the purpose of adding air entrainment to concrete?",
    options: [
      { id: "a", text: "To increase weight" },
      { id: "b", text: "To improve freeze-thaw resistance" },
      { id: "c", text: "To speed up curing time" },
      { id: "d", text: "To reduce cost" },
    ],
    correctAnswer: "b",
  },
  {
    id: 7,
    question: "Which admixture is added to concrete to delay the setting time?",
    options: [
      { id: "a", text: "Accelerator" },
      { id: "b", text: "Retarder" },
      { id: "c", text: "Plasticizer" },
      { id: "d", text: "Air-entraining agent" },
    ],
    correctAnswer: "b",
  },
];

const SelfQuiz = () => {
  // States
  const [currentScreen, setCurrentScreen] = useState("start"); // start, quiz, results
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);

  const { user } = useAuth();

  // Select 5 random questions
  useEffect(() => {
    const shuffled = [...quizQuestions].sort(() => 0.5 - Math.random());
    setSelectedQuestions(shuffled.slice(0, 5));
  }, []);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setTimerActive(false);
      calculateResults();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Start quiz handler
  const startQuiz = () => {
    setCurrentScreen("quiz");
    setTimerActive(true);
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId,
    });
  };

  // Move to next question
  const nextQuestion = () => {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateResults();
    }
  };

  // Calculate final results
  const calculateResults = () => {
    setTimerActive(false);
    let newScore = 0;
    selectedQuestions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        newScore += 1;
      }
    });
    setScore(newScore);
    setCurrentScreen("results");
  };

  // Reset quiz
  const resetQuiz = () => {
    setCurrentScreen("start");
    setCurrentQuestionIndex(0);
    setAnswers({});
    setScore(0);
    setTimeRemaining(300);
    setTimerActive(false);

    const shuffled = [...quizQuestions].sort(() => 0.5 - Math.random());
    setSelectedQuestions(shuffled.slice(0, 5));
  };

  // Render functions for different screens
  const renderStartScreen = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-primary">
        Concrete Knowledge Quiz
      </h1>
      <div className="bg-gray-100 p-4 rounded-lg mb-6 w-full">
        <h2 className="font-bold text-secondary mb-2 flex items-center">
          <FaQuestionCircle className="mr-2 text-primary" /> Quiz Instructions
        </h2>
        <ul className="list-disc ml-5 text-sm text-tertiary">
          <li>The quiz consists of 5 random questions about concrete</li>
          <li>You have 5 minutes to complete the quiz</li>
          <li>Each question has only one correct answer</li>
          <li>You can't go back to previous questions</li>
          <li>Results will be displayed at the end</li>
        </ul>
      </div>
      <button
        onClick={startQuiz}
        className="w-full py-3 px-6 bg-primary text-white font-semibold rounded-md hover:bg-green-700 transition duration-300 flex items-center justify-center"
      >
        Start Quiz <FaArrowRight className="ml-2" />
      </button>
    </div>
  );

  const renderQuizScreen = () => {
    if (selectedQuestions.length === 0) return <div>Loading questions...</div>;

    const currentQuestion = selectedQuestions[currentQuestionIndex];

    return (
      <div className="bg-white rounded-lg shadow-lg max-w-3xl mx-auto">
        {/* Quiz header */}
        <div className="bg-primary p-4 rounded-t-lg text-white flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">Concrete Knowledge Quiz</h2>
            <p className="text-sm">Student: {user.name}</p>
          </div>
          <div className="flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-md">
            <FaClock className="mr-2" />
            <span className="font-mono">{formatTime(timeRemaining)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 h-2">
          <div
            className="bg-primary h-2"
            style={{
              width: `${
                ((currentQuestionIndex + 1) / selectedQuestions.length) * 100
              }%`,
            }}
          ></div>
        </div>

        {/* Question area */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
                {currentQuestionIndex + 1}
              </span>
              <span className="text-sm text-tertiary">
                Question {currentQuestionIndex + 1} of{" "}
                {selectedQuestions.length}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-secondary">
              {currentQuestion.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option) => (
              <div
                key={option.id}
                className={`p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary transition duration-200 ${
                  answers[currentQuestion.id] === option.id
                    ? "border-primary bg-green-50"
                    : ""
                }`}
                onClick={() =>
                  handleAnswerSelect(currentQuestion.id, option.id)
                }
              >
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 ${
                      answers[currentQuestion.id] === option.id
                        ? "border-primary bg-primary text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {option.id.toUpperCase()}
                  </div>
                  <span className="text-secondary">{option.text}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-end">
            <button
              onClick={nextQuestion}
              disabled={!answers[currentQuestion.id]}
              className={`py-2 px-6 rounded-md flex items-center ${
                answers[currentQuestion.id]
                  ? "bg-primary text-white hover:bg-green-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              } transition duration-300`}
            >
              {currentQuestionIndex < selectedQuestions.length - 1 ? (
                <>
                  Next <FaArrowRight className="ml-2" />
                </>
              ) : (
                <>
                  Finish Quiz <FaCheckCircle className="ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderResultsScreen = () => (
    <div className="bg-white rounded-lg shadow-lg max-w-3xl mx-auto">
      {/* Results header */}
      <div className="bg-primary p-6 rounded-t-lg text-white text-center">
        <FaTrophy className="text-4xl mx-auto mb-2" />
        <h2 className="text-2xl font-bold">Quiz Completed!</h2>
        <p>Thank you for completing the Concrete Knowledge Quiz</p>
      </div>

      {/* Results summary */}
      <div className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-secondary mb-2">
            Your Results, {user.name}
          </h3>
          <div className="bg-gray-100 rounded-lg inline-block px-6 py-3">
            <span className="text-4xl font-bold text-primary">{score}</span>
            <span className="text-lg text-tertiary">
              {" "}
              / {selectedQuestions.length}
            </span>
          </div>
          <p className="mt-2 text-tertiary">
            Time taken: {formatTime(300 - timeRemaining)}
          </p>
        </div>

        {/* Detailed results */}
        <div className="mb-6">
          <h4 className="font-semibold text-secondary mb-3">
            Question Summary
          </h4>
          <div className="space-y-3">
            {selectedQuestions.map((question, index) => (
              <div
                key={question.id}
                className="flex items-start p-3 border-l-4 bg-gray-50 rounded-r-md"
                style={{
                  borderColor:
                    answers[question.id] === question.correctAnswer
                      ? "#1aa100"
                      : "#ff4d4d",
                }}
              >
                <div className="mr-3 mt-1">
                  {answers[question.id] === question.correctAnswer ? (
                    <FaCheckCircle className="text-primary" />
                  ) : (
                    <FaTimesCircle className="text-red-500" />
                  )}
                </div>
                <div>
                  <p className="text-secondary font-medium">
                    {index + 1}. {question.question}
                  </p>
                  <p className="text-sm text-tertiary mt-1">
                    Your answer:{" "}
                    {question.options.find(
                      (opt) => opt.id === answers[question.id]
                    )?.text || "Not answered"}
                  </p>
                  {answers[question.id] !== question.correctAnswer && (
                    <p className="text-sm text-primary mt-1">
                      Correct answer:{" "}
                      {
                        question.options.find(
                          (opt) => opt.id === question.correctAnswer
                        )?.text
                      }
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance evaluation */}
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h4 className="font-semibold text-secondary mb-2">
            Performance Evaluation
          </h4>
          <p className="text-tertiary">
            {score === 5
              ? "Excellent! You have a thorough understanding of concrete fundamentals."
              : score >= 3
              ? "Good job! You have a solid understanding of concrete basics, but there's still room for improvement."
              : "You may need to review the fundamentals of concrete. Consider revisiting the study materials."}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center">
          <button
            onClick={resetQuiz}
            className="py-3 px-6 bg-primary text-white font-semibold rounded-md hover:bg-green-700 transition duration-300 flex items-center"
          >
            <FaRedo className="mr-2" /> Take Quiz Again
          </button>
        </div>
      </div>
    </div>
  );

  // Main render function
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="container mx-auto">
        {currentScreen === "start" && renderStartScreen()}
        {currentScreen === "quiz" && renderQuizScreen()}
        {currentScreen === "results" && renderResultsScreen()}
      </div>
    </div>
  );
};

export default SelfQuiz;
