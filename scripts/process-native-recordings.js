#!/usr/bin/env node

/**
 * Native Speaker Recording Processor
 *
 * This script validates and processes audio recordings from a native Japanese speaker.
 * It ensures all files meet technical specifications and are ready for production use.
 *
 * Requirements:
 * - npm install fluent-ffmpeg
 * - ffmpeg installed on system (brew install ffmpeg)
 *
 * Usage:
 * 1. Place all received MP3 files in /audio/phrases-raw/
 * 2. Run: node scripts/process-native-recordings.js
 * 3. Processed files will be output to /audio/phrases/
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

// Configuration
const CONFIG = {
  inputDir: path.join(__dirname, '../audio/phrases-raw'),
  outputDir: path.join(__dirname, '../audio/phrases'),
  targetSampleRate: 44100,
  targetBitrate: '128k',
  targetChannels: 1, // Mono
  targetFormat: 'mp3',
  silenceDuration: 1.0, // 1 second padding
  targetLoudness: -3.0, // -3dB normalization
};

// Expected files (44 total)
const EXPECTED_FILES = [];

// Generate expected file list
const categories = {
  general: 10,
  restaurant: 9,
  train: 7,
  temple: 5,
  shopping: 7,
  emergency: 6
};

Object.entries(categories).forEach(([category, count]) => {
  for (let i = 0; i < count; i++) {
    EXPECTED_FILES.push(`${category}_${i}.mp3`);
  }
});

// Statistics tracking
const stats = {
  total: EXPECTED_FILES.length,
  found: 0,
  processed: 0,
  errors: 0,
  warnings: []
};

/**
 * Check if ffmpeg is installed
 */
async function checkFFmpeg() {
  try {
    await execPromise('ffmpeg -version');
    console.log('✓ ffmpeg found');
    return true;
  } catch (error) {
    console.error('✗ ffmpeg not found. Install with: brew install ffmpeg');
    return false;
  }
}

/**
 * Create output directory if it doesn't exist
 */
function ensureDirectories() {
  if (!fs.existsSync(CONFIG.inputDir)) {
    fs.mkdirSync(CONFIG.inputDir, { recursive: true });
    console.log(`✓ Created input directory: ${CONFIG.inputDir}`);
  }

  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    console.log(`✓ Created output directory: ${CONFIG.outputDir}`);
  }
}

/**
 * Validate that all expected files are present
 */
function validateFiles() {
  console.log('\n📋 Validating file presence...');

  const presentFiles = fs.readdirSync(CONFIG.inputDir)
    .filter(f => f.endsWith('.mp3'));

  stats.found = presentFiles.length;

  const missingFiles = EXPECTED_FILES.filter(
    f => !presentFiles.includes(f)
  );

  if (missingFiles.length > 0) {
    console.warn('\n⚠️  Missing files:');
    missingFiles.forEach(f => console.warn(`   - ${f}`));
    stats.warnings.push(`${missingFiles.length} files missing`);
  } else {
    console.log(`✓ All ${EXPECTED_FILES.length} files present`);
  }

  const extraFiles = presentFiles.filter(
    f => !EXPECTED_FILES.includes(f)
  );

  if (extraFiles.length > 0) {
    console.warn('\n⚠️  Unexpected files (will be ignored):');
    extraFiles.forEach(f => console.warn(`   - ${f}`));
  }

  return presentFiles.filter(f => EXPECTED_FILES.includes(f));
}

/**
 * Get audio file information using ffprobe
 */
async function getAudioInfo(filePath) {
  try {
    const { stdout } = await execPromise(
      `ffprobe -v error -show_entries format=duration,bit_rate -show_entries stream=sample_rate,channels -of json "${filePath}"`
    );

    const info = JSON.parse(stdout);

    return {
      duration: parseFloat(info.format.duration),
      bitrate: parseInt(info.format.bit_rate),
      sampleRate: parseInt(info.streams[0].sample_rate),
      channels: parseInt(info.streams[0].channels)
    };
  } catch (error) {
    console.error(`Error getting info for ${path.basename(filePath)}:`, error.message);
    return null;
  }
}

/**
 * Process a single audio file
 */
