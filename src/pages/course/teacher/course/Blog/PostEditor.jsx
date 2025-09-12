import React, { useState, useRef } from "react";
import { Eye, Save, BookOpen, BookText, FileText } from "lucide-react";
import EditorToolbar from "./EditorToolbar";
import QuizGenerator from "./QuizGenerator";
import educationalTemplates from "./utils/educationalTemplates"; // Import the templates

const PostEditor = ({ post, onUpdatePost, onSavePost, onPreview }) => {
  const [isCodeView, setIsCodeView] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [selectedFontSize, setSelectedFontSize] = useState("16px");

  const designEditorRef = useRef(null);
  const codeEditorRef = useRef(null);

  // Update post field
  const updateField = (field, value) => {
    onUpdatePost({
      ...post,
      [field]: value,
    });
  };

  // Save content from design editor to post
  const saveDesignContent = () => {
    if (designEditorRef.current) {
      updateField("content", designEditorRef.current.innerHTML);
    }
  };

  // Save content from code editor to post
  const saveCodeContent = () => {
    if (codeEditorRef.current) {
      updateField("content", codeEditorRef.current.value);
    }
  };

  // Toggle between code and design view
  const toggleCodeView = () => {
    if (isCodeView) {
      // Switching from code to design
      saveCodeContent();
    } else {
      // Switching from design to code
      saveDesignContent();
    }
    setIsCodeView(!isCodeView);
  };

  // Handle cover image upload
  const handleCoverImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField("coverImage", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Execute design editor command
  const execCommand = (command, value = null) => {
    if (designEditorRef.current) {
      designEditorRef.current.focus();
      document.execCommand(command, false, value);
      saveDesignContent();
    }
  };

  // Insert template
  const insertTemplate = (template) => {
    if (designEditorRef.current) {
      execCommand("insertHTML", template.html);
      // Scroll to where the template was inserted
      setTimeout(() => {
        const tempElement =
          designEditorRef.current.querySelector(".edu-template");
        if (tempElement) {
          tempElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  };

  // Add quiz to post
  const addQuiz = (quiz) => {
    const updatedQuizzes = [...(post.quizzes || []), quiz];
    updateField("quizzes", updatedQuizzes);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Title
        </label>
        <input
          type="text"
          id="title"
          value={post.title}
          onChange={(e) => updateField("title", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cover Image
        </label>
        <div className="flex items-center space-x-4">
          <label className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md cursor-pointer hover:bg-gray-200">
            Upload Cover Image
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageUpload}
              className="hidden"
            />
          </label>
          {post.coverImage && (
            <button
              onClick={() => updateField("coverImage", null)}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Remove
            </button>
          )}
        </div>
        {post.coverImage && (
          <div className="mt-4 h-40 w-full overflow-hidden rounded-md">
            <img
              src={post.coverImage}
              alt="Cover preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <button
            onClick={toggleCodeView}
            className={`flex items-center px-3 py-1.5 text-sm rounded-md ${
              isCodeView
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {isCodeView ? "Design View" : "HTML Code View"}
          </button>
        </div>

        {!isCodeView && (
          <>
            <EditorToolbar
              execCommand={execCommand}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              selectedFontSize={selectedFontSize}
              setSelectedFontSize={setSelectedFontSize}
            />

            {/* Design Editor */}
            <div
              ref={designEditorRef}
              className="w-full min-h-[300px] px-4 py-2 border border-gray-300 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-auto"
              contentEditable={true}
              onBlur={saveDesignContent}
              dangerouslySetInnerHTML={{
                __html: post.content || "",
              }}
            ></div>
          </>
        )}

        {/* Code Editor */}
        {isCodeView && (
          <textarea
            ref={codeEditorRef}
            className="w-full min-h-[400px] px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            onBlur={saveCodeContent}
            defaultValue={post.content || ""}
            placeholder="<p>Write your HTML code here</p>"
          ></textarea>
        )}
      </div>

      {/* Template Buttons and Quiz Generator Section */}
      <div className="mb-6 border-t pt-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <h3 className="w-full text-sm font-medium text-gray-700 mb-2">
            Educational Templates:
          </h3>

          <button
            onClick={() => insertTemplate(educationalTemplates[0])}
            className="flex items-center bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition text-sm"
            title="Insert Concept Explainer template"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Concept Explainer
          </button>

          <button
            onClick={() => insertTemplate(educationalTemplates[1])}
            className="flex items-center bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 transition text-sm"
            title="Insert Tutorial Guide template"
          >
            <FileText className="w-4 h-4 mr-2" />
            Tutorial Guide
          </button>

          <button
            onClick={() => insertTemplate(educationalTemplates[2])}
            className="flex items-center bg-amber-600 text-white px-3 py-2 rounded-md hover:bg-amber-700 transition text-sm"
            title="Insert Topic Explorer template"
          >
            <BookText className="w-4 h-4 mr-2" />
            Topic Explorer
          </button>
        </div>

        <QuizGenerator
          existingQuizzes={post.quizzes || []}
          onAddQuiz={addQuiz}
          onUpdateQuizzes={(quizzes) => updateField("quizzes", quizzes)}
        />
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onPreview}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </button>
        <button
          onClick={onSavePost}
          className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </button>
      </div>
    </div>
  );
};

export default PostEditor;
