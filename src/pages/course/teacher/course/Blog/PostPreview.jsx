import React from "react";
import { PenLine, List, Eye } from "lucide-react";

const PostPreview = ({ post, onEdit, onBackToList }) => {
  return (
    <div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {post.coverImage && (
          <div className="h-72 w-full overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-8">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

          <div className="text-gray-500 text-sm mb-6">
            Published on {new Date(post.createdAt).toLocaleDateString()}
            {post.createdAt !== post.updatedAt &&
              ` • Updated on ${new Date(post.updatedAt).toLocaleDateString()}`}
          </div>

          <div
            className="blog-content"
            dangerouslySetInnerHTML={{
              __html: post.content || "",
            }}
          />

          {/* Display quizzes if they exist */}
          {post.quizzes && post.quizzes.length > 0 && (
            <div className="mt-10 border-t pt-6">
              <h2 className="text-2xl font-bold mb-4">Quiz</h2>
              {post.quizzes.map((quiz, index) => (
                <div
                  key={index}
                  className="mb-6 p-4 border rounded-lg bg-gray-50"
                >
                  <h3 className="text-lg font-semibold mb-3">
                    Question {index + 1}: {quiz.question}
                  </h3>
                  <div className="ml-4">
                    {quiz.options.map((option, optIndex) => (
                      <div key={optIndex} className="mb-2">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name={`quiz-${index}`}
                            className="mr-2"
                            onClick={() => {
                              // In a real implementation, you'd track user answers here
                              if (optIndex === quiz.correctOption) {
                                alert("Correct!");
                              } else {
                                alert(
                                  `Incorrect. The correct answer is: ${
                                    quiz.options[quiz.correctOption]
                                  }`
                                );
                              }
                            }}
                          />
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex space-x-4">
        <button
          onClick={onEdit}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <PenLine className="w-4 h-4 mr-2" />
          Edit Post
        </button>
        <button
          onClick={onBackToList}
          className="flex items-center border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition"
        >
          <List className="w-4 h-4 mr-2" />
          Back to Posts
        </button>
      </div>
    </div>
  );
};

export default PostPreview;
