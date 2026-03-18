#!/usr/bin/env python3

"""
Generate native speaker audio for Japanese phrases using gTTS (Google Text-to-Speech)
This is a free service that doesn't require API keys or authentication.

Requirements:
pip install gtts

Usage:
python3 scripts/generate-audio-gtts.py
"""

import json
import os
from pathlib import Path

try:
    from gtts import gTTS
    GTTS_AVAILABLE = True
except ImportError:
    print("⚠ gTTS not installed. Run: pip install gtts")
    GTTS_AVAILABLE = False
    exit(1)

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
PHRASES_FILE = PROJECT_DIR / 'phrases.json'
AUDIO_DIR = PROJECT_DIR / 'audio' / 'phrases'

# Create audio directory
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

def load_phrases():
    """Load phrases from JSON file"""
    with open(PHRASES_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def generate_audio(text, output_path, lang='ja'):
    """Generate audio file using gTTS"""
    try:
        tts = gTTS(text=text, lang=lang, slow=False)
        tts.save(str(output_path))
        return True
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False

def main():
    print('\n🎤 Starting audio generation with gTTS...\n')

    # Load phrases
    phrases_data = load_phrases()
    categories = list(phrases_data.keys())

    total_phrases = sum(len(phrases_data[cat]) for cat in categories)
    success_count = 0
    fail_count = 0
    skip_count = 0

    for category in categories:
        phrases = phrases_data[category]
        print(f'\n📁 Category: {category} ({len(phrases)} phrases)')

        for i, phrase in enumerate(phrases):
            filename = f'{category}_{i}.mp3'
            output_path = AUDIO_DIR / filename

            # Skip if file already exists
            if output_path.exists():
                print(f'  ⏭  {filename} (already exists)')
                success_count += 1
                skip_count += 1
                continue

            # Generate audio
            print(f'  🔄 {filename} ... ', end='', flush=True)

            if generate_audio(phrase['ja'], output_path):
                print('✓')
                success_count += 1
            else:
                print('✗')
                fail_count += 1

    # Summary
    print('\n' + '=' * 50)
    print(f'\n✅ Audio generation complete!')
    print(f'   Total phrases: {total_phrases}')
    print(f'   Generated: {success_count - skip_count}')
    print(f'   Skipped (existing): {skip_count}')
    if fail_count > 0:
        print(f'   Failed: {fail_count}')
    print(f'   Output: {AUDIO_DIR}')
    print('')

if __name__ == '__main__':
    main()
