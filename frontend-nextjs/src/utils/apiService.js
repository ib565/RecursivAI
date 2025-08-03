// Use environment variable for API base URL
const API_BASE_URL = process.env.NEXT_APP_API_BASE_URL || 'http://localhost:8000';

/**
 * Fetch helper with error handling
 * @param {string} endpoint - API endpoint to fetch
 * @param {Object} options - Fetch options (method, headers, body)
 * @returns {Promise} - Response data or error
 */
const fetchFromAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API fetch error: ${endpoint}`, error);
    throw error; // Re-throw to let calling component handle the error
  }
};

/**
 * Get all posts with optional filtering
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Maximum number of posts to return
 * @param {number} params.offset - Number of posts to skip
 * @param {string} params.status - Filter by status ('published' or 'draft')
 * @returns {Promise} - Array of posts
 */
export const getAllPosts = (params = {}) => {
  // Build query string from params
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value);
    }
  });
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `/posts?${queryString}` : '/posts';
  
  return fetchFromAPI(endpoint);
};

/**
 * Get a post by ID
 * @param {string} id - Post ID
 * @returns {Promise} - Post object
 */
export const getPostById = (id) => {
  return fetchFromAPI(`/posts/${id}`);
};

/**
 * Get a post by slug
 * @param {string} slug - Post slug
 * @returns {Promise} - Post object
 */
export const getPostBySlug = (slug) => {
  return fetchFromAPI(`/posts/by-slug/${slug}`);
};

/**
 * Create a new post
 * @param {Object} postData - Post data
 * @returns {Promise} - Created post
 */
export const createPost = (postData) => {
  return fetchFromAPI('/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });
};

/**
 * Update a post
 * @param {string} id - Post ID
 * @param {Object} postData - Updated post data
 * @returns {Promise} - Updated post
 */
export const updatePost = (id, postData) => {
  return fetchFromAPI(`/posts/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });
};

/**
 * Delete a post
 * @param {string} id - Post ID
 * @returns {Promise} - Deletion result
 */
export const deletePost = (id) => {
  return fetchFromAPI(`/posts/${id}`, {
    method: 'DELETE',
  });
};

/**
 * Trigger paper processing to create new posts
 * @returns {Promise} - Processing result
 */
export const processPapers = () => {
  return fetchFromAPI('/posts/process_papers_create_posts', {
    method: 'POST',
  });
};


/**
 * Get all news posts with optional filtering
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Maximum number of posts to return
 * @param {number} params.offset - Number of posts to skip
 * @returns {Promise} - Array of news posts
 */
export const getNewsPosts = (params = {}) => {
  // Build query string from params
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value);
    }
  });

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/posts/news?${queryString}` : "/posts/news";

  return fetchFromAPI(endpoint);
};