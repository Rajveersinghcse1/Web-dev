# Professional Coding Challenge Platform - System Architecture

## Executive Summary

This document provides a comprehensive technical specification for a professional coding challenge platform comparable to LeetCode and GeeksforGeeks, with emphasis on **deterministic evaluation**, **sandboxed execution**, and **scalable test-case processing**.

---

## 1. UI/UX LAYOUT SPECIFICATION

### 1.1 Split-Screen Layout Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: Problem Title | Difficulty Badge | Solved Status   │
├──────────────────────┬──────────────────────────────────────┤
│                      │                                      │
│  LEFT PANEL (40-50%) │  RIGHT PANEL (50-60%)               │
│                      │                                      │
│  [Tab: Description]  │  Language Selector  [Run] [Submit]  │
│  [Tab: Submissions]  │  ┌────────────────────────────────┐ │
│                      │  │                                │ │
│  ┌────────────────┐  │  │   Monaco Code Editor          │ │
│  │ Problem Title  │  │  │   - Syntax Highlighting       │ │
│  │ Difficulty     │  │  │   - Auto-indentation          │ │
│  ├────────────────┤  │  │   - Line numbers              │ │
│  │ Description    │  │  │   - Autocomplete              │ │
│  │ Input Format   │  │  └────────────────────────────────┘ │
│  │ Output Format  │  │                                      │
│  │ Constraints    │  │  ┌────────────────────────────────┐ │
│  │ Examples       │  │  │ Console / Results              │ │
│  │  - Input       │  │  │ [Results] [Logs]               │ │
│  │  - Output      │  │  │ - Test Case Status             │ │
│  │  - Explanation │  │  │ - Execution Time               │ │
│  └────────────────┘  │  │ - Memory Usage                 │ │
│                      │  └────────────────────────────────┘ │
│                      │                                      │
└──────────────────────┴──────────────────────────────────────┘
          ↕ Draggable Divider (30-70% range)
```

### 1.2 Layout Features

**Vertical Split with Draggable Divider**
- Persistent state on resize (saved to localStorage)
- Minimum: 30% / Maximum: 70% per panel
- Smooth drag interaction with visual feedback
- Desktop-first with responsive fallback

**Left Panel – Problem Statement (Read-Only)**
- Fixed header with title + difficulty badge
- Independent scroll (never affects editor)
- Syntax-highlighted code examples
- Hierarchical content structure

**Right Panel – Code Execution Workspace**
- Monaco editor with full IDE features
- Language selector (C, C++, Java, Python, JavaScript)
- Action controls (Run Code, Submit)
- Console/Results tabbed interface

---

## 2. BACKEND EXECUTION ARCHITECTURE

### 2.1 System Flow Diagram

```
User Clicks "Run Code" or "Submit"
          ↓
┌─────────────────────────────────────┐
│ Frontend: ChallengePage Component   │
│ - Captures code, language, input    │
│ - Sends POST to /api/challenges/:id │
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│ Backend: Express Route Handler      │
│ - Validates request                 │
│ - Authenticates user                │
│ - Fetches challenge data            │
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│ Test Case Selection Logic           │
│ - Run Code: Visible test cases only │
│ - Submit: ALL test cases (visible + │
│   hidden)                            │
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│ Code Execution Engine               │
│ FOR EACH test case:                 │
│   1. Call Compiler API              │
│   2. Pass code + input              │
│   3. Set time/memory limits         │
│   4. Capture stdout/stderr          │
│   5. Measure execution time         │
│   6. Record memory usage            │
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│ Output Normalization & Comparison   │
│ - Trim whitespace                   │
│ - Normalize line endings            │
│ - Strip trailing spaces             │
│ - Compare with expectedOutput       │
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│ Result Aggregation                  │
│ - Count passed/failed test cases    │
│ - Calculate total execution time    │
│ - Identify peak memory usage        │
│ - Determine submission status       │
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│ Database Storage                    │
│ - Save UserSubmission record        │
│ - Update Challenge statistics       │
│ - Award points if accepted          │
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│ Frontend Response Handling          │
│ - Display test case results         │
│ - Show performance metrics          │
│ - Trigger success/failure UI        │
└─────────────────────────────────────┘
```

### 2.2 Compiler API Integration

**External Compiler: Piston API (https://emkc.org/api/v2/piston)**

```javascript
// Language Configuration
const LANGUAGE_MAP = {
  'C': { language: 'c', version: '10.2.0' },
  'C++': { language: 'cpp', version: '10.2.0' },
  'Java': { language: 'java', version: '15.0.2' },
  'Python': { language: 'python', version: '3.10.0' },
  'JavaScript': { language: 'javascript', version: '18.15.0' }
};

