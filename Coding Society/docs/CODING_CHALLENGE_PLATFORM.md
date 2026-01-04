# Professional Coding Challenge Platform - Architecture Documentation

## 🎯 Overview

A complete LeetCode/GeeksforGeeks-style coding challenge system with professional UI/UX, deterministic test execution, and scalable architecture.

## 📋 Table of Contents

1. [UI/UX Architecture](#uiux-architecture)
2. [Backend Execution Pipeline](#backend-execution-pipeline)
3. [Test Case Validation System](#test-case-validation-system)
4. [Pass/Fail Decision Logic](#passfail-decision-logic)
5. [Performance Metrics](#performance-metrics)
6. [Progression Rules](#progression-rules)
7. [API Documentation](#api-documentation)
8. [Security & Sandboxing](#security--sandboxing)

---

## 🎨 UI/UX Architecture

### Split-Screen Layout

The interface uses a **vertical split-screen layout** with a resizable divider:

```
┌─────────────────────────────────────────────────┐
│  Header: Problem Title | Language | Actions    │
├──────────────────┬──────────────────────────────┤
│                  │                              │
│  LEFT PANEL      │  RIGHT PANEL                 │
│  (Problem)       │  (Code Editor)               │
│                  │                              │
│  - Title         │  - Monaco Editor             │
│  - Description   │  - Language Selector         │
│  - Input Format  │  - Action Buttons            │
│  - Output Format │  - Console Output            │
│  - Constraints   │  - Test Results              │
│  - Examples      │                              │
│  - Hints         │                              │
│                  │                              │
│  (40-50% width)  │  (50-60% width)              │
│                  │                              │
└──────────────────┴──────────────────────────────┘
```

### Key UI Features

1. **Persistent State**: Split position is maintained across resizes
2. **Independent Scrolling**: Problem and editor scroll independently
3. **Syntax Highlighting**: Monaco Editor with language-specific themes
4. **Auto-indentation**: Smart code formatting
5. **Line Numbers**: For easy reference
6. **Responsive Fallback**: Mobile-friendly collapsible layout

### Action Controls

- **Run Code**: Soft evaluation against visible test cases
- **Submit**: Final evaluation against all test cases (visible + hidden)
- **Reset**: Restore starter code template
- **Language Selector**: Switch between C, C++, Java, Python, JavaScript

---

## ⚡ Backend Execution Pipeline

### Architecture

```
User Submits Code
      ↓
API Gateway (/api/v1/code-execution/execute)
      ↓
Rate Limiting Check (30 req/min)
      ↓
Code Validation
      ↓
Piston API (Sandboxed Execution)
      ↓
Language-Specific Compiler/Interpreter
      ↓
Execute in Isolated Docker Container
      ↓
Capture: stdout, stderr, time, memory
      ↓
Compare Output with Expected
      ↓
Return Results to Frontend
```

### Execution Flow

1. **Request Validation**
   - Check required fields: code, language, test cases
   - Validate language support
   - Check user authentication

2. **Code Compilation** (if applicable)
   - Compile timeout: 10 seconds
   - Memory limit: 256MB
   - Capture compilation errors

3. **Sandboxed Execution**
   - Runtime timeout: 5 seconds per test case
   - Memory limit: 256MB
   - Network isolation
   - File system restrictions

4. **Output Capture**
   - Standard output (stdout)
   - Standard error (stderr)
   - Execution time (milliseconds)
   - Memory usage (estimated)
   - Exit code

5. **Result Processing**
   - Normalize output (trim, lowercase, spacing)
   - Compare with expected output
   - Generate execution metrics

---

## ✅ Test Case Validation System

### Test Case Structure

```javascript
{
  input: "2\n5",                    // Standard input
  expectedOutput: "10",              // Expected result
  visible: true,                     // Show to user?
  hidden: false                      // Hidden test case
}
```

### Validation Logic

```javascript
// Normalize function
function normalizeOutput(output) {
  return output
    .toString()
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

// Comparison
const passed = normalizeOutput(actualOutput) === normalizeOutput(expectedOutput);
```

### Test Case Types

1. **Visible Test Cases**
   - Shown in problem description
   - Used for "Run Code" action
   - Full details displayed on failure

2. **Hidden Test Cases**
   - Only used in "Submit" action
   - Test edge cases and corner scenarios
   - Limited feedback on failure (pass/fail only)

### Execution Strategy

- **Run Code**: Execute against 3-5 visible test cases
- **Submit**: Execute against ALL test cases (5-10 total)
- **Sequential Execution**: Test cases run one at a time
- **Early Termination**: Optional (continue even if one fails)

---

## 🎯 Pass/Fail Decision Logic

### Success Criteria

```javascript
// All test cases must pass for submission to succeed
const allPassed = testResults.every(result => result.passed);

// Per test case
const passed = 
  normalizedActual === normalizedExpected &&
  executionTime <= timeLimit &&
  memory <= memoryLimit &&
  exitCode === 0 &&
  stderr === '';
```

### Failure Scenarios

1. **Compilation Error**
   - Failed to compile code
   - Syntax errors
   - Import/include errors

2. **Runtime Error**
   - Exception thrown during execution
   - Segmentation fault
   - Stack overflow

3. **Wrong Answer**
   - Output doesn't match expected
   - Incorrect logic

4. **Time Limit Exceeded**
   - Execution took longer than 5 seconds
   - Infinite loop detected

5. **Memory Limit Exceeded**
   - Used more than 256MB RAM
   - Memory leak

---

## 📊 Performance Metrics

### Metrics Collected

```javascript
{
  executionTime: 124,        // milliseconds
  memory: 12.5,              // megabytes
  timeComplexity: "O(n)",    // Theoretical
  spaceComplexity: "O(1)",   // Theoretical
  passRate: 80,              // percentage
  avgExecutionTime: 98       // average across test cases
}
```

### Time & Space Complexity Visualization

When all test cases pass, display:

```
✅ All Test Cases Passed!

Time Complexity: O(n)
Space Complexity: O(1)

Performance Metrics:
├─ Execution Time: 124ms
├─ Memory Usage: 12.5MB
└─ Efficiency: Excellent
```

### Complexity Graph (Future Enhancement)

- Plot input size vs execution time
- Identify actual complexity from data points
- Compare against theoretical bounds

---

## 🔒 Progression Rules

### **NON-NEGOTIABLE**: Next Problem Unlocking

```javascript
if (allTestCasesPassed === false) {
  // User CANNOT proceed to next problem
  // "Next" button remains LOCKED
  // Must achieve 100% pass rate
}
```

### Progression Flow

```
Problem 1 (Unlocked)
    ↓
Solve with 100% pass
    ↓
Problem 2 (Now Unlocked)
    ↓
Partial success (80%)
    ↓
Problem 2 (Still locked)
    ↓
Retry until 100%
    ↓
Problem 3 (Unlocked)
```

### Tracking

- **Attempts**: Number of submission attempts
- **Best Score**: Highest percentage achieved
- **Completion**: Only 100% counts as "completed"
- **XP Rewards**: Only awarded on first 100% completion

### XP System

```javascript
const xpRewards = {
  Easy: 100 XP,
  Medium: 200 XP,
  Hard: 300 XP
};

// Awarded ONLY on first 100% pass
// No partial XP for failed attempts
```

---

## 🔌 API Documentation

### Base URL

```
http://localhost:5000/api/v1/code-execution
```

### Endpoints

#### 1. Execute Code

```http
POST /execute
Authorization: Bearer <token>

Request Body:
{
  "code": "def solution():\n    return 42",
  "language": "python",
  "input": "5\n10",
  "timeLimit": 5000,
  "memoryLimit": 256
}

Response:
{
  "success": true,
  "output": "42",
  "stderr": "",
  "executionTime": 124,
  "memory": 12.5,
  "exitCode": 0
}
```

#### 2. Run Test Cases

```http
POST /test
Authorization: Bearer <token>

Request Body:
{
  "code": "...",
  "language": "python",
  "testCases": [
    {
      "input": "2\n5",
      "expectedOutput": "10",
      "visible": true
    },
    {
      "input": "10\n20",
      "expectedOutput": "200",
      "hidden": true
    }
  ]
}

Response:
{
  "success": true,
  "allPassed": true,
  "totalTests": 2,
  "passedTests": 2,
  "failedTests": 0,
  "avgExecutionTime": 98,
  "results": [
    {
      "testNumber": 1,
      "passed": true,
      "input": "2\n5",
      "expectedOutput": "10",
      "actualOutput": "10",
      "executionTime": 95,
      "memory": 11.2
    },
    {
      "testNumber": 2,
      "passed": true,
      "hidden": true,
      "executionTime": 101
    }
  ]
}
```

#### 3. Submit Solution

```http
POST /submit
Authorization: Bearer <token>

Request Body:
{
  "code": "...",
  "language": "python",
  "problemId": 1
}

Response:
{
  "success": true,
  "submissionId": 12345,
  "allTestsPassed": true,
  "message": "Solution accepted"
}
```

#### 4. Get Runtimes

```http
GET /runtimes
Authorization: Bearer <token>

Response:
{
  "success": true,
  "runtimes": [
    {
      "language": "python",
      "version": "3.10",
      "aliases": ["py", "python3"]
    },
    ...
  ]
}
```

### Rate Limiting

- **Limit**: 30 requests per minute per user
- **Window**: 60 seconds
- **Response**: 429 Too Many Requests

---

## 🛡️ Security & Sandboxing

### Sandboxing Strategy

Uses **Piston API** for secure code execution:

- **Docker Containers**: Each execution in isolated container
- **Network Isolation**: No internet access
- **File System Restrictions**: Limited read/write
- **Resource Limits**: CPU, memory, time constraints
- **Process Isolation**: Cannot access host system

### Security Measures

1. **Input Validation**
   - Sanitize all user inputs
   - Check code length limits
   - Validate language support

2. **Rate Limiting**
   - Prevent abuse
   - Fair resource allocation
   - DDoS protection

3. **Authentication**
   - JWT tokens required
   - User verification
   - Session management

4. **Output Sanitization**
   - Remove sensitive data
   - Limit output size
   - Escape special characters

5. **Audit Logging**
   - Track all executions
   - Monitor for suspicious activity
   - Compliance reporting

### Piston API Configuration

```javascript
{
  compile_timeout: 10000,        // 10 seconds
  run_timeout: 5000,             // 5 seconds
  compile_memory_limit: 256MB,
  run_memory_limit: 256MB,
  output_max_size: 1MB
}
```

---

## 🚀 Deployment Considerations

### Environment Variables

```bash
# Backend
PISTON_API_URL=https://emkc.org/api/v2/piston
CODE_EXECUTION_TIMEOUT=5000
CODE_EXECUTION_MEMORY_LIMIT=256
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=30

# Frontend
VITE_API_URL=http://localhost:5000/api/v1
```

### Scalability

- **Horizontal Scaling**: Deploy multiple API instances
- **Load Balancing**: Distribute execution requests
- **Caching**: Cache problem definitions and test cases
- **Queue System**: Use job queue for heavy loads (Bull, RabbitMQ)

### Monitoring

- Execution time metrics
- Success/failure rates
- User activity tracking
- Resource usage monitoring
- Error logging and alerting

---

## 📚 Future Enhancements

1. **Code Optimization Analyzer**
   - Suggest better algorithms
   - Identify bottlenecks
   - Recommend improvements

2. **Discussion Forum**
   - Share solutions
   - Learn from others
   - Community voting

3. **Video Explanations**
   - Step-by-step walkthroughs
   - Algorithm visualizations
   - Expert insights

4. **Contest Mode**
   - Timed challenges
   - Leaderboards
   - Ranking system

5. **Interview Preparation**
   - Company-specific problems
   - Mock interviews
   - Behavioral questions

---

## 📞 Support

For issues or questions:
- GitHub Issues: [repository-url]
- Email: support@codingsociety.com
- Documentation: [docs-url]

---

**Built with ❤️ by the Coding Society Team**
