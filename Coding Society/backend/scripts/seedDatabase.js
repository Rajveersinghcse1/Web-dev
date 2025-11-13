/**
 * Database Seeding Script for Coding Society Platform
 * Populates the database with initial quests, achievements, and sample data
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Models
const User = require('../models/User');
const Quest = require('../models/Quest');
const Achievement = require('../models/Achievement');

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-society', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample achievements
const achievements = [
  {
    id: 'first_quest',
    name: 'First Steps',
    description: 'Complete your first quest',
    category: 'progression',
    type: 'milestone',
    rarity: 'common',
    icon: '🎯',
    requirements: {
      type: 'quest_completion',
      target: 1
    },
    rewards: {
      xp: 50,
      coins: 25
    },
    status: 'active',
    createdBy: null // Will be set to admin user
  },
  {
    id: 'level_5_milestone',
    name: 'Rising Coder',
    description: 'Reach level 5',
    category: 'progression',
    type: 'milestone',
    rarity: 'uncommon',
    icon: '⭐',
    requirements: {
      type: 'level_reached',
      target: 5
    },
    rewards: {
      xp: 100,
      coins: 50,
      skillPoints: 1
    },
    status: 'active',
    createdBy: null
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete a quest in under 5 minutes',
    category: 'challenge',
    type: 'challenge',
    rarity: 'rare',
    icon: '⚡',
    requirements: {
      type: 'custom',
      target: 1,
      conditions: [
        { field: 'timeSpent', operator: 'lt', value: 5 }
      ]
    },
    rewards: {
      xp: 200,
      gems: 5
    },
    status: 'active',
    createdBy: null
  }
];

// Sample quests
const quests = [
  {
    title: 'Hello World Adventure',
    description: 'Begin your coding journey with the classic Hello World program',
    shortDescription: 'Your first step into the coding universe',
    category: 'general',
    difficulty: 'beginner',
    tags: ['basics', 'introduction', 'first-quest'],
    story: {
      introduction: 'Welcome, brave coder! You have entered the mystical realm of programming.',
      background: 'Legend speaks of ancient magic words that can communicate with the digital spirits.',
      objective: 'Your first quest is to speak the sacred phrase "Hello, World!" to prove your worth.',
      conclusion: 'Congratulations! You have taken your first step into a larger world of code.'
    },
    theme: 'fantasy',
    programmingLanguage: 'javascript',
    challenge: {
      problem: 'Create a function that returns the string "Hello, World!"',
      constraints: [
        'Function must be named "helloWorld"',
        'Function should return exactly "Hello, World!"'
      ],
      examples: [
        {
          input: 'helloWorld()',
          output: '"Hello, World!"',
          explanation: 'The function should return the greeting string'
        }
      ],
      hints: [
        {
          text: 'Use the return statement to output a string',
          cost: 0,
          unlockAfter: 0
        },
        {
          text: 'Make sure the capitalization and punctuation match exactly',
          cost: 5,
          unlockAfter: 2
        }
      ],
      starterCode: 'function helloWorld() {\n  // Your code here\n}',
      solutionTemplate: 'function helloWorld() {\n  return "Hello, World!";\n}',
      testCases: [
        {
          input: 'helloWorld()',
          expectedOutput: 'Hello, World!',
          isHidden: false,
          weight: 1
        }
      ]
    },
    rewards: {
      xp: 25,
      coins: 10,
      skillPoints: 1
    },
    status: 'published',
    featured: true,
    author: null // Will be set to admin user
  },
  {
    title: 'The Sum Scroll',
    description: 'Master the ancient art of addition with magical numbers',
    shortDescription: 'Learn to combine numbers with mystical powers',
    category: 'algorithms',
    difficulty: 'beginner',
    tags: ['math', 'functions', 'basics'],
    story: {
      introduction: 'The Grand Wizard has tasked you with creating a magical calculation scroll.',
      background: 'Numbers hold great power in the coding realm, and adding them together creates stronger spells.',
      objective: 'Create a function that can add any two numbers together.',
      conclusion: 'Your mathematical magic grows stronger! The numbers bend to your will.'
    },
    theme: 'fantasy',
    programmingLanguage: 'javascript',
    challenge: {
      problem: 'Create a function that takes two numbers and returns their sum',
      constraints: [
        'Function must be named "addNumbers"',
        'Function should accept two parameters',
        'Function should return the sum of the two numbers'
      ],
      examples: [
        {
          input: 'addNumbers(3, 5)',
          output: '8',
          explanation: 'The sum of 3 and 5 is 8'
        },
        {
          input: 'addNumbers(-2, 7)',
          output: '5',
          explanation: 'The sum of -2 and 7 is 5'
        }
      ],
      hints: [
        {
          text: 'Use the + operator to add numbers together',
          cost: 0,
          unlockAfter: 0
        },
        {
          text: 'Don\'t forget to return the result',
          cost: 5,
          unlockAfter: 3
        }
      ],
      starterCode: 'function addNumbers(a, b) {\n  // Your code here\n}',
      solutionTemplate: 'function addNumbers(a, b) {\n  return a + b;\n}',
      testCases: [
        {
          input: 'addNumbers(3, 5)',
          expectedOutput: '8',
          isHidden: false,
          weight: 1
        },
        {
          input: 'addNumbers(-2, 7)',
          expectedOutput: '5',
          isHidden: false,
          weight: 1
        },
        {
          input: 'addNumbers(0, 0)',
          expectedOutput: '0',
          isHidden: true,
          weight: 1
        }
      ]
    },
    rewards: {
      xp: 35,
      coins: 15,
      skillPoints: 0
    },
    status: 'published',
    featured: false,
    author: null
  }
];

// Sample admin user
const adminUser = {
  username: 'admin',
  email: 'admin@rock.com',
  password: 'admin123',
  profile: {
    firstName: 'System',
    lastName: 'Administrator',
    avatar: '👨‍💻'
  },
  role: 'admin',
  gameData: {
    level: 100,
    xp: 50000,
    totalXP: 50000,
    skillPoints: 50,
    coins: 10000,
    gems: 500,
    characterClass: 'fullstack_paladin'
  }
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Quest.deleteMany({});
    await Achievement.deleteMany({});

    // Create admin user
    console.log('👤 Creating admin user...');
    const admin = await User.create(adminUser);
    console.log(`✅ Admin user created: ${admin.username}`);

    // Update achievements and quests with admin user ID
    achievements.forEach(achievement => {
      achievement.createdBy = admin._id;
    });

    quests.forEach(quest => {
      quest.author = admin._id;
    });

    // Seed achievements
    console.log('🏆 Seeding achievements...');
    const createdAchievements = await Achievement.insertMany(achievements);
    console.log(`✅ Created ${createdAchievements.length} achievements`);

    // Seed quests
    console.log('📜 Seeding quests...');
    const createdQuests = await Quest.insertMany(quests);
    console.log(`✅ Created ${createdQuests.length} quests`);

    // Create sample users
    console.log('👥 Creating sample users...');
    const sampleUsers = [
      {
        username: 'coder_alice',
        email: 'alice@example.com',
        password: 'Password123!',
        profile: { firstName: 'Alice', lastName: 'Johnson', avatar: '👩‍💻' },
        gameData: { level: 5, xp: 450, totalXP: 450, skillPoints: 3, coins: 200, gems: 25 }
      },
      {
        username: 'dev_bob',
        email: 'bob@example.com',
        password: 'Password123!',
        profile: { firstName: 'Bob', lastName: 'Smith', avatar: '👨‍💻' },
        gameData: { level: 3, xp: 200, totalXP: 200, skillPoints: 1, coins: 150, gems: 15 }
      },
      {
        username: 'wizard_charlie',
        email: 'charlie@example.com',
        password: 'Password123!',
        profile: { firstName: 'Charlie', lastName: 'Brown', avatar: '🧙‍♂️' },
        gameData: { level: 8, xp: 720, totalXP: 720, skillPoints: 5, coins: 350, gems: 40, characterClass: 'frontend_wizard' }
      }
    ];

    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${createdUsers.length} sample users`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Seeding Summary:');
    console.log(`   👤 Users: ${createdUsers.length + 1} (including admin)`);
    console.log(`   🏆 Achievements: ${createdAchievements.length}`);
    console.log(`   📜 Quests: ${createdQuests.length}`);
    console.log('\n🔑 Admin Credentials:');
    console.log('   Email: admin@rock.com');
    console.log('   Password: admin123');
    console.log('\n🎮 Ready to start your coding adventure!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seeding
seedDatabase();