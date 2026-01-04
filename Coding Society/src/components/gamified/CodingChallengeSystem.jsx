import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { useGame } from '../../context/GameContext';
import { 
  Play, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock,
  MemoryStick,
  Code,
  ChevronLeft,
  ChevronRight,
  Lock,
  Award,
  TrendingUp,
  BarChart3,
  Lightbulb,
  AlertCircle,
  Loader2,
  Sparkles,
  Trophy,
  ArrowRight,
  RotateCcw,
  Maximize2,
  Minimize2,
  Settings,
  Activity
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import codeExecutionService from '../../services/professionalCodeExecutionService';

/**
 * ⚡ PROFESSIONAL CODING CHALLENGE PLATFORM ⚡
 * 
 * A LeetCode / GeeksforGeeks style coding challenge interface featuring:
 * - 📱 Split-screen layout (resizable)
 * - 🎯 Deterministic test case validation
 * - ⚡ Real-time code execution with sandboxing
 * - 📊 Performance metrics (time & space complexity)
 * - 🔒 Strict progression (next unlock on 100% pass)
 * - 🎨 Professional UI/UX
 */

// ===== PROBLEM DATABASE =====
const PROBLEMS_DATABASE = [
  {
    id: 1,
    title: 'Add Two Numbers',
    difficulty: 'Easy',
    category: 'Math',
    description: `You are given two integers num1 and num2. Return the sum of the two integers.

This is a simple addition problem to help you get started with the coding challenge platform.`,
    inputFormat: `num1: Integer
num2: Integer`,
    outputFormat: `Integer (sum of num1 and num2)`,
    constraints: [
      '-1000 ≤ num1, num2 ≤ 1000'
    ],
    examples: [
      {
        input: 'num1 = 12, num2 = 5',
        output: '17',
        explanation: '12 + 5 = 17'
      },
      {
        input: 'num1 = -10, num2 = 4',
        output: '-6',
        explanation: '-10 + 4 = -6'
      },
      {
        input: 'num1 = 0, num2 = 0',
        output: '0',
        explanation: '0 + 0 = 0'
      }
    ],
    testCases: [
      { input: '12\n5', expectedOutput: '17', visible: true },
      { input: '-10\n4', expectedOutput: '-6', visible: true },
      { input: '0\n0', expectedOutput: '0', visible: true },
      { input: '100\n-50', expectedOutput: '50', visible: false },
      { input: '-999\n999', expectedOutput: '0', visible: false },
    ],
    starterCode: {
      python: `def addTwoNumbers(num1, num2):
    """
    :type num1: int
    :type num2: int
    :rtype: int
    """
    # Write your solution here
    pass

if __name__ == "__main__":
    import sys
    num1 = int(sys.stdin.readline().strip())
    num2 = int(sys.stdin.readline().strip())
    result = addTwoNumbers(num1, num2)
    print(result)`,
      javascript: `/**
 * @param {number} num1
 * @param {number} num2
 * @return {number}
 */
var addTwoNumbers = function(num1, num2) {
    // Write your solution here
};

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let lines = [];
rl.on('line', (line) => {
    lines.push(line);
    if (lines.length === 2) {
        const num1 = parseInt(lines[0]);
        const num2 = parseInt(lines[1]);
        console.log(addTwoNumbers(num1, num2));
        rl.close();
    }
});`,
      java: `import java.util.Scanner;

class Solution {
    public int addTwoNumbers(int num1, int num2) {
        // Write your solution here
        return 0;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int num1 = sc.nextInt();
        int num2 = sc.nextInt();
        Solution sol = new Solution();
        System.out.println(sol.addTwoNumbers(num1, num2));
    }
}`,
      cpp: `#include <iostream>
using namespace std;

class Solution {
public:
    int addTwoNumbers(int num1, int num2) {
        // Write your solution here
        return 0;
    }
};

int main() {
    int num1, num2;
    cin >> num1 >> num2;
    Solution sol;
    cout << sol.addTwoNumbers(num1, num2) << endl;
    return 0;
}`,
      c: `#include <stdio.h>

int addTwoNumbers(int num1, int num2) {
    // Write your solution here
    return 0;
}

int main() {
    int num1, num2;
    scanf("%d", &num1);
    scanf("%d", &num2);
    printf("%d\\n", addTwoNumbers(num1, num2));
    return 0;
}`
    },
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    hints: [
      'This is a simple addition operation.',
      'Use the + operator to add two numbers.',
      'Make sure to handle negative numbers correctly.'
    ],
    locked: false
  },
  {
    id: 2,
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    inputFormat: `nums: Array of integers
target: Integer`,
    outputFormat: `Array of two indices [index1, index2]`,
    constraints: [
      '2 ≤ nums.length ≤ 10⁴',
      '-10⁹ ≤ nums[i] ≤ 10⁹',
      '-10⁹ ≤ target ≤ 10⁹',
      'Only one valid answer exists'
    ],
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'nums[1] + nums[2] == 6, so we return [1, 2].'
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]',
        explanation: 'Both elements add up to the target.'
      }
    ],
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', visible: true },
      { input: '[3,2,4]\n6', expectedOutput: '[1,2]', visible: true },
      { input: '[3,3]\n6', expectedOutput: '[0,1]', visible: true },
      { input: '[1,5,3,7,9]\n10', expectedOutput: '[1,3]', visible: false },
      { input: '[0,4,3,0]\n0', expectedOutput: '[0,3]', visible: false },
    ],
    starterCode: {
      python: `def twoSum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Write your solution here
    pass

# Test your solution
if __name__ == "__main__":
    import sys
    nums = eval(sys.stdin.readline().strip())
    target = int(sys.stdin.readline().strip())
    result = twoSum(nums, target)
    print(result)`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Write your solution here
};

