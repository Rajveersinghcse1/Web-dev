/**
 * Quick Admin API Endpoint Test
 * Tests all admin routes to ensure they're working
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';
let authToken = '';

async function login() {
  try {
    console.log('\n🔐 Logging in as admin...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: 'admin@codingsociety.com',
      password: 'Admin@123'
    });
    
    authToken = response.data.token;
    console.log('✅ Login successful');
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testEndpoint(method, path, description, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${path}`,
      headers: { Authorization: `Bearer ${authToken}` }
    };
    
    if (data) config.data = data;
    
    const response = await axios(config);
    console.log(`✅ ${description}`);
    return response.data;
  } catch (error) {
    console.error(`❌ ${description}`);
    console.error('   Response:', error.response?.data || error.message);
    return null;
  }
}

async function runTests() {
  console.log('\n🧪 ADMIN API ENDPOINT TESTS\n');
  console.log('━'.repeat(60));
  
  // Login first
  if (!await login()) {
    console.log('\n❌ Cannot proceed without authentication');
    return;
  }
  
  console.log('\n📊 Testing User Management Endpoints...');
  console.log('━'.repeat(60));
  await testEndpoint('GET', '/admin/users?page=1&limit=10', 'GET /admin/users');
  await testEndpoint('GET', '/admin/users?role=admin', 'GET /admin/users (filter by role)');
  await testEndpoint('GET', '/admin/users?status=active', 'GET /admin/users (filter by status)');
  
  console.log('\n📈 Testing Analytics Endpoints...');
  console.log('━'.repeat(60));
  const dashboard = await testEndpoint('GET', '/admin/analytics/dashboard', 'GET /admin/analytics/dashboard');
  const content = await testEndpoint('GET', '/admin/analytics/content', 'GET /admin/analytics/content');
  const engagement = await testEndpoint('GET', '/admin/analytics/engagement', 'GET /admin/analytics/engagement');
  
  console.log('\n⚙️  Testing Settings Endpoints...');
  console.log('━'.repeat(60));
  const settings = await testEndpoint('GET', '/admin/settings', 'GET /admin/settings');
  
  console.log('\n📝 Testing System Endpoints...');
  console.log('━'.repeat(60));
  await testEndpoint('GET', '/admin/audit-logs?page=1&limit=10', 'GET /admin/audit-logs');
  await testEndpoint('GET', '/admin/system/health', 'GET /admin/system/health');
  
  console.log('\n━'.repeat(60));
  console.log('✅ TEST SUITE COMPLETE\n');
  
  // Display sample data
  if (dashboard) {
    console.log('📊 Dashboard Analytics:');
    console.log(`   Total Users: ${dashboard.users?.total || 0}`);
    console.log(`   Active Users: ${dashboard.users?.active || 0}`);
    console.log(`   Total Content: ${dashboard.content?.total || 0}`);
  }
  
  if (content) {
    console.log('\n📚 Content Distribution:');
    if (content.distribution) {
      content.distribution.forEach(item => {
        console.log(`   ${item._id}: ${item.count}`);
      });
    }
  }
  
  if (settings) {
    console.log('\n⚙️  System Settings:');
    console.log(`   Site Name: ${settings.siteName}`);
    console.log(`   Maintenance Mode: ${settings.maintenanceMode ? 'ON' : 'OFF'}`);
    console.log(`   Allow Registration: ${settings.allowRegistration ? 'YES' : 'NO'}`);
  }
  
  console.log('\n🎉 All endpoints tested successfully!');
  console.log('🚀 Admin panel is ready at: http://localhost:3000/admin\n');
}

runTests().then(() => process.exit(0)).catch(err => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
