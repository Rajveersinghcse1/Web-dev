const http = require('http');

console.log('🚀 Testing Voice Cloner Backend API');
console.log('=====================================');

// Test functions
async function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const responseData = body ? JSON.parse(body) : {};
          resolve({ statusCode: res.statusCode, headers: res.headers, data: responseData, body });
        } catch (e) {
          resolve({ statusCode: res.statusCode, headers: res.headers, body, error: e.message });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  // Test 1: Health Check
  console.log('\n1. Testing Health Check...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/health',
      method: 'GET'
    });
    console.log(`✅ Health Check: Status ${response.statusCode}`);
    console.log(`Response: ${response.body}`);
  } catch (error) {
    console.log(`❌ Health Check Failed: ${error.message}`);
  }

  // Test 2: Input Validation - Invalid Registration  
  console.log('\n2. Testing Input Validation (Invalid Registration)...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email: "invalid-email",
      password: "weak",
      name: "a"
    });
    
    if (response.statusCode === 400) {
      console.log('✅ Input Validation Working: Rejected invalid data');
    } else {
      console.log(`❌ Should have failed validation. Status: ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`❌ Validation test error: ${error.message}`);
  }

  // Test 3: Valid Registration
  console.log('\n3. Testing Valid User Registration...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email: "test@example.com",
      password: "StrongPass123!",
      name: "Test User"
    });
    
    if (response.statusCode === 201) {
      console.log('✅ Registration: Status 201 - User Created');
      console.log(`User Email: ${response.data.data?.user?.email}`);
    } else if (response.statusCode === 409) {
      console.log('✅ Registration: User already exists (expected)');
    } else {
      console.log(`❌ Registration unexpected status: ${response.statusCode}`);
      console.log(`Response: ${response.body}`);
    }
  } catch (error) {
    console.log(`❌ Registration test error: ${error.message}`);
  }

  // Test 4: Valid Login
  console.log('\n4. Testing User Login...');
  let accessToken = null;
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      email: "test@example.com",
      password: "StrongPass123!"
    });
    
    if (response.statusCode === 200) {
      console.log('✅ Login: Status 200 - Success');
      accessToken = response.data.data?.accessToken;
      console.log(`Access Token Received: ${accessToken ? accessToken.length : 0} characters`);
    } else {
      console.log(`❌ Login failed. Status: ${response.statusCode}`);
      console.log(`Response: ${response.body}`);
    }
  } catch (error) {
    console.log(`❌ Login test error: ${error.message}`);
  }

  // Test 5: Protected Route (without token)
  console.log('\n5. Testing Protected Route (No Token)...');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/user/profile',
      method: 'GET'
    });
    
    if (response.statusCode === 401) {
      console.log('✅ Protection Working: Unauthorized access denied');
    } else {
      console.log(`❌ Should have been rejected. Status: ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`❌ Protected route test error: ${error.message}`);
  }

  // Test 6: Protected Route (with token)
  if (accessToken) {
    console.log('\n6. Testing Protected Route (With Token)...');
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/user/profile',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.statusCode === 200) {
        console.log('✅ Protected Route: Access granted with valid token');
      } else {
        console.log(`❌ Protected route with token failed. Status: ${response.statusCode}`);
        console.log(`Response: ${response.body}`);
      }
    } catch (error) {
      console.log(`❌ Protected route with token error: ${error.message}`);
    }
  } else {
    console.log('\n6. Skipping Protected Route test - No access token available');
  }

  console.log('\n🏁 Testing Complete!');
  console.log('=====================================');
}

runTests().catch(console.error);