import api from "./api"; // Assuming 'api' is a pre-configured axios instance

/**
 * Adds a new chapter to a specific module in a course.
 * @param {string} courseId - The ID of the course.
 * @param {string} moduleId - The ID of the module.
 * @param {object} chapterData - The data for the new chapter (e.g., { title, description, color }).
 * @returns {Promise<object>} The server response, which includes the newly created chapter object.
 */
export const addChapterToModule = async (courseId, moduleId, chapterData) => {
  try {
    const response = await api.post(
      `/articles/course/${courseId}/module/${moduleId}/chapters`,
      chapterData,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating chapter:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Creates a new article within a specific chapter.
 * @param {string} courseId - The ID of the course.
 * @param {string} moduleId - The ID of the module.
 * @param {string} chapterId - The ID of the chapter.
 * @param {FormData} articleData - The article data as FormData (must include title, content, author, etc.).
 * @returns {Promise<object>} The server response, which includes the newly created article object.
 */
export const addArticleToChapter = async (courseId, moduleId, chapterId, articleData) => {
  try {
    const response = await api.post(
      `/articles/course/${courseId}/module/${moduleId}/chapter/${chapterId}/articles`,
      articleData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating article:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Updates an existing article using its ID.
 * @param {string} articleId - The ID of the article to update.
 * @param {FormData} articleData - The updated article data as FormData. Can include title, content, author, and/or a new image.
 * @returns {Promise<object>} The server response, which includes the fully updated article object.
 */
export const updateArticle = async (articleId, articleData) => {
  try {
    const response = await api.put(`/articles/articles/${articleId}`, articleData);
    return response.data;
  } catch (error) {
    console.error("Error updating article:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Deletes a chapter from a module.
 * @param {string} courseId - The ID of the course.
 * @param {string} moduleId - The ID of the module.
 * @param {string} chapterId - The ID of the chapter to delete.
 * @returns {Promise<object>} The server response.
 */
export const deleteChapter = async (courseId, moduleId, chapterId) => {
    try {
        // Assuming a standard RESTful DELETE endpoint like /api/articles/course/.../chapter/:chapterId
        const response = await api.delete(`/articles/course/${courseId}/module/${moduleId}/chapter/${chapterId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting chapter:", error.response?.data || error.message);
        throw error;
    }
};





/**
 * Updates the links array for a specific chapter using PUT API
 * @param {string} courseId - The ID of the course
 * @param {string} moduleId - The ID of the module
 * @param {string} chapterId - The ID of the chapter
 * @param {string[]} links - Array of link URLs to save
 * @returns {Promise<object>} The server response with updated chapter
 */
export const updateChapterLinks = async (courseId, moduleId, chapterId, links) => {
  try {
    const response = await api.put(
      `/syllabus/course/${courseId}/syllabus/module/${moduleId}/chapter/${chapterId}`,
      { link: links },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating chapter links:", error.response?.data || error.message);
    throw error;
  }
};