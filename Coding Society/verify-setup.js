#!/usr/bin/env node

/**
 * Ultra-Advanced Feed System - Setup Verification Script
 * Checks all components and services for proper configuration
 */

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Ultra-Advanced Feed System - Setup Verification\n');

const checks = [
  {
    name: 'Docker Services Status',
    command: 'docker-compose ps',
    success: (output) => output.includes('coding-society-minio') && 
                         output.includes('coding-society-mongodb') && 
                         output.includes('coding-society-redis')
  },
  {
    name: 'MinIO Service Health',
    command: 'curl -f http://localhost:9000/minio/health/live',
    success: (output) => !output.includes('curl: ')
  },
  {
    name: 'Backend Dependencies',
    path: 'backend/node_modules',
    check: 'directory'
  },
  {
    name: 'Frontend Dependencies', 
    path: 'node_modules',
    check: 'directory'
  },
  {
    name: 'Backend Environment',
    path: 'backend/.env',
    check: 'file'
  },
  {
    name: 'Docker Compose Config',
    path: 'docker-compose.yml',
    check: 'file'
  },
  {
    name: 'Ultra Advanced Feed Page',
    path: 'src/pages/UltraAdvancedFeedPage.jsx',
    check: 'file'
  },
  {
    name: 'Backend Feed API',
    path: 'backend/routes/feed.js',
    check: 'file'
  },
  {
    name: 'Post Model',
    path: 'backend/models/Post.js', 
    check: 'file'
  },
  {
    name: 'Story Model',
    path: 'backend/models/Story.js',
    check: 'file'
  }
];

let passed = 0;
let total = checks.length;

function runCheck(check, index) {
  return new Promise((resolve) => {
    if (check.command) {
      exec(check.command, { cwd: process.cwd() }, (error, stdout, stderr) => {
        const success = !error && check.success(stdout + stderr);
        console.log(`${success ? '✅' : '❌'} ${check.name}`);
        if (!success && (error || stderr)) {
          console.log(`   Error: ${error?.message || stderr}`);
        }
        if (success) passed++;
        resolve();
      });
    } else if (check.check === 'file') {
      const exists = fs.existsSync(check.path);
      console.log(`${exists ? '✅' : '❌'} ${check.name}`);
      if (!exists) {
        console.log(`   Missing: ${check.path}`);
      }
      if (exists) passed++;
      resolve();
    } else if (check.check === 'directory') {
      const exists = fs.existsSync(check.path) && fs.lstatSync(check.path).isDirectory();
      console.log(`${exists ? '✅' : '❌'} ${check.name}`);
      if (!exists) {
        console.log(`   Missing: ${check.path}`);
      }
      if (exists) passed++;
      resolve();
    }
  });
}

async function runAllChecks() {
  for (let i = 0; i < checks.length; i++) {
    await runCheck(checks[i], i);
  }
  
  console.log(`\n📊 Results: ${passed}/${total} checks passed`);
  
  if (passed === total) {
    console.log('\n🎉 All systems operational! Your ultra-advanced feed is ready!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Start backend: cd backend && npm run dev');
    console.log('   2. Start frontend: npm run dev');
    console.log('   3. Open browser: http://localhost:5173/feed');
    console.log('   4. Register/Login to test all features');
  } else {
    console.log('\n⚠️  Some components need attention. Check the errors above.');
    console.log('\n🔧 Common fixes:');
    console.log('   • Run: docker-compose up -d');
    console.log('   • Run: npm install (in root and backend)');
    console.log('   • Check Docker Desktop is running');
    console.log('   • Verify all files were created properly');
  }
  
  console.log('\n📖 For detailed testing guide, see: TESTING_GUIDE.md');
  console.log('📋 For deployment info, see: ULTRA_ADVANCED_FEED_DEPLOYMENT.md');
}

runAllChecks().catch(console.error);