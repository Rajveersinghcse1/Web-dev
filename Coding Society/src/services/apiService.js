/**
 * API Service for Coding Society Frontend
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  /**
   * Get authentication headers
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Make HTTP request
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Authentication API
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async logout() {
    this.setToken(null);
    return { success: true };
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Game API
  async getPlayerStats() {
    return this.request('/game/stats');
  }

  async levelUp() {
    return this.request('/game/level-up', {
      method: 'POST',
    });
  }

  async updateCharacter(characterData) {
    return this.request('/game/character', {
      method: 'PUT',
      body: JSON.stringify(characterData),
    });
  }

  async getLeaderboard(limit = 10) {
    return this.request(`/game/leaderboard?limit=${limit}`);
  }

  // Quests API
  async getQuests(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/quests${queryParams ? `?${queryParams}` : ''}`);
  }

  async getQuest(questId) {
    return this.request(`/quests/${questId}`);
  }

  async startQuest(questId) {
    return this.request(`/quests/${questId}/start`, {
      method: 'POST',
    });
  }

  async submitQuest(questId, solution) {
    return this.request(`/quests/${questId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ solution }),
    });
  }

  async getQuestProgress(questId) {
    return this.request(`/quests/${questId}/progress`);
  }

  // Achievements API
  async getAchievements() {
    return this.request('/achievements');
  }

  async checkAchievements() {
    return this.request('/achievements/check', {
      method: 'POST',
    });
  }

  // Skill Trees API
  async getSkillTrees() {
    return this.request('/skill-trees');
  }

  async unlockSkill(skillId) {
    return this.request(`/skill-trees/unlock/${skillId}`, {
      method: 'POST',
    });
  }

  // Battle Arena API
  async getBattles() {
    return this.request('/battles');
  }

  async createBattle(battleData) {
    return this.request('/battles', {
      method: 'POST',
      body: JSON.stringify(battleData),
    });
  }

  async joinBattle(battleId) {
    return this.request(`/battles/${battleId}/join`, {
      method: 'POST',
    });
  }

  // Avatar API
  async getAvatars() {
    return this.request('/avatars');
  }

  async purchaseAvatar(avatarId) {
    return this.request(`/avatars/${avatarId}/purchase`, {
      method: 'POST',
    });
  }

  // Users API
  async getUsers(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/users${queryParams ? `?${queryParams}` : ''}`);
  }

  async getUser(userId) {
    return this.request(`/users/${userId}`);
  }

  // Analytics API
  async getAnalytics(timeframe = '7d') {
    return this.request(`/analytics?timeframe=${timeframe}`);
  }

  async trackEvent(eventData) {
    return this.request('/analytics/track', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  // ===== FEED API METHODS =====

  /**
   * Get feed posts with pagination and filters
   */
  async getFeed(page = 1, limit = 10, filters = {}) {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });

    return this.request(`/api/feed?${queryParams}`);
  }

  /**
   * Create a new post with file upload support (uploads to MinIO)
   */
  async createPost(postData) {
    const formData = new FormData();
    
    // Add text content
    formData.append('content', postData.content || '');
    formData.append('type', postData.type || 'text');
    formData.append('privacy', postData.privacy || 'public');
    
    // Add optional fields
    if (postData.title?.trim()) formData.append('title', postData.title.trim());
    if (postData.category?.trim()) formData.append('category', postData.category.trim());
    if (postData.codeLanguage?.trim()) formData.append('codeLanguage', postData.codeLanguage.trim());
    
    // Add tags
    if (postData.tags && postData.tags.length > 0) {
      formData.append('tags', postData.tags.join(','));
    }
    
    // Add location
    if (postData.location) {
      formData.append('location', JSON.stringify(postData.location));
    }
    
    // Add code snippet
    if (postData.codeSnippet) {
      formData.append('codeSnippet', JSON.stringify(postData.codeSnippet));
    }
    
    // Add poll data
    if (postData.type === 'poll' && postData.poll?.options?.length > 0) {
      formData.append('pollOptions', JSON.stringify(postData.poll.options));
    }

    // Add media files - these will be uploaded to MinIO automatically
    if (postData.media && postData.media.length > 0) {
      postData.media.forEach((file) => {
        formData.append('files', file);
      });
    }

    // Use special headers for file upload
    const headers = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    // Don't set Content-Type for FormData - browser will set it with boundary

    return this.request('/api/v1/feed', {
      method: 'POST',
      headers,
      body: formData
    });
  }

  /**
   * Like/react to a post
   */
  async likePost(postId, reaction = 'like') {
    return this.request(`/api/feed/${postId}/like`, {
      method: 'POST',
      body: JSON.stringify({ reaction })
    });
  }

  /**
   * Add comment to a post
   */
  async addComment(postId, content) {
    return this.request(`/api/feed/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  }

  /**
   * Share a post
   */
  async sharePost(postId) {
    return this.request(`/api/feed/${postId}/share`, {
      method: 'POST'
    });
  }

  /**
   * Bookmark a post
   */
  async bookmarkPost(postId) {
    return this.request(`/api/feed/${postId}/bookmark`, {
      method: 'POST'
    });
  }

  // ===== STORIES API METHODS =====

  /**
   * Get active stories
   */
  async getStories() {
    return this.request('/api/stories');
  }

  /**
   * Create a new story with media upload (uploads to MinIO)
   */
  async createStory(storyData) {
    const formData = new FormData();
    
    formData.append('privacy', storyData.privacy || 'public');
    
    if (storyData.text) {
      formData.append('text', storyData.text);
    }

    // Add media file - this will be uploaded to MinIO
    if (storyData.media) {
      formData.append('media', storyData.media);
    }

    // Use special headers for file upload
    const headers = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return this.request('/api/stories', {
      method: 'POST',
      headers,
      body: formData
    });
  }

  /**
   * Mark story as viewed
   */
  async viewStory(storyId) {
    return this.request(`/api/stories/${storyId}/view`, {
      method: 'POST'
    });
  }

  // ===== FILE UPLOAD HELPERS =====

  /**
   * Validate file before upload
   */
  validateFile(file, type = 'any') {
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (file.size > maxSize) {
      throw new Error('File size must be less than 50MB');
    }

    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/avi', 'video/mov'];
    const allowedDocTypes = ['application/pdf', 'text/plain'];

    let allowedTypes = [];
    if (type === 'image') allowedTypes = allowedImageTypes;
    else if (type === 'video') allowedTypes = allowedVideoTypes;
    else if (type === 'document') allowedTypes = allowedDocTypes;
    else allowedTypes = [...allowedImageTypes, ...allowedVideoTypes, ...allowedDocTypes];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not supported`);
    }

    return true;
  }

  /**
   * Create preview URL for file
   */
  createPreviewUrl(file) {
    return URL.createObjectURL(file);
  }

  /**
   * Revoke preview URL to free memory
   */
  revokePreviewUrl(url) {
    URL.revokeObjectURL(url);
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;