import React from "react";
import { PenLine, Eye, Trash2, Plus, List } from "lucide-react";

const PostList = ({
  posts,
  onCreatePost,
  onEditPost,
  onPreviewPost,
  onDeletePost,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Your Posts</h2>
        <button
          onClick={onCreatePost}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You don't have any posts yet</p>
          <button
            onClick={onCreatePost}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Create Your First Post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              {post.coverImage && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-medium text-lg mb-2">{post.title}</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Last updated: {new Date(post.updatedAt).toLocaleDateString()}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEditPost(post)}
                    className="flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <PenLine className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => onPreviewPost(post)}
                    className="flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </button>
                  <button
                    onClick={() => onDeletePost(post.id)}
                    className="flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostList;