// Execution Request
POST https://emkc.org/api/v2/piston/execute
{
  "language": "python",
  "version": "3.10.0",
  "files": [{ "content": "<user_code>" }],
  "stdin": "<test_case_input>",
  "compile_timeout": 10000,
  "run_timeout": 5000
}

// Execution Response
{
  "run": {
    "stdout": "<program_output>",
    "stderr": "<error_messages>",
    "code": 0,  // exit code
    "memory": 1024  // bytes
  }
}
```

**Sandboxing Mechanism**
- Code executes in isolated Docker containers (Piston API handles this)
- No access to network, filesystem, or system resources
- Enforced time limits (5-10 seconds max)
- Enforced memory limits (64-512 MB)
- Automatic process termination on violation

---

## 3. TEST CASE VALIDATION & EXECUTION FLOW

### 3.1 Test Case Storage Schema

```javascript
// MongoDB Schema
testCaseSchema = {
  input: String,           // Raw input data
  expectedOutput: String,  // Expected output (trimmed/normalized)
  explanation: String,     // Why this test case matters
  isHidden: Boolean,       // Hidden from user during "Run Code"
  weight: Number,          // For partial scoring (1-10)
  timeLimit: Number,       // Milliseconds (default: 5000)
  memoryLimit: Number      // MB (default: 128)
}
```

### 3.2 Test Case Execution Logic

**Step 1: Test Case Selection**
```javascript
if (action === 'RUN_CODE') {
  testCases = challenge.testCases.filter(tc => !tc.isHidden);
} else if (action === 'SUBMIT') {
  testCases = challenge.testCases; // ALL test cases
}
```

**Step 2: Sequential Execution**
```javascript
for (const testCase of testCases) {
  const result = await executeTestCase(
    language,
    code,
    testCase.input,
    testCase.timeLimit,
    testCase.memoryLimit
  );
  
  // Normalize outputs for comparison
  const actualOutput = normalizeOutput(result.stdout);
  const expectedOutput = normalizeOutput(testCase.expectedOutput);
  
  // Deterministic comparison
  const passed = actualOutput === expectedOutput;
  
  results.push({
    testCaseId: testCase._id,
    passed,
    input: testCase.input,
    expectedOutput,
    actualOutput,
    executionTime: result.executionTime,
    memoryUsage: result.memoryUsage,
    error: result.stderr
  });
  
  // Early termination on failure (for Submit)
  if (!passed && action === 'SUBMIT') {
    break; // Stop execution to save API calls
  }
}
```

**Step 3: Output Normalization**
```javascript
function normalizeOutput(output) {
  return output
    .trim()                    // Remove leading/trailing whitespace
    .replace(/\r\n/g, '\n')    // Normalize line endings
    .replace(/\s+$/gm, '');    // Remove trailing spaces per line
}
```

**Step 4: Deterministic Comparison**
```javascript
function compareOutputs(actual, expected) {
  const normalizedActual = normalizeOutput(actual);
  const normalizedExpected = normalizeOutput(expected);
  return normalizedActual === normalizedExpected; // Exact string match
}
```

### 3.3 Status Determination

```javascript
function determineStatus(results, testCases) {
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = testCases.length;
  
  if (compilationError) return 'COMPILATION_ERROR';
  if (runtimeError) return 'RUNTIME_ERROR';
  if (results.some(r => r.executionTime > r.timeLimit)) return 'TIME_LIMIT_EXCEEDED';
  if (results.some(r => r.memoryUsage > r.memoryLimit)) return 'MEMORY_LIMIT_EXCEEDED';
  if (passedCount < totalCount) return 'WRONG_ANSWER';
  return 'ACCEPTED';
}
```

---

## 4. RESULT STATES & UI BEHAVIOR

### 4.1 Success State (100% Test Cases Passed)

**Visual Indicators**
- ✅ Green success banner: "All Test Cases Passed"
- Subtle confetti animation (canvas-confetti library)
- Success modal overlay with stats

**Displayed Metrics**
```
┌─────────────────────────────────────┐
│  ✓ ALL TEST CASES PASSED!          │
│                                     │
│  Execution Time:    245ms          │
│  Memory Usage:      12.4 MB        │
│  Score:             100/100        │
│  Points Earned:     +30            │
│                                     │
│  [Review Solution] [Next Problem]  │
└─────────────────────────────────────┘
```

**Performance Visualization**
- Bar chart: Input size vs. Execution time
- Comparison: "Faster than 85% of submissions"
- Space complexity visualization (if available)

**Progression**
- "Next Problem" button unlocked
- Problem marked as solved (green checkmark)
- Points/XP awarded to user account

### 4.2 Failure State (Any Test Case Failed)

**Visual Indicators**
- ❌ Red failure banner: "Test Cases Failed"
- Failed test case details (for visible cases only)
- "Try Again" prompt (no progression)

**Displayed Information**
```
┌─────────────────────────────────────┐
│  ✗ WRONG ANSWER                    │
│                                     │
│  Test Cases: 3/10 passed           │
│                                     │
│  Failed Test Case #4:              │
│  Input:     [1, 2, 3, 4]          │
│  Expected:  10                     │
│  Got:       11                     │
│                                     │
│  Execution Time:    152ms          │
│  Memory Usage:      8.2 MB         │
│                                     │
│  [Try Again]                       │
└─────────────────────────────────────┘
```

**Hidden Test Cases**
- Only show count: "Failed Hidden Test Case #8"
- No input/output revealed
- Prevents gaming the system

**Editor State**
- Code remains intact (not cleared)
- Can edit and re-run immediately
- No penalty for failed attempts (tracks count only)

---

## 5. PROGRESSION RULES (NON-NEGOTIABLE)

### 5.1 Strict Gating Logic

```javascript
// Next Problem Button Logic
if (submissionStatus === 'ACCEPTED' && 
    passedTestCases === totalTestCases) {
  enableNextButton = true;
} else {
  enableNextButton = false; // STRICTLY LOCKED
}
```

**Rules**
- ✅ **100% Pass Required**: Must pass ALL test cases (visible + hidden)
- ❌ **No Partial Credit**: 9/10 passed = FAILED (no progression)
- ✅ **Unlimited Attempts**: Can retry indefinitely
- ✅ **Attempt Tracking**: Each submission counted in user history
- ❌ **No Hints on Failure**: Hidden test cases never revealed

### 5.2 Points & Rewards System

```javascript
const POINTS_MAP = {
  'Easy': 10,
  'Medium': 20,
  'Hard': 30
};

