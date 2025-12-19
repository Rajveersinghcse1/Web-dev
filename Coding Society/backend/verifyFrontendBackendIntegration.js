const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api/v1/admin';
let authToken = '';

// Login as admin
async function login() {
  try {
    const response = await axios.post('http://localhost:5000/api/v1/auth/login', {
      identifier: 'admin@codingsociety.com',
      password: 'Admin@123456'
    });
    authToken = response.data.token;
    console.log('Login successful');
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Test Library Content Creation (New Frontend Structure)
async function testLibraryContent() {
  console.log('\nTesting Library Content Creation...');
  const form = new FormData();
  form.append('title', 'Integration Test Library Content');
  form.append('description', 'Testing new frontend fields');
  form.append('category', 'programming'); // New field
  form.append('type', 'study_notes'); // New enum value
  form.append('difficulty', 'beginner');
  form.append('tags', 'test, integration');
  form.append('content', 'Some content');
  
  try {
    const response = await axios.post(`${API_URL}/library`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('Library Content Created:', response.data.success);
    return response.data.data._id;
  } catch (error) {
    console.error('Library Content Creation Failed:', error.response?.data || error.message);
    return null;
  }
}

// Test Innovation Project Creation (New Frontend Structure)
async function testInnovationProject() {
  console.log('\nTesting Innovation Project Creation...');
  const form = new FormData();
  form.append('title', 'Integration Test Innovation');
  form.append('description', 'Testing new frontend fields');
  form.append('category', 'web_application'); // New enum value
  form.append('type', 'prototype'); // New field
  form.append('difficulty', 'intermediate');
  form.append('status', 'planning');
  
  try {
    const response = await axios.post(`${API_URL}/innovation`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('Innovation Project Created:', response.data.success);
    return response.data.data._id;
  } catch (error) {
    console.error('Innovation Project Creation Failed:', error.response?.data || error.message);
    return null;
  }
}

// Test Hackathon Creation (New Frontend Structure)
async function testHackathon() {
  console.log('\nTesting Hackathon Creation...');
  const form = new FormData();
  form.append('title', 'Integration Test Hackathon');
  form.append('description', 'Testing new frontend fields');
  form.append('type', 'web_development'); // New field (Category)
  form.append('eventFormat', 'virtual'); // New field
  form.append('difficulty', 'mixed');
  form.append('status', 'upcoming');
  form.append('eventStartDate', new Date().toISOString());
  form.append('eventEndDate', new Date(Date.now() + 86400000).toISOString());
  
  try {
    const response = await axios.post(`${API_URL}/hackathon`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('Hackathon Created:', response.data.success);
    return response.data.data._id;
  } catch (error) {
    console.error('Hackathon Creation Failed:', error.response?.data || error.message);
    return null;
  }
}

// Test Internship Creation (New Frontend Structure)
async function testInternship() {
  console.log('\nTesting Internship Creation...');
  const form = new FormData();
  form.append('title', 'Integration Test Internship');
  form.append('company', 'Test Corp');
  form.append('description', 'Testing new frontend fields');
  form.append('department', 'product'); // Lowercase
  form.append('role', 'Product Manager Intern'); // Required field
  form.append('type', 'remote');
  form.append('location', 'New York');
  form.append('duration', '3');
  form.append('compensation', '1000');
  form.append('requirements', 'Must know React, Must know Node.js'); // For requirements array
  form.append('mentorName', 'John Doe');
  form.append('mentorEmail', 'john@example.com');
  form.append('mentorPhone', '1234567890');
  
  try {
    const response = await axios.post(`${API_URL}/internship`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('Internship Created:', response.data.success);
    return response.data.data._id;
  } catch (error) {
    console.error('Internship Creation Failed:', error.response?.data || error.message);
    return null;
  }
}

async function run() {
  await login();
  await testLibraryContent();
  await testInnovationProject();
  await testHackathon();
  await testInternship();
}

run();