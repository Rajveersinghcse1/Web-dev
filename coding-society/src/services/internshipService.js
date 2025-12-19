import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/internships`;

// Get auth token from local storage
const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  }
  return {};
};

const getInternships = async (params = {}) => {
  try {
    const response = await axios.get(API_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching internships:', error);
    throw error;
  }
};

const getInternshipById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching internship details:', error);
    throw error;
  }
};

const applyForInternship = async (id, applicationData) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/apply`, applicationData, { headers: getAuthHeader() });
    return response.data;
  } catch (error) {
    console.error('Error applying for internship:', error);
    throw error;
  }
};

const getMyApplications = async () => {
    try {
        const response = await axios.get(`${API_URL}/user/applications`, { headers: getAuthHeader() });
        return response.data;
    } catch (error) {
        console.error('Error fetching my applications:', error);
        throw error;
    }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Not specified';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const internshipService = {
  getInternships,
  getInternshipById,
  applyForInternship,
  getMyApplications,
  formatDate
};

export default internshipService;
