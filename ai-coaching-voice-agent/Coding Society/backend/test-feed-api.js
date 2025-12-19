const API_URL = 'http://localhost:5000/api/v1';
const ADMIN_EMAIL = 'admin@codingsociety.com';
const ADMIN_PASSWORD = 'Admin@123456';

async function testFeedAPI() {
  try {
    console.log('🚀 Starting Feed API Test...');

    // 1. Login to get token
    console.log('\n🔑 Logging in...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });

    if (!loginResponse.ok) throw new Error(`Login failed: ${loginResponse.statusText}`);
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful! Token received.');

    // 2. Create a new post
    console.log('\n📝 Creating a new post...');
    const formData = new FormData();
    formData.append('title', 'Test Post from Script');
    formData.append('content', 'This is a test post created to verify backend-database connection.');
    formData.append('type', 'text');
    formData.append('privacy', 'public');

    const createPostResponse = await fetch(`${API_URL}/feed`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!createPostResponse.ok) {
        const errText = await createPostResponse.text();
        throw new Error(`Create post failed: ${createPostResponse.status} - ${errText}`);
    }
    
    const createPostData = await createPostResponse.json();
    console.log('✅ Post created successfully!');
    console.log('Post ID:', createPostData.post._id);

    // 3. Fetch posts to verify
    console.log('\n📥 Fetching posts...');
    const fetchPostsResponse = await fetch(`${API_URL}/feed`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!fetchPostsResponse.ok) throw new Error(`Fetch posts failed: ${fetchPostsResponse.statusText}`);
    const fetchPostsData = await fetchPostsResponse.json();
    const posts = fetchPostsData.posts;
    console.log(`✅ Fetched ${posts.length} posts.`);
    
    const createdPost = posts.find(p => p._id === createPostData.post._id);
    if (createdPost) {
      console.log('✅ Verified: Created post found in feed!');
      console.log('Post Content:', createdPost.content);
    } else {
      console.error('❌ Error: Created post not found in feed.');
    }

    console.log('\n🎉 Feed API Test Completed Successfully!');

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
  }
}

testFeedAPI();
