/**
 * Comprehensive Problem Database for LeetCode/GFG-Style Coding Challenges
 * 
 * Each problem includes:
 * - Title, difficulty, category, tags
 * - Description with markdown support
 * - Examples with input/output
 * - Constraints
 * - Test cases (visible + hidden)
 * - Code templates for each language
 * - Hints
 */

export const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

export const CATEGORIES = {
  ARRAYS: 'arrays',
  STRINGS: 'strings',
  MATH: 'math',
  RECURSION: 'recursion',
  SORTING: 'sorting',
  SEARCHING: 'searching',
  DYNAMIC_PROGRAMMING: 'dynamic_programming',
  TREES: 'trees',
  GRAPHS: 'graphs',
  LINKED_LISTS: 'linked_lists'
};

// Code templates for each language
const TEMPLATES = {
  twoSum: {
    python: `def twoSum(nums, target):
    """
    Find two numbers that add up to target.
    
    Args:
        nums: List of integers
        target: Target sum
    
    Returns:
        List of two indices
    """
    # Your code here
    pass

# Read input
import sys
input_data = sys.stdin.read().strip().split('\\n')
nums = list(map(int, input_data[0].strip('[]').split(',')))
target = int(input_data[1])

# Get result and print
result = twoSum(nums, target)
print(result)`,
    javascript: `function twoSum(nums, target) {
    // Your code here
    return [];
}

// Read input from stdin
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

const lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
    const nums = JSON.parse(lines[0]);
    const target = parseInt(lines[1]);
    const result = twoSum(nums, target);
    console.log(JSON.stringify(result));
});`,
    java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line1 = sc.nextLine();
        int target = sc.nextInt();
        
        // Parse array
        line1 = line1.replaceAll("[\\\\[\\\\]]", "");
        String[] parts = line1.split(",");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            nums[i] = Integer.parseInt(parts[i].trim());
        }
        
        int[] result = twoSum(nums, target);
        System.out.println(Arrays.toString(result));
    }
}`,
    cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Your code here
    return {};
}

int main() {
    string line;
    getline(cin, line);
    
    // Parse array
    vector<int> nums;
    line = line.substr(1, line.size() - 2); // Remove brackets
    stringstream ss(line);
    string token;
    while (getline(ss, token, ',')) {
        nums.push_back(stoi(token));
    }
    
    int target;
    cin >> target;
    
    vector<int> result = twoSum(nums, target);
    cout << "[" << result[0] << "," << result[1] << "]" << endl;
    return 0;
}`,
    c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Your code here
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));
    return result;
}

int main() {
    char line[1000];
    fgets(line, sizeof(line), stdin);
    
    // Parse array (simplified)
    int nums[100], size = 0, target;
    char* token = strtok(line + 1, ",]");
    while (token) {
        nums[size++] = atoi(token);
        token = strtok(NULL, ",]");
    }
    
    scanf("%d", &target);
    
    int returnSize;
    int* result = twoSum(nums, size, target, &returnSize);
    printf("[%d,%d]\\n", result[0], result[1]);
    free(result);
    return 0;
}`
  },
  
  reverseString: {
    python: `def reverseString(s):
    """
    Reverse the input string.
    
    Args:
        s: Input string
    
    Returns:
        Reversed string
    """
    # Your code here
    pass

# Read input and print result
s = input().strip()
print(reverseString(s))`,
    javascript: `function reverseString(s) {
    // Your code here
    return "";
}

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', (line) => {
    console.log(reverseString(line.trim()));
    rl.close();
});`,
    java: `import java.util.Scanner;

