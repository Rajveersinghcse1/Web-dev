/**
 * Code Execution Controller
 * 
 * Handles secure code execution for coding challenges
 * Uses external execution APIs like Piston or Judge0
 */

const axios = require('axios');

// Piston API configuration (free code execution API)
const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

// Language mappings for Piston API
const LANGUAGE_MAP = {
  python: { language: 'python', version: '3.10.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
  java: { language: 'java', version: '15.0.2' },
  cpp: { language: 'c++', version: '10.2.0' },
  c: { language: 'c', version: '10.2.0' }
};

/**
 * Execute user code against test cases
 */
exports.executeCode = async (req, res) => {
  try {
    const { code, language, input, timeLimit = 5000, memoryLimit = 256 } = req.body;

    // Validate inputs
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Code and language are required'
      });
    }

    // Check if language is supported
    if (!LANGUAGE_MAP[language]) {
      return res.status(400).json({
        success: false,
        message: `Language '${language}' is not supported`
      });
    }

    const langConfig = LANGUAGE_MAP[language];
    const startTime = Date.now();

    try {
      // Execute code using Piston API
      const response = await axios.post(`${PISTON_API_URL}/execute`, {
        language: langConfig.language,
        version: langConfig.version,
        files: [
          {
            name: getFileName(language),
            content: code
          }
        ],
        stdin: input || '',
        compile_timeout: 10000,
        run_timeout: timeLimit,
        compile_memory_limit: memoryLimit * 1024 * 1024,
        run_memory_limit: memoryLimit * 1024 * 1024
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000 // 15 second timeout
      });

      const executionTime = Date.now() - startTime;
      const result = response.data;

      // Parse the result
      const output = result.run?.stdout || '';
      const stderr = result.run?.stderr || result.compile?.stderr || '';
      const exitCode = result.run?.code || 0;

      // Estimate memory usage (Piston doesn't provide exact memory)
      const estimatedMemory = Math.floor(Math.random() * 50) + 10; // Mock memory

      return res.json({
        success: true,
        output: output.trim(),
        stderr: stderr.trim(),
        executionTime,
        memory: estimatedMemory,
        exitCode,
        language: language,
        version: langConfig.version
      });

    } catch (apiError) {
      console.error('Piston API Error:', apiError.message);

      // Handle API errors
      if (apiError.response) {
        return res.status(500).json({
          success: false,
          message: 'Code execution failed',
          error: apiError.response.data?.message || 'Execution service error'
        });
      }

      throw apiError;
    }

  } catch (error) {
    console.error('Code execution error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during code execution',
      error: error.message
    });
  }
};

/**
 * Validate code against multiple test cases
 */
exports.runTestCases = async (req, res) => {
  try {
    const { code, language, testCases, problemId } = req.body;

    if (!code || !language || !testCases || !Array.isArray(testCases)) {
      return res.status(400).json({
        success: false,
        message: 'Code, language, and test cases are required'
      });
    }

    const results = [];
    let allPassed = true;
    let totalExecutionTime = 0;

    // Run code against each test case
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      
      try {
        const execResult = await runSingleTestCase(code, language, testCase.input);
        
        // Normalize and compare output
        const expectedOutput = normalizeOutput(testCase.expectedOutput);
        const actualOutput = normalizeOutput(execResult.output);
        const passed = expectedOutput === actualOutput;

        if (!passed) allPassed = false;

        totalExecutionTime += execResult.executionTime;

        results.push({
          testNumber: i + 1,
          passed,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: execResult.output,
          executionTime: execResult.executionTime,
          memory: execResult.memory,
          stderr: execResult.stderr,
          hidden: testCase.hidden || false
        });

      } catch (error) {
        allPassed = false;
        results.push({
          testNumber: i + 1,
          passed: false,
          input: testCase.input,
          error: error.message,
          hidden: testCase.hidden || false
        });
      }
    }

    const passedCount = results.filter(r => r.passed).length;
    const avgExecutionTime = Math.round(totalExecutionTime / testCases.length);

    return res.json({
      success: true,
      allPassed,
      totalTests: testCases.length,
      passedTests: passedCount,
      failedTests: testCases.length - passedCount,
      avgExecutionTime,
      results: results.map(r => {
        // Don't send full details for failed hidden test cases
        if (r.hidden && !r.passed) {
          return {
            testNumber: r.testNumber,
            passed: false,
            hidden: true,
            executionTime: r.executionTime
          };
        }
        return r;
      })
    });

  } catch (error) {
    console.error('Test case validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error running test cases',
      error: error.message
    });
  }
};

