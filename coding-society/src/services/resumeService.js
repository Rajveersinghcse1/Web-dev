import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/resume`;

// Get auth token from local storage
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  return !!token;
};

// Check if user is in demo mode
const isDemoMode = () => {
  const token = localStorage.getItem('authToken');
  return token && (token.includes('demo_') || token === 'demo-token');
};

const getResume = async () => {
  try {
    // If not authenticated, return empty resume structure
    if (!isAuthenticated()) {
      return {
        personalInfo: { fullName: '', email: '' },
        education: [],
        skills: { technical: [], languages: [], tools: [] },
        projects: [],
        internships: [],
        achievements: [],
        settings: { accentColor: '#2563eb', fontFamily: 'font-sans', templateId: 'professional' }
      };
    }

    // If demo mode, return from localStorage
    if (isDemoMode()) {
      const saved = localStorage.getItem('resumeData');
      if (saved) {
        return JSON.parse(saved);
      }
      return {
        personalInfo: { fullName: '', email: '' },
        education: [],
        skills: { technical: [], languages: [], tools: [] },
        projects: [],
        internships: [],
        achievements: [],
        settings: { accentColor: '#2563eb', fontFamily: 'font-sans', templateId: 'professional' }
      };
    }

    // For real users, fetch from backend
    const response = await axios.get(API_URL, { headers: getAuthHeader() });
    return response.data;
  } catch (error) {
    // If 401, user is not authenticated - return empty structure
    if (error.response?.status === 401) {
      console.warn('Resume access unauthorized, using local storage fallback');
      const saved = localStorage.getItem('resumeData');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // Ignore parse errors
        }
      }
      return {
        personalInfo: { fullName: '', email: '' },
        education: [],
        skills: { technical: [], languages: [], tools: [] },
        projects: [],
        internships: [],
        achievements: [],
        settings: { accentColor: '#2563eb', fontFamily: 'font-sans', templateId: 'professional' }
      };
    }
    console.error('Error fetching resume:', error);
    throw error;
  }
};

const saveResume = async (resumeData) => {
  try {
    // If not authenticated or demo mode, save to localStorage only
    if (!isAuthenticated() || isDemoMode()) {
      localStorage.setItem('resumeData', JSON.stringify(resumeData));
      return resumeData;
    }

    // For real users, save to backend
    const response = await axios.put(API_URL, resumeData, { headers: getAuthHeader() });
    return response.data;
  } catch (error) {
    // If 401, save to localStorage as fallback
    if (error.response?.status === 401) {
      console.warn('Resume save unauthorized, using local storage fallback');
      localStorage.setItem('resumeData', JSON.stringify(resumeData));
      return resumeData;
    }
    console.error('Error saving resume:', error);
    throw error;
  }
};

const resumeService = {
  getResume,
  saveResume
};

export default resumeService;
