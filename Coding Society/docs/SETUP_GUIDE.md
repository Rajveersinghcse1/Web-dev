# Coding Challenge Platform - Setup & Installation Guide

## Overview

This implementation provides a **production-ready coding challenge platform** comparable to LeetCode/GeeksforGeeks with the following features:

- ✅ Split-screen Monaco editor interface
- ✅ Sandboxed code execution via Piston API
- ✅ Deterministic test case validation
- ✅ Hidden test cases for anti-cheating
- ✅ Performance metrics (time/memory tracking)
- ✅ Progression system with strict gating
- ✅ Beautiful success/failure UI states

---

## Installation Steps

### 1. Install Dependencies

```bash
# Backend dependencies (if not already installed)
cd backend
npm install uuid

# Frontend dependencies
cd ..
npm install @monaco-editor/react canvas-confetti
```

### 2. Database Setup

The models are ready to use. No migration needed if you're using the existing MongoDB connection.

**New Models:**
- `CodingChallenge` - Stores problems with test cases
- `UserSubmission` - Tracks all submissions with metrics

### 3. Backend Route Registration

✅ Already added to `server.js`:
```javascript
const challengesRoutes = require('./routes/challenges');
app.use(`${apiPrefix}/challenges`, challengesRoutes);
```

### 4. Frontend Route Configuration

Add to your React Router configuration:

```jsx
// In your App.jsx or routing file
import ChallengePage from './pages/ChallengePage';
import ChallengesListPage from './pages/ChallengesListPage';

// Add these routes:
<Route path="/challenges" element={<ChallengesListPage />} />
<Route path="/challenges/:slug" element={<ChallengePage />} />
```

---

## API Endpoints

### Challenge Management

**GET /api/v1/challenges**
- List all challenges (paginated, filtered)
- Query params: `page`, `limit`, `difficulty`, `category`, `search`, `sortBy`

**GET /api/v1/challenges/:slug**
- Get single challenge details
- Returns problem statement, visible test cases, starter code

### Code Execution

**POST /api/v1/challenges/:slug/run**
- Run code against visible test cases only
- Request: `{ code, language }`
- Response: Test results for visible cases

**POST /api/v1/challenges/:slug/submit**
- Submit code for full evaluation (visible + hidden test cases)
- Request: `{ code, language, timeSpentCoding }`
- Response: Full results, status, points earned

### Submission History

**GET /api/v1/challenges/:slug/submissions**
- Get user's submission history for a challenge

**GET /api/v1/challenges/:slug/submissions/:submissionId**
- Get detailed submission info

---

## Creating Test Challenges

### Option 1: Manual Database Insert

