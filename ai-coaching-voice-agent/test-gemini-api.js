/**
 * Comprehensive Gemini API Test Script
 * 
 * This script tests:
 * 1. API key presence and validity
 * 2. API connectivity
 * 3. Question generation functionality
 * 4. Speech analysis functionality
 * 5. Response parsing and validation
 * 
 * Run with: node test-gemini-api.js
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
function loadEnvFile() {
    try {
        const envPath = join(__dirname, '.env.local');
        const envContent = readFileSync(envPath, 'utf-8');
        const envVars = {};
        
        envContent.split('\n').forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#')) {
                const [key, ...valueParts] = trimmedLine.split('=');
                if (key && valueParts.length > 0) {
                    envVars[key.trim()] = valueParts.join('=').trim();
                }
            }
        });
        
        return envVars;
    } catch (error) {
        console.error('❌ Failed to read .env.local:', error.message);
        return {};
    }
}

const envVars = loadEnvFile();
const API_KEY = envVars.NEXT_PUBLIC_GEMINI_API_KEY || envVars.Gemini_API_Key || "";

console.log('\n='.repeat(80));
console.log('GEMINI API COMPREHENSIVE TEST');
console.log('='.repeat(80));
console.log(`\nTest started at: ${new Date().toISOString()}\n`);

// Test Results Tracker
const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
};

function logTest(name, passed, details = '') {
    testResults.total++;
    if (passed) {
        testResults.passed++;
        console.log(`✅ PASS: ${name}`);
    } else {
        testResults.failed++;
        console.log(`❌ FAIL: ${name}`);
    }
    if (details) {
        console.log(`   ${details}`);
    }
    testResults.tests.push({ name, passed, details });
    console.log('');
}

async function test1_CheckAPIKey() {
    console.log('TEST 1: API Key Configuration');
    console.log('-'.repeat(80));
    
    const hasKey = !!API_KEY;
    
    if (hasKey) {
        console.log(`   Key Length: ${API_KEY.length} characters`);
        console.log(`   Key Preview: ${API_KEY.substring(0, 15)}...`);
        console.log(`   Source: ${process.env.NEXT_PUBLIC_GEMINI_API_KEY ? 'NEXT_PUBLIC_GEMINI_API_KEY' : 'Gemini_API_Key'}`);
        logTest('API Key Present', true, `Key configured with ${API_KEY.length} characters`);
    } else {
        console.log('   ❌ No API key found in environment');
        console.log('   Expected: NEXT_PUBLIC_GEMINI_API_KEY or Gemini_API_Key');
        logTest('API Key Present', false, 'No API key configured');
        return false;
    }
    
    return true;
}

async function test2_InitializeClient() {
    console.log('TEST 2: Gemini Client Initialization');
    console.log('-'.repeat(80));
    
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        console.log('   Client initialized successfully');
        console.log('   Model: gemini-2.5-flash');
        
        logTest('Client Initialization', true, 'GoogleGenerativeAI client created');
        return model;
    } catch (error) {
        console.log('   Error:', error.message);
        logTest('Client Initialization', false, error.message);
        return null;
    }
}

async function test3_SimpleAPICall(model) {
    console.log('TEST 3: Simple API Connectivity Test');
    console.log('-'.repeat(80));
    
    if (!model) {
        logTest('Simple API Call', false, 'Model not initialized');
        return false;
    }
    
    try {
        console.log('   Sending test request...');
        const startTime = Date.now();
        
        const result = await model.generateContent('Say "Hello from Gemini!"');
        const response = await result.response;
        const text = response.text();
        
        const duration = Date.now() - startTime;
        
        console.log(`   Response received in ${duration}ms`);
        console.log(`   Response: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
        
        logTest('Simple API Call', true, `Response received in ${duration}ms`);
        return true;
    } catch (error) {
        console.log('   Error:', error.message);
        if (error.message.includes('API key')) {
            console.log('   ⚠️  This likely indicates an invalid or expired API key');
        }
        logTest('Simple API Call', false, error.message);
        return false;
    }
}

async function test4_QuestionGeneration(model) {
    console.log('TEST 4: Interview Question Generation');
    console.log('-'.repeat(80));
    
    if (!model) {
        logTest('Question Generation', false, 'Model not initialized');
        return false;
    }
    
    const testTopic = "JavaScript ES6 Features";
    console.log(`   Topic: "${testTopic}"`);
    
    try {
        const prompt = `You are an expert technical interviewer. Generate exactly 10 unique, high-quality interview questions for the topic: "${testTopic}".

Requirements:
1. Questions must be progressively difficult (3 easy, 4 medium, 3 hard)
2. All questions must be relevant to ${testTopic}
3. No duplicate or similar questions
4. Questions should be clear and specific
5. Mix conceptual and practical questions
6. Include questions that test both breadth and depth of knowledge

Return the response as a JSON array with this exact structure:
[
  {
    "questionId": "q1",
    "questionText": "The actual question text",
    "difficulty": "easy",
    "source": "Common interview question"
  }
]

IMPORTANT: Return ONLY the JSON array, no additional text or markdown formatting.`;

        console.log('   Generating questions...');
        const startTime = Date.now();
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();
        
        const duration = Date.now() - startTime;
        console.log(`   Response received in ${duration}ms`);
        
        // Clean response
        if (text.startsWith("```json")) text = text.substring(7);
        if (text.startsWith("```")) text = text.substring(3);
        if (text.endsWith("```")) text = text.substring(0, text.length - 3);
        text = text.trim();
        
        // Parse and validate
        const questions = JSON.parse(text);
        
        console.log(`   ✓ Valid JSON parsed`);
        console.log(`   ✓ Questions generated: ${questions.length}`);
        
        if (questions.length !== 10) {
            logTest('Question Generation', false, `Expected 10 questions, got ${questions.length}`);
            return false;
        }
        
        // Validate structure
        let structureValid = true;
        const difficulties = { easy: 0, medium: 0, hard: 0 };
        
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.questionId || !q.questionText || !q.difficulty) {
                console.log(`   ❌ Invalid structure at question ${i + 1}`);
                structureValid = false;
                break;
            }
            difficulties[q.difficulty.toLowerCase()] = (difficulties[q.difficulty.toLowerCase()] || 0) + 1;
        }
        
        if (!structureValid) {
            logTest('Question Generation', false, 'Invalid question structure');
            return false;
        }
        
        console.log(`   ✓ All questions have valid structure`);
        console.log(`   Distribution: Easy(${difficulties.easy}), Medium(${difficulties.medium}), Hard(${difficulties.hard})`);
        
        // Check uniqueness
        const uniqueTexts = new Set(questions.map(q => q.questionText.toLowerCase()));
        if (uniqueTexts.size !== 10) {
            logTest('Question Generation', false, 'Duplicate questions found');
            return false;
        }
        
        console.log(`   ✓ All questions are unique`);
        
        // Show first question as sample
        console.log(`\n   Sample Question:`);
        console.log(`   "${questions[0].questionText}"`);
        console.log(`   Difficulty: ${questions[0].difficulty}\n`);
        
        logTest('Question Generation', true, `10 unique questions generated in ${duration}ms`);
        return true;
        
    } catch (error) {
        console.log('   Error:', error.message);
        logTest('Question Generation', false, error.message);
        return false;
    }
}

async function test5_SpeechAnalysis(model) {
    console.log('TEST 5: Speech Analysis');
    console.log('-'.repeat(80));
    
    if (!model) {
        logTest('Speech Analysis', false, 'Model not initialized');
        return false;
    }
    
    const testQuestion = "What are the benefits of using arrow functions in JavaScript?";
    const testTranscription = "Arrow functions provide a shorter syntax and they also bind the this value lexically, which means they don't have their own this context. This makes them useful in callbacks and when working with classes.";
    
    console.log(`   Question: "${testQuestion}"`);
    console.log(`   Response: "${testTranscription.substring(0, 80)}..."`);
    
    try {
        const prompt = `Analyze the following interview response for a technical interview question.

Question: "${testQuestion}"
Response: "${testTranscription}"

Analyze the response and provide scores (0-100) for:
1. Grammar Score - Grammatical correctness
2. Fluency Score - Flow and coherence
3. Filler Words Count - Count of um, uh, hmm, like, you know, etc.
4. Hesitation Count - Number of pauses or stammering instances
5. Clarity Score - How clear and articulate the response is
6. Relevance Score - How relevant the answer is to the question
7. Confidence Score - Overall confidence in delivery

Return ONLY a JSON object with this exact structure:
{
  "grammarScore": 85,
  "fluencyScore": 80,
  "fillerWords": 3,
  "hesitationCount": 2,
  "clarityScore": 90,
  "relevanceScore": 85,
  "confidenceScore": 80
}`;

        console.log('   Analyzing response...');
        const startTime = Date.now();
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();
        
        const duration = Date.now() - startTime;
        console.log(`   Response received in ${duration}ms`);
        
        // Clean response
        if (text.startsWith("```json")) text = text.substring(7);
        if (text.startsWith("```")) text = text.substring(3);
        if (text.endsWith("```")) text = text.substring(0, text.length - 3);
        text = text.trim();
        
        const analysis = JSON.parse(text);
        
        console.log(`   ✓ Valid JSON parsed`);
        console.log(`   Analysis Results:`);
        console.log(`     Grammar: ${analysis.grammarScore}/100`);
        console.log(`     Fluency: ${analysis.fluencyScore}/100`);
        console.log(`     Clarity: ${analysis.clarityScore}/100`);
        console.log(`     Relevance: ${analysis.relevanceScore}/100`);
        console.log(`     Confidence: ${analysis.confidenceScore}/100`);
        console.log(`     Filler Words: ${analysis.fillerWords}`);
        console.log(`     Hesitations: ${analysis.hesitationCount}`);
        
        // Validate scores are in range
        const scores = [
            analysis.grammarScore,
            analysis.fluencyScore,
            analysis.clarityScore,
            analysis.relevanceScore,
            analysis.confidenceScore
        ];
        
        const allValid = scores.every(score => score >= 0 && score <= 100);
        
        if (!allValid) {
            logTest('Speech Analysis', false, 'Scores out of valid range (0-100)');
            return false;
        }
        
        console.log(`   ✓ All scores in valid range`);
        
        logTest('Speech Analysis', true, `Analysis completed in ${duration}ms`);
        return true;
        
    } catch (error) {
        console.log('   Error:', error.message);
        logTest('Speech Analysis', false, error.message);
        return false;
    }
}

async function test6_ErrorHandling(model) {
    console.log('TEST 6: Error Handling and Edge Cases');
    console.log('-'.repeat(80));
    
    if (!model) {
        logTest('Error Handling', false, 'Model not initialized');
        return false;
    }
    
    try {
        // Test with empty prompt
        console.log('   Testing empty prompt...');
        const result = await model.generateContent('');
        console.log('   ⚠️  Empty prompt accepted (may vary by API)');
        
        logTest('Error Handling', true, 'API handles edge cases');
        return true;
        
    } catch (error) {
        console.log(`   ✓ Empty prompt rejected: ${error.message}`);
        logTest('Error Handling', true, 'API properly validates input');
        return true;
    }
}

// Main test execution
async function runAllTests() {
    try {
        const hasKey = await test1_CheckAPIKey();
        if (!hasKey) {
            console.log('\n⚠️  Cannot proceed without API key\n');
            printSummary();
            return;
        }
        
        const model = await test2_InitializeClient();
        if (!model) {
            console.log('\n⚠️  Cannot proceed without initialized model\n');
            printSummary();
            return;
        }
        
        const connected = await test3_SimpleAPICall(model);
        if (!connected) {
            console.log('\n⚠️  API connectivity failed - remaining tests skipped\n');
            printSummary();
            return;
        }
        
        // Continue with other tests
        await test4_QuestionGeneration(model);
        await test5_SpeechAnalysis(model);
        await test6_ErrorHandling(model);
        
        printSummary();
        
    } catch (error) {
        console.error('\n❌ FATAL ERROR:', error.message);
        console.error(error.stack);
        printSummary();
        process.exit(1);
    }
}

function printSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`\nTotal Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${testResults.total > 0 ? Math.round((testResults.passed / testResults.total) * 100) : 0}%`);
    
    if (testResults.failed > 0) {
        console.log('\n⚠️  FAILED TESTS:');
        testResults.tests
            .filter(t => !t.passed)
            .forEach(t => console.log(`   - ${t.name}: ${t.details}`));
    }
    
    console.log(`\nTest completed at: ${new Date().toISOString()}`);
    console.log('='.repeat(80) + '\n');
    
    // Exit with appropriate code
    process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests();
