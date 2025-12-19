// User routes - Enhanced implementation with connections
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

// Get user by ID
router.get('/:userId', auth, async (req, res) => {
  try {
    // In a real app, this would fetch from database
    const mockUser = {
      id: req.params.userId,
      name: 'Sample User',
      position: 'Software Developer',
      company: 'Tech Company',
      avatar: '/api/placeholder/40/40',
      bio: 'Passionate developer creating amazing applications',
      location: 'San Francisco, CA',
      joinDate: 'January 2024',
      isFollowing: false,
      mutualConnections: 5
    };
    
    res.json({ success: true, data: mockUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user' });
  }
});

// Get user connections
router.get('/connections', auth, async (req, res) => {
  try {
    // Mock connections data
    const connections = [
      {
        id: 1,
        name: 'Sarah Chen',
        position: 'Frontend Developer',
        company: 'Google',
        avatar: '/api/placeholder/40/40',
        mutualConnections: 15,
        isFollowing: true,
        connectedAt: '2024-01-15'
      },
      {
        id: 2,
        name: 'Alex Rodriguez',
        position: 'Backend Engineer',
        company: 'Microsoft',
        avatar: '/api/placeholder/40/40',
        mutualConnections: 8,
        isFollowing: true,
        connectedAt: '2024-01-20'
      }
    ];
    
    res.json({ success: true, data: connections });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching connections' });
  }
});

// Get suggested connections
router.get('/suggestions', auth, async (req, res) => {
  try {
    // Mock suggested connections
    const suggestions = [
      {
        id: 4,
        name: 'David Park',
        position: 'DevOps Engineer',
        company: 'Amazon',
        avatar: '/api/placeholder/40/40',
        mutualConnections: 5,
        isFollowing: false,
        reason: 'Works at Amazon'
      },
      {
        id: 5,
        name: 'Lisa Wang',
        position: 'Data Scientist',
        company: 'Netflix',
        avatar: '/api/placeholder/40/40',
        mutualConnections: 12,
        isFollowing: false,
        reason: 'Similar interests'
      }
    ];
    
    res.json({ success: true, data: suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching suggestions' });
  }
});

// Follow/Unfollow user
router.post('/follow/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // In a real app, this would update the database
    // For now, we'll just return success
    
    res.json({ 
      success: true, 
      message: 'User follow status updated',
      data: { userId, isFollowing: true }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating follow status' });
  }
});

// Unfollow user
router.delete('/follow/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // In a real app, this would update the database
    res.json({ 
      success: true, 
      message: 'User unfollowed successfully',
      data: { userId, isFollowing: false }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating follow status' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, bio, location, website, github, twitter, phone, company, position } = req.body;
    
    // In a real app, this would update the database
    const updatedProfile = {
      name,
      bio,
      location,
      website,
      github,
      twitter,
      phone,
      company,
      position
    };
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
});

// Search users
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    // Mock search results
    const results = [
      {
        id: 6,
        name: 'John Smith',
        position: 'Full Stack Developer',
        company: 'Startup Inc.',
        avatar: '/api/placeholder/40/40',
        mutualConnections: 3,
        isFollowing: false
      },
      {
        id: 7,
        name: 'Jane Doe',
        position: 'UI/UX Designer',
        company: 'Design Studio',
        avatar: '/api/placeholder/40/40',
        mutualConnections: 1,
        isFollowing: false
      }
    ].filter(user => 
      user.name.toLowerCase().includes(q?.toLowerCase() || '') ||
      user.position.toLowerCase().includes(q?.toLowerCase() || '')
    );
    
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error searching users' });
  }
});

module.exports = router;