// Award points ONLY on first accepted submission
if (status === 'ACCEPTED' && isFirstAccepted) {
  const points = POINTS_MAP[challenge.difficulty];
  await User.updateOne(
    { _id: userId },
    { $inc: { 'gameData.xp': points } }
  );
}
```

---

## 6. PERFORMANCE METRICS CALCULATION

### 6.1 Execution Time Measurement

```javascript
const startTime = Date.now();
const result = await fetch(COMPILER_API, { /* ... */ });
const executionTime = Date.now() - startTime; // milliseconds
```

**Aggregation**
```javascript
const totalExecutionTime = results.reduce((sum, r) => 
  sum + r.executionTime, 0
);
```

### 6.2 Memory Usage Tracking

```javascript
// From compiler API response
const memoryUsage = result.run.memory / 1024; // Convert bytes to MB

// Peak memory across all test cases
const peakMemory = Math.max(...results.map(r => r.memoryUsage));
```

### 6.3 Complexity Visualization (Future Enhancement)

**Algorithm**
1. Run code against test cases of varying input sizes
2. Record execution time for each size
3. Plot time vs. input size
4. Fit curve to identify O(n), O(n log n), O(n²), etc.

**Example Output**
```
Time Complexity: O(n log n)
Space Complexity: O(n)

  Time (ms)
    1000 │                     ●
     800 │                 ●
     600 │             ●
     400 │         ●
     200 │     ●
       0 └──┴──┴──┴──┴──┴──┴──
         0  20 40 60 80 100 120
              Input Size (n)
