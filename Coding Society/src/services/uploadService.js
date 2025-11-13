/**
 * File Upload Service for Coding Society Platform
 * Handles file uploads to MinIO via backend API endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class UploadService {
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
   * Get authentication headers for file uploads
   */
  getUploadHeaders() {
    const headers = {};
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    // Don't set Content-Type for FormData uploads
    return headers;
  }

  /**
   * Upload progress callback
   */
  createProgressHandler(onProgress) {
    return (progressEvent) => {
      if (progressEvent.lengthComputable && onProgress) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    };
  }

  /**
   * Upload files with XMLHttpRequest for progress tracking
   */
  async uploadWithProgress(endpoint, formData, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Setup progress handler
      if (onProgress) {
        xhr.upload.addEventListener('progress', this.createProgressHandler(onProgress));
      }
      
      // Setup completion handler
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.message || `HTTP ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };
      
      // Setup error handler
      xhr.onerror = () => {
        reject(new Error('Network error occurred'));
      };
      
      // Setup timeout handler
      xhr.ontimeout = () => {
        reject(new Error('Upload timeout'));
      };
      
      // Configure and send request
      xhr.open('POST', `${API_BASE_URL}/api/v1${endpoint}`);
      
      // Set headers
      const headers = this.getUploadHeaders();
      Object.keys(headers).forEach(key => {
        xhr.setRequestHeader(key, headers[key]);
      });
      
      // Set timeout (5 minutes for large files)
      xhr.timeout = 5 * 60 * 1000;
      
      xhr.send(formData);
    });
  }

  /**
   * Validate file before upload
   */
  validateFile(file, options = {}) {
    const {
      maxSize = 50 * 1024 * 1024, // 50MB default
      allowedTypes = [],
      allowedExtensions = []
    } = options;

    // Check file size
    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${this.formatFileSize(maxSize)} limit`);
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Check file extension
    if (allowedExtensions.length > 0) {
      const extension = file.name.toLowerCase().split('.').pop();
      if (!allowedExtensions.includes(extension)) {
        throw new Error(`File extension .${extension} not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`);
      }
    }

    return true;
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // FEED PAGE UPLOADS
  
  /**
   * Upload single image for feed
   */
  async uploadFeedImage(file, onProgress) {
    this.validateFile(file, {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp']
    });

    const formData = new FormData();
    formData.append('image', file);

    return this.uploadWithProgress('/upload/feed/image', formData, onProgress);
  }

  /**
   * Upload multiple images for feed
   */
  async uploadFeedImages(files, onProgress) {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      this.validateFile(file, {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp']
      });
      formData.append('images', file);
    });

    return this.uploadWithProgress('/upload/feed/images', formData, onProgress);
  }

  /**
   * Upload single video for feed
   */
  async uploadFeedVideo(file, onProgress) {
    this.validateFile(file, {
      maxSize: 100 * 1024 * 1024, // 100MB
      allowedTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'],
      allowedExtensions: ['mp4', 'mov', 'avi', 'mkv', 'webm']
    });

    const formData = new FormData();
    formData.append('video', file);

    return this.uploadWithProgress('/upload/feed/video', formData, onProgress);
  }

  /**
   * Upload multiple videos for feed
   */
  async uploadFeedVideos(files, onProgress) {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      this.validateFile(file, {
        maxSize: 100 * 1024 * 1024, // 100MB
        allowedTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'],
        allowedExtensions: ['mp4', 'mov', 'avi', 'mkv', 'webm']
      });
      formData.append('videos', file);
    });

    return this.uploadWithProgress('/upload/feed/videos', formData, onProgress);
  }

  // LIBRARY PAGE UPLOADS

  /**
   * Upload PDF for library
   */
  async uploadLibraryPDF(file, onProgress) {
    this.validateFile(file, {
      maxSize: 20 * 1024 * 1024, // 20MB
      allowedTypes: ['application/pdf'],
      allowedExtensions: ['pdf']
    });

    const formData = new FormData();
    formData.append('pdf', file);

    return this.uploadWithProgress('/upload/library/pdf', formData, onProgress);
  }

  /**
   * Upload multiple library files
   */
  async uploadLibraryFiles(files, onProgress) {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      this.validateFile(file, {
        maxSize: 20 * 1024 * 1024, // 20MB
        allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        allowedExtensions: ['pdf', 'doc', 'docx']
      });
      formData.append('files', file);
    });

    return this.uploadWithProgress('/upload/library', formData, onProgress);
  }

  // INNOVATION PAGE UPLOADS

  /**
   * Upload PDF for innovation projects
   */
  async uploadInnovationPDF(file, onProgress) {
    this.validateFile(file, {
      maxSize: 20 * 1024 * 1024, // 20MB
      allowedTypes: ['application/pdf'],
      allowedExtensions: ['pdf']
    });

    const formData = new FormData();
    formData.append('pdf', file);

    return this.uploadWithProgress('/upload/innovation/pdf', formData, onProgress);
  }

  /**
   * Upload multiple innovation files
   */
  async uploadInnovationFiles(files, onProgress) {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      this.validateFile(file, {
        maxSize: 50 * 1024 * 1024, // 50MB
        allowedTypes: ['application/pdf', 'application/zip', 'application/x-rar-compressed'],
        allowedExtensions: ['pdf', 'zip', 'rar']
      });
      formData.append('files', file);
    });

    return this.uploadWithProgress('/upload/innovation', formData, onProgress);
  }

  // UTILITY METHODS

  /**
   * Get file upload status
   */
  async getUploadHealth() {
    const response = await fetch(`${API_BASE_URL}/api/v1/upload/health`, {
      headers: this.getUploadHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to check upload health');
    }

    return response.json();
  }

  /**
   * Test file upload
   */
  async testUpload(file, onProgress) {
    const formData = new FormData();
    formData.append('testfile', file);

    return this.uploadWithProgress('/upload/test', formData, onProgress);
  }

  /**
   * Create file preview
   */
  createFilePreview(file) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get file info
   */
  getFileInfo(file) {
    return {
      name: file.name,
      size: file.size,
      formattedSize: this.formatFileSize(file.size),
      type: file.type,
      lastModified: new Date(file.lastModified),
      extension: file.name.toLowerCase().split('.').pop()
    };
  }
}

// Create singleton instance
const uploadService = new UploadService();

export default uploadService;