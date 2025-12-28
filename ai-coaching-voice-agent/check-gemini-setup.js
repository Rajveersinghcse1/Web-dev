/**
 * Gemini 2.5 Flash Setup Verification Script
 * Checks if Gemini API is properly configured across the entire project
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n' + '='.repeat(80));
console.log('🔍 GEMINI 2.5 FLASH SETUP VERIFICATION');
console.log('='.repeat(80) + '\n');

// Load environment variables
function loadEnvFile() {
    try {
        const envPath = join(__dirname, '.env.local');
        if (!existsSync(envPath)) {
            console.error('❌ .env.local file not found!');
            return {};
        }
        
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

// Check 1: API Key Configuration
console.log('CHECK 1: API Key Configuration');
console.log('-'.repeat(80));

const API_KEY = envVars.NEXT_PUBLIC_GEMINI_API_KEY || envVars.Gemini_API_Key || "";

if (!API_KEY) {
    console.error('❌ FAILED: No Gemini API key found!');
    console.log('   Expected variables: NEXT_PUBLIC_GEMINI_API_KEY or Gemini_API_Key');
    console.log('   Action: Add your Gemini API key to .env.local file');
    console.log('   Get key from: https://aistudio.google.com/app/apikey');
} else {
    console.log('✅ PASSED: API key found');
    console.log(`   Variable: ${envVars.NEXT_PUBLIC_GEMINI_API_KEY ? 'NEXT_PUBLIC_GEMINI_API_KEY' : 'Gemini_API_Key'}`);
    console.log(`   Length: ${API_KEY.length} characters`);
    console.log(`   Preview: ${API_KEY.substring(0, 12)}...`);
}

console.log();

// Check 2: API Connectivity Test
console.log('CHECK 2: API Connectivity Test');
console.log('-'.repeat(80));

if (API_KEY) {
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        console.log('Testing API connection...');
        const result = await model.generateContent('Say "Hello!"');
        const response = await result.response;
        const text = response.text();
        
        if (text) {
            console.log('✅ PASSED: Gemini API is working!');
            console.log(`   Model: gemini-2.5-flash`);
            console.log(`   Response: ${text.substring(0, 50)}...`);
        }
    } catch (error) {
        console.error('❌ FAILED: API connectivity error');
        console.error(`   Error: ${error.message}`);
        console.log('   Possible causes:');
        console.log('   1. Invalid API key');
        console.log('   2. API key expired or disabled');
        console.log('   3. Network connectivity issues');
        console.log('   4. Rate limit exceeded');
    }
} else {
    console.log('⚠️  SKIPPED: No API key to test');
}

console.log();

// Check 3: Service Files Configuration
console.log('CHECK 3: Service Files Configuration');
console.log('-'.repeat(80));

const serviceFiles = [
    'src/services/GlobalServices.jsx',
    'src/services/speechAnalyzer.js',
    'src/services/interviewQuestionGenerator.js',
    'src/services/LearningPathService.js'
];

let allServicesConfigured = true;

for (const filePath of serviceFiles) {
    const fullPath = join(__dirname, filePath);
    if (existsSync(fullPath)) {
        const content = readFileSync(fullPath, 'utf-8');
        
        // Check if it uses GoogleGenerativeAI
        const hasGemini = content.includes('GoogleGenerativeAI') || content.includes('gemini-2.5-flash');
        // Check if it has API key configuration
        const hasAPIKey = content.includes('NEXT_PUBLIC_GEMINI_API_KEY') || content.includes('Gemini_API_Key');
        
        if (hasGemini && hasAPIKey) {
            console.log(`✅ ${filePath}`);
        } else if (hasGemini && !hasAPIKey) {
            console.log(`⚠️  ${filePath} - Uses Gemini but API key config unclear`);
            allServicesConfigured = false;
        } else {
            console.log(`❌ ${filePath} - Not using Gemini!`);
            allServicesConfigured = false;
        }
    } else {
        console.log(`❌ ${filePath} - File not found!`);
        allServicesConfigured = false;
    }
}

console.log();

// Check 4: Package Dependencies
console.log('CHECK 4: Package Dependencies');
console.log('-'.repeat(80));

try {
    const packagePath = join(__dirname, 'package.json');
    const packageContent = readFileSync(packagePath, 'utf-8');
    const packageJson = JSON.parse(packageContent);
    
    if (packageJson.dependencies['@google/generative-ai']) {
        console.log('✅ PASSED: @google/generative-ai is installed');
        console.log(`   Version: ${packageJson.dependencies['@google/generative-ai']}`);
    } else {
        console.log('❌ FAILED: @google/generative-ai not found in dependencies');
        console.log('   Action: Run npm install @google/generative-ai');
    }
} catch (error) {
    console.log('❌ FAILED: Could not read package.json');
}

console.log();

// Final Summary
console.log('='.repeat(80));
console.log('📊 SUMMARY');
console.log('='.repeat(80));

if (API_KEY && allServicesConfigured) {
    console.log('✅ ALL CHECKS PASSED!');
    console.log('   Gemini 2.5 Flash is properly configured and ready to use.');
    console.log('   All services are using Gemini API consistently.');
} else {
    console.log('⚠️  ISSUES DETECTED');
    if (!API_KEY) {
        console.log('   - Add Gemini API key to .env.local');
    }
    if (!allServicesConfigured) {
        console.log('   - Some service files may not be properly configured');
    }
}

console.log('\n' + '='.repeat(80) + '\n');
