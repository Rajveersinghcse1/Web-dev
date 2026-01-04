/**
 * Test script to verify Piston API integration
 * Tests all 5 languages with the "Add Two Numbers" problem
 */

const axios = require('axios');

const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

// Test cases for Add Two Numbers problem
const testCode = {
  python: `def addTwoNumbers(a, b):
    return a + b

# Test
print(addTwoNumbers(2, 3))`,
  
  javascript: `function addTwoNumbers(a, b) {
    return a + b;
}

// Test
console.log(addTwoNumbers(2, 3));`,
  
  java: `public class Solution {
    public static int addTwoNumbers(int a, int b) {
        return a + b;
    }
    
    public static void main(String[] args) {
        System.out.println(addTwoNumbers(2, 3));
    }
}`,
  
  cpp: `#include <iostream>
using namespace std;

int addTwoNumbers(int a, int b) {
    return a + b;
}

int main() {
    cout << addTwoNumbers(2, 3) << endl;
    return 0;
}`,
  
  c: `#include <stdio.h>

int addTwoNumbers(int a, int b) {
    return a + b;
}

int main() {
    printf("%d\\n", addTwoNumbers(2, 3));
    return 0;
}`
};

const languageVersions = {
  python: '3.10.0',
  javascript: '18.15.0',
  java: '15.0.2',
  cpp: '10.2.0',
  c: '10.2.0'
};

async function testPistonAPI() {
  console.log('🚀 Testing Piston API Integration\n');
  console.log('=' .repeat(60));
  
  for (const [language, code] of Object.entries(testCode)) {
    try {
      console.log(`\n📝 Testing ${language.toUpperCase()}...`);
      
      const response = await axios.post(`${PISTON_API_URL}/execute`, {
        language: language,
        version: languageVersions[language],
        files: [{
          name: language === 'java' ? 'Solution.java' : 
                language === 'cpp' ? 'solution.cpp' :
                language === 'c' ? 'solution.c' : 
                `solution.${language === 'javascript' ? 'js' : 'py'}`,
          content: code
        }]
      });
      
      if (response.data.run) {
        const output = response.data.run.stdout || '';
        const error = response.data.run.stderr || '';
        const exitCode = response.data.run.code;
        
        if (exitCode === 0 && output.trim() === '5') {
          console.log(`✅ ${language} - SUCCESS`);
          console.log(`   Output: ${output.trim()}`);
          console.log(`   Runtime: ${response.data.run.runtime || 'N/A'}ms`);
        } else {
          console.log(`❌ ${language} - FAILED`);
          console.log(`   Expected: 5, Got: ${output.trim()}`);
          if (error) console.log(`   Error: ${error}`);
        }
      } else {
        console.log(`❌ ${language} - No execution result`);
      }
      
    } catch (error) {
      console.log(`❌ ${language} - ERROR`);
      console.log(`   ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data: ${JSON.stringify(error.response.data)}`);
      }
    }
    
    // Rate limiting delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ Test Complete!');
}

// Run tests
testPistonAPI().catch(console.error);
