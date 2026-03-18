#!/usr/bin/env node

/**
 * Audio File Validator
 *
 * Quick validation script to check if all audio files are present and playable.
 * Use this before deployment to ensure audio system is working.
 *
 * Usage: node scripts/validate-audio.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const AUDIO_DIR = path.join(__dirname, '../audio/phrases');
const PHRASES_FILE = path.join(__dirname, '../phrases.json');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Load phrases.json and extract expected files
 */
function getExpectedFiles() {
  try {
    const phrasesData = JSON.parse(fs.readFileSync(PHRASES_FILE, 'utf8'));
    const expectedFiles = [];

    Object.entries(phrasesData).forEach(([category, phrases]) => {
      phrases.forEach((_, index) => {
        expectedFiles.push(`${category}_${index}.mp3`);
      });
    });

    return { phrasesData, expectedFiles };
  } catch (error) {
    log(`✗ Error reading phrases.json: ${error.message}`, 'red');
    process.exit(1);
  }
}

/**
 * Check which files exist
 */
function checkFileExistence(expectedFiles) {
  const results = {
    present: [],
    missing: [],
    totalSize: 0
  };

  expectedFiles.forEach(filename => {
    const filePath = path.join(AUDIO_DIR, filename);

    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      results.present.push({
        filename,
        size: stats.size,
        sizeKB: (stats.size / 1024).toFixed(2)
      });
      results.totalSize += stats.size;
    } else {
      results.missing.push(filename);
    }
  });

  return results;
}

/**
 * Display validation results
 */
function displayResults(phrasesData, expectedFiles, results) {
  log('\n🎵 Audio File Validation Report', 'bold');
  log('='.repeat(60), 'blue');

  // Summary
  log('\n📊 Summary:', 'bold');
  log(`   Total expected: ${expectedFiles.length} files`);
  log(`   Present: ${colors.green}${results.present.length}${colors.reset}`);
  log(`   Missing: ${results.missing.length > 0 ? colors.red : colors.green}${results.missing.length}${colors.reset}`);
  log(`   Total size: ${(results.totalSize / 1024 / 1024).toFixed(2)} MB`);

  // Category breakdown
  log('\n📁 By Category:', 'bold');

  Object.entries(phrasesData).forEach(([category, phrases]) => {
    const categoryFiles = expectedFiles.filter(f => f.startsWith(`${category}_`));
    const presentCount = results.present.filter(f => f.filename.startsWith(`${category}_`)).length;
    const status = presentCount === categoryFiles.length ? '✓' : '✗';
    const statusColor = presentCount === categoryFiles.length ? 'green' : 'red';

    log(`   ${status} ${category.padEnd(12)} ${presentCount}/${categoryFiles.length} files`, statusColor);
  });

  // Missing files detail
  if (results.missing.length > 0) {
    log('\n⚠️  Missing Files:', 'yellow');
    results.missing.forEach(filename => {
      log(`   ✗ ${filename}`, 'red');
    });
  }

  // File size distribution
  if (results.present.length > 0) {
    log('\n📦 File Sizes:', 'bold');

    const sizes = results.present.map(f => parseFloat(f.sizeKB));
    const avgSize = (sizes.reduce((a, b) => a + b, 0) / sizes.length).toFixed(2);
    const minSize = Math.min(...sizes).toFixed(2);
    const maxSize = Math.max(...sizes).toFixed(2);

    log(`   Average: ${avgSize} KB`);
    log(`   Range: ${minSize} - ${maxSize} KB`);

    // Check for suspiciously small files
    const smallFiles = results.present.filter(f => parseFloat(f.sizeKB) < 3);
    if (smallFiles.length > 0) {
      log('\n⚠️  Warning: Suspiciously small files (< 3 KB):', 'yellow');
      smallFiles.forEach(f => {
        log(`   ${f.filename} - ${f.sizeKB} KB`, 'yellow');
      });
    }

    // Check for suspiciously large files
    const largeFiles = results.present.filter(f => parseFloat(f.sizeKB) > 50);
    if (largeFiles.length > 0) {
      log('\n⚠️  Warning: Suspiciously large files (> 50 KB):', 'yellow');
      largeFiles.forEach(f => {
        log(`   ${f.filename} - ${f.sizeKB} KB`, 'yellow');
      });
    }
  }

  // Status
  log('\n' + '='.repeat(60), 'blue');

  if (results.missing.length === 0) {
    log('\n✓ All audio files present!', 'green');
    log('\n📝 Next steps:', 'bold');
    log('   1. Test playback in browser');
    log('   2. Verify audio quality');
    log('   3. Deploy to production');
  } else {
    log('\n✗ Audio files missing!', 'red');
    log('\n📝 Action required:', 'bold');
    log('   1. Run: node scripts/generate-audio-gtts.py (TTS generation)');
    log('   2. OR: Hire native speaker and run process-native-recordings.js');
    log('   3. Re-run this validation script');
  }

  log(''); // Empty line at end
}

/**
 * Main validation function
 */
function main() {
  // Check if audio directory exists
  if (!fs.existsSync(AUDIO_DIR)) {
    log(`✗ Audio directory not found: ${AUDIO_DIR}`, 'red');
    log('   Creating directory...', 'yellow');
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
    log('   ✓ Directory created', 'green');
  }

  // Get expected files
  const { phrasesData, expectedFiles } = getExpectedFiles();

  // Check file existence
  const results = checkFileExistence(expectedFiles);

  // Display results
  displayResults(phrasesData, expectedFiles, results);

  // Exit with appropriate code
  process.exit(results.missing.length > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { getExpectedFiles, checkFileExistence };
