/**
 * Admin Service
 * API service for admin panel operations
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

class AdminService {
  // Helper method to get auth token
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Helper method to make authenticated requests
  async makeRequest(url, options = {}) {
    const token = this.getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    // Remove Content-Type for FormData requests
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  // ==========================================================================
  // ANALYTICS
  // ==========================================================================
  
  async getAnalytics() {
    return this.makeRequest('/admin/analytics');
  }

  // ==========================================================================
  // LIBRARY CONTENT
  // ==========================================================================
  
  async getLibraryContent(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.makeRequest(`/admin/library?${searchParams}`);
  }

  async createLibraryContent(formData) {
    return this.makeRequest('/admin/library', {
      method: 'POST',
      body: formData
    });
  }

  async updateLibraryContent(id, formData) {
    return this.makeRequest(`/admin/library/${id}`, {
      method: 'PUT',
      body: formData
    });
  }

  async deleteLibraryContent(id) {
    return this.makeRequest(`/admin/library/${id}`, {
      method: 'DELETE'
    });
  }

  // ==========================================================================
  // INNOVATION PROJECTS
  // ==========================================================================
  
  async getInnovationProjects(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.makeRequest(`/admin/innovation?${searchParams}`);
  }

  async createInnovationProject(formData) {
    return this.makeRequest('/admin/innovation', {
      method: 'POST',
      body: formData
    });
  }

  async updateInnovationProject(id, formData) {
    return this.makeRequest(`/admin/innovation/${id}`, {
      method: 'PUT',
      body: formData
    });
  }

  // ==========================================================================
  // SYSTEM SETTINGS
  // ==========================================================================

  async getSettings() {
    return this.makeRequest('/admin/settings');
  }

  async updateSettings(settings) {
    return this.makeRequest('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  // ==========================================================================
  // USER MANAGEMENT
  // ==========================================================================

  async getUsers(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.makeRequest(`/admin/users?${searchParams}`);
  }

  async updateUserRole(userId, role) {
    return this.makeRequest(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  }

  // ==========================================================================
  // INTERNSHIPS
  // ==========================================================================
  
  async getInternships(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.makeRequest(`/admin/internship?${searchParams}`);
  }

  async createInternship(formData) {
    return this.makeRequest('/admin/internship', {
      method: 'POST',
      body: formData
    });
  }

  async updateInternship(id, formData) {
    return this.makeRequest(`/admin/internship/${id}`, {
      method: 'PUT',
      body: formData
    });
  }

  async deleteInternship(id) {
    return this.makeRequest(`/admin/internship/${id}`, {
      method: 'DELETE'
    });
  }

  // ==========================================================================
  // HACKATHONS
  // ==========================================================================
  
  async getHackathons(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.makeRequest(`/admin/hackathon?${searchParams}`);
  }

  async createHackathon(formData) {
    return this.makeRequest('/admin/hackathon', {
      method: 'POST',
      body: formData
    });
  }

  async updateHackathon(id, formData) {
    return this.makeRequest(`/admin/hackathon/${id}`, {
      method: 'PUT',
      body: formData
    });
  }

  async deleteHackathon(id) {
    return this.makeRequest(`/admin/hackathon/${id}`, {
      method: 'DELETE'
    });
  }

  // ==========================================================================
  // FILE OPERATIONS
  // ==========================================================================
  
  getFileUrl(filename, contentType) {
    return `${API_BASE_URL}/files/${contentType}/${filename}`;
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================
  
  // Create FormData from object with file handling
  createFormData(data) {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      
      if (value === null || value === undefined) {
        return;
      }
      
      if (key === 'files' && Array.isArray(value)) {
        // Handle array of files
        value.forEach(file => {
          if (file instanceof File) {
            formData.append('files', file);
          }
        });
      } else if (key === 'files' && value instanceof FileList) {
        // Handle FileList
        Array.from(value).forEach(file => {
          formData.append('files', file);
        });
      } else if (value instanceof File) {
        // Handle single file
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        // Handle other arrays (convert to comma-separated string)
        formData.append(key, value.join(','));
      } else if (typeof value === 'object') {
        // Handle objects (convert to JSON string)
        formData.append(key, JSON.stringify(value));
      } else {
        // Handle primitive values
        formData.append(key, value.toString());
      }
    });
    
    return formData;
  }

  // Validate form data
  validateLibraryContent(data) {
    const errors = [];
    
    if (!data.title?.trim()) errors.push('Title is required');
    if (!data.description?.trim()) errors.push('Description is required');
    if (!data.subject) errors.push('Subject is required');
    if (!data.type) errors.push('Content type is required');
    if (!data.difficulty) errors.push('Difficulty level is required');
    
    return errors;
  }

  validateInnovationProject(data) {
    const errors = [];
    
    if (!data.title?.trim()) errors.push('Title is required');
    if (!data.description?.trim()) errors.push('Description is required');
    if (!data.category) errors.push('Category is required');
    if (!data.difficulty) errors.push('Difficulty level is required');
    
    return errors;
  }

  validateInternship(data) {
    const errors = [];
    
    if (!data.title?.trim()) errors.push('Title is required');
    if (!data.company?.trim()) errors.push('Company is required');
    if (!data.description?.trim()) errors.push('Description is required');
    if (!data.type) errors.push('Internship type is required');
    if (!data.location?.trim()) errors.push('Location is required');
    if (!data.mentorName?.trim()) errors.push('Mentor name is required');
    if (!data.mentorEmail?.trim()) errors.push('Mentor email is required');
    if (!data.mentorPhone?.trim()) errors.push('Mentor phone is required');
    
    return errors;
  }

  validateHackathon(data) {
    const errors = [];
    
    if (!data.title?.trim()) errors.push('Title is required');
    if (!data.description?.trim()) errors.push('Description is required');
    if (!data.theme?.trim()) errors.push('Theme is required');
    if (!data.type) errors.push('Hackathon type is required');
    if (!data.eventStartDate) errors.push('Start date is required');
    if (!data.eventEndDate) errors.push('End date is required');
    
    return errors;
  }

  validateQuest(data) {
    const errors = [];
    
    if (!data.title?.trim()) errors.push('Title is required');
    if (!data.description?.trim()) errors.push('Description is required');
    if (!data.shortDescription?.trim()) errors.push('Short description is required');
    if (!data.category) errors.push('Category is required');
    if (!data.difficulty) errors.push('Difficulty is required');
    if (!data.story?.introduction?.trim()) errors.push('Story introduction is required');
    if (!data.story?.objective?.trim()) errors.push('Story objective is required');
    
    return errors;
  }

  validateAchievement(data) {
    const errors = [];
    
    if (!data.id?.trim()) errors.push('ID is required');
    if (!data.name?.trim()) errors.push('Name is required');
    if (!data.description?.trim()) errors.push('Description is required');
    if (!data.category) errors.push('Category is required');
    if (!data.type) errors.push('Type is required');
    if (!data.rarity) errors.push('Rarity is required');
    if (!data.icon?.trim()) errors.push('Icon is required');
    
    return errors;
  }

  // ==========================================================================
  // QUESTS
  // ==========================================================================
  
  async getQuests(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.makeRequest(`/admin/quests?${searchParams}`);
  }

  async createQuest(data) {
    return this.makeRequest('/admin/quests', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateQuest(id, data) {
    return this.makeRequest(`/admin/quests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteQuest(id) {
    return this.makeRequest(`/admin/quests/${id}`, {
      method: 'DELETE'
    });
  }

  // ==========================================================================
  // ACHIEVEMENTS
  // ==========================================================================
  
  async getAchievements(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.makeRequest(`/admin/achievements?${searchParams}`);
  }

  async createAchievement(data) {
    return this.makeRequest('/admin/achievements', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateAchievement(id, data) {
    return this.makeRequest(`/admin/achievements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteAchievement(id) {
    return this.makeRequest(`/admin/achievements/${id}`, {
      method: 'DELETE'
    });
  }

  // Format date for inputs
  formatDateForInput(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  // Format datetime for inputs
  formatDateTimeForInput(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  }
}

export default new AdminService();