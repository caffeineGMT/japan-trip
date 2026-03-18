#!/usr/bin/env node

/**
 * Generate native speaker audio for all Japanese phrases
 * Uses Google Cloud Text-to-Speech API with WaveNet voices
 *
 * Requirements:
 * 1. npm install @google-cloud/text-to-speech
 * 2. Set up Google Cloud credentials (GOOGLE_APPLICATION_CREDENTIALS)
 *
 * Usage:
 * node scripts/generate-audio.js
 */

const fs = require('fs');
const path = require('path');

// Check if Google Cloud TTS is available
let textToSpeech;
let useGoogleTTS = false;

try {
  textToSpeech = require('@google-cloud/text-to-speech');
  useGoogleTTS = true;
  console.log('✓ Google Cloud TTS available');
} catch (error) {
  console.log('⚠ Google Cloud TTS not installed. Run: npm install @google-cloud/text-to-speech');
  console.log('⚠ Will create placeholder audio files for development');
}

// Load phrases data
const phrasesPath = path.join(__dirname, '..', 'phrases.json');
const phrasesData = JSON.parse(fs.readFileSync(phrasesPath, 'utf8'));

// Output directory
const audioDir = path.join(__dirname, '..', 'audio', 'phrases');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
  console.log(`✓ Created audio directory: ${audioDir}`);
}

// Google Cloud TTS client
let client;
if (useGoogleTTS) {
  try {
    client = new textToSpeech.TextToSpeechClient();
    console.log('✓ Google Cloud TTS client initialized');
  } catch (error) {
    console.error('✗ Failed to initialize Google Cloud TTS client:', error.message);
    console.log('⚠ Make sure GOOGLE_APPLICATION_CREDENTIALS is set');
    useGoogleTTS = false;
  }
}

// Voice configuration
const VOICE_CONFIG = {
  languageCode: 'ja-JP',
  name: 'ja-JP-Neural2-B', // Female voice, natural sounding
  ssmlGender: 'FEMALE'
};

const AUDIO_CONFIG = {
  audioEncoding: 'MP3',
  speakingRate: 0.9, // Slightly slower for clarity
  pitch: 0.0,
  volumeGainDb: 0.0
};

/**
 * Generate audio using Google Cloud TTS
 */
async function generateWithGoogleTTS(text, outputPath) {
  const request = {
    input: { text },
    voice: VOICE_CONFIG,
    audioConfig: AUDIO_CONFIG
  };

  try {
    const [response] = await client.synthesizeSpeech(request);
    fs.writeFileSync(outputPath, response.audioContent, 'binary');
    return true;
  } catch (error) {
    console.error(`✗ Failed to generate audio: ${error.message}`);
    return false;
  }
}

/**
 * Create a placeholder audio file (silent 1-second MP3)
 * This is used when Google TTS is not available
 */
function createPlaceholderAudio(outputPath) {
  // A minimal valid MP3 file (silent, very short)
  // This is a base64-encoded 1-second silent MP3
  const silentMP3Base64 = 'SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhAC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7v//////////////////////////////////////////////////////////////////////wAAAExhdmM1OC4xMzQAAAAAAAAAAAAAAAAkAAAAAAAAA4S/jFVyAAAAAAAAAAAAAAAAAAAA//sQZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQZDwP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';

  const buffer = Buffer.from(silentMP3Base64, 'base64');
  fs.writeFileSync(outputPath, buffer);
}

/**
 * Generate all audio files
 */
async function generateAllAudio() {
  console.log('\n🎤 Starting audio generation...\n');

  const categories = Object.keys(phrasesData);
  let totalPhrases = 0;
  let successCount = 0;
  let failCount = 0;

  for (const category of categories) {
    const phrases = phrasesData[category];
    console.log(`\n📁 Category: ${category} (${phrases.length} phrases)`);

    for (let i = 0; i < phrases.length; i++) {
      const phrase = phrases[i];
      const filename = `${category}_${i}.mp3`;
      const outputPath = path.join(audioDir, filename);

      // Skip if file already exists
      if (fs.existsSync(outputPath)) {
        console.log(`  ⏭  ${filename} (already exists)`);
        successCount++;
        totalPhrases++;
        continue;
      }

      totalPhrases++;
      process.stdout.write(`  🔄 ${filename} ... `);

      if (useGoogleTTS && client) {
        // Generate using Google Cloud TTS
        const success = await generateWithGoogleTTS(phrase.ja, outputPath);
        if (success) {
          console.log('✓');
          successCount++;
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } else {
          console.log('✗ (creating placeholder)');
          createPlaceholderAudio(outputPath);
          failCount++;
        }
      } else {
        // Create placeholder for development
        createPlaceholderAudio(outputPath);
        console.log('⚠ (placeholder)');
        successCount++;
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\n✅ Audio generation complete!`);
  console.log(`   Total phrases: ${totalPhrases}`);
  console.log(`   Generated: ${successCount}`);
  if (failCount > 0) {
    console.log(`   Failed: ${failCount}`);
  }
  console.log(`   Output: ${audioDir}`);
  console.log('');

  if (!useGoogleTTS) {
    console.log('💡 To generate real native speaker audio:');
    console.log('   1. Install: npm install @google-cloud/text-to-speech');
    console.log('   2. Set up Google Cloud credentials');
    console.log('   3. Run this script again\n');
  }
}

// Run the script
if (require.main === module) {
  generateAllAudio().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { generateAllAudio };
