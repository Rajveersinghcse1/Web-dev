/**
 * Student Service
 * API service for student-facing pages to fetch data from admin-managed content
 */

class StudentService {
  constructor() {
     this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  }

  // Helper method to make requests
  async makeRequest(endpoint, options = {}) {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('StudentService request error:', error);
      throw error;
    }
  }

  // LIBRARY CONTENT
  async getLibraryContent(params = {}) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });
    
    return this.makeRequest(`/library?${searchParams}`);
  }

  async getLibraryContentById(id) {
    return this.makeRequest(`/library/${id}`);
  }

  // Get library content by category
  async getLibraryByCategory(category, params = {}) {
    return this.getLibraryContent({ ...params, category });
  }

  // Get library content by subject
  async getLibraryBySubject(subject, params = {}) {
    return this.getLibraryContent({ ...params, subject });
  }

  // Get library content by difficulty
  async getLibraryByDifficulty(difficulty, params = {}) {
    return this.getLibraryContent({ ...params, difficulty });
  }

  // Get popular library content
  async getPopularLibraryContent(limit = 10) {
    return this.getLibraryContent({ 
      limit,
      sortBy: 'views',
      sortOrder: 'desc'
    });
  }

  // Get recent library content
  async getRecentLibraryContent(limit = 10) {
    return this.getLibraryContent({ 
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  }

  // INNOVATION PROJECTS
  async getInnovationProjects(params = {}) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });
    
    return this.makeRequest(`/innovation?${searchParams}`);
  }

  async getInnovationProjectById(id) {
    return this.makeRequest(`/innovation/${id}`);
  }

  // Get active innovation projects
  async getActiveInnovationProjects(limit = 10) {
    return this.getInnovationProjects({ 
      status: 'in_progress',
      limit
    });
  }

  // Get completed innovation projects
  async getCompletedInnovationProjects(limit = 10) {
    return this.getInnovationProjects({ 
      status: 'completed',
      limit
    });
  }

  // Get innovation projects by category
  async getInnovationProjectsByCategory(category, params = {}) {
    return this.getInnovationProjects({ ...params, category });
  }

  // INTERNSHIPS
  async getInternships(params = {}) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });
    
    return this.makeRequest(`/internships?${searchParams}`);
  }

  async getInternshipById(id) {
    return this.makeRequest(`/admin/internship/${id}`);
  }

  // Get open internships
  async getOpenInternships(limit = 20) {
    return this.getInternships({ 
      status: 'open',
      limit
    });
  }

  // Get internships by type
  async getInternshipsByType(type, params = {}) {
    return this.getInternships({ ...params, type });
  }

  // Get internships by company
  async getInternshipsByCompany(company, params = {}) {
    return this.getInternships({ ...params, company });
  }

  // Get recent internships
  async getRecentInternships(limit = 10) {
    return this.getInternships({ 
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  }

  // HACKATHONS
  async getHackathons(params = {}) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });
    
    return this.makeRequest(`/hackathons?${searchParams}`);
  }

  async getHackathonById(id) {
    return this.makeRequest(`/hackathons/${id}`);
  }

  // Get upcoming hackathons
  async getUpcomingHackathons(limit = 10) {
    return this.getHackathons({ 
      status: 'upcoming,registration_open',
      limit
    });
  }

  // Get active hackathons
  async getActiveHackathons(limit = 10) {
    return this.getHackathons({ 
      status: 'in_progress,judging',
      limit
    });
  }

  // Get hackathons with open registration
  async getHackathonsWithOpenRegistration(limit = 10) {
    return this.getHackathons({ 
      status: 'registration_open',
      limit
    });
  }

  // Get hackathons by type
  async getHackathonsByType(type, params = {}) {
    return this.getHackathons({ ...params, type });
  }

  // UTILITY METHODS
  
  // Format date for display
  formatDate(dateString) {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Format date and time for display
  formatDateTime(dateString) {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Calculate time remaining
  getTimeRemaining(dateString) {
    if (!dateString) return null;
    
    const targetDate = new Date(dateString);
    const now = new Date();
    const timeDiff = targetDate - now;
    
    if (timeDiff <= 0) return 'Expired';
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    } else {
      return 'Less than 1 hour remaining';
    }
  }

  // Check if registration is open for hackathon
  isRegistrationOpen(hackathon) {
    if (!hackathon.registrationStartDate || !hackathon.registrationEndDate) return false;
    
    const now = new Date();
    const startDate = new Date(hackathon.registrationStartDate);
    const endDate = new Date(hackathon.registrationEndDate);
    
    return now >= startDate && now <= endDate;
  }

  // Get file URL
  getFileUrl(filePath) {
    if (!filePath) return null;
    if (filePath.startsWith('http')) return filePath;
    return `${this.baseURL}/files/${filePath}`;
  }

  // Extract file extension
  getFileExtension(filename) {
    if (!filename) return '';
    return filename.split('.').pop().toLowerCase();
  }

  // Check if file is image
  isImageFile(filename) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    return imageExtensions.includes(this.getFileExtension(filename));
  }

  // Check if file is document
  isDocumentFile(filename) {
    const docExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
    return docExtensions.includes(this.getFileExtension(filename));
  }

  // Get file icon based on extension
  getFileIcon(filename) {
    const extension = this.getFileExtension(filename);
    const iconMap = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      txt: '📄',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      mp4: '🎥',
      mp3: '🎵',
      zip: '📦',
      rar: '📦'
    };
    return iconMap[extension] || '📄';
  }
}

// Create and export a single instance
const studentService = new StudentService();
export default studentService;