```javascript
// Run in MongoDB shell or create a seed script
db.codingchallenges.insertOne({
  problemId: "CC001",
  title: "Two Sum",
  slug: "two-sum",
  difficulty: "Easy",
  category: "Array",
  problemStatement: {
    description: "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.",
    inputFormat: "Line 1: Space-separated integers representing the array\nLine 2: Target integer",
    outputFormat: "Two space-separated integers representing the indices",
    constraints: [
      "2 ≤ nums.length ≤ 10^4",
      "-10^9 ≤ nums[i] ≤ 10^9",
      "-10^9 ≤ target ≤ 10^9"
    ],
    exampleTestCases: [
      {
        input: "2 7 11 15\n9",
        output: "0 1",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ]
  },
  testCases: [
    {
      input: "2 7 11 15\n9",
      expectedOutput: "0 1",
      isHidden: false,
      weight: 1,
      timeLimit: 5000,
      memoryLimit: 128
    },
    {
      input: "3 2 4\n6",
      expectedOutput: "1 2",
      isHidden: false,
      weight: 1,
      timeLimit: 5000,
      memoryLimit: 128
    },
    {
      input: "3 3\n6",
      expectedOutput: "0 1",
      isHidden: true,
      weight: 1,
      timeLimit: 5000,
      memoryLimit: 128
    }
  ],
  supportedLanguages: ["Python", "Java", "C++", "JavaScript", "C"],
  starterCode: {
    Python: "def two_sum(nums, target):\n    # Your code here\n    pass\n\nif __name__ == '__main__':\n    nums = list(map(int, input().split()))\n    target = int(input())\n    result = two_sum(nums, target)\n    print(result[0], result[1])",
    Java: "import java.util.*;\n\npublic class Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        // Your code here\n        return new int[]{0, 0};\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] input = sc.nextLine().split(\" \");\n        int[] nums = new int[input.length];\n        for (int i = 0; i < input.length; i++) {\n            nums[i] = Integer.parseInt(input[i]);\n        }\n        int target = sc.nextInt();\n        int[] result = twoSum(nums, target);\n        System.out.println(result[0] + \" \" + result[1]);\n    }\n}"
  },
  executionLimits: {
    defaultTimeLimit: 5000,
    defaultMemoryLimit: 128
  },
  tags: ["hash-table", "array"],
  isActive: true,
  isPremium: false,
  createdBy: ObjectId("YOUR_USER_ID"),
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Option 2: Admin API Endpoint (Create Later)

You can create an admin route for adding challenges via UI.

---

## Testing the Implementation

### 1. Start Backend Server

```bash
cd backend
npm start
```

### 2. Start Frontend Dev Server

```bash
npm run dev
```

### 3. Navigate to Challenges

```
http://localhost:5173/challenges
```

### 4. Test Code Execution Flow

1. Select a challenge from the list
2. Choose a programming language
3. Write code in Monaco editor
4. Click "Run Code" to test against visible test cases
5. Click "Submit" for full evaluation
6. Verify success/failure states

---

## Architecture Highlights

### Sandboxed Execution
- All code runs via Piston API (https://emkc.org/api/v2/piston)
- Isolated Docker containers
- No filesystem/network access
- Enforced time and memory limits

### Deterministic Evaluation
- Output normalization (trim, line endings)
- Exact string comparison
- No random inputs in test cases

### Hidden Test Cases
- Never sent to frontend
- Only evaluated on "Submit"
- Prevents gaming the system

### Progression System
- 100% test case pass required for advancement
- No partial credit
- Unlimited attempts allowed
- Points awarded only on first accepted submission

---

## Performance Considerations

### Rate Limiting
- Implemented at route level
- Prevents API abuse
- Configurable limits

### Caching Strategy (Future)
- Cache challenge list (5 min TTL)
- Cache user submission stats
- Redis for distributed caching

### Scalability (Future)
- Queue-based execution (Bull/BullMQ)
- Horizontal scaling with load balancer
- Database read replicas

---

## Troubleshooting

### Monaco Editor Not Loading
```bash
npm install @monaco-editor/react
```

### Confetti Animation Not Working
```bash
npm install canvas-confetti
```

### Compiler API Errors
- Check internet connection
- Verify Piston API is accessible: https://emkc.org/api/v2/piston/runtimes
- Consider rate limiting (Piston has usage limits)

### Test Cases Not Executing
- Verify test case format (input/expectedOutput as strings)
- Check language mapping in LANGUAGE_MAP
- Review compiler API response in backend logs

---

## Next Steps

### Immediate Enhancements
1. Create seed script with 50+ problems
2. Add admin panel for challenge management
3. Implement user leaderboard
4. Add solution discussion forum

### Advanced Features
1. Real-time collaborative coding
2. Video solution explanations
3. Company-specific problem filtering
4. Weekly contests
5. AI-powered hints system

---

## File Structure

```
backend/
  models/
    CodingChallenge.js      ✅ Complete
    UserSubmission.js       ✅ Complete
  routes/
    challenges.js           ✅ Complete
  server.js                 ✅ Updated

src/
  pages/
    ChallengePage.jsx       ✅ Complete
    ChallengesListPage.jsx  ✅ Complete

docs/
  CODING_CHALLENGE_ARCHITECTURE.md  ✅ Complete
  SETUP_GUIDE.md                    ✅ This file
```

---

## Support

For issues or questions:
1. Check [CODING_CHALLENGE_ARCHITECTURE.md](./CODING_CHALLENGE_ARCHITECTURE.md) for technical details
2. Review backend logs for API errors
3. Inspect browser console for frontend errors
4. Test compiler API directly: https://emkc.org/api/v2/piston/execute

---

**Implementation Status**: ✅ Complete and Production-Ready
**Last Updated**: 2026-01-01
