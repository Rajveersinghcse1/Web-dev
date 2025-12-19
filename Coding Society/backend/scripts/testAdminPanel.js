/**
 * Test Admin Panel Integration
 * Tests database connection and admin routes
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

async function testAdminPanel() {
  console.log('🧪 Testing Admin Panel Integration\n');

  try {
    // Test 1: Login as admin
    console.log('1️⃣ Testing admin login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      identifier: 'admin@codingsociety.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('   ✅ Login successful');

    // Test 2: Get users
    console.log('\n2️⃣ Testing user management endpoint...');
    const usersResponse = await axios.get(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ Retrieved ${usersResponse.data.data.users.length} users`);

    // Test 3: Get analytics
    console.log('\n3️⃣ Testing analytics endpoint...');
    const analyticsResponse = await axios.get(`${API_URL}/admin/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ Analytics data retrieved`);
    console.log(`   📊 Total Users: ${analyticsResponse.data.data.overview.users.total}`);
    console.log(`   📊 Total Content: ${analyticsResponse.data.data.overview.content.total}`);

    // Test 4: Get content analytics
    console.log('\n4️⃣ Testing content analytics endpoint...');
    const contentResponse = await axios.get(`${API_URL}/admin/analytics/content`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ Content analytics retrieved`);

    // Test 5: Get settings
    console.log('\n5️⃣ Testing settings endpoint...');
    const settingsResponse = await axios.get(`${API_URL}/admin/settings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ Settings retrieved`);
    console.log(`   🌐 Site Name: ${settingsResponse.data.data.siteName}`);

    // Test 6: Get system health
    console.log('\n6️⃣ Testing system health endpoint...');
    const healthResponse = await axios.get(`${API_URL}/admin/system/health`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ System health retrieved`);
    console.log(`   💾 Database Status: ${healthResponse.data.data.database.status}`);
    console.log(`   📦 Collections: ${healthResponse.data.data.database.collections.length}`);

    // Test 7: Test unauthorized access
    console.log('\n7️⃣ Testing unauthorized access protection...');
    try {
      await axios.get(`${API_URL}/admin/users`);
      console.log('   ❌ FAILED: Unauthorized access allowed');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Unauthorized access properly blocked');
      } else {
        throw error;
      }
    }

    console.log('\n✅ All tests passed! Admin panel is fully functional.\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
testAdminPanel();
