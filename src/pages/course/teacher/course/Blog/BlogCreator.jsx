import React, { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import PostList from "./PostList";
import PostEditor from "./PostEditor";
import PostPreview from "./PostPreview";

const BlogCreator = () => {
  // States
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [view, setView] = useState("list"); // list, edit, preview

  // Load posts from localStorage on initial render
  useEffect(() => {
    const savedPosts = localStorage.getItem("blog-posts");
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    }
  }, []);

  // Save posts to localStorage whenever posts state changes
  useEffect(() => {
    localStorage.setItem("blog-posts", JSON.stringify(posts));
  }, [posts]);

  // Create a new post
  const createNewPost = () => {
    const newPost = {
      id: Date.now(),
      title: "Untitled Post",
      content: "",
      coverImage: null,
      quizzes: [], // New field for quizzes
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPosts([newPost, ...posts]);
    setCurrentPost(newPost);
    setView("edit");
  };

  // Update current post
  const updateCurrentPost = (updatedPost) => {
    setCurrentPost({
      ...updatedPost,
      updatedAt: new Date().toISOString(),
    });
  };

  // Save current post to posts array
  const savePost = () => {
    const updatedPosts = posts.map((post) =>
      post.id === currentPost.id ? currentPost : post
    );
    setPosts(updatedPosts);
  };

  // Delete a post
  const deletePost = (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      setPosts(posts.filter((post) => post.id !== id));
      if (currentPost && currentPost.id === id) {
        setCurrentPost(null);
        setView("list");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">HTML Blog Creator</h1>

          {view !== "list" && (
            <button
              onClick={() => {
                if (view === "edit") savePost();
                setView("list");
              }}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Posts
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        {view === "list" && (
          <PostList
            posts={posts}
            onCreatePost={createNewPost}
            onEditPost={(post) => {
              setCurrentPost(post);
              setView("edit");
            }}
            onPreviewPost={(post) => {
              setCurrentPost(post);
              setView("preview");
            }}
            onDeletePost={deletePost}
          />
        )}

        {view === "edit" && currentPost && (
          <PostEditor
            post={currentPost}
            onUpdatePost={updateCurrentPost}
            onSavePost={savePost}
            onPreview={() => {
              savePost();
              setView("preview");
            }}
          />
        )}

        {view === "preview" && currentPost && (
          <PostPreview
            post={currentPost}
            onEdit={() => setView("edit")}
            onBackToList={() => setView("list")}
          />
        )}
      </main>
    </div>
  );
};

export default BlogCreator;
