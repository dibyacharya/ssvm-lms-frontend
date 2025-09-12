import React, { useState } from "react";
import { createAssignment } from "../../../services/assignment.service";

const AssignmentForm = ({ courseID, fetchAssignments = () => console.log("Fetching assignments...") }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [totalPoints, setTotalPoints] = useState(100);
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // AI Question Generator states
  const [selectedOutcome, setSelectedOutcome] = useState("");
  const [selectedBloomLevel, setSelectedBloomLevel] = useState("");
  const [questionType, setQuestionType] = useState("Long answer"); // Added state for question type
  const [extraPrompt, setExtraPrompt] = useState(""); // Added state for extra prompt
  const [generatingQuestion, setGeneratingQuestion] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [aiError, setAiError] = useState(null);

  // Course outcomes options
  const courseOutcomes = [
    "Identify different types of concrete and its properties.",
    "Determine the workability of concrete.",
    "Determine strength and durability of concrete.",
    "Design concrete mixes for the given conditions.",
    "Perform tests of hardened concrete.",
    "Select types of admixture and special concrete for given condition.",
  ];

  // Bloom's taxonomy levels
  const bloomLevels = [
    "Remember",
    "Understand",
    "Apply",
    "Analyze",
    "Evaluate",
    "Create",
  ];
  
  // Question types for the AI generator
  const questionTypes = ["Objective", "Short answer", "Long answer", "Case based"];

  // Handle file upload
  const handleFileUpload = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files);
      setAttachments((prevAttachments) => [...prevAttachments, ...newFiles]);
    }
  };

  // Remove selected file
  const handleRemoveFile = (index) => {
    setAttachments((prevAttachments) =>
      prevAttachments.filter((_, fileIndex) => fileIndex !== index)
    );
  };

  // Generate question using the live API
  const generateQuestion = async () => {
    if (!selectedOutcome || !selectedBloomLevel || !questionType) {
      setAiError(
        "Please select a course outcome, a Bloom's taxonomy level, and a question type."
      );
      return;
    }

    setGeneratingQuestion(true);
    setAiError(null);

    const apiEndpoint = "https://question-generation.whitegrass-ce3c3d28.centralindia.azurecontainerapps.io/api/generate-questions";

    // Use URLSearchParams to construct the x-www-form-urlencoded body
    const requestBody = new URLSearchParams();
    requestBody.append("selected_cos[]", selectedOutcome);
    requestBody.append("selected_bloom[]", selectedBloomLevel);
    requestBody.append("selected_types[]", questionType);
    requestBody.append("extra_prompt[]", extraPrompt || "Generate based on concrete concepts");

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestBody.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();

      // Handle the new API response structure where `data.questions` is an array of objects.
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        const newQuestions = data.questions.map(q_item => {
            // The actual question text is in the 'output' property.
            // Replace newline characters with <br> for HTML rendering.
            const formattedQuestion = q_item.output.replace(/\n/g, '<br />');
            return {
                question: formattedQuestion,
                rawQuestion: q_item.output, // Keep raw text for description
                outcome: q_item.co,
                bloomLevel: q_item.bloom_level,
                type: questionType, // Use the type that was requested
            };
        });

        setGeneratedQuestions(prev => [...newQuestions, ...prev]);

      } else {
        throw new Error("No questions were generated in the expected format.");
      }
    } catch (err) {
      console.error("Error generating question:", err);
      setAiError(err.message || "Failed to generate question. Check the console for details.");
    } finally {
      setGeneratingQuestion(false);
    }
  };

  // Add selected question to description using the raw text to avoid HTML tags
  const addQuestionToDescription = (rawQuestion) => {
    const formattedQuestion = `Q) ${rawQuestion}`;
    setDescription((prev) => (prev ? `${prev}\n\n${formattedQuestion}` : formattedQuestion));
  };

  // Remove question from the list
  const removeQuestion = (indexToRemove) => {
    setGeneratedQuestions((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("totalPoints", totalPoints.toString());
      formData.append("dueDate", dueDate);
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      await createAssignment(courseID, formData);

      setSuccess(true);
      setTitle("");
      setDescription("");
      setAttachments([]);
      setTotalPoints(100);
      setDueDate("");
      setGeneratedQuestions([]);
      setTimeout(() => {
        if(fetchAssignments) fetchAssignments();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create assignment.");
      console.error("Error creating assignment:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col lg:flex-row w-full p-4 md:p-6 gap-4 max-h-[90vh] overflow-y-auto"
    >
      {/* Left Section - Assignment Form */}
      <div className="w-full lg:w-2/3 p-4 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Create Assignment</h2>
        <input
          type="text"
          className="w-full border p-2 rounded mb-4"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="w-full border p-2 rounded mb-4"
          placeholder="Description"
          rows="8"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>

        {/* AI Question Generator */}
        <div className="mb-6 p-4 border rounded-lg border-blue-200 bg-blue-50">
          <h3 className="text-lg font-semibold mb-3 text-blue-800">
            AI Question Generator
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <select className="w-full border p-2 rounded" value={selectedOutcome} onChange={(e) => setSelectedOutcome(e.target.value)}>
              <option value="">Select a Course Outcome</option>
              {courseOutcomes.map((o, i) => <option key={i} value={o}>{o}</option>)}
            </select>
            <select className="w-full border p-2 rounded" value={selectedBloomLevel} onChange={(e) => setSelectedBloomLevel(e.target.value)}>
              <option value="">Select a Bloom's Level</option>
              {bloomLevels.map((l, i) => <option key={i} value={l}>{l}</option>)}
            </select>
             <select className="w-full border p-2 rounded" value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
               <option value="">Select Question Type</option>
               {questionTypes.map((t, i) => <option key={i} value={t}>{t}</option>)}
            </select>
            <textarea
                className="w-full border p-2 rounded md:col-span-2"
                placeholder="Extra Prompt (Optional)"
                rows="2"
                value={extraPrompt}
                onChange={(e) => setExtraPrompt(e.target.value)}
            ></textarea>
          </div>

          <button
            type="button"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300 transition-colors mb-3"
            onClick={generateQuestion}
            disabled={generatingQuestion || !selectedOutcome || !selectedBloomLevel || !questionType}
          >
            {generatingQuestion ? "Generating..." : "Generate Question"}
          </button>

          {aiError && <div className="text-red-600 text-sm mb-3 p-2 bg-red-100 rounded">{aiError}</div>}

          {generatedQuestions.length > 0 && (
            <div className="mt-4">
              <h4 className="text-md font-semibold mb-2">Generated Questions:</h4>
              <div className="space-y-3">
                {generatedQuestions.map((item, index) => (
                  <div key={index} className="p-3 border rounded bg-white shadow-sm">
                    <div className="flex justify-between items-start">
                      <p className="text-sm mb-2 pr-2" dangerouslySetInnerHTML={{ __html: item.question }}></p>
                      <button type="button" onClick={() => removeQuestion(index)} className="text-red-500 hover:text-red-700 ml-2 text-lg font-bold" title="Remove question">×</button>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <button type="button" className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200" onClick={() => addQuestionToDescription(item.rawQuestion)}>Use This Question</button>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-semibold capitalize px-2 py-0.5 bg-gray-200 rounded">{item.type}</span>
                        <span>{item.bloomLevel}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* File Upload Section */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Attachments (PDF only)</label>
          <input type="file" accept=".pdf" multiple onChange={handleFileUpload} className="w-full border p-2 rounded" />
          {attachments.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Selected ({attachments.length})</h4>
              <div className="border rounded p-2 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex justify-between items-center py-1 px-2 hover:bg-gray-50 rounded">
                    <span className="text-sm text-gray-700 truncate max-w-xs">📄 {file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                    <button type="button" onClick={() => handleRemoveFile(index)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-full lg:w-1/3 p-4 bg-gray-50 shadow-md rounded-lg h-fit">
        <h3 className="text-lg font-semibold mb-4">Assignment Settings</h3>
        <div className="mb-4">
          <label className="block font-medium mb-1">Total Points</label>
          <select className="w-full border p-2 rounded" value={totalPoints} onChange={(e) => setTotalPoints(e.target.value)}>
            <option value="100">100</option>
            <option value="50">50</option>
            <option value="25">25</option>
            <option value="10">10</option>
            <option value="0">Ungraded</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Due Date</label>
          <input type="date" className="w-full border p-2 rounded" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
          disabled={loading || !title || !dueDate}
        >
          {loading ? "Creating..." : "Create Assignment"}
        </button>
        {success && <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">Assignment created successfully!</div>}
        {error && <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
      </div>
    </form>
  );
};

export default AssignmentForm;
