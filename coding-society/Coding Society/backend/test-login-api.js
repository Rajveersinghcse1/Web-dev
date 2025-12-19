/**
 * Test login API endpoint directly with detailed logging
 */

const axios = require('axios');

async function testLoginAPI() {
  try {
    console.log('🚀 Testing login API endpoint...');
    console.log('📡 URL: http://localhost:5000/api/v1/auth/login');
    
    const response = await axios.post('http://localhost:5000/api/v1/auth/login', {
      identifier: 'test@example.com',
      password: 'password123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Success Response:');
    console.log('📊 Status:', response.status);
    console.log('📝 Data:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ Error Response:');
    console.log('📊 Status:', error.response?.status);
    console.log('📝 Error Data:', JSON.stringify(error.response?.data, null, 2));
    console.log('🔍 Full Error:', error.message);
  }
}

testLoginAPI();