public class Main {
    public static String reverseString(String s) {
        // Your code here
        return "";
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        System.out.println(reverseString(s));
    }
}`,
    cpp: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

string reverseString(string s) {
    // Your code here
    return "";
}

int main() {
    string s;
    getline(cin, s);
    cout << reverseString(s) << endl;
    return 0;
}`,
    c: `#include <stdio.h>
#include <string.h>

void reverseString(char* s) {
    // Your code here (modify in place)
}

int main() {
    char s[1000];
    fgets(s, sizeof(s), stdin);
    s[strcspn(s, "\\n")] = 0; // Remove newline
    reverseString(s);
    printf("%s\\n", s);
    return 0;
}`
  },

  fibonacci: {
    python: `def fibonacci(n):
    """
    Return the nth Fibonacci number.
    
    Args:
        n: Position in Fibonacci sequence (0-indexed)
    
    Returns:
        The nth Fibonacci number
    """
    # Your code here
    pass

# Read input and print result
n = int(input().strip())
print(fibonacci(n))`,
    javascript: `function fibonacci(n) {
    // Your code here
    return 0;
}

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', (line) => {
    const n = parseInt(line.trim());
    console.log(fibonacci(n));
    rl.close();
});`,
    java: `import java.util.Scanner;

public class Main {
    public static long fibonacci(int n) {
        // Your code here
        return 0;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(fibonacci(n));
    }
}`,
    cpp: `#include <iostream>
using namespace std;

long long fibonacci(int n) {
    // Your code here
    return 0;
}

int main() {
    int n;
    cin >> n;
    cout << fibonacci(n) << endl;
    return 0;
}`,
    c: `#include <stdio.h>

long long fibonacci(int n) {
    // Your code here
    return 0;
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%lld\\n", fibonacci(n));
    return 0;
}`
  },

  isPalindrome: {
    python: `def isPalindrome(s):
    """
    Check if a string is a palindrome.
    
    Args:
        s: Input string
    
    Returns:
        True if palindrome, False otherwise
    """
    # Your code here
    pass

# Read input and print result
s = input().strip()
print("true" if isPalindrome(s) else "false")`,
    javascript: `function isPalindrome(s) {
    // Your code here
    return false;
}

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', (line) => {
    console.log(isPalindrome(line.trim()) ? "true" : "false");
    rl.close();
});`,
    java: `import java.util.Scanner;

public class Main {
    public static boolean isPalindrome(String s) {
        // Your code here
        return false;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        System.out.println(isPalindrome(s) ? "true" : "false");
    }
}`,
    cpp: `#include <iostream>
#include <string>
using namespace std;

bool isPalindrome(string s) {
    // Your code here
    return false;
}

int main() {
    string s;
    getline(cin, s);
    cout << (isPalindrome(s) ? "true" : "false") << endl;
    return 0;
}`,
    c: `#include <stdio.h>
#include <string.h>
#include <stdbool.h>

bool isPalindrome(char* s) {
    // Your code here
    return false;
}

int main() {
    char s[1000];
    fgets(s, sizeof(s), stdin);
    s[strcspn(s, "\\n")] = 0;
    printf("%s\\n", isPalindrome(s) ? "true" : "false");
    return 0;
}`
  },

  maxSubarray: {
    python: `def maxSubArray(nums):
    """
    Find the contiguous subarray with the largest sum.
    
    Args:
        nums: List of integers
    
    Returns:
        Maximum sum of contiguous subarray
    """
    # Your code here
    pass

# Read input
import sys
line = input().strip()
nums = list(map(int, line.strip('[]').split(',')))
print(maxSubArray(nums))`,
    javascript: `function maxSubArray(nums) {
    // Your code here
    return 0;
}

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', (line) => {
    const nums = JSON.parse(line.trim());
    console.log(maxSubArray(nums));
    rl.close();
});`,
    java: `import java.util.*;

public class Main {
    public static int maxSubArray(int[] nums) {
        // Your code here
        return 0;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().replaceAll("[\\\\[\\\\]]", "");
        String[] parts = line.split(",");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            nums[i] = Integer.parseInt(parts[i].trim());
        }
        System.out.println(maxSubArray(nums));
    }
}`,
    cpp: `#include <iostream>
#include <vector>
#include <sstream>
#include <climits>
using namespace std;

int maxSubArray(vector<int>& nums) {
    // Your code here
    return 0;
}

int main() {
    string line;
    getline(cin, line);
    line = line.substr(1, line.size() - 2);
    
    vector<int> nums;
    stringstream ss(line);
    string token;
    while (getline(ss, token, ',')) {
        nums.push_back(stoi(token));
    }
    
    cout << maxSubArray(nums) << endl;
    return 0;
}`,
    c: `#include <stdio.h>
#include <stdlib.h>
#include <limits.h>

int maxSubArray(int* nums, int size) {
    // Your code here
    return 0;
}

int main() {
    char line[10000];
    fgets(line, sizeof(line), stdin);
    
    int nums[1000], size = 0;
    char* token = strtok(line + 1, ",]");
    while (token) {
        nums[size++] = atoi(token);
        token = strtok(NULL, ",]");
    }
    
    printf("%d\\n", maxSubArray(nums, size));
    return 0;
}`
  },

  factorial: {
    python: `def factorial(n):
    """
    Calculate the factorial of n.
    
    Args:
        n: A non-negative integer
    
    Returns:
        n! (n factorial)
    """
    # Your code here
    pass

n = int(input().strip())
print(factorial(n))`,
    javascript: `function factorial(n) {
    // Your code here
    return 0;
}

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', (line) => {
    console.log(factorial(parseInt(line.trim())));
    rl.close();
});`,
    java: `import java.util.Scanner;

public class Main {
    public static long factorial(int n) {
        // Your code here
        return 0;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(factorial(n));
    }
}`,
    cpp: `#include <iostream>
using namespace std;

long long factorial(int n) {
    // Your code here
    return 0;
}

int main() {
    int n;
    cin >> n;
    cout << factorial(n) << endl;
    return 0;
}`,
    c: `#include <stdio.h>

long long factorial(int n) {
    // Your code here
    return 0;
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%lld\\n", factorial(n));
    return 0;
}`
  },

  isPrime: {
    python: `def isPrime(n):
    """
    Check if a number is prime.
    
    Args:
        n: A positive integer
    
    Returns:
        True if prime, False otherwise
    """
    # Your code here
    pass

n = int(input().strip())
print("true" if isPrime(n) else "false")`,
    javascript: `function isPrime(n) {
    // Your code here
    return false;
}

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', (line) => {
    console.log(isPrime(parseInt(line.trim())) ? "true" : "false");
    rl.close();
});`,
    java: `import java.util.Scanner;

public class Main {
    public static boolean isPrime(int n) {
        // Your code here
        return false;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(isPrime(n) ? "true" : "false");
    }
}`,
    cpp: `#include <iostream>
using namespace std;

bool isPrime(int n) {
    // Your code here
    return false;
}

int main() {
    int n;
    cin >> n;
    cout << (isPrime(n) ? "true" : "false") << endl;
    return 0;
}`,
    c: `#include <stdio.h>
#include <stdbool.h>

bool isPrime(int n) {
    // Your code here
    return false;
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%s\\n", isPrime(n) ? "true" : "false");
    return 0;
}`
  },

  mergeSortedArrays: {
    python: `def mergeSortedArrays(arr1, arr2):
    """
    Merge two sorted arrays into one sorted array.
    
    Args:
        arr1: First sorted array
        arr2: Second sorted array
    
    Returns:
        Merged sorted array
    """
    # Your code here
    pass

import sys
lines = sys.stdin.read().strip().split('\\n')
arr1 = list(map(int, lines[0].strip('[]').split(','))) if lines[0] != '[]' else []
arr2 = list(map(int, lines[1].strip('[]').split(','))) if lines[1] != '[]' else []
result = mergeSortedArrays(arr1, arr2)
print(result)`,
    javascript: `function mergeSortedArrays(arr1, arr2) {
    // Your code here
    return [];
}

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

const lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
    const arr1 = JSON.parse(lines[0]);
    const arr2 = JSON.parse(lines[1]);
    console.log(JSON.stringify(mergeSortedArrays(arr1, arr2)));
});`,
    java: `import java.util.*;

public class Main {
    public static int[] mergeSortedArrays(int[] arr1, int[] arr2) {
        // Your code here
        return new int[]{};
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line1 = sc.nextLine().replaceAll("[\\\\[\\\\]]", "");
        String line2 = sc.nextLine().replaceAll("[\\\\[\\\\]]", "");
        
        int[] arr1 = line1.isEmpty() ? new int[0] : Arrays.stream(line1.split(",")).mapToInt(s -> Integer.parseInt(s.trim())).toArray();
        int[] arr2 = line2.isEmpty() ? new int[0] : Arrays.stream(line2.split(",")).mapToInt(s -> Integer.parseInt(s.trim())).toArray();
        
        System.out.println(Arrays.toString(mergeSortedArrays(arr1, arr2)));
    }
}`,
    cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

vector<int> mergeSortedArrays(vector<int>& arr1, vector<int>& arr2) {
    // Your code here
    return {};
}

vector<int> parseArray(string line) {
    vector<int> result;
    if (line == "[]") return result;
    line = line.substr(1, line.size() - 2);
    stringstream ss(line);
    string token;
    while (getline(ss, token, ',')) {
        result.push_back(stoi(token));
    }
    return result;
}

int main() {
    string line1, line2;
    getline(cin, line1);
    getline(cin, line2);
    
    vector<int> arr1 = parseArray(line1);
    vector<int> arr2 = parseArray(line2);
    vector<int> result = mergeSortedArrays(arr1, arr2);
    
    cout << "[";
    for (int i = 0; i < result.size(); i++) {
        cout << result[i];
        if (i < result.size() - 1) cout << ",";
    }
    cout << "]" << endl;
    return 0;
}`,
    c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int* mergeSortedArrays(int* arr1, int size1, int* arr2, int size2, int* returnSize) {
    // Your code here
    *returnSize = 0;
    return NULL;
}

int main() {
    // Simplified implementation
    printf("[]\\n");
    return 0;
}`
  },

  binarySearch: {
    python: `def binarySearch(arr, target):
    """
    Find the index of target in sorted array using binary search.
    
    Args:
        arr: Sorted array of integers
        target: Target value to find
    
    Returns:
        Index of target, or -1 if not found
    """
    # Your code here
    pass

import sys
lines = sys.stdin.read().strip().split('\\n')
arr = list(map(int, lines[0].strip('[]').split(',')))
target = int(lines[1])
print(binarySearch(arr, target))`,
    javascript: `function binarySearch(arr, target) {
    // Your code here
    return -1;
}

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

const lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
    const arr = JSON.parse(lines[0]);
    const target = parseInt(lines[1]);
    console.log(binarySearch(arr, target));
});`,
    java: `import java.util.*;

public class Main {
    public static int binarySearch(int[] arr, int target) {
        // Your code here
        return -1;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().replaceAll("[\\\\[\\\\]]", "");
        int target = sc.nextInt();
        
        int[] arr = Arrays.stream(line.split(",")).mapToInt(s -> Integer.parseInt(s.trim())).toArray();
        System.out.println(binarySearch(arr, target));
    }
}`,
    cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

int binarySearch(vector<int>& arr, int target) {
    // Your code here
    return -1;
}

int main() {
    string line;
    getline(cin, line);
    line = line.substr(1, line.size() - 2);
    
    vector<int> arr;
    stringstream ss(line);
    string token;
    while (getline(ss, token, ',')) {
        arr.push_back(stoi(token));
    }
    
    int target;
    cin >> target;
    
    cout << binarySearch(arr, target) << endl;
    return 0;
}`,
    c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int binarySearch(int* arr, int size, int target) {
    // Your code here
    return -1;
}

int main() {
    char line[10000];
    fgets(line, sizeof(line), stdin);
    
    int arr[1000], size = 0, target;
    char* token = strtok(line + 1, ",]");
    while (token) {
        arr[size++] = atoi(token);
        token = strtok(NULL, ",]");
    }
    
    scanf("%d", &target);
    printf("%d\\n", binarySearch(arr, size, target));
    return 0;
}`
  },

  countVowels: {
    python: `def countVowels(s):
    """
    Count the number of vowels in a string.
    
    Args:
        s: Input string
    
    Returns:
        Number of vowels (a, e, i, o, u - case insensitive)
    """
    # Your code here
    pass

s = input().strip()
print(countVowels(s))`,
    javascript: `function countVowels(s) {
    // Your code here
    return 0;
}

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', (line) => {
    console.log(countVowels(line.trim()));
    rl.close();
});`,
    java: `import java.util.Scanner;

public class Main {
    public static int countVowels(String s) {
        // Your code here
        return 0;
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        System.out.println(countVowels(s));
    }
}`,
    cpp: `#include <iostream>
#include <string>
using namespace std;

int countVowels(string s) {
    // Your code here
    return 0;
}

int main() {
    string s;
    getline(cin, s);
    cout << countVowels(s) << endl;
    return 0;
}`,
    c: `#include <stdio.h>
#include <string.h>
#include <ctype.h>

int countVowels(char* s) {
    // Your code here
    return 0;
}

int main() {
    char s[1000];
    fgets(s, sizeof(s), stdin);
    s[strcspn(s, "\\n")] = 0;
    printf("%d\\n", countVowels(s));
    return 0;
}`
  }
};

