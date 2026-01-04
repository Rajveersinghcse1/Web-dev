# 🚀 Coding Challenge Platform - Setup & Usage Guide

## Overview

This guide covers the complete setup and usage of the new LeetCode-style professional coding challenge system that replaces the old quest system in the Gamified page.

---

## ✅ Changes Made

### 1. **Removed Navbar Quests**
   - Deleted "Quests" link from study mode navigation
   - Removed `/quests` and `/quests/:questId` routes from App.jsx
   - Removed `QuestsListPage` import

### 2. **Updated Gamified Page**
   - Replaced "Quests" tab with "Coding Challenges"
   - Integrated new `CodingChallengeSystem` component
   - Updated quick actions to navigate to challenges instead of quests

### 3. **New Professional Coding Challenge System**
   - **Component**: `src/components/gamified/CodingChallengeSystem.jsx`
   - LeetCode-style split-screen interface
   - Resizable panels with draggable divider
   - Monaco Editor integration
   - Real-time code execution
   - Test case validation
   - Performance metrics display

### 4. **Backend Code Execution API**
   - **Controller**: `backend/controllers/codeExecutionController.js`
   - **Routes**: `backend/routes/codeExecution.js`
   - Piston API integration for sandboxed execution
   - Rate limiting (30 requests/minute)
   - Test case validation
   - Submission tracking

### 5. **Frontend Service**
   - **Service**: `src/services/professionalCodeExecutionService.js`
   - API integration
   - Output normalization
   - Syntax validation
   - Language configuration

---

## 📦 Installation

### Backend Setup

1. **Install Dependencies**

```bash
cd backend
npm install
```

This will install the new `axios` dependency required for Piston API integration.

2. **Environment Variables**

No additional environment variables needed. The system uses:
- Piston API: `https://emkc.org/api/v2/piston` (free, no API key needed)
- Rate limiting: 30 requests/minute
- Execution timeout: 5 seconds
- Memory limit: 256MB

3. **Start Backend Server**

```bash
npm run dev
```

The code execution API will be available at:
```
http://localhost:5000/api/v1/code-execution
```

### Frontend Setup

1. **Install Dependencies** (if not already installed)

```bash
cd ..
npm install
```

Monaco Editor is already in the dependencies.

2. **Start Frontend**

```bash
npm run dev
```

---

## 🎮 How to Use

### For Users

1. **Navigate to Coding Challenges**
   - Click on "Gamified" in the navbar
   - Select "Coding Challenges" tab

2. **Select a Problem**
   - Browse the problem list
   - Click on any unlocked problem to start

3. **Write Your Solution**
   - Use the Monaco Editor on the right panel
   - Select your preferred language (Python, JavaScript, Java, C++, C)
   - Read the problem description on the left panel

4. **Test Your Code**
   - Click **"Run Code"** to test against visible test cases
   - Review output in the console
   - Fix any errors and try again

5. **Submit Your Solution**
   - When confident, click **"Submit"**
   - Code runs against ALL test cases (visible + hidden)
   - Must pass 100% to unlock the next problem

6. **Progression**
   - ✅ 100% pass = Problem solved, XP awarded, next problem unlocked
   - ❌ <100% pass = Must retry, problem remains locked
   - Track attempts and best scores

### For Developers

#### Adding New Problems

Edit `src/components/gamified/CodingChallengeSystem.jsx`:

