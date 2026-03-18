# Native Speaker Recording Workflow

Complete guide for replacing TTS-generated audio with professional native speaker recordings.

## Current Status

🔄 **TTS Generated**: Currently using gTTS (Google Text-to-Speech) for all 44 phrases
🎯 **Goal**: Replace with professional native Japanese speaker recordings

---

## Quick Start

### Option 1: Hire Native Speaker (Recommended for Production)

**Budget**: $200 | **Timeline**: 5 days | **Quality**: Professional

1. **Post job on Fiverr/Upwork**
   ```bash
   # Use the hiring brief
   open NATIVE_SPEAKER_HIRING_BRIEF.md
   ```

2. **Share requirements with voice actor**
   - Send `NATIVE_SPEAKER_HIRING_BRIEF.md`
   - Budget: $200 ($100 after first 10 phrases, $100 after completion)
   - Specs: 44.1kHz, mono, MP3 128kbps, normalized volume

3. **Receive recordings**
   - Voice actor delivers ZIP file with 44 MP3 files
   - Files should follow naming: `category_index.mp3`

4. **Process recordings**
   ```bash
   # Extract ZIP to /audio/phrases-raw/
   unzip japanese-phrases-recording.zip -d audio/phrases-raw/

   # Validate and process
   npm run process-audio

   # Verify output
   npm run validate-audio
   ```

5. **Test in browser**
   ```bash
   npm start
   # Open http://localhost:3000
   # Click phrases button (🗣️)
   # Test all 44 phrases
   ```

6. **Deploy**
   ```bash
   git add audio/phrases
   git commit -m "Replace TTS with native speaker recordings"
   git push origin main
   ```

---

### Option 2: Use Current TTS (Free, Already Implemented)

**Budget**: $0 | **Timeline**: Immediate | **Quality**: Good enough

The app already has TTS-generated audio using gTTS. This is acceptable for:
- MVP/Beta testing
- Budget constraints
- Quick deployments

To regenerate TTS audio:
```bash
npm run generate-audio-tts
```

---

## File Structure

```
japan-trip/
├── audio/
│   ├── phrases/          # Production audio (44 MP3s)
│   └── phrases-raw/      # Raw recordings from voice actor (for processing)
│
├── scripts/
│   ├── generate-audio-gtts.py         # Generate TTS audio (free)
│   ├── process-native-recordings.js   # Process native recordings
│   └── validate-audio.js              # Validate audio files
│
├── audio-player.js                    # Audio playback system
├── phrases.json                       # All 44 phrases
└── NATIVE_SPEAKER_HIRING_BRIEF.md    # Hiring instructions
```

---

## NPM Scripts

Add these to `package.json`:

```json
{
  "scripts": {
    "validate-audio": "node scripts/validate-audio.js",
    "process-audio": "node scripts/process-native-recordings.js",
    "generate-audio-tts": "python3 scripts/generate-audio-gtts.py",
    "audio-check": "npm run validate-audio"
  }
}
```

---

## Detailed Workflow

### Phase 1: Hiring (Days 1-2)

1. **Create job posting**
   - Platform: Fiverr or Upwork
   - Copy from: `NATIVE_SPEAKER_HIRING_BRIEF.md`
   - Budget: $200
   - Timeline: 5 days

2. **Review proposals**
   - Check voice samples
   - Verify native Japanese speaker
   - Confirm recording equipment quality
   - Ask about experience with travel/educational content

3. **Hire and communicate**
   - Send complete phrase list (in hiring brief)
   - Share technical specifications
   - Set milestones:
     - Milestone 1 (50%): First 10 phrases approved
     - Milestone 2 (50%): All 44 phrases delivered

### Phase 2: Recording (Days 3-4)

Voice actor records and delivers:

**Expected deliverables**:
- 44 MP3 files
- Naming: `category_index.mp3`
- Quality: 44.1kHz, mono, 128kbps
- Each file: 1s silence + phrase + 1s silence

**Your review**:
1. Download ZIP file
2. Extract to `audio/phrases-raw/`
3. Run validation: `npm run validate-audio`
4. Spot-check 5-10 random files for quality
5. Approve or request revisions

### Phase 3: Processing (Day 5)

**Setup**:
```bash
# Install ffmpeg (if not already installed)
brew install ffmpeg

# Install npm dependencies
npm install
```

**Process recordings**:
```bash
# Validate raw files
npm run validate-audio

# Process with normalization and padding
npm run process-audio

# Check output
npm run validate-audio
```

**What the processing script does**:
- ✅ Adds 1-second silence padding (if missing)
- ✅ Normalizes volume to -3dB
- ✅ Converts to mono (if stereo)
- ✅ Sets sample rate to 44.1kHz
- ✅ Sets bitrate to 128kbps
- ✅ Outputs to `/audio/phrases/`

**Expected output**:
```
✓ All 44 files processed successfully!
Total size: ~1-2 MB
Ready for deployment
```

### Phase 4: Testing (Day 5)

**Local testing**:
```bash
# Start local server
npm start

# Open browser
open http://localhost:3000
```

**Test checklist**:
- [ ] Click phrases button (🗣️)
- [ ] Each category expands/collapses
- [ ] Click all 44 phrases
- [ ] Verify natural voice (not robotic TTS)
- [ ] Check for consistent volume
- [ ] Verify 🎤 icon shows (native audio)
- [ ] Test on mobile device
- [ ] Test offline mode (PWA)

