import api from "./api";

/**
 * Service to handle all discussion forum API calls
 */
const DiscussionService = {
  /**
   * Get all teacher discussions
   */
  async getTeacherDiscussions() {
    const response = await api.get("/discussion/teacher");
    return response.data;
  },

  /**
   * Get all discussions for a specific course
   * @param {string} courseId - The ID of the course
   */
  async getCourseDiscussions(courseId) {
    const response = await api.get(`/discussion/course/${courseId}`);
    return response.data;
  },

  /**
   * Get a specific discussion by ID
   * @param {string} discussionId - The ID of the discussion
   */
  async getDiscussionById(discussionId) {
    const response = await api.get(`/discussion/${discussionId}`);
    return response.data;
  },

  /**
   * Create a new teacher discussion
   * @param {Object} discussionData - Discussion data (title, content)
   * @param {Array} attachments - Optional array of file attachments
   */
  async createTeacherDiscussion(discussionData, attachments = []) {
    const formData = new FormData();
    formData.append("title", discussionData.title);
    formData.append("content", discussionData.content);

    // Add each attachment directly to formData
    attachments.forEach((file) => {
      formData.append("attachments", file);
    });

    const response = await api.post("/discussion/teacher", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Create a new course discussion
   * @param {string} courseId - The ID of the course
   * @param {Object} discussionData - Discussion data (title, content)
   * @param {Array} attachments - Optional array of file attachments
   */
  async createCourseDiscussion(courseId, discussionData, attachments = []) {
    const formData = new FormData();
    formData.append("title", discussionData.title);
    formData.append("content", discussionData.content);

    // Add each attachment directly to formData
    attachments.forEach((file) => {
      formData.append("attachments", file);
    });

    const response = await api.post(
      `/discussion/course/${courseId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Update a discussion
   * @param {string} discussionId - The ID of the discussion
   * @param {Object} updateData - Data to update (title, content)
   * @param {Array} newAttachments - Optional array of new file attachments
   * @param {Array} removeAttachments - Optional array of attachment IDs to remove
   */
  async updateDiscussion(
    discussionId,
    updateData,
    newAttachments = [],
    removeAttachments = []
  ) {
    const formData = new FormData();

    // Add fields directly to formData
    if (updateData.title) formData.append("title", updateData.title);
    if (updateData.content) formData.append("content", updateData.content);

    // Add each attachment ID to remove
    removeAttachments.forEach((id) => {
      formData.append("removeAttachments", id);
    });

    // Add each new attachment
    newAttachments.forEach((file) => {
      formData.append("attachments", file);
    });

    const response = await api.put(`/discussion/${discussionId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Delete a discussion
   * @param {string} discussionId - The ID of the discussion
   */
  async deleteDiscussion(discussionId) {
    const response = await api.delete(`/discussion/${discussionId}`);
    return response.data;
  },

  /**
   * Search discussions
   * @param {string} query - Search query
   * @param {string} type - Optional discussion type ('teacher' or 'course')
   * @param {string} courseId - Optional course ID for filtering
   */
  async searchDiscussions(query, type = null, courseId = null) {
    let url = `/discussion/search?query=${encodeURIComponent(query)}`;

    if (type) {
      url += `&type=${type}`;
    }

    if (courseId) {
      url += `&courseId=${courseId}`;
    }

    const response = await api.get(url);
    return response.data;
  },

  /**
   * Add a comment to a discussion
   * @param {string} discussionId - The ID of the discussion
   * @param {string} content - The comment content
   * @param {Array} attachments - Optional array of file attachments
   */
  async addComment(discussionId, content, attachments = []) {
    const formData = new FormData();
    formData.append("content", content);

    // Add each attachment directly to formData
    attachments.forEach((file) => {
      formData.append("attachments", file);
    });

    const response = await api.post(
      `/discussion/${discussionId}/comment`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Add a reply to a comment
   * @param {string} discussionId - The ID of the discussion
   * @param {string} commentId - The ID of the parent comment
   * @param {string} content - The reply content
   * @param {Array} attachments - Optional array of file attachments
   */
  async addReply(discussionId, commentId, content, attachments = []) {
    const formData = new FormData();
    formData.append("content", content);

    // Add each attachment directly to formData
    attachments.forEach((file) => {
      formData.append("attachments", file);
    });

    const response = await api.post(
      `/discussion/${discussionId}/comment/${commentId}/reply`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Update a comment
   * @param {string} discussionId - The ID of the discussion
   * @param {string} commentId - The ID of the comment
   * @param {string} content - The updated comment content
   * @param {Array} newAttachments - Optional array of new file attachments
   * @param {Array} removeAttachments - Optional array of attachment IDs to remove
   */
  async updateComment(
    discussionId,
    commentId,
    content,
    newAttachments = [],
    removeAttachments = []
  ) {
    const formData = new FormData();
    formData.append("content", content);

    // Add each attachment ID to remove
    removeAttachments.forEach((id) => {
      formData.append("removeAttachments", id);
    });

    // Add each new attachment
    newAttachments.forEach((file) => {
      formData.append("attachments", file);
    });

    const response = await api.put(
      `/discussion/${discussionId}/comment/${commentId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Delete a comment
   * @param {string} discussionId - The ID of the discussion
   * @param {string} commentId - The ID of the comment
   */
  async deleteComment(discussionId, commentId) {
    const response = await api.delete(
      `/discussion/${discussionId}/comment/${commentId}`
    );
    return response.data;
  },
};

export default DiscussionService;