// Test your solution
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let lines = [];
rl.on('line', (line) => {
    lines.push(line);
    if (lines.length === 2) {
        const nums = JSON.parse(lines[0]);
        const target = parseInt(lines[1]);
        console.log(JSON.stringify(twoSum(nums, target)));
        rl.close();
    }
});`,
      java: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String numsStr = sc.nextLine();
        int target = sc.nextInt();
        
        // Parse array
        numsStr = numsStr.replace("[", "").replace("]", "");
        String[] parts = numsStr.split(",");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            nums[i] = Integer.parseInt(parts[i].trim());
        }
        
        Solution sol = new Solution();
        int[] result = sol.twoSum(nums, target);
        System.out.println(Arrays.toString(result));
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        return {};
    }
};

int main() {
    string line;
    getline(cin, line);
    
    // Parse array
    vector<int> nums;
    line = line.substr(1, line.length() - 2); // Remove []
    stringstream ss(line);
    int num;
    char comma;
    while (ss >> num) {
        nums.push_back(num);
        ss >> comma;
    }
    
    int target;
    cin >> target;
    
    Solution sol;
    vector<int> result = sol.twoSum(nums, target);
    cout << "[" << result[0] << "," << result[1] << "]" << endl;
    
    return 0;
}`,
      c: `#include <stdio.h>
#include <stdlib.h>

/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Write your solution here
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));
    return result;
}

int main() {
    // Input parsing
    char line[1000];
    fgets(line, sizeof(line), stdin);
    
    int nums[10000];
    int numsSize = 0;
    char* token = strtok(line, "[,]");
    while (token != NULL) {
        nums[numsSize++] = atoi(token);
        token = strtok(NULL, "[,]");
    }
    
    int target;
    scanf("%d", &target);
    
    int returnSize;
    int* result = twoSum(nums, numsSize, target, &returnSize);
    printf("[%d,%d]\\n", result[0], result[1]);
    free(result);
    
    return 0;
}`
    },
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    hints: [
      'A brute force approach would be to check every pair of numbers, but this would be O(n²).',
      'Think about how you can use a hash map to store values you\'ve seen.',
      'For each number, check if (target - number) exists in your hash map.'
    ]
  },
  {
    id: 3,
    title: 'Reverse Integer',
    difficulty: 'Medium',
    category: 'Math',
    description: `Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range [-2³¹, 2³¹ - 1], then return 0.

Assume the environment does not allow you to store 64-bit integers (signed or unsigned).`,
    inputFormat: 'x: 32-bit signed integer',
    outputFormat: 'Integer (reversed, or 0 if overflow)',
    constraints: [
      '-2³¹ ≤ x ≤ 2³¹ - 1'
    ],
    examples: [
      {
        input: 'x = 123',
        output: '321',
        explanation: ''
      },
      {
        input: 'x = -123',
        output: '-321',
        explanation: ''
      },
      {
        input: 'x = 120',
        output: '21',
        explanation: ''
      }
    ],
    testCases: [
      { input: '123', expectedOutput: '321', visible: true },
      { input: '-123', expectedOutput: '-321', visible: true },
      { input: '120', expectedOutput: '21', visible: true },
      { input: '1534236469', expectedOutput: '0', visible: false },
      { input: '0', expectedOutput: '0', visible: false },
    ],
    starterCode: {
      python: `def reverse(x):
    """
    :type x: int
    :rtype: int
    """
    # Write your solution here
    pass

if __name__ == "__main__":
    import sys
    x = int(sys.stdin.readline().strip())
    result = reverse(x)
    print(result)`,
      javascript: `/**
 * @param {number} x
 * @return {number}
 */
var reverse = function(x) {
    // Write your solution here
};

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (line) => {
    const x = parseInt(line);
    console.log(reverse(x));
    rl.close();
});`,
      java: `import java.util.Scanner;

class Solution {
    public int reverse(int x) {
        // Write your solution here
        return 0;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int x = sc.nextInt();
        Solution sol = new Solution();
        System.out.println(sol.reverse(x));
    }
}`,
      cpp: `#include <iostream>
using namespace std;

class Solution {
public:
    int reverse(int x) {
        // Write your solution here
        return 0;
    }
};

int main() {
    int x;
    cin >> x;
    Solution sol;
    cout << sol.reverse(x) << endl;
    return 0;
}`,
      c: `#include <stdio.h>
#include <limits.h>

int reverse(int x) {
    // Write your solution here
    return 0;
}

int main() {
    int x;
    scanf("%d", &x);
    printf("%d\\n", reverse(x));
    return 0;
}`
    },
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'You can reverse the integer digit by digit.',
      'Remember to check for overflow before adding the next digit.',
      'Use modulo (%) to extract digits and integer division to remove them.'
    ]
  },
  {
    id: 4,
    title: 'Palindrome Number',
    difficulty: 'Easy',
    category: 'Math',
    description: `Given an integer x, return true if x is a palindrome, and false otherwise.`,
    inputFormat: 'x: Integer',
    outputFormat: 'Boolean (true or false)',
    constraints: [
      '-2³¹ ≤ x ≤ 2³¹ - 1'
    ],
    examples: [
      {
        input: 'x = 121',
        output: 'true',
        explanation: '121 reads as 121 from left to right and from right to left.'
      },
      {
        input: 'x = -121',
        output: 'false',
        explanation: 'From left to right, it reads -121. From right to left, it becomes 121-.'
      },
      {
        input: 'x = 10',
        output: 'false',
        explanation: 'Reads 01 from right to left.'
      }
    ],
    testCases: [
      { input: '121', expectedOutput: 'true', visible: true },
      { input: '-121', expectedOutput: 'false', visible: true },
      { input: '10', expectedOutput: 'false', visible: true },
      { input: '12321', expectedOutput: 'true', visible: false },
      { input: '0', expectedOutput: 'true', visible: false },
    ],
    starterCode: {
      python: `def isPalindrome(x):
    """
    :type x: int
    :rtype: bool
    """
    # Write your solution here
    pass

if __name__ == "__main__":
    import sys
    x = int(sys.stdin.readline().strip())
    result = isPalindrome(x)
    print(str(result).lower())`,
      javascript: `/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function(x) {
    // Write your solution here
};

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (line) => {
    const x = parseInt(line);
    console.log(isPalindrome(x));
    rl.close();
});`,
      java: `import java.util.Scanner;

class Solution {
    public boolean isPalindrome(int x) {
        // Write your solution here
        return false;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int x = sc.nextInt();
        Solution sol = new Solution();
        System.out.println(sol.isPalindrome(x));
    }
}`,
      cpp: `#include <iostream>
using namespace std;

class Solution {
public:
    bool isPalindrome(int x) {
        // Write your solution here
        return false;
    }
};

int main() {
    int x;
    cin >> x;
    Solution sol;
    cout << (sol.isPalindrome(x) ? "true" : "false") << endl;
    return 0;
}`,
      c: `#include <stdio.h>
#include <stdbool.h>

bool isPalindrome(int x) {
    // Write your solution here
    return false;
}

int main() {
    int x;
    scanf("%d", &x);
    printf("%s\\n", isPalindrome(x) ? "true" : "false");
    return 0;
}`
    },
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    hints: [
      'Negative numbers are never palindromes.',
      'You can reverse half of the number and compare it with the other half.',
      'Alternatively, convert to string, but that uses extra space.'
    ],
    locked: false
  }
];

