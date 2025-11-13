const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Post = require('../models/Post');
const Achievement = require('../models/Achievement');

const logger = require('../utils/logger');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding_society', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    logger.info('📦 Connected to MongoDB for seeding');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Achievement.deleteMany({})
    ]);

    logger.info('🧹 Cleared existing data');

    // Create sample users
    const users = [
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'USER',
        isVerified: true,
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          bio: 'Full-stack developer passionate about React and Node.js',
          skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
          experience: 'intermediate'
        },
        stats: {
          postsCount: 5,
          likesReceived: 24,
          commentsCount: 12,
          points: 850,
          level: 3
        }
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'ADMIN',
        isVerified: true,
        profile: {
          firstName: 'Jane',
          lastName: 'Smith',
          bio: 'Senior Software Engineer and mentor. Love helping new developers!',
          skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
          experience: 'expert'
        },
        stats: {
          postsCount: 15,
          likesReceived: 89,
          commentsCount: 45,
          points: 2340,
          level: 8
        }
      },
      {
        username: 'alex_dev',
        email: 'alex@example.com',
        password: 'password123',
        role: 'USER',
        isVerified: true,
        profile: {
          firstName: 'Alex',
          lastName: 'Developer',
          bio: 'Mobile app developer focusing on React Native',
          skills: ['React Native', 'TypeScript', 'Firebase'],
          experience: 'intermediate'
        },
        stats: {
          postsCount: 8,
          likesReceived: 34,
          commentsCount: 18,
          points: 1200,
          level: 4
        }
      },
      {
        username: 'sarah_coder',
        email: 'sarah@example.com',
        password: 'password123',
        role: 'MODERATOR',
        isVerified: true,
        profile: {
          firstName: 'Sarah',
          lastName: 'Coder',
          bio: 'DevOps engineer and cloud enthusiast',
          skills: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD'],
          experience: 'advanced'
        },
        stats: {
          postsCount: 12,
          likesReceived: 67,
          commentsCount: 28,
          points: 1890,
          level: 6
        }
      },
      {
        username: 'mike_junior',
        email: 'mike@example.com',
        password: 'password123',
        role: 'USER',
        isVerified: false,
        profile: {
          firstName: 'Mike',
          lastName: 'Junior',
          bio: 'Computer science student learning web development',
          skills: ['HTML', 'CSS', 'JavaScript'],
          experience: 'beginner'
        },
        stats: {
          postsCount: 2,
          likesReceived: 8,
          commentsCount: 5,
          points: 150,
          level: 1
        }
      }
    ];

    const createdUsers = await User.insertMany(users);
    logger.info(`👥 Created ${createdUsers.length} users`);

    // Create sample achievements
    const achievements = [
      {
        title: 'First Steps',
        description: 'Welcome to Coding Society! Complete your first action.',
        icon: 'baby',
        category: 'milestone',
        points: 50,
        rarity: 'common',
        requirements: {
          type: 'posts',
          count: 1
        }
      },
      {
        title: 'Getting Started',
        description: 'Create your first 5 posts',
        icon: 'trophy',
        category: 'coding',
        points: 200,
        rarity: 'common',
        requirements: {
          type: 'posts',
          count: 5
        }
      },
      {
        title: 'Community Favorite',
        description: 'Receive 50 likes on your posts',
        icon: 'heart',
        category: 'community',
        points: 500,
        rarity: 'uncommon',
        requirements: {
          type: 'likes',
          count: 50
        }
      },
      {
        title: 'Conversation Starter',
        description: 'Write 25 comments',
        icon: 'comments',
        category: 'community',
        points: 300,
        rarity: 'uncommon',
        requirements: {
          type: 'comments',
          count: 25
        }
      },
      {
        title: 'Consistency Champion',
        description: 'Maintain a 30-day activity streak',
        icon: 'fire',
        category: 'milestone',
        points: 1000,
        rarity: 'rare',
        requirements: {
          type: 'streak',
          count: 30
        }
      },
      {
        title: 'Rising Star',
        description: 'Reach 100 total likes',
        icon: 'star',
        category: 'community',
        points: 750,
        rarity: 'rare',
        requirements: {
          type: 'likes',
          count: 100
        }
      }
    ];

    const createdAchievements = await Achievement.insertMany(achievements);
    logger.info(`🏆 Created ${createdAchievements.length} achievements`);

    // Award some achievements to users
    const johnDoe = createdUsers[0];
    const janeSmith = createdUsers[1];
    
    // Award achievements based on user stats
    for (const achievement of createdAchievements) {
      for (const user of createdUsers) {
        const meetsRequirements = Achievement.meetsRequirements(achievement, user.stats);
        if (meetsRequirements) {
          achievement.earnedBy.push({ user: user._id });
          await user.addAchievement(achievement._id);
        }
      }
      await achievement.save();
    }

    // Create sample posts
    const posts = [
      {
        title: 'My Journey Learning React',
        content: `Hey everyone! 👋

I wanted to share my experience learning React over the past few months. As someone who came from vanilla JavaScript, React initially felt overwhelming with all its concepts like components, props, and state.

## What helped me:
- Building small projects first
- Reading the official documentation
- Joining this amazing community!

## Key takeaways:
1. Start with functional components and hooks
2. Practice, practice, practice
3. Don't be afraid to ask questions

Would love to hear about your React learning journey in the comments! 

\`\`\`javascript
const MyFirstComponent = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
};
\`\`\``,
        author: johnDoe._id,
        category: 'tutorial',
        tags: ['react', 'javascript', 'learning', 'beginner'],
        status: 'published',
        views: 156
      },
      {
        title: 'Building a REST API with Node.js and Express',
        content: `Just finished building my first REST API! Here's a quick guide for beginners:

## Setup
1. Initialize your project: \`npm init -y\`
2. Install dependencies: \`npm install express mongoose cors\`
3. Create your server.js file

## Basic Structure
\`\`\`javascript
const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/users', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
\`\`\`

## Next Steps
- Add database connection
- Implement CRUD operations
- Add authentication
- Write tests

Happy coding! 🚀`,
        author: janeSmith._id,
        category: 'tutorial',
        tags: ['nodejs', 'express', 'api', 'backend'],
        status: 'published',
        featured: true,
        views: 289
      },
      {
        title: 'Help with CSS Grid Layout',
        content: `I'm struggling to understand CSS Grid. Can someone explain the difference between grid-template-columns and grid-template-areas?

I've been trying to create a responsive layout but I keep getting confused about when to use each approach.

Any resources or examples would be super helpful! 🙏`,
        author: createdUsers[4]._id, // mike_junior
        category: 'question',
        tags: ['css', 'grid', 'layout', 'help'],
        status: 'published',
        views: 78
      },
      {
        title: 'My First Mobile App is Live!',
        content: `Exciting news! 🎉 

After 6 months of development, my React Native app "TaskMaster" is now live on both iOS and Android app stores!

## What it does:
- Task management with priorities
- Calendar integration
- Offline sync
- Dark mode support

## Tech Stack:
- React Native
- TypeScript 
- Firebase
- Redux Toolkit

## Challenges faced:
1. Platform-specific UI differences
2. State management complexity
3. App store submission process

Special thanks to this community for all the help along the way! 

Download links in my bio 📱`,
        author: createdUsers[2]._id, // alex_dev
        category: 'showcase',
        tags: ['react-native', 'mobile', 'app', 'typescript', 'firebase'],
        status: 'published',
        featured: true,
        views: 342
      },
      {
        title: 'DevOps Best Practices for Small Teams',
        content: `Working with a small development team? Here are some DevOps practices that can make a huge difference:

## 1. Automate Everything
- CI/CD pipelines
- Testing
- Deployments
- Monitoring alerts

## 2. Infrastructure as Code
Use tools like:
- Terraform for infrastructure
- Docker for containerization
- Kubernetes for orchestration (if needed)

## 3. Monitoring and Observability
- Application logs
- Performance metrics
- Error tracking
- Health checks

## 4. Security First
- Secrets management
- Vulnerability scanning
- Access control
- Regular updates

## Tools we use:
- GitHub Actions for CI/CD
- AWS for hosting
- Datadog for monitoring
- Vault for secrets

What tools does your team use? Share your setup below! 🔧`,
        author: createdUsers[3]._id, // sarah_coder
        category: 'discussion',
        tags: ['devops', 'ci-cd', 'aws', 'docker', 'monitoring'],
        status: 'published',
        views: 198
      }
    ];

    const createdPosts = await Post.insertMany(posts);
    logger.info(`📝 Created ${createdPosts.length} posts`);

    // Add some likes and comments to posts
    for (const post of createdPosts) {
      // Add random likes
      const likeCount = Math.floor(Math.random() * 20) + 5;
      for (let i = 0; i < likeCount; i++) {
        const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        await post.addLike(randomUser._id);
      }

      // Add some comments
      const commentCount = Math.floor(Math.random() * 5) + 1;
      const sampleComments = [
        'Great post! Thanks for sharing your experience.',
        'This is exactly what I was looking for. Very helpful!',
        'Awesome work! Can you share more details about this?',
        'I had the same issue. Your solution worked perfectly!',
        'Excellent tutorial. Well explained and easy to follow.',
        'Thanks for the detailed explanation. Very informative!',
        'This helped me solve my problem. Much appreciated!',
        'Clear and concise. Perfect for beginners like me.'
      ];

      for (let i = 0; i < commentCount; i++) {
        const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
        await post.addComment({
          author: randomUser._id,
          content: randomComment
        });
      }
    }

    logger.info('✅ Database seeded successfully!');
    
    // Display summary
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    🌱 DATABASE SEEDED SUCCESSFULLY           ║
╠═══════════════════════════════════════════════════════════════╣
║ Users Created:        ${createdUsers.length}                                      ║
║ Posts Created:        ${createdPosts.length}                                      ║
║ Achievements Created: ${createdAchievements.length}                                      ║
╠═══════════════════════════════════════════════════════════════╣
║ Sample Users:                                                 ║
║ • john_doe (USER)     - Intermediate React Developer          ║
║ • jane_smith (ADMIN)  - Senior Full-Stack Engineer           ║
║ • alex_dev (USER)     - Mobile App Developer                 ║
║ • sarah_coder (MOD)   - DevOps Engineer                      ║
║ • mike_junior (USER)  - CS Student                          ║
╠═══════════════════════════════════════════════════════════════╣
║ All users password:   password123                            ║
║ Ready to test your backend API! 🚀                          ║
╚═══════════════════════════════════════════════════════════════╝
    `);

  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    logger.info('📦 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run if script is called directly
if (require.main === module) {
  seedData().catch(error => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
}

module.exports = seedData;