**Browser DevTools check**:
1. Network tab → See all MP3s load
2. Console → Check for errors
3. Application → Service Worker → Verify audio cached

### Phase 5: Deployment (Day 5)

**Commit changes**:
```bash
git add audio/phrases/*.mp3
git commit -m "Replace TTS with native Japanese speaker recordings

- 44 professional MP3 recordings
- Budget: $200 (Fiverr/Upwork)
- Quality: 44.1kHz, mono, 128kbps, normalized
- Total size: ~1-2 MB
- Improves user experience significantly"

git push origin main
```

**Vercel deployment** (automatic):
```bash
# Vercel will auto-deploy on push to main
# Check deployment: https://vercel.com/dashboard

# Or manual deployment:
npx vercel --prod
```

**Post-deployment verification**:
1. Visit production URL
2. Test all 44 phrases
3. Check Network tab (audio loads from CDN)
4. Verify PWA caching works
5. Test on mobile devices

---

## Quality Checklist

### Audio File Quality
- [ ] Natural Japanese pronunciation (native speaker)
- [ ] Consistent volume across all files
- [ ] No background noise or echo
- [ ] Clear pronunciation (not rushed)
- [ ] Appropriate speaking speed (slightly slower)
- [ ] Friendly, approachable tone

### Technical Quality
- [ ] Format: MP3
- [ ] Sample rate: 44.1 kHz
- [ ] Channels: Mono
- [ ] Bitrate: 128 kbps
- [ ] Silence padding: 1s before + 1s after
- [ ] Volume normalized to -3dB

### System Integration
- [ ] All 44 files present
- [ ] Correct naming: `category_index.mp3`
- [ ] Files load in browser
- [ ] Audio player works correctly
- [ ] Fallback to TTS if needed
- [ ] Service Worker caches audio
- [ ] PWA works offline

---

## Troubleshooting

### Problem: Voice actor delivered wrong file names

**Solution**:
```bash
# Rename files using script
node scripts/rename-audio-files.js
```

Or manually rename following pattern: `category_index.mp3`

### Problem: Audio quality is poor (noise, echo)

**Solution**:
1. Request revision from voice actor (1 free revision included)
2. Or use noise reduction tool:
   ```bash
   ffmpeg -i input.mp3 -af "afftdn=nf=-25" output.mp3
   ```

### Problem: Files are too large (> 50 KB each)

**Solution**:
```bash
# Re-encode at lower bitrate
ffmpeg -i input.mp3 -b:a 96k output.mp3
```

### Problem: Some phrases sound too fast

**Solution**:
Request re-recording at 0.85x speed, or slow down in post:
```bash
ffmpeg -i input.mp3 -filter:a "atempo=0.9" output.mp3
```

### Problem: Volume inconsistent between files

**Solution**:
Use the processing script which includes normalization:
```bash
npm run process-audio
```

---

## Cost Breakdown

### Option 1: Native Speaker (Recommended)
- Voice actor: $200
- Time investment: 1-2 hours (your time)
- **Total**: $200 + 2 hours

### Option 2: TTS (Current)
- gTTS: Free
- Time investment: 5 minutes
- **Total**: $0 + 5 minutes

### Option 3: Premium TTS (Google Cloud)
- Google Cloud TTS: ~$16 for 1M chars
- For 44 phrases: < $1
- Time investment: 15 minutes
- **Total**: $1 + 15 minutes

---

## Expected Results

### Before (TTS)
- ❌ Robotic voice
- ❌ Inconsistent across browsers
- ❌ Sometimes fails on iOS
- ❌ Variable quality
- ⚠️ Amateur feel

### After (Native Speaker)
- ✅ Natural, professional voice
- ✅ Consistent everywhere
- ✅ Works on all devices
- ✅ High quality
- ✅ Premium feel

### Business Impact
- 📈 Higher perceived value
- 📈 Better user reviews
- 📈 Increased conversion rate
- 📈 Competitive advantage
- 📈 Professional credibility

---

## Timeline Summary

| Phase | Duration | Owner |
|-------|----------|-------|
| 1. Hiring | 1-2 days | You |
| 2. Recording | 2-3 days | Voice actor |
| 3. Processing | 1 hour | You |
| 4. Testing | 1 hour | You |
| 5. Deployment | 15 min | You |
| **Total** | **5 days** | - |

---

## Next Steps

Choose your path:

### Path A: Go Professional ($200, 5 days)
```bash
1. open NATIVE_SPEAKER_HIRING_BRIEF.md
2. Post job on Fiverr/Upwork
3. Wait for recordings
4. npm run process-audio
5. npm run validate-audio
6. git commit && git push
```

### Path B: Keep TTS (Free, Already Done)
```bash
1. npm run validate-audio  # Verify current TTS files
2. Test in browser
3. Deploy as-is
4. Upgrade to native speaker later
```

---

## Support

Questions? Check:
- **Technical**: See `audio-player.js` source code
- **Hiring**: See `NATIVE_SPEAKER_HIRING_BRIEF.md`
- **Processing**: Run `npm run process-audio --help`

---

**Last Updated**: 2024-03-18
**Status**: Ready for native speaker recordings
**Current Audio**: TTS-generated (gTTS)
