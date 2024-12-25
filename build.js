const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Remove dist directory if it exists
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
}

// Run TypeScript compiler
execSync('npx tsc', { stdio: 'inherit' });
