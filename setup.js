#!/usr/bin/env node

/**
 * Setup script for Holiday Hub
 * Run with: node setup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎉 Holiday Hub Setup\n');

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.log('Creating .env file from .env.example...');
  fs.copyFileSync('.env.example', '.env');
  console.log('✅ .env file created\n');
  console.log('⚠️  Please edit .env and add your configuration values:\n');
  console.log('   - DATABASE_URL (PostgreSQL connection string)');
  console.log('   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)');
  console.log('   - RESEND_API_KEY (from resend.com)');
  console.log('   - EMAIL_FROM (your email address)\n');
} else {
  console.log('✅ .env file already exists\n');
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies already installed\n');
}

// Try to generate Prisma client
console.log('🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated\n');
} catch (error) {
  console.log('⚠️  Could not generate Prisma client');
  console.log('   Make sure to configure your DATABASE_URL in .env\n');
}

console.log('🎯 Next steps:\n');
console.log('1. Edit .env with your configuration');
console.log('2. Run: npx prisma db push');
console.log('3. Run: npm run prisma:seed');
console.log('4. Run: npm run dev\n');
console.log('Happy holiday tracking! 🎉\n');
