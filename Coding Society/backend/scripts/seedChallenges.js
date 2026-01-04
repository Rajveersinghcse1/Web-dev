/**
 * Seed script for creating sample coding challenges
 * Run: node backend/scripts/seedChallenges.js
 */

const mongoose = require('mongoose');
const CodingChallenge = require('../models/CodingChallenge');
require('dotenv').config();

const sampleChallenges = [
  {
    problemId: "CC001",
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "Easy",
    category: "Array",
    problemStatement: {
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
      inputFormat: "Line 1: Space-separated integers representing the array\nLine 2: Target integer",
      outputFormat: "Two space-separated integers representing the indices (0-indexed)",
      constraints: [
        "2 ≤ nums.length ≤ 10^4",
        "-10^9 ≤ nums[i] ≤ 10^9",
        "-10^9 ≤ target ≤ 10^9",
        "Only one valid answer exists"
      ],
      exampleTestCases: [
        {
          input: "2 7 11 15\n9",
          output: "0 1",
          explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
        },
        {
          input: "3 2 4\n6",
          output: "1 2",
          explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
        }
      ]
    },
    testCases: [
      { input: "2 7 11 15\n9", expectedOutput: "0 1", isHidden: false, weight: 1, timeLimit: 5000, memoryLimit: 128 },
      { input: "3 2 4\n6", expectedOutput: "1 2", isHidden: false, weight: 1, timeLimit: 5000, memoryLimit: 128 },
      { input: "3 3\n6", expectedOutput: "0 1", isHidden: true, weight: 1, timeLimit: 5000, memoryLimit: 128 },
      { input: "1 2 3 4 5\n9", expectedOutput: "3 4", isHidden: true, weight: 1, timeLimit: 5000, memoryLimit: 128 }
    ],
    supportedLanguages: ["Python", "Java", "C++", "JavaScript", "C"],
    starterCode: {
      Python: "def two_sum(nums, target):\n    # Your code here\n    pass\n\nif __name__ == '__main__':\n    nums = list(map(int, input().split()))\n    target = int(input())\n    result = two_sum(nums, target)\n    print(result[0], result[1])",
      Java: "import java.util.*;\n\npublic class Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        // Your code here\n        return new int[]{0, 0};\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] input = sc.nextLine().split(\" \");\n        int[] nums = new int[input.length];\n        for (int i = 0; i < input.length; i++) {\n            nums[i] = Integer.parseInt(input[i]);\n        }\n        int target = sc.nextInt();\n        int[] result = twoSum(nums, target);\n        System.out.println(result[0] + \" \" + result[1]);\n    }\n}",
      JavaScript: "function twoSum(nums, target) {\n    // Your code here\n}\n\nconst readline = require('readline');\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nlet lines = [];\nrl.on('line', (line) => {\n    lines.push(line);\n    if (lines.length === 2) {\n        const nums = lines[0].split(' ').map(Number);\n        const target = parseInt(lines[1]);\n        const result = twoSum(nums, target);\n        console.log(result[0] + ' ' + result[1]);\n        rl.close();\n    }\n});"
    },
    tags: ["hash-table", "array"],
    companies: ["Amazon", "Google", "Facebook"],
    isActive: true
  },
  {
    problemId: "CC002",
    title: "Reverse String",
    slug: "reverse-string",
    difficulty: "Easy",
    category: "String",
    problemStatement: {
      description: "Write a function that reverses a string. The input string is given as an array of characters.",
      inputFormat: "A single line containing a string",
      outputFormat: "The reversed string",
      constraints: [
        "1 ≤ s.length ≤ 10^5",
        "s[i] is a printable ASCII character"
      ],
      exampleTestCases: [
        {
          input: "hello",
          output: "olleh",
          explanation: "The string 'hello' becomes 'olleh' when reversed."
        },
        {
          input: "Hannah",
          output: "hannaH",
          explanation: "The string 'Hannah' becomes 'hannaH' when reversed."
        }
      ]
    },
    testCases: [
      { input: "hello", expectedOutput: "olleh", isHidden: false, weight: 1, timeLimit: 5000, memoryLimit: 128 },
      { input: "Hannah", expectedOutput: "hannaH", isHidden: false, weight: 1, timeLimit: 5000, memoryLimit: 128 },
      { input: "a", expectedOutput: "a", isHidden: true, weight: 1, timeLimit: 5000, memoryLimit: 128 },
      { input: "abcdefghijklmnopqrstuvwxyz", expectedOutput: "zyxwvutsrqponmlkjihgfedcba", isHidden: true, weight: 1, timeLimit: 5000, memoryLimit: 128 }
    ],
    supportedLanguages: ["Python", "Java", "C++", "JavaScript", "C"],
    starterCode: {
      Python: "def reverse_string(s):\n    # Your code here\n    pass\n\nif __name__ == '__main__':\n    s = input()\n    result = reverse_string(s)\n    print(result)",
      Java: "import java.util.*;\n\npublic class Solution {\n    public static String reverseString(String s) {\n        // Your code here\n        return \"\";\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        String result = reverseString(s);\n        System.out.println(result);\n    }\n}",
      JavaScript: "function reverseString(s) {\n    // Your code here\n}\n\nconst readline = require('readline');\nconst rl = readline.createInterface({\n    input: process.stdin,\n    output: process.stdout\n});\n\nrl.on('line', (line) => {\n    const result = reverseString(line);\n    console.log(result);\n    rl.close();\n});"
    },
    tags: ["string", "two-pointers"],
    companies: ["Microsoft", "Apple"],
    isActive: true
  },
  {
    problemId: "CC003",
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    difficulty: "Medium",
    category: "Stack",
    problemStatement: {
      description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
      inputFormat: "A single line containing a string of parentheses",
      outputFormat: "Print 'true' if valid, 'false' otherwise",
      constraints: [
        "1 ≤ s.length ≤ 10^4",
        "s consists of parentheses only '()[]{}'"
      ],
      exampleTestCases: [
        {
          input: "()",
          output: "true",
          explanation: "The string contains valid matching parentheses."
        },
        {
          input: "()[]{}",
          output: "true",
          explanation: "All brackets are properly matched and closed."
        },
        {
          input: "(]",
          output: "false",
          explanation: "Brackets are not properly matched."
        }
      ]
    },
    testCases: [
      { input: "()", expectedOutput: "true", isHidden: false, weight: 1, timeLimit: 5000, memoryLimit: 128 },
      { input: "()[]{}", expectedOutput: "true", isHidden: false, weight: 1, timeLimit: 5000, memoryLimit: 128 },
      { input: "(]", expectedOutput: "false", isHidden: false, weight: 1, timeLimit: 5000, memoryLimit: 128 },
      { input: "{[]}", expectedOutput: "true", isHidden: true, weight: 1, timeLimit: 5000, memoryLimit: 128 },
      { input: "([)]", expectedOutput: "false", isHidden: true, weight: 1, timeLimit: 5000, memoryLimit: 128 },
      { input: "((((((((()))))))))))", expectedOutput: "false", isHidden: true, weight: 1, timeLimit: 5000, memoryLimit: 128 }
    ],
    supportedLanguages: ["Python", "Java", "C++", "JavaScript", "C"],
    starterCode: {
      Python: "def is_valid(s):\n    # Your code here\n    pass\n\nif __name__ == '__main__':\n    s = input()\n    result = is_valid(s)\n    print('true' if result else 'false')",
      Java: "import java.util.*;\n\npublic class Solution {\n    public static boolean isValid(String s) {\n        // Your code here\n        return false;\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        boolean result = isValid(s);\n        System.out.println(result ? \"true\" : \"false\");\n    }\n}"
    },
    tags: ["stack", "string"],
    companies: ["Amazon", "Google", "Bloomberg"],
    isActive: true
  }
];

