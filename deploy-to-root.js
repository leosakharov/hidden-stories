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

// Build the application
console.log('Building the application...');
runCommand('cd hidden-stories-app && npm run build');

// Copy the built files to the root of the repository
console.log('\nCopying built files to the root of the repository...');

// Get the list of files in the dist directory
const distDir = path.join(__dirname, 'hidden-stories-app', 'dist');
const files = fs.readdirSync(distDir);

// Copy each file to the root of the repository
files.forEach(file => {
  const srcPath = path.join(distDir, file);
  const destPath = path.join(__dirname, file);
  
  // If the file is a directory, copy it recursively
  if (fs.statSync(srcPath).isDirectory()) {
    // Create the directory if it doesn't exist
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    
    // Get the list of files in the source directory
    const dirFiles = fs.readdirSync(srcPath);
    
    // Copy each file in the directory
    dirFiles.forEach(dirFile => {
      const dirFileSrcPath = path.join(srcPath, dirFile);
      const dirFileDestPath = path.join(destPath, dirFile);
      
      // If the file is a directory, create it
      if (fs.statSync(dirFileSrcPath).isDirectory()) {
        if (!fs.existsSync(dirFileDestPath)) {
          fs.mkdirSync(dirFileDestPath, { recursive: true });
        }
        
        // Copy the directory recursively using fs methods
        const copyDir = (src, dest) => {
          const entries = fs.readdirSync(src, { withFileTypes: true });
          
          entries.forEach(entry => {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            
            if (entry.isDirectory()) {
              if (!fs.existsSync(destPath)) {
                fs.mkdirSync(destPath, { recursive: true });
              }
              copyDir(srcPath, destPath);
            } else {
              fs.copyFileSync(srcPath, destPath);
              console.log(`Copied ${srcPath} to ${destPath}`);
            }
          });
        };
        
        copyDir(dirFileSrcPath, dirFileDestPath);
      } else {
        // Copy the file
        fs.copyFileSync(dirFileSrcPath, dirFileDestPath);
        console.log(`Copied ${dirFileSrcPath} to ${dirFileDestPath}`);
      }
    });
  } else {
    // Copy the file
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${srcPath} to ${destPath}`);
  }
});

// Commit and push the changes
console.log('\nCommitting and pushing the changes...');
runCommand('git add .');
runCommand('git commit -m "Deploy application to root for GitHub Pages"');
runCommand('git push');

console.log('\nDeployment complete!');
console.log('Your site should be available at: https://leosakharov.github.io/');
