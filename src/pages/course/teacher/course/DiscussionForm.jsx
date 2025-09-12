import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  FileText,
  Paperclip,
  Send,
  MoreVertical,
  Edit,
  Trash2,
  User,
  Users,
  Clock,
  ChevronLeft,
  Reply,
} from "lucide-react";
import DiscussionService from "../../../../services/discussion.service";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";

const DiscussionForum = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(
    user.role === "teacher" ? "teacher" : "course"
  ); // "student" or "teacher"
  const [showNewDiscussionForm, setShowNewDiscussionForm] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { courseID } = useParams();
  // Form state
  const [newDiscussionTitle, setNewDiscussionTitle] = useState("");
  const [newDiscussionContent, setNewDiscussionContent] = useState("");
  const [newDiscussionAttachments, setNewDiscussionAttachments] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(courseID || "");
  const [courses, setCourses] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentAttachments, setCommentAttachments] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [replyAttachments, setReplyAttachments] = useState([]);

  // Refs for file inputs
  const discussionFileInputRef = useRef(null);
  const commentFileInputRef = useRef(null);
  const replyFileInputRef = useRef(null);

  // Fetch discussions when tab changes
  useEffect(() => {
    fetchDiscussions();
  }, [activeTab, courseID, selectedCourseId]);

  // Fetch courses for dropdown (for teacher)
  useEffect(() => {
    if (activeTab === "course" && !courseID) {
      fetchTeacherCourses();
    }
  }, [activeTab, courseID]);

  // Fetch discussions based on active tab
  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (activeTab === "teacher") {
        response = await DiscussionService.getTeacherDiscussions();
      } else {
        // If courseIDis provided as prop, use that, otherwise use the selected one
        const targetCourseId = courseID || selectedCourseId;
        if (!targetCourseId) {
          setDiscussions([]);
          setLoading(false);
          return;
        }
        response = await DiscussionService.getCourseDiscussions(targetCourseId);
      }

      setDiscussions(response.discussions || []);
    } catch (err) {
      setError(err.message || "Failed to fetch discussions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses for the teacher
  const fetchTeacherCourses = async () => {
    try {
      // This would call your existing course API
      // Replace with your actual course service
      const response = await fetch("/api/courses", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
  };

  // Create a new discussion
  const handleCreateDiscussion = async (e) => {
    e.preventDefault();

    if (!newDiscussionTitle.trim() || !newDiscussionContent.trim()) {
      setError("Title and content are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const discussionData = {
        title: newDiscussionTitle,
        content: newDiscussionContent,
      };
let response;
      if (activeTab === "teacher") {
        response = await DiscussionService.createTeacherDiscussion(
          discussionData,
          newDiscussionAttachments
        );
      } else {
        const targetCourseId = courseID || selectedCourseId;
        console.log(targetCourseId);
        if (!targetCourseId) {
          setError("Please select a course");
          setLoading(false);
          return;
        }

        response = await DiscussionService.createCourseDiscussion(
          targetCourseId,
          discussionData,
          newDiscussionAttachments
        );
      }

      // Reset form
      setNewDiscussionTitle("");
      setNewDiscussionContent("");
      setNewDiscussionAttachments([]);
      setShowNewDiscussionForm(false);

      // Refresh discussions
      fetchDiscussions();
    } catch (err) {
      setError(err.message || "Failed to create discussion");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // View a discussion
  const handleViewDiscussion = async (discussionId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await DiscussionService.getDiscussionById(discussionId);
      setSelectedDiscussion(response.discussion);
    } catch (err) {
      setError(err.message || "Failed to load discussion");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add a comment to a discussion
  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await DiscussionService.addComment(
        selectedDiscussion._id,
        commentText,
        commentAttachments
      );

      // Reset form
      setCommentText("");
      setCommentAttachments([]);

      // Refresh discussion to show new comment
      handleViewDiscussion(selectedDiscussion._id);
    } catch (err) {
      setError(err.message || "Failed to add comment");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add a reply to a comment
  const handleAddReply = async (e, commentId) => {
    e.preventDefault();

    if (!replyText.trim()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await DiscussionService.addReply(
        selectedDiscussion._id,
        commentId,
        replyText,
        replyAttachments
      );

      // Reset form
      setReplyText("");
      setReplyAttachments([]);
      setReplyingTo(null);

      // Refresh discussion to show new reply
      handleViewDiscussion(selectedDiscussion._id);
    } catch (err) {
      setError(err.message || "Failed to add reply");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a discussion
  const handleDeleteDiscussion = async (discussionId) => {
    if (!window.confirm("Are you sure you want to delete this discussion?")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await DiscussionService.deleteDiscussion(discussionId);

      // If deleting the currently viewed discussion, go back to list
      if (selectedDiscussion && selectedDiscussion._id === discussionId) {
        setSelectedDiscussion(null);
      }

      // Refresh discussions
      fetchDiscussions();
    } catch (err) {
      setError(err.message || "Failed to delete discussion");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await DiscussionService.deleteComment(selectedDiscussion._id, commentId);

      // Refresh discussion to reflect deleted comment
      handleViewDiscussion(selectedDiscussion._id);
    } catch (err) {
      setError(err.message || "Failed to delete comment");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection for discussions
  const handleDiscussionFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewDiscussionAttachments(Array.from(e.target.files));
    }
  };

  // Handle file selection for comments
  const handleCommentFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setCommentAttachments(Array.from(e.target.files));
    }
  };

  // Handle file selection for replies
  const handleReplyFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setReplyAttachments(Array.from(e.target.files));
    }
  };

  // UI Components
  const Avatar = ({ src, alt, className }) => (
    <img src={src} alt={alt} className={`rounded-full ${className}`} />
  );

  const DropdownMenu = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative">
        <button
          className="bg-transparent p-1 rounded-full hover:bg-gray-100"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 py-1 w-36 bg-white rounded-md shadow-lg z-10 border">
            {children}
          </div>
        )}
      </div>
    );
  };

  const DropdownItem = ({ icon, children, danger = false, onClick }) => (
    <button
      className={`w-full text-left px-4 py-2 text-sm flex items-center hover:bg-gray-100 ${
        danger ? "text-red-600" : ""
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onClick && onClick();
      }}
    >
      {icon}
      <span className="ml-2">{children}</span>
    </button>
  );

  const Tab = ({ active, icon, label, onClick }) => (
    <button
      className={`px-4 py-2 border-b-2 flex items-center ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-gray-600 hover:text-gray-800"
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="ml-1">{label}</span>
    </button>
  );

  const Badge = ({ children, className }) => (
    <span className={`px-2 py-1 text-xs rounded ${className}`}>{children}</span>
  );

  const Button = ({
    variant,
    className,
    onClick,
    children,
    type = "button",
    disabled = false,
  }) => {
    const getButtonClass = () => {
      switch (variant) {
        case "primary":
          return "bg-primary/80 hover:bg-primary text-white";
        case "outline":
          return "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700";
        case "link":
          return "text-primary hover:text-blue-800 bg-transparent";
        default:
          return "bg-gray-100 hover:bg-gray-200 text-gray-700";
      }
    };

    return (
      <button
        type={type}
        className={`px-4 py-2 rounded-md font-medium text-sm ${getButtonClass()} ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </button>
    );
  };

  const FileAttachment = ({ file }) => (
    <div className="flex items-center p-2  rounded mb-2 bg-gray-50">
      <FileText className="w-4 h-4 text-primary mr-2" />
      <div>
        <div className="text-sm font-medium">
          {typeof file === "string" ? file : file.name}
        </div>
        {file.size && (
          <div className="text-xs text-gray-500">
            {formatFileSize(file.size)}
          </div>
        )}
      </div>
    </div>
  );

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const DiscussionCard = ({ discussion, isCourse, onClick }) => (
    <div
      className="mb-4 p-4 border rounded-lg shadow-sm hover:shadow cursor-pointer bg-white"
      onClick={() => onClick(discussion._id)}
    >
      <div className="flex justify-between">
        <div>
          <div className="flex items-center mb-2">
            <div className="m-4 p-4 w-6 h-6 rounded-full bg-green-200 text-black flex items-center justify-center">
              {discussion.author.name.split(" ")[0].charAt(0)}
            </div>
            <div>
              <span className="font-medium">{discussion.author.name}</span>
              <div className="text-xs text-gray-500 flex items-center">
                <Clock className="w-3 h-3 mr-1" />{" "}
                {new Date(discussion.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <h5 className="text-lg font-medium mb-2">{discussion.title}</h5>
          {isCourse && discussion.course && (
            <div className="mb-2">
              <Badge className="bg-primary/20 text-primary">
                {discussion.courseName || `Course: ${discussion.course}`}
              </Badge>
            </div>
          )}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {discussion.content}
          </p>
        </div>
        <DropdownMenu>
          <DropdownItem
            icon={<Edit className="w-4 h-4" />}
            onClick={() => alert("Edit functionality would go here")}
          >
            Edit
          </DropdownItem>
          <DropdownItem
            icon={<Trash2 className="w-4 h-4" />}
            danger
            onClick={() => handleDeleteDiscussion(discussion._id)}
          >
            Delete
          </DropdownItem>
        </DropdownMenu>
      </div>
      <div className="flex mt-1 text-sm text-gray-500">
        <div className="flex items-center mr-4">
          <MessageSquare className="w-4 h-4 mr-1" />{" "}
          {discussion.comments?.length || 0} comments
        </div>
        {discussion.attachments && discussion.attachments.length > 0 && (
          <div className="flex items-center">
            <Paperclip className="w-4 h-4 mr-1" />{" "}
            {discussion.attachments.length} attachments
          </div>
        )}
      </div>
    </div>
  );

  const Comment = ({ comment, level = 0, discussionId }) => (
    <div key={comment._id} className={`mb-4 ${level > 0 ? "ml-12" : ""}`}>
      <div className="p-4 border rounded-lg bg-white">
        <div className="flex items-center mb-3">
          <div className="m-4 p-4 w-6 h-6 rounded-full bg-green-200 text-black flex items-center justify-center">
            {comment.author.name.split(" ")[0].charAt(0)}
          </div>
          <div>
            <div className="font-medium">{comment.author.name}</div>
            <div className="text-xs text-gray-500">
              {new Date(comment.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownItem
                icon={<Edit className="w-4 h-4" />}
                onClick={() =>
                  alert("Edit comment functionality would go here")
                }
              >
                Edit
              </DropdownItem>
              <DropdownItem
                icon={<Trash2 className="w-4 h-4" />}
                danger
                onClick={() => handleDeleteComment(comment._id)}
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          </div>
        </div>

        <div className="text-gray-700 mb-3">
          {comment.isDeleted ? (
            <span className="italic text-gray-500">
              This comment has been deleted
            </span>
          ) : (
            comment.content
          )}
        </div>

        {comment.attachments &&
          comment.attachments.length > 0 &&
          !comment.isDeleted && (
            <div className="border-t pt-2 mt-2">
              {comment.attachments.map((file, index) => (
                <FileAttachment key={index} file={file} />
              ))}
            </div>
          )}

        {!comment.isDeleted && (
          <div className="mt-2 text-sm">
            <button
              className="text-primary/80 flex items-center hover:text-primary"
              onClick={() => setReplyingTo(comment._id)}
            >
              <Reply className="w-4 h-4 mr-1" /> Reply
            </button>
          </div>
        )}
      </div>

      {replyingTo === comment._id && (
        <div className="mt-2 ml-12">
          <div className="p-4 border rounded-lg bg-white">
            <form onSubmit={(e) => handleAddReply(e, comment._id)}>
              <div className="flex">
                <div className="m-4 p-4 w-6 h-6 rounded-full bg-green-200 text-black flex items-center justify-center">
                  {"@"}
                </div>
                <div className="flex-grow">
                  <textarea
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder={`Reply to ${comment.author.name}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                  />
                  <div className="flex justify-between mt-2">
                    <div>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        ref={replyFileInputRef}
                        onChange={handleReplyFileSelect}
                      />
                      <Button
                        variant="outline"
                        className="flex items-center"
                        onClick={() => replyFileInputRef.current?.click()}
                        type="button"
                      >
                        <Paperclip className="w-4 h-4 mr-1" /> Attach Files
                      </Button>
                    </div>
                    <div>
                      <Button
                        variant="outline"
                        className="mr-2"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText("");
                          setReplyAttachments([]);
                        }}
                        type="button"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        className="flex items-center"
                        type="submit"
                        disabled={loading || !replyText.trim()}
                      >
                        <Send className="w-4 h-4 mr-1" /> Post Reply
                      </Button>
                    </div>
                  </div>

                  {/* Display selected files */}
                  {replyAttachments.length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm font-medium mb-1">
                        Selected files:
                      </div>
                      {replyAttachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center p-2 border rounded mb-1 bg-gray-50"
                        >
                          <FileText className="w-4 h-4 text-primary mr-2" />
                          <div className="flex-grow">
                            <div className="text-sm truncate">{file.name}</div>
                            <div className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </div>
                          </div>
                          <button
                            className="text-red-500 hover:text-red-700 p-1"
                            onClick={() => {
                              setReplyAttachments(
                                replyAttachments.filter((_, i) => i !== index)
                              );
                            }}
                            type="button"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <Comment
              key={reply._id}
              comment={reply}
              level={level + 1}
              discussionId={discussionId}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderDiscussionItems = (discussionList, isCourse = false) => {
    if (loading && discussionList.length === 0) {
      return <div className="text-center p-4">Loading discussions...</div>;
    }

    if (error && discussionList.length === 0) {
      return <div className="text-center p-4 text-red-500">{error}</div>;
    }

    if (discussionList.length === 0) {
      return (
        <div className="text-center p-4 text-gray-500">
          No discussions found. Create a new discussion to get started.
        </div>
      );
    }

    return discussionList.map((discussion) => (
      <DiscussionCard
        key={discussion._id}
        discussion={discussion}
        isCourse={isCourse}
        onClick={handleViewDiscussion}
      />
    ));
  };

  const renderDiscussionDetail = () => {
    if (!selectedDiscussion) return null;

    return (
      <div className="discussion-detail">
        <Button
          variant="link"
          className="mb-4 flex items-center"
          onClick={() => setSelectedDiscussion(null)}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to discussions
        </Button>

        <div className="mb-6 p-6 border rounded-lg shadow-sm bg-white">
          <div className="flex justify-between mb-4">
            <div className="flex items-center">
              <div className="m-4 p-4 w-6 h-6 rounded-full bg-green-200 text-black flex items-center justify-center">
                {selectedDiscussion.author.name.split(" ")[0].charAt(0)}
              </div>
              <div>
                <div className="font-medium">
                  {selectedDiscussion.author.name}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(selectedDiscussion.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownItem
                icon={<Edit className="w-4 h-4" />}
                onClick={() => alert("Edit functionality would go here")}
              >
                Edit
              </DropdownItem>
              <DropdownItem
                icon={<Trash2 className="w-4 h-4" />}
                danger
                onClick={() => handleDeleteDiscussion(selectedDiscussion._id)}
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          </div>

          <h4 className="text-xl font-medium mb-3">
            {selectedDiscussion.title}
          </h4>
          <div className="mb-4 whitespace-pre-line text-gray-700">
            {selectedDiscussion.content}
          </div>

          {selectedDiscussion.attachments &&
            selectedDiscussion.attachments.length > 0 && (
              <div className="pt-3 mt-3">
                <div className="text-sm font-medium mb-2">Attachments</div>
                {selectedDiscussion.attachments.map((file, index) => (
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={index}
                  >
                    <FileAttachment key={index} file={file} />
                  </a>
                ))}
              </div>
            )}
        </div>

        <div className="comments-section">
          <h5 className="text-lg font-medium mb-3">
            Comments (
            {selectedDiscussion.comments
              ? selectedDiscussion.comments.length
              : 0}
            )
          </h5>

          {selectedDiscussion.comments &&
            selectedDiscussion.comments.map((comment) => (
              <Comment
                key={comment._id}
                comment={comment}
                discussionId={selectedDiscussion._id}
              />
            ))}

          {/* Add comment form */}
          <div className="mt-6 p-4 border rounded-lg bg-white">
            <form onSubmit={handleAddComment}>
              <div className="flex">
                <div className="m-4 p-4 w-6 h-6 rounded-full bg-green-200 text-black flex items-center justify-center">
                  {"@"}
                </div>
                <div className="flex-grow">
                  <textarea
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    required
                  />
                  <div className="flex justify-between mt-2">
                    <div>
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        ref={commentFileInputRef}
                        onChange={handleCommentFileSelect}
                      />
                      <Button
                        variant="outline"
                        className="flex items-center"
                        onClick={() => commentFileInputRef.current?.click()}
                        type="button"
                      >
                        <Paperclip className="w-4 h-4 mr-1" /> Attach Files
                      </Button>
                    </div>
                    <Button
                      variant="primary"
                      className="flex items-center"
                      type="submit"
                      disabled={loading || !commentText.trim()}
                    >
                      <Send className="w-4 h-4 mr-1" /> Post Comment
                    </Button>
                  </div>

                  {/* Display selected files */}
                  {commentAttachments.length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm font-medium mb-1">
                        Selected files:
                      </div>
                      {commentAttachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center p-2 border rounded mb-1 bg-gray-50"
                        >
                          <FileText className="w-4 h-4 text-primary mr-2" />
                          <div className="flex-grow">
                            <div className="text-sm truncate">{file.name}</div>
                            <div className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </div>
                          </div>
                          <button
                            className="text-red-500 hover:text-red-700 p-1"
                            onClick={() => {
                              setCommentAttachments(
                                commentAttachments.filter((_, i) => i !== index)
                              );
                            }}
                            type="button"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const renderNewDiscussionForm = () => {
    return (
      <div className="mb-6 p-6 border rounded-lg shadow-sm bg-white">
        <h5 className="text-lg font-medium mb-4">Create New Discussion</h5>

        <form onSubmit={handleCreateDiscussion}>
        { activeTab==="teacher" && <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Discussion Type
            </label>
            <div className="flex">
              <div className="mr-4">
                <input
                  type="radio"
                  id="type-teacher"
                  name="discussion-type"
                  className="mr-1"
                  checked={activeTab === "teacher"}
                  onChange={() => {}} // Controlled by tab
                  readOnly
                />
                <label htmlFor="type-teacher">Teacher Discussion</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="type-course"
                  name="discussion-type"
                  className="mr-1"
                  checked={activeTab === "course"}
                  onChange={() => {}} // Controlled by tab
                  readOnly
                />
                <label htmlFor="type-course">Course Discussion</label>
              </div>
            </div>
          </div>}

          {activeTab === "course" && !courseID && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Select Course
              </label>
              <select
                className="w-full p-2 border rounded"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                required={activeTab === "course"}
              >
                <option value="">-- Select a Course --</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Enter discussion title"
              value={newDiscussionTitle}
              onChange={(e) => setNewDiscussionTitle(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              className="w-full p-2 border rounded"
              rows="5"
              placeholder="Enter discussion content"
              value={newDiscussionContent}
              onChange={(e) => setNewDiscussionContent(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Attachments
            </label>
            <div className="border-dashed border-2 border-gray-300 p-4 text-center rounded">
              <Paperclip className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <div className="text-sm text-gray-500">
                Drag and drop files here or click to browse
              </div>
              <input
                type="file"
                className="hidden"
                multiple
                ref={discussionFileInputRef}
                onChange={handleDiscussionFileSelect}
              />
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => discussionFileInputRef.current?.click()}
                type="button"
              >
                Browse Files
              </Button>
            </div>

            {/* Display selected files */}
            {newDiscussionAttachments.length > 0 && (
              <div className="mt-2">
                <div className="text-sm font-medium mb-1">Selected files:</div>
                {newDiscussionAttachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center p-2 border rounded mb-1 bg-gray-50"
                  >
                    <FileText className="w-4 h-4 text-primary mr-2" />
                    <div className="flex-grow">
                      <div className="text-sm truncate">{file.name}</div>
                      <div className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                    <button
                      className="text-red-500 hover:text-red-700 p-1"
                      onClick={() => {
                        setNewDiscussionAttachments(
                          newDiscussionAttachments.filter((_, i) => i !== index)
                        );
                      }}
                      type="button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              className="mr-2"
              onClick={() => {
                setShowNewDiscussionForm(false);
                setNewDiscussionTitle("");
                setNewDiscussionContent("");
                setNewDiscussionAttachments([]);
              }}
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={
                loading ||
                !newDiscussionTitle.trim() ||
                !newDiscussionContent.trim()
              }
            >
              Create Discussion
            </Button>
          </div>
        </form>
      </div>
    );
  };

  const renderDiscussionList = () => {
    return (
      <div className="discussion-list">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-medium">
            {activeTab === "teacher"
              ? "Teacher Discussions"
              : "Course Discussions"}
          </h4>
          <Button
            variant="primary"
            onClick={() => setShowNewDiscussionForm(true)}
            className="flex items-center"
          >
            <MessageSquare className="w-4 h-4 mr-1" /> New Discussion
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {showNewDiscussionForm && renderNewDiscussionForm()}

        {activeTab === "teacher" && renderDiscussionItems(discussions)}
        {activeTab === "course" && renderDiscussionItems(discussions, true)}
      </div>
    );
  };

  return (
    <div className="discussion-forum p-4 bg-gray-50 min-h-screen">
      <div className="container mx-auto bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Discussion Forums</h2>

        {user.role === "teacher" && (
          <Tab
            active={activeTab === "teacher"}
            icon={<User className="w-4 h-4" />}
            label="Teacher Forum"
            onClick={() => {
              setActiveTab("teacher");
              setSelectedDiscussion(null);
              setShowNewDiscussionForm(false);
            }}
          />
        )}
        <Tab
          active={activeTab === "course"}
          icon={<Users className="w-4 h-4" />}
          label="Course Forum"
          onClick={() => {
            setActiveTab("course");
            setSelectedDiscussion(null);
            setShowNewDiscussionForm(false);
          }}
        />

        <div className="forum-content">
          {selectedDiscussion
            ? renderDiscussionDetail()
            : renderDiscussionList()}
        </div>
      </div>
    </div>
  );
};

export default DiscussionForum;