async function seedChallenges() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27019/coding-society');
    console.log('✅ Connected to MongoDB');

    // Get admin user ID (create a generic admin if not exists)
    const User = require('../models/User');
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('⚠️  No admin user found. Creating one...');
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@codingsociety.com',
        password: 'admin123',
        role: 'admin'
      });
    }

    console.log(`✅ Using admin user: ${adminUser.email}`);

    // Clear existing challenges
    console.log('🗑️  Clearing existing challenges...');
    await CodingChallenge.deleteMany({});

    // Insert sample challenges
    console.log('📝 Inserting sample challenges...');
    const challenges = sampleChallenges.map(challenge => ({
      ...challenge,
      createdBy: adminUser._id,
      lastModifiedBy: adminUser._id
    }));

    await CodingChallenge.insertMany(challenges);

    console.log(`✅ Successfully seeded ${challenges.length} challenges!`);
    console.log('\n📋 Challenges created:');
    challenges.forEach(c => {
      console.log(`   - ${c.problemId}: ${c.title} (${c.difficulty})`);
    });

    console.log('\n🎉 Database seeding complete!');
    console.log('\n🚀 You can now:');
    console.log('   1. Navigate to /challenges to see the list');
    console.log('   2. Click on any challenge to start coding');
    console.log('   3. Test your solution with Run Code');
    console.log('   4. Submit for full evaluation\n');

  } catch (error) {
    console.error('❌ Error seeding challenges:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the seed script
seedChallenges();