```javascript
const PROBLEMS_DATABASE = [
  {
    id: 4,  // Increment ID
    title: 'Your Problem Title',
    difficulty: 'Medium',  // Easy, Medium, Hard
    category: 'Arrays',
    description: `Problem description here...`,
    inputFormat: `nums: Array of integers`,
    outputFormat: `Integer`,
    constraints: [
      '1 ≤ n ≤ 10⁵'
    ],
    examples: [
      {
        input: 'nums = [1,2,3]',
        output: '6',
        explanation: 'Sum is 1+2+3=6'
      }
    ],
    testCases: [
      { 
        input: '[1,2,3]', 
        expectedOutput: '6', 
        visible: true 
      },
      { 
        input: '[10,20,30]', 
        expectedOutput: '60', 
        visible: false  // Hidden test case
      }
    ],
    starterCode: {
      python: `def solution(nums):\n    # Your code here\n    pass`,
      javascript: `function solution(nums) {\n    // Your code here\n}`,
      // ... other languages
    },
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Use a loop to iterate',
      'Keep track of sum'
    ],
    locked: false  // Set true for progression-locked problems
  }
];
```

#### Customizing Language Support

Edit `src/services/professionalCodeExecutionService.js`:

```javascript
getLanguageConfig(language) {
  const configs = {
    newlanguage: {
      name: 'New Language',
      version: '1.0',
      icon: '🆕',
      extension: 'ext',
      template: '// Template code\n',
      boilerplate: 'function main() {\n}\n'
    }
  };
  return configs[language];
}
```

Update backend controller:

```javascript
const LANGUAGE_MAP = {
  newlanguage: { language: 'lang', version: '1.0' }
};
```

#### Adjusting Rate Limits

Edit `backend/controllers/codeExecutionController.js`:

```javascript
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 50; // Increase from 30 to 50
```

#### Changing Execution Limits

```javascript
{
  compile_timeout: 15000,       // Increase to 15 seconds
  run_timeout: 10000,           // Increase to 10 seconds
  compile_memory_limit: 512MB,  // Increase to 512MB
  run_memory_limit: 512MB
}
```

---

## 🧪 Testing

### Test Code Execution Endpoint

```bash
curl -X POST http://localhost:5000/api/v1/code-execution/execute \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(42)",
    "language": "python",
    "input": ""
  }'
```

Expected response:

```json
{
  "success": true,
  "output": "42",
  "stderr": "",
  "executionTime": 95,
  "memory": 12.5,
  "exitCode": 0
}
```

### Test Test Case Validation

```bash
curl -X POST http://localhost:5000/api/v1/code-execution/test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "import sys\nnums = eval(sys.stdin.readline())\nprint(sum(nums))",
    "language": "python",
    "testCases": [
      {
        "input": "[1,2,3]",
        "expectedOutput": "6",
        "visible": true
      },
      {
        "input": "[10,20,30]",
        "expectedOutput": "60",
        "visible": false
      }
    ]
  }'
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **Piston API Rate Limit**

**Error**: "Too many requests"

**Solution**: 
- Piston API has its own rate limits
- Implement local caching
- Consider self-hosting Piston
- Upgrade to paid execution service

#### 2. **Monaco Editor Not Loading**

**Error**: Monaco editor shows blank screen

**Solution**:
```bash
npm install @monaco-editor/react
```

Ensure in `vite.config.js`:
```javascript
optimizeDeps: {
  include: ['@monaco-editor/react']
}
```

#### 3. **Code Execution Timeout**

**Error**: "Execution timeout exceeded"

**Solution**:
- Optimize user code
- Increase timeout in backend
- Check for infinite loops
- Profile code performance

#### 4. **Authentication Error**

**Error**: "Unauthorized"

**Solution**:
- Ensure user is logged in
- Check JWT token validity
- Verify middleware is applied
- Check CORS settings

#### 5. **Output Mismatch**

**Error**: Test case fails but output looks correct

**Solution**:
- Check whitespace differences
- Normalize output (trim, lowercase)
- Verify expected output format
- Check for trailing newlines

### Debug Mode

Enable detailed logging:

**Backend**:
```javascript
// In codeExecutionController.js
console.log('Executing code:', { code, language, input });
console.log('Piston response:', response.data);
```

**Frontend**:
```javascript
// In CodingChallengeSystem.jsx
console.log('Test results:', testResults);
console.log('Execution result:', executionResult);
```

---

## 📊 Monitoring & Analytics

### Track User Progress

```javascript
// In backend, track submissions
const submission = {
  userId: req.user.id,
  problemId,
  code,
  language,
  passed: allTestsPassed,
  executionTime: avgExecutionTime,
  timestamp: new Date()
};

await Submission.create(submission);
```

### Analytics Queries

```javascript
// Get user's problem-solving stats
const stats = await Submission.aggregate([
  { $match: { userId: userId } },
  { $group: {
      _id: '$problemId',
      attempts: { $sum: 1 },
      solved: { $max: '$passed' }
    }
  }
]);

// Get platform-wide metrics
const metrics = await Submission.aggregate([
  { $group: {
      _id: '$language',
      count: { $sum: 1 },
      avgTime: { $avg: '$executionTime' }
    }
  }
]);
```