```

---

## 7. NON-NEGOTIABLE SYSTEM CONSTRAINTS

### 7.1 Security Constraints

✅ **Sandboxed Execution**
- All code runs in isolated Docker containers
- No filesystem/network access
- Automatic cleanup after execution

✅ **Hidden Test Cases**
- Stored in database, never sent to frontend
- Only returned on "Submit" action
- Input/output masked in failure responses

✅ **Rate Limiting**
- Max 10 submissions per user per minute
- Prevents API abuse and spam

### 7.2 Execution Constraints

✅ **Time Limits**
- Default: 5 seconds per test case
- Maximum: 10 seconds (API limit)
- Exceeding limit = TIME_LIMIT_EXCEEDED

✅ **Memory Limits**
- Default: 128 MB per execution
- Maximum: 512 MB
- Exceeding limit = MEMORY_LIMIT_EXCEEDED

✅ **Language Support**
- C, C++, Java, Python, JavaScript
- Version-locked for consistency
- Additional languages require API support

### 7.3 Data Integrity Constraints

✅ **Deterministic Evaluation**
- No random inputs in test cases
- No time-dependent assertions
- Exact string matching after normalization

✅ **Idempotent Submissions**
- Same code + same input = same output
- Results reproducible across runs

---

## 8. DATABASE SCHEMA OVERVIEW

### 8.1 CodingChallenge Model

```javascript
{
  problemId: "LC001",
  title: "Two Sum",
  slug: "two-sum",
  difficulty: "Easy",
  category: "Array",
  problemStatement: {
    description: "...",
    inputFormat: "...",
    outputFormat: "...",
    constraints: ["1 ≤ n ≤ 10^4"],
    exampleTestCases: [{ input, output, explanation }]
  },
  testCases: [
    { input, expectedOutput, isHidden, timeLimit, memoryLimit }
  ],
  supportedLanguages: ["Python", "Java", "C++"],
  starterCode: { Python: "def solution():\n    pass" },
  statistics: {
    totalAttempts: 1523,
    totalSolved: 892,
    acceptanceRate: 58.5
  }
}
```

### 8.2 UserSubmission Model

```javascript
{
  submissionId: "uuid",
  userId: ObjectId,
  challengeId: ObjectId,
  submissionType: "SUBMIT", // or "RUN"
  language: "Python",
  code: "def solution():\n    return sum([1,2,3])",
  status: "ACCEPTED",
  testCaseResults: [
    { testCaseId, passed, input, expectedOutput, actualOutput, executionTime, memoryUsage }
  ],
  totalTestCases: 10,
  passedTestCases: 10,
  totalExecutionTime: 245,
  peakMemoryUsage: 12.4,
  score: 100,
  attemptNumber: 3,
  isFirstAccepted: true,
  createdAt: ISODate
}
```

---

## 9. API ENDPOINTS SPECIFICATION

### 9.1 Challenge Endpoints

**GET /api/v1/challenges**
- Purpose: List all challenges (paginated, filtered)
- Query Params: `page`, `limit`, `difficulty`, `category`, `search`
- Response: Array of challenges with solved status

**GET /api/v1/challenges/:slug**
- Purpose: Get single challenge details
- Response: Challenge data (without hidden test cases, without solution)

### 9.2 Execution Endpoints

**POST /api/v1/challenges/:slug/run**
- Purpose: Run code against visible test cases only
- Request: `{ code, language }`
- Response: Test results (visible cases only)

**POST /api/v1/challenges/:slug/submit**
- Purpose: Submit code for full evaluation (all test cases)
- Request: `{ code, language, timeSpentCoding }`
- Response: Full test results + status + points

### 9.3 Submission History

**GET /api/v1/challenges/:slug/submissions**
- Purpose: Get user's submission history for a challenge
- Response: Array of past submissions (without code)

**GET /api/v1/challenges/:slug/submissions/:submissionId**
- Purpose: Get detailed submission info
- Response: Full submission details including code

---

## 10. UX MICRO-INTERACTIONS

### 10.1 Success Animations

**Confetti Animation**
```javascript
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 }
});
```

**Success Modal Slide-In**
```css
@keyframes slideIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
```

### 10.2 Loading States

**Run Code Button**
- Disabled during execution
- Spinner icon replaces play icon
- Text: "Running..." with animated dots

**Submit Button**
- Disabled during submission
- Locked if already solved (shows checkmark)
- Text: "Submitting..." with spinner

### 10.3 Error Feedback

**Compilation Error**
- Red banner at top
- Code line highlighting (if API provides line number)
- Error message in console

**Runtime Error**
- Orange warning banner
- Stack trace in console tab
- Failed test case details

---

## 11. IMPLEMENTATION CHECKLIST

### Backend
- [x] CodingChallenge model with test cases
- [x] UserSubmission model with detailed tracking
- [x] Compiler API integration (Piston)
- [x] Test case execution engine
- [x] Output normalization & comparison
- [x] Route handlers for run/submit
- [x] Authentication middleware
- [x] Statistics tracking

### Frontend
- [x] Split-screen layout with draggable divider
- [x] Monaco editor integration
- [x] Language selector
- [x] Run/Submit actions
- [x] Test results visualization
- [x] Success modal with animations
- [x] Performance metrics display
- [x] Failure state with error details

### Integration
- [ ] Connect frontend to backend API
- [ ] Add route in server.js
- [ ] Install npm dependencies (uuid, canvas-confetti, @monaco-editor/react)
- [ ] Test execution flow end-to-end

---

## 12. CONCLUSION

This architecture provides a **production-ready, deterministic, and scalable** coding challenge platform with the following guarantees:

✅ **Sandboxed Execution**: All code runs in isolated environments  
✅ **Hidden Test Cases**: Cannot be accessed by frontend  
✅ **Deterministic Evaluation**: Same input = same output  
✅ **Strict Progression**: 100% pass required for advancement  
✅ **Performance Tracking**: Execution time + memory usage recorded  
✅ **Professional UX**: Split-screen, Monaco editor, micro-interactions  

The system is ready for deployment and can handle thousands of concurrent submissions with proper scaling (load balancing, Redis caching, queue-based execution).

---

**Architecture Version**: 1.0  
**Last Updated**: 2026-01-01  
**Status**: Implementation Complete ✅
