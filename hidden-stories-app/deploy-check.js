#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to execute shell commands and print output
function runCommand(command) {
  console.log(`\n> ${command}`);
  try {
    const output = execSync(command, { encoding: 'utf8' });
    console.log(output);
    return output;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    return null;
  }
}

// Check if git is installed
console.log('Checking git installation...');
runCommand('git --version');

// Check if the current directory is a git repository
console.log('\nChecking if current directory is a git repository...');
const isGitRepo = fs.existsSync(path.join(__dirname, '..', '.git'));
console.log(`Is git repository: ${isGitRepo}`);

if (!isGitRepo) {
  console.log('\nThis is not a git repository. Please initialize a git repository first.');
  console.log('Run the following commands:');
  console.log('git init');
  console.log('git add .');
  console.log('git commit -m "Initial commit"');
  console.log('git branch -M main');
  console.log('git remote add origin https://github.com/leosakharov/Hidden-Stories.git');
  console.log('git push -u origin main');
  process.exit(1);
}

// Check remote repositories
console.log('\nChecking remote repositories...');
runCommand('git remote -v');

// Check current branch
console.log('\nChecking current branch...');
runCommand('git branch');

// Check if gh-pages branch exists
console.log('\nChecking if gh-pages branch exists...');
const branches = runCommand('git branch -a');
const hasGhPagesBranch = branches && branches.includes('gh-pages');
console.log(`Has gh-pages branch: ${hasGhPagesBranch}`);

// Check if dist directory exists
console.log('\nChecking if dist directory exists...');
const distExists = fs.existsSync(path.join(__dirname, 'dist'));
console.log(`Dist directory exists: ${distExists}`);

if (!distExists) {
  console.log('\nDist directory does not exist. Building the project...');
  runCommand('npm run build');
}

// Deploy to GitHub Pages
console.log('\nDeploying to GitHub Pages...');
runCommand('npm run deploy -- -m "Deploy Hidden Stories to GitHub Pages"');

console.log('\nDeployment complete. Please check the GitHub repository settings to ensure GitHub Pages is configured correctly:');
console.log('1. Go to https://github.com/leosakharov/Hidden-Stories/settings/pages');
console.log('2. Under "Source", select "Deploy from a branch"');
console.log('3. Under "Branch", select "gh-pages" and "/ (root)"');
console.log('4. Click "Save"');
console.log('\nYour site should be available at: https://leosakharov.github.io/Hidden-Stories/');
