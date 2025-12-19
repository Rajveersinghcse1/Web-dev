// Feedback/Contact Service
class FeedbackService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Get common headers
  getHeaders(includeAuth = false) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['x-auth-token'] = token;
      }
    }

    return headers;
  }

  // Submit feedback/contact form
  async submitFeedback(feedbackData) {
    try {
      const response = await fetch(`${this.baseURL}/feedback`, {
        method: 'POST',
        headers: this.getHeaders(true), // Include auth token if available
        body: JSON.stringify(feedbackData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit feedback');
      }

      return result;
    } catch (error) {
      console.error('Submit feedback error:', error);
      throw error;
    }
  }

  // Submit feedback with file attachments
  async submitFeedbackWithFiles(feedbackData, files = []) {
    try {
      const formData = new FormData();
      
      // Add text data
      Object.keys(feedbackData).forEach(key => {
        if (feedbackData[key] !== undefined && feedbackData[key] !== null) {
          formData.append(key, feedbackData[key]);
        }
      });

      // Add files
      files.forEach(file => {
        formData.append('attachments', file);
      });

      const headers = {};
      const token = this.getAuthToken();
      if (token) {
        headers['x-auth-token'] = token;
      }

      const response = await fetch(`${this.baseURL}/feedback`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit feedback');
      }

      return result;
    } catch (error) {
      console.error('Submit feedback with files error:', error);
      throw error;
    }
  }

  // Get all feedback (Admin only)
  async getAllFeedback(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await fetch(`${this.baseURL}/feedback?${queryParams}`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch feedback');
      }

      return result;
    } catch (error) {
      console.error('Get all feedback error:', error);
      throw error;
    }
  }

  // Get feedback statistics (Admin only)
  async getFeedbackStats() {
    try {
      const response = await fetch(`${this.baseURL}/feedback/stats`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch feedback statistics');
      }

      return result;
    } catch (error) {
      console.error('Get feedback stats error:', error);
      throw error;
    }
  }

  // Get feedback by ID (Admin only)
  async getFeedbackById(id) {
    try {
      const response = await fetch(`${this.baseURL}/feedback/${id}`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch feedback');
      }

      return result;
    } catch (error) {
      console.error('Get feedback by ID error:', error);
      throw error;
    }
  }

  // Update feedback status (Admin only)
  async updateFeedbackStatus(id, status, note = '') {
    try {
      const response = await fetch(`${this.baseURL}/feedback/${id}/status`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify({ status, note }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update feedback status');
      }

      return result;
    } catch (error) {
      console.error('Update feedback status error:', error);
      throw error;
    }
  }

  // Assign feedback to admin (Admin only)
  async assignFeedback(id, assignedTo, note = '') {
    try {
      const response = await fetch(`${this.baseURL}/feedback/${id}/assign`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify({ assignedTo, note }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to assign feedback');
      }

      return result;
    } catch (error) {
      console.error('Assign feedback error:', error);
      throw error;
    }
  }

  // Add admin note to feedback (Admin only)
  async addAdminNote(id, note) {
    try {
      const response = await fetch(`${this.baseURL}/feedback/${id}/notes`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify({ note }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to add admin note');
      }

      return result;
    } catch (error) {
      console.error('Add admin note error:', error);
      throw error;
    }
  }

  // Validate feedback data
  validateFeedbackData(data) {
    const errors = [];

    if (!data.name || data.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Please provide a valid email address');
    }

    if (!data.subject || data.subject.trim().length < 5) {
      errors.push('Subject must be at least 5 characters long');
    }

    if (!data.message || data.message.trim().length < 10) {
      errors.push('Message must be at least 10 characters long');
    }

    if (data.name && data.name.length > 100) {
      errors.push('Name cannot exceed 100 characters');
    }

    if (data.subject && data.subject.length > 200) {
      errors.push('Subject cannot exceed 200 characters');
    }

    if (data.message && data.message.length > 2000) {
      errors.push('Message cannot exceed 2000 characters');
    }

    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      errors.push('Rating must be between 1 and 5');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Format feedback data for display
  formatFeedbackForDisplay(feedback) {
    return {
      ...feedback,
      createdAt: new Date(feedback.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      resolvedAt: feedback.resolvedAt ? new Date(feedback.resolvedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : null,
      statusColor: this.getStatusColor(feedback.status),
      priorityColor: this.getPriorityColor(feedback.priority),
      categoryIcon: this.getCategoryIcon(feedback.category)
    };
  }

  // Get status color
  getStatusColor(status) {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  // Get priority color
  getPriorityColor(priority) {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  }

  // Get category icon
  getCategoryIcon(category) {
    const icons = {
      general: '💬',
      technical: '🔧',
      billing: '💳',
      'feature-request': '💡',
      'bug-report': '🐛',
      account: '👤',
      other: '❓'
    };
    return icons[category] || '💬';
  }
}

// Create and export singleton instance
const feedbackService = new FeedbackService();
export default feedbackService;