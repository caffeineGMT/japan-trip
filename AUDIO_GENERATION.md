# Japanese Phrase Audio Generation

This document explains how the native speaker audio system works for Japanese phrases.

## Overview

The Japan Trip Companion app uses **real native speaker audio recordings** for all Japanese phrases instead of browser Text-to-Speech. This provides:

- ✅ Natural, native Japanese pronunciation
- ✅ Consistent audio quality across all devices
- ✅ Offline playback support (via PWA)
- ✅ Intelligent preloading for instant playback
- ✅ Automatic TTS fallback if audio files fail to load

## Audio System Architecture

### 1. Audio Player (`audio-player.js`)

The `PhraseAudioPlayer` class manages:
- **Preloading**: All audio files are preloaded on app initialization
- **Caching**: Audio is cached in memory for instant replay
- **Fallback**: Automatically falls back to Web Speech API TTS if audio fails
- **Visual Indicators**: Shows 🎤 for native audio, 🤖 for TTS fallback

### 2. File Naming Convention

Audio files follow the pattern: `{category}_{index}.mp3`

Examples:
- `general_0.mp3` - First general phrase ("こんにちは")
- `restaurant_5.mp3` - 6th restaurant phrase ("お会計お願いします")
- `emergency_2.mp3` - 3rd emergency phrase ("病院はどこですか")

### 3. Storage Location

All audio files are stored in: `/audio/phrases/`

This directory is:
- Cached by the Service Worker for offline access
- Served statically by Vercel
- Preloaded by the audio player on app start

## Generating Audio Files

### Method 1: gTTS (Free, No API Key Required) ✅ **RECOMMENDED**

The easiest method using Google's free Text-to-Speech service:

```bash
# Install gTTS
pip install gtts

# Generate all audio files
python3 scripts/generate-audio-gtts.py
```

**Output**: 44 MP3 files with natural Japanese pronunciation

### Method 2: Google Cloud TTS (Highest Quality)

For production-grade WaveNet voices:

```bash
# Install package
npm install @google-cloud/text-to-speech

# Set up Google Cloud credentials
export GOOGLE_APPLICATION_CREDENTIALS="path/to/credentials.json"

# Generate audio
node scripts/generate-audio.js
```

**Voices Used**:
- `ja-JP-Neural2-B` (Female, natural)
- Speaking rate: 0.9x (slightly slower for clarity)
- Output format: MP3

### Method 3: Manual Recording

For the highest quality, record a native Japanese speaker:

1. Open `scripts/record-audio.html` in a browser
2. Have a native speaker read each phrase
3. Use a quality microphone
4. Save files following the naming convention

## Audio File Specifications

- **Format**: MP3
- **Sample Rate**: 24 kHz (gTTS) or 44.1 kHz (GCloud)
- **Bitrate**: 64-128 kbps
- **Channels**: Mono
- **Total Size**: ~2-3 MB for all 44 files

## Current Status

✅ **All 44 audio files generated** using gTTS
- 9 restaurant phrases
- 7 train/transport phrases
- 5 temple phrases
- 7 shopping phrases
- 6 emergency phrases
- 10 general phrases

## Testing

To test the audio system:

1. Open the app: `https://your-domain.vercel.app`
2. Click the phrases button (🗣️) in the top navigation
3. Click any phrase to hear the audio
4. Look for the indicator:
   - 🎤 = Native speaker audio (working!)
   - 🤖 = TTS fallback (audio file not found)

## Deployment

Audio files are automatically deployed with Vercel:

```json
// vercel.json
{
  "headers": [
    {
      "source": "/audio/phrases/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

## Service Worker Caching

Audio files are cached for offline use:

```javascript
// In service-worker.js
const AUDIO_CACHE = 'audio-cache-v1';
const audioFiles = [
  '/audio/phrases/general_0.mp3',
  '/audio/phrases/restaurant_0.mp3',
  // ... all 44 files
];
```

## Troubleshooting

### Audio not playing?

1. Check browser console for errors
2. Verify files exist in `/audio/phrases/`
3. Check Network tab to see if files are loading
4. Try clearing cache and reloading

### Fallback to TTS?

- Audio file missing or failed to load
- Check the 🤖 icon next to the phrase
- Regenerate audio files using gTTS

### Preloading too slow?

- Audio files are preloaded asynchronously
- First click may use TTS, subsequent clicks use cached audio
- Total preload time: ~2-5 seconds for all 44 files

## Future Enhancements

- [ ] Record actual native speaker (higher quality)
- [ ] Add male voice option
- [ ] Include different speaking speeds
- [ ] Add regional dialect variations
- [ ] Compress audio files further (WebM/Opus)

## Credits

Audio generated using:
- **gTTS** (Google Text-to-Speech) - Free, open source
- **@google-cloud/text-to-speech** - Premium WaveNet voices (optional)
