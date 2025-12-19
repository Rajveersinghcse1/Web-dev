/**
 * Admin Analytics Model
 * Stores aggregated analytics data for dashboard
 */

const mongoose = require('mongoose');

const adminAnalyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true,
    unique: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  users: {
    total: { type: Number, default: 0 },
    new: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    byRole: {
      user: { type: Number, default: 0 },
      admin: { type: Number, default: 0 },
      superadmin: { type: Number, default: 0 }
    },
    byStatus: {
      active: { type: Number, default: 0 },
      inactive: { type: Number, default: 0 },
      suspended: { type: Number, default: 0 }
    }
  },
  content: {
    library: {
      total: { type: Number, default: 0 },
      new: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
      downloads: { type: Number, default: 0 }
    },
    innovations: {
      total: { type: Number, default: 0 },
      new: { type: Number, default: 0 },
      approved: { type: Number, default: 0 },
      pending: { type: Number, default: 0 }
    },
    internships: {
      total: { type: Number, default: 0 },
      new: { type: Number, default: 0 },
      active: { type: Number, default: 0 },
      applications: { type: Number, default: 0 }
    },
    hackathons: {
      total: { type: Number, default: 0 },
      new: { type: Number, default: 0 },
      ongoing: { type: Number, default: 0 },
      participants: { type: Number, default: 0 }
    },
    quests: {
      total: { type: Number, default: 0 },
      completed: { type: Number, default: 0 },
      averageCompletionTime: { type: Number, default: 0 }
    }
  },
  engagement: {
    posts: {
      total: { type: Number, default: 0 },
      new: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 }
    },
    stories: {
      total: { type: Number, default: 0 },
      new: { type: Number, default: 0 },
      views: { type: Number, default: 0 }
    },
    feedback: {
      total: { type: Number, default: 0 },
      new: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 }
    }
  },
  system: {
    activeUsers: { type: Number, default: 0 },
    serverUptime: { type: Number, default: 0 },
    apiCalls: { type: Number, default: 0 },
    errors: { type: Number, default: 0 },
    storageUsed: { type: Number, default: 0 }
  },
  topContent: [{
    type: String,
    title: String,
    views: Number,
    engagement: Number
  }],
  topUsers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    xp: Number,
    contributions: Number
  }]
}, {
  timestamps: true
});

// Indexes
adminAnalyticsSchema.index({ date: -1 });
adminAnalyticsSchema.index({ period: 1, date: -1 });

// Static method to generate daily analytics
adminAnalyticsSchema.statics.generateDailyAnalytics = async function(date = new Date()) {
  const User = mongoose.model('User');
  const Post = mongoose.model('Post');
  const LibraryContent = mongoose.model('LibraryContent');
  const Innovation = mongoose.model('Innovation');
  const Internship = mongoose.model('Internship');
  const Hackathon = mongoose.model('Hackathon');
  const Quest = mongoose.model('Quest');
  const Story = mongoose.model('Story');
  const Feedback = mongoose.model('Feedback');

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    // User analytics
    const [totalUsers, newUsers, usersByRole, usersByStatus] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      User.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    ]);

    // Content analytics
    const [
      totalLibrary, newLibrary,
      totalInnovations, newInnovations,
      totalInternships, newInternships,
      totalHackathons, newHackathons,
      totalQuests, totalPosts, newPosts,
      totalStories, newStories,
      totalFeedback, newFeedback
    ] = await Promise.all([
      LibraryContent.countDocuments(),
      LibraryContent.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
      Innovation.countDocuments(),
      Innovation.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
      Internship.countDocuments(),
      Internship.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
      Hackathon.countDocuments(),
      Hackathon.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
      Quest.countDocuments(),
      Post.countDocuments(),
      Post.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
      Story.countDocuments(),
      Story.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
      Feedback.countDocuments(),
      Feedback.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } })
    ]);

    // Create or update analytics record
    const analytics = await this.findOneAndUpdate(
      { date: startOfDay },
      {
        date: startOfDay,
        period: 'daily',
        users: {
          total: totalUsers,
          new: newUsers,
          byRole: {
            user: usersByRole.find(r => r._id === 'user')?.count || 0,
            admin: usersByRole.find(r => r._id === 'admin')?.count || 0,
            superadmin: usersByRole.find(r => r._id === 'superadmin')?.count || 0
          },
          byStatus: {
            active: usersByStatus.find(s => s._id === 'active')?.count || 0,
            inactive: usersByStatus.find(s => s._id === 'inactive')?.count || 0,
            suspended: usersByStatus.find(s => s._id === 'suspended')?.count || 0
          }
        },
        content: {
          library: { total: totalLibrary, new: newLibrary },
          innovations: { total: totalInnovations, new: newInnovations },
          internships: { total: totalInternships, new: newInternships },
          hackathons: { total: totalHackathons, new: newHackathons },
          quests: { total: totalQuests }
        },
        engagement: {
          posts: { total: totalPosts, new: newPosts },
          stories: { total: totalStories, new: newStories },
          feedback: { total: totalFeedback, new: newFeedback }
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return analytics;
  } catch (error) {
    console.error('Failed to generate daily analytics:', error);
    throw error;
  }
};

module.exports = mongoose.model('AdminAnalytics', adminAnalyticsSchema);
