const fs = require('fs');
const path = require('path');
const fetchTrendingRepos = require('./scrape');

async function build() {
  try {
    console.log('Fetching trending repositories...');
    await fetchTrendingRepos();
    
    const distDir = path.join(__dirname, '../dist');
    const publicDir = path.join(__dirname, '../public');
    const dataDir = path.join(__dirname, '../data');
    
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    copyDirectory(publicDir, distDir);
    copyDirectory(dataDir, path.join(distDir, 'data'));
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

build();
