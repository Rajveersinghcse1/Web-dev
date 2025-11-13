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

  async deleteInnovationProject(id) {
    return this.makeRequest(`/admin/innovation/${id}`, {
      method: 'DELETE'
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
      
      if (key === 'files' && value instanceof FileList) {
        // Handle multiple files
        Array.from(value).forEach(file => {
          formData.append('files', file);
        });
      } else if (value instanceof File) {
        // Handle single file
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        // Handle arrays (convert to comma-separated string)
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