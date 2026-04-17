#!/usr/bin/env node

const { spawn } = require('child_process');

// Build TypeScript first
console.log('Building TypeScript...');
const build = spawn('npm', ['run', 'build'], { stdio: 'inherit' });

build.on('close', (code) => {
  if (code !== 0) {
    console.error('Build failed');
    process.exit(1);
  }
  
  // Start Nakama
  console.log('Starting Nakama server...');
  const nakama = spawn('nakama', [
    '--name', 'nakama1',
    '--database.address', `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/${process.env.POSTGRES_DB}?sslmode=prefer`,
    '--logger.level', 'INFO', 
    '--session.token_expiry_sec', '7200',
    '--runtime.path', './build'
  ], { stdio: 'inherit' });
  
  nakama.on('close', (code) => {
    process.exit(code);
  });
});