// Problem Database
export const PROBLEMS = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORIES.ARRAYS,
    tags: ['Array', 'Hash Table'],
    companies: ['Google', 'Amazon', 'Facebook', 'Microsoft'],
    acceptanceRate: 49.1,
    likes: 45892,
    dislikes: 1523,
    description: `Given an array of integers \`nums\` and an integer \`target\`, return **indices of the two numbers** such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: '[2,7,11,15]\n9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: '[3,2,4]\n6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
      },
      {
        input: '[3,3]\n6',
        output: '[0,1]',
        explanation: 'nums[0] + nums[1] = 3 + 3 = 6'
      }
    ],
    constraints: [
      '2 ≤ nums.length ≤ 10⁴',
      '-10⁹ ≤ nums[i] ≤ 10⁹',
      '-10⁹ ≤ target ≤ 10⁹',
      'Only one valid answer exists'
    ],
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false },
      { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isHidden: false },
      { input: '[3,3]\n6', expectedOutput: '[0,1]', isHidden: false },
      { input: '[1,2,3,4,5]\n9', expectedOutput: '[3,4]', isHidden: true },
      { input: '[-1,-2,-3,-4,-5]\n-8', expectedOutput: '[2,4]', isHidden: true }
    ],
    templates: TEMPLATES.twoSum,
    hints: [
      'A brute force approach would be O(n²). Can you do better?',
      'Try using a hash map to store values you\'ve seen.',
      'For each number, check if (target - number) exists in the hash map.'
    ],
    solution: {
      python: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
      javascript: `function twoSum(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (seen.has(complement)) {
            return [seen.get(complement), i];
        }
        seen.set(nums[i], i);
    }
    return [];
}`
    }
  },

  {
    id: 'reverse-string',
    title: 'Reverse String',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORIES.STRINGS,
    tags: ['String', 'Two Pointers'],
    companies: ['Amazon', 'Microsoft', 'Apple'],
    acceptanceRate: 75.3,
    likes: 6234,
    dislikes: 891,
    description: `Write a function that reverses a string. The input string is given as a string.