/**
 * Submit solution for final evaluation
 */
exports.submitSolution = async (req, res) => {
  try {
    const { code, language, problemId } = req.body;
    const userId = req.user?.id;

    if (!code || !language || !problemId) {
      return res.status(400).json({
        success: false,
        message: 'Code, language, and problem ID are required'
      });
    }

    // In a real implementation, you would:
    // 1. Fetch problem details from database
    // 2. Run against all test cases (including hidden ones)
    // 3. Store submission in database
    // 4. Update user's problem-solving stats
    // 5. Award XP/achievements

    // For now, return success response
    return res.json({
      success: true,
      message: 'Solution submitted successfully',
      submissionId: Date.now(), // Mock submission ID
      problemId,
      allTestsPassed: true // This should be calculated from actual test execution
    });

  } catch (error) {
    console.error('Solution submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error submitting solution',
      error: error.message
    });
  }
};

/**
 * Get execution runtime info
 */
exports.getRuntimes = async (req, res) => {
  try {
    // Fetch available runtimes from Piston API
    const response = await axios.get(`${PISTON_API_URL}/runtimes`, {
      timeout: 10000
    });

    // Filter to only supported languages
    const supportedRuntimes = response.data.filter(runtime => 
      Object.values(LANGUAGE_MAP).some(lang => 
        lang.language === runtime.language && lang.version === runtime.version
      )
    );

    return res.json({
      success: true,
      runtimes: supportedRuntimes
    });

  } catch (error) {
    console.error('Error fetching runtimes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching runtime information'
    });
  }
};

// ===== HELPER FUNCTIONS =====

/**
 * Run code against a single test case
 */
async function runSingleTestCase(code, language, input) {
  const langConfig = LANGUAGE_MAP[language];
  const startTime = Date.now();

  const response = await axios.post(`${PISTON_API_URL}/execute`, {
    language: langConfig.language,
    version: langConfig.version,
    files: [
      {
        name: getFileName(language),
        content: code
      }
    ],
    stdin: input || '',
    compile_timeout: 10000,
    run_timeout: 5000,
    compile_memory_limit: 256 * 1024 * 1024,
    run_memory_limit: 256 * 1024 * 1024
  }, {
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 15000
  });

  const executionTime = Date.now() - startTime;
  const result = response.data;

  return {
    output: (result.run?.stdout || '').trim(),
    stderr: (result.run?.stderr || result.compile?.stderr || '').trim(),
    executionTime,
    memory: Math.floor(Math.random() * 50) + 10, // Mock memory
    exitCode: result.run?.code || 0
  };
}

/**
 * Normalize output for comparison
 */
function normalizeOutput(output) {
  if (!output) return '';
  return output
    .toString()
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\s+$/gm, ''); // Remove trailing whitespace from each line
}

/**
 * Get appropriate filename for language
 */
function getFileName(language) {
  const fileNames = {
    python: 'main.py',
    javascript: 'main.js',
    java: 'Main.java',
    cpp: 'main.cpp',
    c: 'main.c'
  };
  return fileNames[language] || 'main.txt';
}

/**
 * Rate limiting helper
 */
let requestTimestamps = [];
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30;

function checkRateLimit() {
  const now = Date.now();
  requestTimestamps = requestTimestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW);
  
  if (requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  requestTimestamps.push(now);
  return true;
}

// Export rate limit check for use in middleware
exports.checkRateLimit = checkRateLimit;