async function processAudioFile(filename) {
  const inputPath = path.join(CONFIG.inputDir, filename);
  const outputPath = path.join(CONFIG.outputDir, filename);

  console.log(`\n🎵 Processing: ${filename}`);

  // Get input file info
  const info = await getAudioInfo(inputPath);

  if (!info) {
    console.error(`✗ Failed to read ${filename}`);
    stats.errors++;
    return;
  }

  // Display file info
  console.log(`   Duration: ${info.duration.toFixed(2)}s`);
  console.log(`   Sample Rate: ${info.sampleRate} Hz`);
  console.log(`   Channels: ${info.channels === 1 ? 'Mono' : 'Stereo'}`);
  console.log(`   Bitrate: ${Math.round(info.bitrate / 1000)} kbps`);

  // Build ffmpeg command
  // This will:
  // 1. Add 1s silence padding at start and end
  // 2. Normalize loudness to -3dB
  // 3. Convert to mono
  // 4. Set sample rate to 44.1kHz
  // 5. Set bitrate to 128kbps

  const ffmpegCommand = `ffmpeg -y \
    -f lavfi -t ${CONFIG.silenceDuration} -i anullsrc=r=${CONFIG.targetSampleRate}:cl=mono \
    -i "${inputPath}" \
    -f lavfi -t ${CONFIG.silenceDuration} -i anullsrc=r=${CONFIG.targetSampleRate}:cl=mono \
    -filter_complex "[0:a][1:a][2:a]concat=n=3:v=0:a=1,loudnorm=I=${CONFIG.targetLoudness}:TP=-1.5:LRA=11" \
    -ar ${CONFIG.targetSampleRate} \
    -ac ${CONFIG.targetChannels} \
    -b:a ${CONFIG.targetBitrate} \
    "${outputPath}"`;

  try {
    await execPromise(ffmpegCommand);

    // Verify output
    const outputInfo = await getAudioInfo(outputPath);

    if (outputInfo) {
      console.log(`✓ Processed successfully`);
      console.log(`   Output Duration: ${outputInfo.duration.toFixed(2)}s`);
      stats.processed++;
    } else {
      console.error(`✗ Output file validation failed`);
      stats.errors++;
    }
  } catch (error) {
    console.error(`✗ Processing failed: ${error.message}`);
    stats.errors++;
  }
}

/**
 * Generate validation report
 */
function generateReport() {
  const reportPath = path.join(__dirname, '../audio-processing-report.txt');

  const report = `
Native Speaker Audio Processing Report
Generated: ${new Date().toISOString()}

=== Summary ===
Total expected files: ${stats.total}
Files found: ${stats.found}
Successfully processed: ${stats.processed}
Errors: ${stats.errors}

=== Configuration ===
Input directory: ${CONFIG.inputDir}
Output directory: ${CONFIG.outputDir}
Target format: ${CONFIG.targetFormat}
Sample rate: ${CONFIG.targetSampleRate} Hz
Bitrate: ${CONFIG.targetBitrate}
Channels: ${CONFIG.targetChannels} (Mono)
Silence padding: ${CONFIG.silenceDuration}s
Loudness normalization: ${CONFIG.targetLoudness} dB

=== Warnings ===
${stats.warnings.length > 0 ? stats.warnings.join('\n') : 'None'}

=== Status ===
${stats.processed === stats.total ? '✓ All files processed successfully!' : '⚠️  Some files failed processing'}

=== Next Steps ===
${stats.processed === stats.total ? `
1. Test audio playback in browser
2. Verify all phrases sound natural
3. Check volume consistency across files
4. Deploy to production: git add audio/phrases && git commit && git push
` : `
1. Review errors above
2. Fix or re-record problematic files
3. Re-run this script
4. Contact voice actor for revision if needed
`}
`;

  fs.writeFileSync(reportPath, report);
  console.log(`\n📊 Report saved to: ${reportPath}`);

  return report;
}

/**
 * Main processing function
 */
async function main() {
  console.log('🎙️  Native Speaker Recording Processor\n');
  console.log('======================================\n');

  // Check prerequisites
  if (!await checkFFmpeg()) {
    process.exit(1);
  }

  // Create directories
  ensureDirectories();

  // Validate files
  const filesToProcess = validateFiles();

  if (filesToProcess.length === 0) {
    console.error('\n✗ No files to process. Please add MP3 files to:', CONFIG.inputDir);
    process.exit(1);
  }

  // Process each file
  console.log(`\n🔄 Processing ${filesToProcess.length} files...\n`);

  for (const filename of filesToProcess) {
    await processAudioFile(filename);
  }

  // Generate report
  console.log('\n======================================\n');
  const report = generateReport();
  console.log(report);

  // Exit with appropriate code
  process.exit(stats.errors > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { processAudioFile, validateFiles, getAudioInfo };
