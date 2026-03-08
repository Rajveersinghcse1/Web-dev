#!/usr/bin/env node
/**
 * Convex Connection Test Script
 * Tests the full connectivity between frontend and Convex database
 */

const https = require('https');
const http = require('http');

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://bright-beagle-821.convex.cloud';

console.log('🔍 Testing Convex Database Connection...\n');
console.log(`📍 Convex URL: ${CONVEX_URL}\n`);

// Parse URL
const url = new URL(CONVEX_URL);
const isHttps = url.protocol === 'https:';
const client = isHttps ? https : http;

// Test 1: Basic connectivity
console.log('Test 1: Basic Connectivity');
console.log('━'.repeat(50));

const options = {
    hostname: url.hostname,
    port: url.port || (isHttps ? 443 : 80),
    path: '/',
    method: 'GET',
    timeout: 5000
};

const req = client.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log(`✅ Status Code: ${res.statusCode}`);
        console.log(`✅ Response: ${data.trim()}`);
        console.log('\n');
        
        // Test 2: Check for CORS headers
        console.log('Test 2: CORS Configuration');
        console.log('━'.repeat(50));
        const corsHeaders = {
            'access-control-allow-origin': res.headers['access-control-allow-origin'],
            'access-control-allow-credentials': res.headers['access-control-allow-credentials'],
            'access-control-allow-methods': res.headers['access-control-allow-methods']
        };
        
        Object.entries(corsHeaders).forEach(([key, value]) => {
            if (value) {
                console.log(`✅ ${key}: ${value}`);
            } else {
                console.log(`⚠️  ${key}: Not set`);
            }
        });
        
        console.log('\n');
        console.log('Test 3: Environment Variables');
        console.log('━'.repeat(50));
        console.log(`NEXT_PUBLIC_CONVEX_URL: ${process.env.NEXT_PUBLIC_CONVEX_URL || '❌ NOT SET'}`);
        console.log(`CONVEX_SELF_HOSTED_URL: ${process.env.CONVEX_SELF_HOSTED_URL || '❌ NOT SET'}`);
        
        console.log('\n');
        console.log('📋 Summary');
        console.log('━'.repeat(50));
        
        if (res.statusCode === 200 && data.includes('Convex')) {
            console.log('✅ Convex backend is running and accessible');
            console.log('✅ Frontend should be able to connect');
            console.log('\n💡 Next Steps:');
            console.log('   1. Restart your Next.js dev server');
            console.log('   2. Check browser console for any connection errors');
            console.log('   3. Verify data is loading in the dashboard');
        } else {
            console.log('❌ Unexpected response from Convex');
            console.log('   Please check if Convex is properly configured');
        }
        
        process.exit(0);
    });
});

req.on('error', (error) => {
    console.error('❌ Connection Failed!');
    console.error(`   Error: ${error.message}`);
    console.log('\n');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Check if Convex backend is running');
    console.log('   2. Verify NEXT_PUBLIC_CONVEX_URL in .env.local');
    console.log('   3. Ensure firewall allows connection to port', url.port);
    console.log('   4. Try: npx convex dev');
    
    process.exit(1);
});

req.on('timeout', () => {
    console.error('❌ Connection Timeout!');
    console.error('   The backend did not respond within 5 seconds');
    req.destroy();
    process.exit(1);
});

req.end();
