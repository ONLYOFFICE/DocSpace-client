/**
 * Simple server script to serve the static files from the dist directory
 * using the serve package.
 * 
 * Run with: node server.js
 */

const { spawn } = require('child_process');
const path = require('path');

// Configuration
const PORT = process.env.PORT || 5001;
const DIST_DIR = path.join(__dirname, 'dist');

console.log(`Starting server on port ${PORT}...`);
console.log(`Serving static files from: ${DIST_DIR}`);

// Spawn the serve process
const serveProcess = spawn('npx', ['serve', 'dist', '-s', '-p', PORT.toString()], {
  stdio: 'inherit',
  shell: true
});

// Handle process events
serveProcess.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

serveProcess.on('close', (code) => {
  if (code !== 0) {
    console.log(`Server process exited with code ${code}`);
  }
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  serveProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  serveProcess.kill();
  process.exit(0);
});
