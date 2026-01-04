import apiService from './apiService';

/**
 * Professional Code Execution Service
 * 
 * Integrates with backend API for secure, sandboxed code execution
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

class CodeExecutionService {
  constructor() {
    this.requestQueue = [];
    this.isProcessing = false;
  }

  /**
   * Execute code with given input
   * @param {string} code - The code to execute
   * @param {string} language - Programming language
   * @param {string} input - Standard input for the program
   * @returns {Promise<Object>} Execution result
   */
  async executeCode(code, language, input = '') {
    try {
      const response = await apiService.request('/code-execution/execute', {
        method: 'POST',
        body: JSON.stringify({
          code,
          language,
          input,
          timeLimit: 5000,
          memoryLimit: 256
        })
      });

      if (!response.success) {
        throw new Error(response.message || 'Code execution failed');
      }

      return {
        output: response.output || '',
        stderr: response.stderr || '',
        executionTime: response.executionTime || 0,
        memory: response.memory || 0,
        exitCode: response.exitCode || 0,
        success: response.success
      };
    } catch (error) {
      console.error('Code execution error:', error);
      return {
        output: '',
        stderr: error.message || 'Execution failed',
        executionTime: 0,
        memory: 0,
        exitCode: 1,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Run code against multiple test cases
   * @param {string} code - The code to execute
   * @param {string} language - Programming language
   * @param {Array} testCases - Array of test cases
   * @returns {Promise<Object>} Test results
   */
  async runTestCases(code, language, testCases) {
    try {
      const response = await apiService.request('/code-execution/test', {
        method: 'POST',
        body: JSON.stringify({
          code,
          language,
          testCases
        })
      });

      if (!response.success) {
        throw new Error(response.message || 'Test execution failed');
      }

      return {
        success: true,
        allPassed: response.allPassed,
        totalTests: response.totalTests,
        passedTests: response.passedTests,
        failedTests: response.failedTests,
        avgExecutionTime: response.avgExecutionTime,
        results: response.results || []
      };
    } catch (error) {
      console.error('Test case execution error:', error);
      return {
        success: false,
        error: error.message,
        allPassed: false,
        totalTests: testCases.length,
        passedTests: 0,
        failedTests: testCases.length,
        results: []
      };
    }
  }

  /**
   * Submit solution for evaluation
   * @param {string} code - The code to submit
   * @param {string} language - Programming language
   * @param {number} problemId - Problem identifier
   * @returns {Promise<Object>} Submission result
   */
  async submitSolution(code, language, problemId) {
    try {
      const response = await apiService.request('/code-execution/submit', {
        method: 'POST',
        body: JSON.stringify({
          code,
          language,
          problemId
        })
      });

      if (!response.success) {
        throw new Error(response.message || 'Submission failed');
      }

      return {
        success: true,
        submissionId: response.submissionId,
        allTestsPassed: response.allTestsPassed,
        message: response.message
      };
    } catch (error) {
      console.error('Solution submission error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get available language runtimes
   * @returns {Promise<Array>} Available runtimes
   */
  async getRuntimes() {
    try {
      const response = await apiService.request('/code-execution/runtimes', {
        method: 'GET'
      });

      if (!response.success) {
        throw new Error('Failed to fetch runtimes');
      }

      return response.runtimes || [];
    } catch (error) {
      console.error('Error fetching runtimes:', error);
      return [];
    }
  }

  /**
   * Validate code syntax (basic check)
   * @param {string} code - The code to validate
   * @param {string} language - Programming language
   * @returns {Object} Validation result
   */
  validateSyntax(code, language) {
    const errors = [];
    const warnings = [];

    if (!code || code.trim().length === 0) {
      errors.push('Code cannot be empty');
    }

    // Basic syntax checks based on language
    switch (language) {
      case 'python':
        // Check for common Python syntax issues
        if (code.includes('print ') && !code.includes('print(')) {
          warnings.push('Use print() function (Python 3 syntax)');
        }
        break;
      
      case 'javascript':
        // Check for common JavaScript issues
        const openBraces = (code.match(/{/g) || []).length;
        const closeBraces = (code.match(/}/g) || []).length;
        if (openBraces !== closeBraces) {
          errors.push('Mismatched braces');
        }
        break;
      
      case 'java':
        // Check for class definition
        if (!code.includes('class ')) {
          errors.push('Java code must contain a class definition');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Normalize output for comparison
   * @param {string} output - Output to normalize
   * @returns {string} Normalized output
   */
  normalizeOutput(output) {
    if (!output) return '';
    return output
      .toString()
      .trim()
      .replace(/\r\n/g, '\n')
      .replace(/\s+/g, ' ')
      .toLowerCase();
  }

  /**
   * Compare outputs
   * @param {string} expected - Expected output
   * @param {string} actual - Actual output
   * @returns {boolean} Whether outputs match
   */
  compareOutputs(expected, actual) {
    const normalizedExpected = this.normalizeOutput(expected);
    const normalizedActual = this.normalizeOutput(actual);
    return normalizedExpected === normalizedActual;
  }

  /**
   * Get language configuration
   * @param {string} language - Programming language
   * @returns {Object} Language config
   */
  getLanguageConfig(language) {
    const configs = {
      python: {
        name: 'Python',
        version: '3.10',
        icon: '🐍',
        extension: 'py',
        template: '# Write your Python code here\n',
        boilerplate: 'def solution():\n    # Your code here\n    pass\n'
      },
      javascript: {
        name: 'JavaScript',
        version: 'Node 18',
        icon: '🟨',
        extension: 'js',
        template: '// Write your JavaScript code here\n',
        boilerplate: 'function solution() {\n    // Your code here\n}\n'
      },
      java: {
        name: 'Java',
        version: '17',
        icon: '☕',
        extension: 'java',
        template: '// Write your Java code here\n',
        boilerplate: 'public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}\n'
      },
      cpp: {
        name: 'C++',
        version: 'C++17',
        icon: '⚙️',
        extension: 'cpp',
        template: '// Write your C++ code here\n',
        boilerplate: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}\n'
      },
      c: {
        name: 'C',
        version: 'C11',
        icon: '🔧',
        extension: 'c',
        template: '// Write your C code here\n',
        boilerplate: '#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}\n'
      }
    };

    return configs[language] || configs.python;
  }

  /**
   * Format execution time for display
   * @param {number} ms - Time in milliseconds
   * @returns {string} Formatted time
   */
  formatExecutionTime(ms) {
    if (ms < 1000) {
      return `${ms}ms`;
    } else {
      return `${(ms / 1000).toFixed(2)}s`;
    }
  }

  /**
   * Format memory usage for display
   * @param {number} mb - Memory in megabytes
   * @returns {string} Formatted memory
   */
  formatMemory(mb) {
    if (mb < 1) {
      return `${(mb * 1024).toFixed(0)}KB`;
    } else {
      return `${mb.toFixed(2)}MB`;
    }
  }

  /**
   * Calculate time complexity category
   * @param {number} executionTime - Execution time in ms
   * @param {number} inputSize - Size of input
   * @returns {string} Complexity category
   */
  estimateTimeComplexity(executionTime, inputSize) {
    if (inputSize < 10) return 'Unknown';
    
    const ratio = executionTime / inputSize;
    
    if (ratio < 0.1) return 'O(1) or O(log n)';
    if (ratio < 1) return 'O(n)';
    if (ratio < 10) return 'O(n log n)';
    if (ratio < 100) return 'O(n²)';
    return 'O(n³) or higher';
  }
}

// Create singleton instance
const codeExecutionService = new CodeExecutionService();

export default codeExecutionService;