You must do this by modifying the input string **in-place** with O(1) extra memory (conceptually).`,
    examples: [
      {
        input: 'hello',
        output: 'olleh',
        explanation: 'The string is reversed character by character.'
      },
      {
        input: 'Hannah',
        output: 'hannaH',
        explanation: 'Note that the case is preserved.'
      }
    ],
    constraints: [
      '1 ≤ s.length ≤ 10⁵',
      's consists of printable ASCII characters'
    ],
    testCases: [
      { input: 'hello', expectedOutput: 'olleh', isHidden: false },
      { input: 'Hannah', expectedOutput: 'hannaH', isHidden: false },
      { input: 'a', expectedOutput: 'a', isHidden: false },
      { input: 'ab', expectedOutput: 'ba', isHidden: true },
      { input: 'programming', expectedOutput: 'gnimmargorp', isHidden: true }
    ],
    templates: TEMPLATES.reverseString,
    hints: [
      'Try using two pointers - one at the start and one at the end.',
      'Swap characters at both pointers and move them towards the center.',
      'In Python, you can use slicing: s[::-1]'
    ],
    solution: {
      python: `def reverseString(s):
    return s[::-1]`,
      javascript: `function reverseString(s) {
    return s.split('').reverse().join('');
}`
    }
  },

  {
    id: 'fibonacci',
    title: 'Fibonacci Number',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORIES.RECURSION,
    tags: ['Math', 'Recursion', 'Dynamic Programming'],
    companies: ['Google', 'Amazon', 'Facebook'],
    acceptanceRate: 68.2,
    likes: 5423,
    dislikes: 234,
    description: `The **Fibonacci numbers**, commonly denoted \`F(n)\` form a sequence, called the **Fibonacci sequence**, such that each number is the sum of the two preceding ones, starting from 0 and 1. That is,

\`\`\`
F(0) = 0, F(1) = 1
F(n) = F(n - 1) + F(n - 2), for n > 1
\`\`\`

Given \`n\`, calculate \`F(n)\`.`,
    examples: [
      {
        input: '2',
        output: '1',
        explanation: 'F(2) = F(1) + F(0) = 1 + 0 = 1.'
      },
      {
        input: '3',
        output: '2',
        explanation: 'F(3) = F(2) + F(1) = 1 + 1 = 2.'
      },
      {
        input: '4',
        output: '3',
        explanation: 'F(4) = F(3) + F(2) = 2 + 1 = 3.'
      }
    ],
    constraints: [
      '0 ≤ n ≤ 30'
    ],
    testCases: [
      { input: '0', expectedOutput: '0', isHidden: false },
      { input: '1', expectedOutput: '1', isHidden: false },
      { input: '2', expectedOutput: '1', isHidden: false },
      { input: '10', expectedOutput: '55', isHidden: true },
      { input: '20', expectedOutput: '6765', isHidden: true }
    ],
    templates: TEMPLATES.fibonacci,
    hints: [
      'Start with the base cases: F(0) = 0, F(1) = 1.',
      'You can solve this recursively, but it\'s inefficient.',
      'Try using memoization or iterative approach for O(n) time complexity.'
    ],
    solution: {
      python: `def fibonacci(n):
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b`,
      javascript: `function fibonacci(n) {
    if (n <= 1) return n;
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
        [a, b] = [b, a + b];
    }
    return b;
}`
    }
  },

  {
    id: 'palindrome',
    title: 'Valid Palindrome',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORIES.STRINGS,
    tags: ['String', 'Two Pointers'],
    companies: ['Facebook', 'Microsoft', 'Apple'],
    acceptanceRate: 43.5,
    likes: 7123,
    dislikes: 6234,
    description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string \`s\`, return \`true\` if it is a **palindrome**, or \`false\` otherwise.`,
    examples: [
      {
        input: 'A man a plan a canal Panama',
        output: 'true',
        explanation: '"amanaplanacanalpanama" is a palindrome.'
      },
      {
        input: 'race a car',
        output: 'false',
        explanation: '"raceacar" is not a palindrome.'
      },
      {
        input: ' ',
        output: 'true',
        explanation: 'After removing non-alphanumeric characters, it\'s an empty string, which is a palindrome.'
      }
    ],
    constraints: [
      '1 ≤ s.length ≤ 2 × 10⁵',
      's consists only of printable ASCII characters'
    ],
    testCases: [
      { input: 'racecar', expectedOutput: 'true', isHidden: false },
      { input: 'hello', expectedOutput: 'false', isHidden: false },
      { input: 'a', expectedOutput: 'true', isHidden: false },
      { input: 'Was it a car or a cat I saw', expectedOutput: 'true', isHidden: true },
      { input: 'No lemon no melon', expectedOutput: 'true', isHidden: true }
    ],
    templates: TEMPLATES.isPalindrome,
    hints: [
      'First, clean the string by removing non-alphanumeric characters.',
      'Convert to lowercase for case-insensitive comparison.',
      'Use two pointers to compare from both ends.'
    ],
    solution: {
      python: `def isPalindrome(s):
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]`,
      javascript: `function isPalindrome(s) {
    const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned === cleaned.split('').reverse().join('');
}`
    }
  },

  {
    id: 'max-subarray',
    title: 'Maximum Subarray',
    difficulty: DIFFICULTY.MEDIUM,
    category: CATEGORIES.DYNAMIC_PROGRAMMING,
    tags: ['Array', 'Dynamic Programming', 'Divide and Conquer'],
    companies: ['Amazon', 'Microsoft', 'LinkedIn', 'Apple'],
    acceptanceRate: 50.1,
    likes: 28456,
    dislikes: 1234,
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

A **subarray** is a contiguous non-empty sequence of elements within an array.`,
    examples: [
      {
        input: '[-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: 'The subarray [4,-1,2,1] has the largest sum 6.'
      },
      {
        input: '[1]',
        output: '1',
        explanation: 'The subarray [1] has the largest sum 1.'
      },
      {
        input: '[5,4,-1,7,8]',
        output: '23',
        explanation: 'The subarray [5,4,-1,7,8] has the largest sum 23.'
      }
    ],
    constraints: [
      '1 ≤ nums.length ≤ 10⁵',
      '-10⁴ ≤ nums[i] ≤ 10⁴'
    ],
    testCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6', isHidden: false },
      { input: '[1]', expectedOutput: '1', isHidden: false },
      { input: '[5,4,-1,7,8]', expectedOutput: '23', isHidden: false },
      { input: '[-1]', expectedOutput: '-1', isHidden: true },
      { input: '[-2,-1]', expectedOutput: '-1', isHidden: true }
    ],
    templates: TEMPLATES.maxSubarray,
    hints: [
      'Think about Kadane\'s algorithm.',
      'At each position, decide: should I add to the current subarray, or start fresh?',
      'Keep track of both current sum and maximum sum seen so far.'
    ],
    solution: {
      python: `def maxSubArray(nums):
    max_sum = current_sum = nums[0]
    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    return max_sum`,
      javascript: `function maxSubArray(nums) {
    let maxSum = nums[0];
    let currentSum = nums[0];
    for (let i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    return maxSum;
}`
    }
  },

  {
    id: 'factorial',
    title: 'Factorial',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORIES.MATH,
    tags: ['Math', 'Recursion'],
    companies: ['Google', 'Amazon'],
    acceptanceRate: 72.1,
    likes: 3421,
    dislikes: 156,
    description: `Given a non-negative integer \`n\`, return the factorial of \`n\`.

The factorial of \`n\` (denoted as \`n!\`) is the product of all positive integers less than or equal to \`n\`.

\`\`\`
n! = n × (n-1) × (n-2) × ... × 2 × 1
0! = 1 (by definition)
\`\`\``,
    examples: [
      {
        input: '5',
        output: '120',
        explanation: '5! = 5 × 4 × 3 × 2 × 1 = 120'
      },
      {
        input: '0',
        output: '1',
        explanation: '0! = 1 by definition.'
      },
      {
        input: '3',
        output: '6',
        explanation: '3! = 3 × 2 × 1 = 6'
      }
    ],
    constraints: [
      '0 ≤ n ≤ 20'
    ],
    testCases: [
      { input: '0', expectedOutput: '1', isHidden: false },
      { input: '1', expectedOutput: '1', isHidden: false },
      { input: '5', expectedOutput: '120', isHidden: false },
      { input: '10', expectedOutput: '3628800', isHidden: true },
      { input: '12', expectedOutput: '479001600', isHidden: true }
    ],
    templates: TEMPLATES.factorial,
    hints: [
      'Base case: 0! = 1',
      'Recursive case: n! = n × (n-1)!',
      'An iterative solution with a loop is also valid.'
    ],
    solution: {
      python: `def factorial(n):
    if n <= 1:
        return 1
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result`,
      javascript: `function factorial(n) {
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}`
    }
  },

  {
    id: 'is-prime',
    title: 'Check Prime Number',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORIES.MATH,
    tags: ['Math', 'Number Theory'],
    companies: ['Amazon', 'Microsoft'],
    acceptanceRate: 55.3,
    likes: 2134,
    dislikes: 345,
    description: `Given a positive integer \`n\`, determine if it is a **prime number**.

A **prime number** is a natural number greater than 1 that has no positive divisors other than 1 and itself.`,
    examples: [
      {
        input: '7',
        output: 'true',
        explanation: '7 is only divisible by 1 and 7, so it\'s prime.'
      },
      {
        input: '4',
        output: 'false',
        explanation: '4 = 2 × 2, so it\'s not prime.'
      },
      {
        input: '1',
        output: 'false',
        explanation: '1 is not considered a prime number.'
      }
    ],
    constraints: [
      '1 ≤ n ≤ 10⁶'
    ],
    testCases: [
      { input: '2', expectedOutput: 'true', isHidden: false },
      { input: '17', expectedOutput: 'true', isHidden: false },
      { input: '4', expectedOutput: 'false', isHidden: false },
      { input: '97', expectedOutput: 'true', isHidden: true },
      { input: '100', expectedOutput: 'false', isHidden: true }
    ],
    templates: TEMPLATES.isPrime,
    hints: [
      '1 is not a prime number.',
      '2 is the only even prime number.',
      'You only need to check divisibility up to √n.'
    ],
    solution: {
      python: `def isPrime(n):
    if n <= 1:
        return False
    if n <= 3:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
    return True`,
      javascript: `function isPrime(n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    for (let i = 5; i * i <= n; i += 6) {
        if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
}`
    }
  },

  {
    id: 'merge-sorted-arrays',
    title: 'Merge Sorted Arrays',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORIES.ARRAYS,
    tags: ['Array', 'Two Pointers', 'Sorting'],
    companies: ['Facebook', 'Microsoft', 'Bloomberg'],
    acceptanceRate: 45.2,
    likes: 9234,
    dislikes: 967,
    description: `You are given two integer arrays \`nums1\` and \`nums2\`, sorted in **non-decreasing order**.

Merge \`nums1\` and \`nums2\` into a single array sorted in **non-decreasing order** and return it.`,
    examples: [
      {
        input: '[1,2,4]\n[1,3,4]',
        output: '[1,1,2,3,4,4]',
        explanation: 'The arrays are merged and sorted.'
      },
      {
        input: '[1]\n[]',
        output: '[1]',
        explanation: 'The result is the non-empty array.'
      }
    ],
    constraints: [
      '0 ≤ nums1.length, nums2.length ≤ 200',
      '-10⁹ ≤ nums1[i], nums2[j] ≤ 10⁹',
      'Both arrays are sorted in non-decreasing order'
    ],
    testCases: [
      { input: '[1,2,4]\n[1,3,4]', expectedOutput: '[1, 1, 2, 3, 4, 4]', isHidden: false },
      { input: '[1]\n[]', expectedOutput: '[1]', isHidden: false },
      { input: '[]\n[1]', expectedOutput: '[1]', isHidden: false },
      { input: '[1,3,5,7]\n[2,4,6,8]', expectedOutput: '[1, 2, 3, 4, 5, 6, 7, 8]', isHidden: true }
    ],
    templates: TEMPLATES.mergeSortedArrays,
    hints: [
      'Use two pointers, one for each array.',
      'Compare elements at both pointers and add the smaller one.',
      'Don\'t forget to add remaining elements after one array is exhausted.'
    ],
    solution: {
      python: `def mergeSortedArrays(arr1, arr2):
    result = []
    i, j = 0, 0
    while i < len(arr1) and j < len(arr2):
        if arr1[i] <= arr2[j]:
            result.append(arr1[i])
            i += 1
        else:
            result.append(arr2[j])
            j += 1
    result.extend(arr1[i:])
    result.extend(arr2[j:])
    return result`,
      javascript: `function mergeSortedArrays(arr1, arr2) {
    const result = [];
    let i = 0, j = 0;
    while (i < arr1.length && j < arr2.length) {
        if (arr1[i] <= arr2[j]) {
            result.push(arr1[i++]);
        } else {
            result.push(arr2[j++]);
        }
    }
    return result.concat(arr1.slice(i), arr2.slice(j));
}`
    }
  },

  {
    id: 'binary-search',
    title: 'Binary Search',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORIES.SEARCHING,
    tags: ['Array', 'Binary Search'],
    companies: ['Google', 'Amazon', 'Microsoft', 'Facebook'],
    acceptanceRate: 55.8,
    likes: 8234,
    dislikes: 178,
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with **O(log n)** runtime complexity.`,
    examples: [
      {
        input: '[-1,0,3,5,9,12]\n9',
        output: '4',
        explanation: '9 exists in nums and its index is 4.'
      },
      {
        input: '[-1,0,3,5,9,12]\n2',
        output: '-1',
        explanation: '2 does not exist in nums so return -1.'
      }
    ],
    constraints: [
      '1 ≤ nums.length ≤ 10⁴',
      '-10⁴ < nums[i], target < 10⁴',
      'All elements in nums are unique',
      'nums is sorted in ascending order'
    ],
    testCases: [
      { input: '[-1,0,3,5,9,12]\n9', expectedOutput: '4', isHidden: false },
      { input: '[-1,0,3,5,9,12]\n2', expectedOutput: '-1', isHidden: false },
      { input: '[5]\n5', expectedOutput: '0', isHidden: false },
      { input: '[1,2,3,4,5,6,7,8,9,10]\n7', expectedOutput: '6', isHidden: true },
      { input: '[2,5]\n5', expectedOutput: '1', isHidden: true }
    ],
    templates: TEMPLATES.binarySearch,
    hints: [
      'Use two pointers: left and right.',
      'Calculate mid point and compare with target.',
      'If target is smaller, search left half; if larger, search right half.'
    ],
    solution: {
      python: `def binarySearch(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
      javascript: `function binarySearch(arr, target) {
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`
    }
  },

  {
    id: 'count-vowels',
    title: 'Count Vowels',
    difficulty: DIFFICULTY.EASY,
    category: CATEGORIES.STRINGS,
    tags: ['String', 'Counting'],
    companies: ['Amazon', 'Google'],
    acceptanceRate: 78.5,
    likes: 1234,
    dislikes: 56,
    description: `Given a string \`s\`, return the number of vowels in the string.

Vowels are: **a, e, i, o, u** (both uppercase and lowercase count).`,
    examples: [
      {
        input: 'hello',
        output: '2',
        explanation: 'The vowels are "e" and "o".'
      },
      {
        input: 'AEIOU',
        output: '5',
        explanation: 'All uppercase vowels are counted.'
      },
      {
        input: 'rhythm',
        output: '0',
        explanation: 'No vowels in this word.'
      }
    ],
    constraints: [
      '1 ≤ s.length ≤ 10⁵',
      's consists of English letters only'
    ],
    testCases: [
      { input: 'hello', expectedOutput: '2', isHidden: false },
      { input: 'AEIOU', expectedOutput: '5', isHidden: false },
      { input: 'rhythm', expectedOutput: '0', isHidden: false },
      { input: 'Programming', expectedOutput: '3', isHidden: true },
      { input: 'aEiOu', expectedOutput: '5', isHidden: true }
    ],
    templates: TEMPLATES.countVowels,
    hints: [
      'Create a set of vowels for O(1) lookup.',
      'Convert each character to lowercase for easy comparison.',
      'Count how many characters are in the vowel set.'
    ],
    solution: {
      python: `def countVowels(s):
    vowels = set('aeiouAEIOU')
    return sum(1 for c in s if c in vowels)`,
      javascript: `function countVowels(s) {
    const vowels = new Set('aeiouAEIOU');
    return [...s].filter(c => vowels.has(c)).length;
}`
    }
  }
];

// Helper functions
export const getProblemById = (id) => PROBLEMS.find(p => p.id === id);

export const getProblemsByDifficulty = (difficulty) => 
  PROBLEMS.filter(p => p.difficulty === difficulty);

export const getProblemsByCategory = (category) => 
  PROBLEMS.filter(p => p.category === category);

export const getProblemsCount = () => ({
  total: PROBLEMS.length,
  easy: getProblemsByDifficulty(DIFFICULTY.EASY).length,
  medium: getProblemsByDifficulty(DIFFICULTY.MEDIUM).length,
  hard: getProblemsByDifficulty(DIFFICULTY.HARD).length
});

export default PROBLEMS;
