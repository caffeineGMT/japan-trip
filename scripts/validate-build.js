#!/usr/bin/env node

/**
 * Build Validation Script
 * Validates JavaScript files for syntax errors before deployment
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '..');
const IGNORED_DIRS = ['node_modules', '.git', '.vercel', 'scripts'];

let errorCount = 0;
let fileCount = 0;

console.log('🔍 Running build validation...\n');

/**
 * Recursively find all JS files
 */
function findJSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      const dirName = path.basename(filePath);
      if (!IGNORED_DIRS.includes(dirName)) {
        findJSFiles(filePath, fileList);
      }
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Validate JavaScript syntax
 */
function validateJS(filePath) {
  try {
    const code = fs.readFileSync(filePath, 'utf8');

    // Check if this is an ES6 module (uses import/export)
    const isModule = /^\s*(import|export)\s+/m.test(code);

    if (isModule) {
      // For ES6 modules, just check for basic syntax errors
      // We can't use Function() constructor as it doesn't support modules
      // Instead, check for common syntax errors
      const hasUnclosedBraces = (code.match(/{/g) || []).length !== (code.match(/}/g) || []).length;
      const hasUnclosedBrackets = (code.match(/\[/g) || []).length !== (code.match(/\]/g) || []).length;
      const hasUnclosedParens = (code.match(/\(/g) || []).length !== (code.match(/\)/g) || []).length;

      if (hasUnclosedBraces) return 'Unclosed braces detected';
      if (hasUnclosedBrackets) return 'Unclosed brackets detected';
      if (hasUnclosedParens) return 'Unclosed parentheses detected';

      return null; // ES6 module syntax is OK
    } else {
      // For non-module files, use Node's built-in syntax checker
      new Function(code);
      return null;
    }
  } catch (error) {
    return error.message;
  }
}

/**
 * Main validation
 */
function main() {
  const jsFiles = findJSFiles(PROJECT_ROOT);

  console.log(`Found ${jsFiles.length} JavaScript files\n`);

  jsFiles.forEach(file => {
    fileCount++;
    const relativePath = path.relative(PROJECT_ROOT, file);
    const error = validateJS(file);

    if (error) {
      errorCount++;
      console.log(`❌ ${relativePath}`);
      console.log(`   ${error}\n`);
    } else {
      console.log(`✓ ${relativePath}`);
    }
  });

  console.log('\n' + '═'.repeat(60));
  if (errorCount === 0) {
    console.log(`✅ BUILD VALIDATION PASSED`);
    console.log(`   ${fileCount} files validated, 0 errors`);
    console.log('═'.repeat(60));
    process.exit(0);
  } else {
    console.log(`❌ BUILD VALIDATION FAILED`);
    console.log(`   ${fileCount} files validated, ${errorCount} errors`);
    console.log('═'.repeat(60));
    console.log('\n⚠️  Fix the errors above before committing.\n');
    process.exit(1);
  }
}

main();