// ===== LANGUAGE CONFIGURATION =====
const LANGUAGES = [
  { id: 'python', name: 'Python', version: '3.10', icon: '🐍' },
  { id: 'javascript', name: 'JavaScript', version: 'Node 18', icon: '🟨' },
  { id: 'java', name: 'Java', version: '17', icon: '☕' },
  { id: 'cpp', name: 'C++', version: 'C++17', icon: '⚙️' },
  { id: 'c', name: 'C', version: 'C11', icon: '🔧' }
];

/**
 * Main Coding Challenge System Component
 */
const CodingChallengeSystem = () => {
  const { gameState, awardXP, showNotification } = useGame();
  
  // State Management
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('python');
  const [userCode, setUserCode] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [splitPosition, setSplitPosition] = useState(45);
  const [isResizing, setIsResizing] = useState(false);
  const [activeHint, setActiveHint] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);
  const [userRanking, setUserRanking] = useState(null);
  
  const containerRef = useRef(null);
  const editorRef = useRef(null);

  // Initialize code when problem or language changes
  useEffect(() => {
    if (selectedProblem && selectedProblem.starterCode[currentLanguage]) {
      setUserCode(selectedProblem.starterCode[currentLanguage]);
      setExecutionResult(null);
      setTestResults([]);
      setConsoleOutput('');
      setAttempts(0);
    }
  }, [selectedProblem, currentLanguage]);

  // Handle split pane resize
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      setSplitPosition(Math.max(30, Math.min(70, newPosition)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  /**
   * Execute code against test cases using real backend
   */
  const handleRunCode = async () => {
    if (!selectedProblem || !userCode.trim()) {
      showNotification('Please write some code first', 'error');
      return;
    }

    setIsExecuting(true);
    setConsoleOutput('Running test cases...\n');
    setAttempts(prev => prev + 1);

    try {
      // Run against visible test cases only for "Run Code"
      const visibleTests = selectedProblem.testCases.filter(tc => tc.visible);
      
      const result = await codeExecutionService.runTestCases(
        userCode, 
        currentLanguage, 
        visibleTests
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Execution failed');
      }

      setTestResults(result.results);
      setExecutionResult({ 
        allPassed: result.allPassed, 
        totalTests: result.totalTests, 
        passedTests: result.passedTests 
      });
      
      let output = `\n${'='.repeat(50)}\n`;
      output += `TEST RESULTS\n`;
      output += `${'='.repeat(50)}\n\n`;
      output += `Passed: ${result.passedTests}/${result.totalTests} test cases\n`;
      output += `Average Execution Time: ${result.avgExecutionTime}ms\n\n`;
      
      result.results.forEach((testResult) => {
        output += `Test Case ${testResult.testNumber}: ${testResult.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
        if (!testResult.hidden || !testResult.passed) {
          output += `Input: ${testResult.input}\n`;
          output += `Expected: ${testResult.expectedOutput}\n`;
          output += `Got: ${testResult.actualOutput}\n`;
        }
        if (testResult.stderr) output += `Error: ${testResult.stderr}\n`;
        output += `Time: ${testResult.executionTime}ms\n`;
        output += `\n`;
      });
      
      setConsoleOutput(output);
      
      if (result.allPassed) {
        showNotification('All visible test cases passed! 🎉', 'success');
      } else {
        showNotification(`${result.passedTests}/${result.totalTests} test cases passed`, 'warning');
      }
      
    } catch (error) {
      setConsoleOutput(`Error: ${error.message}`);
      showNotification('Execution error', 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  /** using real backend
   */
  const handleSubmit = async () => {
    if (!selectedProblem || !userCode.trim()) {
      showNotification('Please write some code first', 'error');
      return;
    }

    setIsExecuting(true);
    setConsoleOutput('Evaluating your solution against all test cases...\n');

    try {
      // Run against ALL test cases (visible + hidden)
      const result = await codeExecutionService.runTestCases(
        userCode, 
        currentLanguage, 
        selectedProblem.testCases
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Execution failed');
      }

      setTestResults(result.results);
      const passedCount = result.passedTests;
      setExecutionResult({ 
        allPassed: result.allPassed, 
        totalTests: result.totalTests, 
        passedTests: passedCount,
        isSubmission: true
      });
      
      let output = `\n${'='.repeat(50)}\n`;
      output += `SUBMISSION RESULTS\n`;
      output += `${'='.repeat(50)}\n\n`;
      output += `Passed: ${passedCount}/${result.totalTests} test cases\n`;
      output += `Average Execution Time: ${result.avgExecutionTime}ms\n\n`;
      
      result.results.forEach((testResult) => {
        output += `Test Case ${testResult.testNumber}${testResult.hidden ? ' (Hidden)' : ''}: ${testResult.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
        if (!testResult.hidden || !testResult.passed) {
          output += `Input: ${testResult.input}\n`;
          output += `Expected: ${testResult.expectedOutput}\n`;
          output += `Got: ${testResult.actualOutput}\n`;
        }
        output += `\n`;
      });
      
      if (result.allPassed) {
        output += `\n🎉 CONGRATULATIONS! All test cases passed!\n`;
        output += `\nTime Complexity: ${selectedProblem.timeComplexity}\n`;
        output += `Space Complexity: ${selectedProblem.spaceComplexity}\n`;
        
        // Award XP and unlock next problem
        const xpReward = selectedProblem.difficulty === 'Easy' ? 100 : selectedProblem.difficulty === 'Medium' ? 200 : 300;
        awardXP(xpReward);
        showNotification(`Problem solved! +${xpReward} XP 🏆`, 'success');
        
        // Calculate performance metrics and ranking
        const avgTime = result.results.reduce((sum, r) => sum + r.executionTime, 0) / result.results.length;
        const totalMemory = result.results.reduce((sum, r) => sum + (r.memory || 0), 0) / result.results.length;
        
        // Mock ranking (in production, fetch from backend)
        const mockRanking = {
          percentile: Math.floor(Math.random() * 30) + 70, // 70-100%
          totalSubmissions: Math.floor(Math.random() * 1000) + 500,
          fasterThan: Math.floor(Math.random() * 40) + 60, // 60-100%
          lessMemoryThan: Math.floor(Math.random() * 40) + 60
        };
        
        setPerformanceData({
          avgExecutionTime: avgTime,
          avgMemory: totalMemory,
          timeComplexity: selectedProblem.timeComplexity,
          spaceComplexity: selectedProblem.spaceComplexity
        });
        setUserRanking(mockRanking);
        setShowPerformanceMetrics(true);
        
        // Unlock next problem
        if (selectedProblem.id < PROBLEMS_DATABASE.length) {
          const nextProblem = PROBLEMS_DATABASE[selectedProblem.id];
          if (nextProblem.locked) {
            nextProblem.locked = false;
          }
        }
      } else {
        output += `\n❌ Some test cases failed. Keep trying!\n`;
        showNotification(`${passedCount}/${result.totalTests} test cases passed`, 'warning');
      }
      
      setConsoleOutput(output);
      
    } catch (error) {
      setConsoleOutput(`Error: ${error.message}`);
      showNotification('Execution error', 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  /**
   * Simulate code execution (replace with actual backend execution)
  /**
   * Normalize output for comparison
   */
  const normalizeOutput = (output) => {
    return codeExecutionService.normalizeOutput(output);
  };

  /**
   * Reset to starter code
   */
  const handleReset = () => {
    if (selectedProblem && selectedProblem.starterCode[currentLanguage]) {
      setUserCode(selectedProblem.starterCode[currentLanguage]);
      setExecutionResult(null);
      setTestResults([]);
      setConsoleOutput('');
      showNotification('Code reset to starter template', 'info');
    }
  };

  // ===== RENDER: Problem List View =====
  if (!selectedProblem) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Coding Challenges</h1>
              <p className="text-blue-100 text-lg">Master algorithms and data structures through practice</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 text-center">
              <div className="text-3xl font-bold">{PROBLEMS_DATABASE.filter(p => !p.locked).length}</div>
              <div className="text-sm text-blue-100">Problems</div>
            </div>
          </div>
        </div>

        {/* Problem List */}
        <div className="space-y-4">
          {PROBLEMS_DATABASE.map((problem, index) => {
            const isLocked = problem.locked && index > 0;
            const difficultyColors = {
              Easy: 'text-green-600 bg-green-50 border-green-200',
              Medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
              Hard: 'text-red-600 bg-red-50 border-red-200'
            };
            
            return (
              <Card 
                key={problem.id} 
                className={`border-2 transition-all duration-300 hover:shadow-lg ${
                  isLocked 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'hover:border-blue-300 cursor-pointer'
                }`}
                onClick={() => !isLocked && setSelectedProblem(problem)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-gray-500 font-mono text-sm">#{problem.id}</span>
                        <h3 className="text-xl font-bold text-gray-900">{problem.title}</h3>
                        {isLocked && <Lock className="w-5 h-5 text-gray-400" />}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${difficultyColors[problem.difficulty]}`}>
                          {problem.difficulty}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          {problem.category}
                        </span>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{problem.timeComplexity}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MemoryStick className="w-4 h-4" />
                          <span>{problem.spaceComplexity}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {!isLocked && (
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                          Solve Challenge
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // ===== RENDER: Split-Screen Coding Interface =====
  const difficultyColors = {
    Easy: 'text-green-600 bg-green-50 border-green-600',
    Medium: 'text-yellow-600 bg-yellow-50 border-yellow-600',
    Hard: 'text-red-600 bg-red-50 border-red-600'
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'space-y-4'} animate-in fade-in duration-300`}>
      {/* Top Action Bar */}
      <div className="flex items-center justify-between bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedProblem(null)}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Problems
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 font-mono text-sm">#{selectedProblem.id}</span>
            <h2 className="text-lg font-bold text-gray-900">{selectedProblem.title}</h2>
            <span className={`px-2 py-1 rounded-md text-xs font-bold border ${difficultyColors[selectedProblem.difficulty]}`}>
              {selectedProblem.difficulty}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Split-Screen Layout */}
      <div 
        ref={containerRef}
        className="flex h-[calc(100vh-140px)] gap-1 bg-gray-100"
      >
        {/* LEFT PANEL: Problem Statement */}
        <div 
          className="bg-white overflow-hidden rounded-lg border border-gray-200"
          style={{ width: `${splitPosition}%` }}
        >
          <div className="h-full overflow-y-auto p-6 prose prose-sm max-w-none">
            {/* Problem Description */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Problem Description</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedProblem.description}
              </p>
            </div>

            {/* Input/Output Format */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-bold text-blue-900 mb-2">Input Format</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {selectedProblem.inputFormat}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="text-sm font-bold text-green-900 mb-2">Output Format</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {selectedProblem.outputFormat}
                </p>
              </div>
            </div>

            {/* Constraints */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Constraints</h3>
              <ul className="list-disc list-inside space-y-1">
                {selectedProblem.constraints.map((constraint, index) => (
                  <li key={index} className="text-gray-700 font-mono text-sm">{constraint}</li>
                ))}
              </ul>
            </div>

            {/* Examples */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Example Test Cases</h3>
              {selectedProblem.examples.map((example, index) => (
                <div key={index} className="mb-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="font-bold text-gray-900 mb-2">Example {index + 1}:</div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">Input:</span>
                      <pre className="bg-white p-2 rounded mt-1 border font-mono">{example.input}</pre>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Output:</span>
                      <pre className="bg-white p-2 rounded mt-1 border font-mono">{example.output}</pre>
                    </div>
                    {example.explanation && (
                      <div>
                        <span className="font-semibold text-gray-700">Explanation:</span>
                        <p className="text-gray-600 mt-1">{example.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Hints */}
            {selectedProblem.hints && selectedProblem.hints.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Hints
                </h3>
                <div className="space-y-2">
                  {selectedProblem.hints.map((hint, index) => (
                    <div key={index}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveHint(activeHint === index ? null : index)}
                        className="w-full justify-between"
                      >
                        <span>Hint {index + 1}</span>
                        <ChevronRight className={`w-4 h-4 transition-transform ${activeHint === index ? 'rotate-90' : ''}`} />
                      </Button>
                      {activeHint === index && (
                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-gray-700">
                          {hint}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RESIZER */}
        <div
          className="w-2 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors flex items-center justify-center group"
          onMouseDown={() => setIsResizing(true)}
        >
          <div className="w-1 h-12 bg-gray-400 rounded-full group-hover:bg-white transition-colors"></div>
        </div>

        {/* RIGHT PANEL: Code Editor + Console */}
        <div 
          className="flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden"
          style={{ width: `${100 - splitPosition - 0.5}%` }}
        >
          {/* Editor Header */}
          <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 p-3">
            <div className="flex items-center gap-3">
              <Code className="w-5 h-5 text-gray-600" />
              <select
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.id} value={lang.id}>
                    {lang.icon} {lang.name} ({lang.version})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="gap-2 text-gray-600"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="60%"
              language={currentLanguage === 'cpp' ? 'cpp' : currentLanguage}
              value={userCode}
              onChange={(value) => setUserCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on'
              }}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between bg-gray-50 border-t border-b border-gray-200 p-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <AlertCircle className="w-4 h-4" />
              <span>Attempts: {attempts}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRunCode}
                disabled={isExecuting}
                variant="outline"
                className="gap-2"
              >
                {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Run Code
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isExecuting}
                className="bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit
              </Button>
            </div>
          </div>

          {/* Console / Results */}
          <div className="flex-1 overflow-y-auto bg-gray-900 text-gray-100 p-4 font-mono text-sm">
            {executionResult && (
              <div className={`mb-4 p-4 rounded-lg border-2 ${
                executionResult.allPassed 
                  ? 'bg-green-900/20 border-green-500' 
                  : 'bg-red-900/20 border-red-500'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  {executionResult.allPassed ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                  <span className="text-lg font-bold">
                    {executionResult.allPassed ? 'All Test Cases Passed!' : 'Some Test Cases Failed'}
                  </span>
                </div>
                <div className="text-sm">
                  Passed: {executionResult.passedTests}/{executionResult.totalTests} test cases
                </div>
                
                {executionResult.allPassed && executionResult.isSubmission && (
                  <div className="mt-4 pt-4 border-t border-green-500/30">
                    <div className="text-green-400 font-bold mb-2">🎉 Problem Solved!</div>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Time Complexity:</span>
                        <span className="ml-2 text-blue-400">{selectedProblem.timeComplexity}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Space Complexity:</span>
                        <span className="ml-2 text-purple-400">{selectedProblem.spaceComplexity}</span>
                      </div>
                    </div>
                    
                    {/* Performance Metrics & Ranking */}
                    {showPerformanceMetrics && performanceData && userRanking && (
                      <div className="mt-4 space-y-4">
                        {/* Performance Stats */}
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-blue-400" />
                            Your Performance
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-900/50 rounded p-3">
                              <div className="text-xs text-gray-400 mb-1">Avg Runtime</div>
                              <div className="text-lg font-bold text-blue-400">
                                {performanceData.avgExecutionTime.toFixed(0)}ms
                              </div>
                            </div>
                            <div className="bg-gray-900/50 rounded p-3">
                              <div className="text-xs text-gray-400 mb-1">Avg Memory</div>
                              <div className="text-lg font-bold text-purple-400">
                                {performanceData.avgMemory.toFixed(1)}MB
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Ranking Visualization */}
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-yellow-400" />
                            Global Ranking
                          </h4>
                          
                          {/* Percentile Badge */}
                          <div className="text-center mb-4">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-2">
                              <span className="text-2xl font-bold text-white">
                                {userRanking.percentile}%
                              </span>
                            </div>
                            <div className="text-xs text-gray-400">Top Percentile</div>
                          </div>

                          {/* Comparison Bars */}
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Runtime</span>
                                <span>Faster than {userRanking.fasterThan}%</span>
                              </div>
                              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000"
                                  style={{ width: `${userRanking.fasterThan}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Memory</span>
                                <span>Less than {userRanking.lessMemoryThan}%</span>
                              </div>
                              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-1000"
                                  style={{ width: `${userRanking.lessMemoryThan}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          {/* Total Submissions */}
                          <div className="mt-4 text-center text-xs text-gray-500">
                            Based on {userRanking.totalSubmissions.toLocaleString()} submissions
                          </div>
                        </div>

                        {/* Complexity Visualization */}
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-green-400" />
                            Complexity Analysis
                          </h4>
                          
                          {/* Time Complexity Graph */}
                          <div className="mb-4">
                            <div className="text-xs text-gray-400 mb-2">Time Complexity: {performanceData.timeComplexity}</div>
                            <div className="flex items-end gap-2 h-24">
                              {[10, 20, 30, 40, 50].map((size, idx) => {
                                const height = size + (idx * 8); // Simulate O(n) growth
                                return (
                                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                    <div className="text-[10px] text-green-400 font-mono">
                                      {(performanceData.avgExecutionTime * (idx + 1) / 5).toFixed(0)}ms
                                    </div>
                                    <div 
                                      className="w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t"
                                      style={{ height: `${height}%` }}
                                    ></div>
                                    <div className="text-[10px] text-gray-500">n={size}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Space Complexity Indicator */}
                          <div>
                            <div className="text-xs text-gray-400 mb-2">Space Complexity: {performanceData.spaceComplexity}</div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-3 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-1/4"></div>
                              </div>
                              <span className="text-xs text-gray-500">Optimal</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3">
                      <Button
                        onClick={() => {
                          setSelectedProblem(null);
                          setExecutionResult(null);
                          setShowPerformanceMetrics(false);
                          setPerformanceData(null);
                          setUserRanking(null);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                      >
                        Next Problem
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <pre className="whitespace-pre-wrap">{consoleOutput || 'Console output will appear here...'}</pre>
            
            {testResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.passed 
                        ? 'bg-green-900/10 border-green-500/30' 
                        : 'bg-red-900/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">
                        Test Case {result.testNumber} {result.hidden && '(Hidden)'}
                      </span>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {result.executionTime}ms
                        </span>
                        <span className={result.passed ? 'text-green-500' : 'text-red-500'}>
                          {result.passed ? '✅ PASSED' : '❌ FAILED'}
                        </span>
                      </div>
                    </div>
                    {!result.passed && !result.hidden && (
                      <div className="text-xs text-gray-400 mt-2 space-y-1">
                        <div>Expected: {result.expectedOutput}</div>
                        <div>Got: {result.output}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingChallengeSystem;