---

## 🚀 Performance Optimization

### Frontend Optimization

1. **Code Editor Lazy Loading**
```javascript
const Editor = lazy(() => import('@monaco-editor/react'));
```

2. **Debounce Code Changes**
```javascript
const debouncedSave = useMemo(
  () => debounce((code) => saveCode(code), 500),
  []
);
```

3. **Memoize Results**
```javascript
const normalizedOutput = useMemo(
  () => normalizeOutput(output),
  [output]
);
```

### Backend Optimization

1. **Cache Problem Definitions**
```javascript
const cache = new Map();

function getProblem(id) {
  if (cache.has(id)) return cache.get(id);
  const problem = PROBLEMS_DATABASE[id];
  cache.set(id, problem);
  return problem;
}
```

2. **Parallel Test Execution** (with caution)
```javascript
const results = await Promise.all(
  testCases.map(tc => executeCode(code, language, tc.input))
);
```

3. **Queue System** (for heavy loads)
```javascript
const Bull = require('bull');
const codeQueue = new Bull('code-execution');

codeQueue.process(async (job) => {
  return await executePistonAPI(job.data);
});
```

---

## 🔒 Security Best Practices

### Input Validation

```javascript
// Validate code length
if (code.length > 50000) {
  throw new Error('Code too long');
}

// Validate language
const ALLOWED_LANGUAGES = ['python', 'javascript', 'java', 'cpp', 'c'];
if (!ALLOWED_LANGUAGES.includes(language)) {
  throw new Error('Unsupported language');
}

// Sanitize input
const sanitizedInput = input.replace(/[^\x20-\x7E\n]/g, '');
```

### Rate Limiting per User

```javascript
const userRequestCounts = new Map();

function checkUserRateLimit(userId) {
  const userCount = userRequestCounts.get(userId) || 0;
  if (userCount >= 20) {
    throw new Error('User rate limit exceeded');
  }
  userRequestCounts.set(userId, userCount + 1);
}
```

### Audit Logging

```javascript
const auditLog = {
  userId: req.user.id,
  action: 'CODE_EXECUTION',
  details: {
    problemId,
    language,
    success: result.success,
    executionTime: result.executionTime
  },
  timestamp: new Date(),
  ipAddress: req.ip
};

await AuditLog.create(auditLog);
```

---

## 📚 Additional Resources

### Documentation
- [Full Architecture Docs](./CODING_CHALLENGE_PLATFORM.md)
- [Piston API Docs](https://github.com/engineer-man/piston)
- [Monaco Editor Docs](https://microsoft.github.io/monaco-editor/)

### Example Problems
- [LeetCode](https://leetcode.com)
- [HackerRank](https://hackerrank.com)
- [CodeForces](https://codeforces.com)

### Related Technologies
- Docker for sandboxing
- Judge0 API (alternative to Piston)
- CodeMirror (alternative editor)
- WebAssembly for client-side execution

---

## 🎯 Next Steps

1. **Test the System**
   - Start backend and frontend
   - Navigate to Coding Challenges
   - Try solving a problem
   - Verify test execution

2. **Add More Problems**
   - Create diverse problem set
   - Cover different algorithms
   - Include edge cases

3. **Customize UI**
   - Adjust colors and themes
   - Add animations
   - Improve mobile responsiveness

4. **Enhance Features**
   - Add solution discussion
   - Implement hints system
   - Create leaderboards

5. **Monitor & Optimize**
   - Track execution metrics
   - Optimize slow queries
   - Improve UX based on feedback

---

## 💡 Tips for Success

1. **Start Simple**: Test with easy problems first
2. **Validate Early**: Check code execution before adding complexity
3. **Monitor Resources**: Watch for memory/CPU spikes
4. **User Feedback**: Gather insights from beta testers
5. **Iterate Quickly**: Make incremental improvements
6. **Document Changes**: Keep this guide updated

---

## 🆘 Support

Need help? 

- **Issues**: Check existing issues first
- **Logs**: Review console and server logs
- **Community**: Ask in discussions
- **Debug**: Use browser DevTools and server logs

---

**Happy Coding! 🚀**
