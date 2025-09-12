import React, { useRef, useEffect, useState } from "react";
import {
  Search,
  Sparkles,
  ChevronDown,
  Loader,
  Square,
  ChevronUp,
  Send,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

const AutoResizeTextbox = ({ selectedLecture }) => {
  const [text, setText] = useState("");
  const [selectedModel, setSelectedModel] = useState("v1");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [displayedResponse, setDisplayedResponse] = useState("");
  const [responseIndex, setResponseIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  const textareaRef = useRef(null);
  const responseRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [text]);

  // Typewriter effect for response
  useEffect(() => {
    if (response && responseIndex < response.length && isGenerating) {
      const timer = setTimeout(() => {
        setDisplayedResponse((prev) => prev + response[responseIndex]);
        setResponseIndex((prevIndex) => prevIndex + 1);
      }, 15);
      return () => clearTimeout(timer);
    } else if (responseIndex >= response.length && isGenerating) {
      setIsGenerating(false);
    }
  }, [response, responseIndex, isGenerating]);

  useEffect(() => {
    if (response && responseIndex === 0) {
      setIsGenerating(true);
    }
  }, [response, responseIndex]);

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [displayedResponse]);

  const handleInput = (e) => {
    setText(e.target.value);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    setIsDropdownOpen(false);
  };

  const handleQuickQuestion = (question) => {
    setText(question);
    handleSearch(question);
  };

  const handleSearch = async (customText = null) => {
    const questionText = customText || text;
    if (!questionText.trim()) return;

    setLoading(true);
    setResponse("");
    setDisplayedResponse("");
    setResponseIndex(0);
    setIsGenerating(true);

    // Add question to conversation history
    const newQuestion = {
      type: 'question',
      content: questionText,
      timestamp: new Date().toISOString()
    };

    try {
      const res = await fetch(
        "https://ca-dev-chatbot.whitegrass-ce3c3d28.centralindia.azurecontainerapps.io/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            question: questionText, 
            show_chunks: false,
            context: selectedLecture ? `Current lecture: ${selectedLecture.title}` : ""
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`Error: ${res.status}`);
      }

      const data = await res.json();
      const answer = data.answer || "No response received";
      setResponse(answer);

      // Add response to conversation history
      const newResponse = {
        type: 'response',
        content: answer,
        timestamp: new Date().toISOString()
      };

      setConversationHistory(prev => [...prev, newQuestion, newResponse]);

      if (!answer || answer.trim() === "") {
        setDisplayedResponse("No response received from the server.");
      }
    } catch (error) {
      console.error("Search failed:", error);
      const errorMessage = "An error occurred while processing your request. Please try again.";
      setResponse(errorMessage);
      
      const errorResponse = {
        type: 'error',
        content: errorMessage,
        timestamp: new Date().toISOString()
      };
      setConversationHistory(prev => [...prev, newQuestion, errorResponse]);
    } finally {
      setLoading(false);
      setText("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const stopGeneration = () => {
    setIsGenerating(false);
    setDisplayedResponse(response);
    setResponseIndex(response.length);
  };

  // Expose handleQuickQuestion to parent
  useEffect(() => {
    if (window.aiTutorTextbox) {
      window.aiTutorTextbox.handleQuickQuestion = handleQuickQuestion;
    } else {
      window.aiTutorTextbox = { handleQuickQuestion };
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Conversation History */}
      {conversationHistory.length > 0 && (
        <div
          ref={responseRef}
          className="flex-1 overflow-y-auto mb-4 space-y-3 max-h-64"
        >
          {conversationHistory.map((message, index) => (
            <div
              key={index}
              className={`${
                message.type === 'question'
                  ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500'
                  : message.type === 'error'
                  ? 'bg-red-50 dark:bg-red-900/10 border-l-4 border-l-red-500'
                  : 'bg-gray-50 dark:bg-gray-700/50 border-l-4 border-l-gray-400'
              } p-3 rounded-r-lg text-sm`}
            >
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {message.type === 'question' ? (
                  <p className="font-medium text-blue-700 dark:text-blue-300 mb-0">
                    {message.content}
                  </p>
                ) : (
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading and Current Response */}
      {(loading || displayedResponse) && (
        <div className="mb-4">
          {loading && (
            <div className="flex justify-center items-center p-4">
              <Loader size={20} className="text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
          )}
          {displayedResponse && (
            <div className="bg-gray-50 dark:bg-gray-700/50 border-l-4 border-l-gray-400 p-3 rounded-r-lg">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{displayedResponse}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
        {/* Model Selector */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-600">
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-gray-900 dark:text-white">{selectedModel}</span>
              {isDropdownOpen ? (
                <ChevronUp size={14} className="text-gray-400 dark:text-gray-500" />
              ) : (
                <ChevronDown size={14} className="text-gray-400 dark:text-gray-500" />
              )}
            </button>

            {isDropdownOpen && (
              <div className="absolute mt-1 w-20 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => handleModelSelect("v1")}
                  className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                    selectedModel === "v1" 
                      ? "bg-gray-100 dark:bg-gray-600 font-medium text-gray-900 dark:text-white" 
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  v1
                </button>
                <button
                  onClick={() => handleModelSelect("v2")}
                  className={`block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                    selectedModel === "v2" 
                      ? "bg-gray-100 dark:bg-gray-600 font-medium text-gray-900 dark:text-white" 
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  v2
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Text Input */}
        <div className="relative flex items-end p-3">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this lecture..."
            className="w-full min-h-[32px] max-h-[120px] pr-10 resize-none overflow-y-auto focus:outline-none
                      text-gray-800 dark:text-gray-100 bg-transparent placeholder-gray-500 dark:placeholder-gray-400 text-sm"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
            rows={1}
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading}
            className={`absolute right-4 bottom-4 p-1.5 rounded-lg transition-colors duration-200 ${
              loading
                ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-400"
            }`}
          >
            {loading ? (
              <Loader size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>

        {/* Bottom Info */}
        <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-600">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Press Enter to send • Shift+Enter for new line
          </div>
        </div>
      </div>

      {/* Stop Generation Button */}
      {isGenerating && (
        <div className="flex justify-center mt-2">
          <button
            onClick={stopGeneration}
            className="flex items-center space-x-1 px-3 py-1 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-400 transition-colors duration-200 text-xs"
          >
            <Square size={12} fill="white" />
            <span>Stop</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AutoResizeTextbox;