/**
 * Audio Player for Japanese Phrases
 * Provides native speaker audio with intelligent preloading and TTS fallback
 */

class PhraseAudioPlayer {
  constructor() {
    this.audioCache = new Map();
    this.preloadedAudio = new Set();
    this.currentAudio = null;
    this.useTTSFallback = true; // Enable TTS fallback if audio file not found
    this.audioBaseUrl = '/audio/phrases/';

    // Track loading status for UI feedback
    this.loadingStatus = {
      total: 0,
      loaded: 0,
      failed: 0
    };

    // Preload on initialization
    this.initializePreloading();
  }

  /**
   * Generate audio filename from phrase data
   * Format: category_index.mp3 (e.g., general_0.mp3, restaurant_1.mp3)
   */
  getAudioFilename(category, index) {
    return `${category}_${index}.mp3`;
  }

  /**
   * Initialize preloading for all phrases
   */
  async initializePreloading() {
    // Wait for phrases data to be loaded
    const checkPhrasesInterval = setInterval(() => {
      if (window.phrasesData) {
        clearInterval(checkPhrasesInterval);
        this.preloadAllPhrases();
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkPhrasesInterval);
      if (!window.phrasesData) {
        console.warn('[Audio] Phrases data not loaded after timeout');
      }
    }, 10000);
  }

  /**
   * Preload all phrase audio files
   */
  async preloadAllPhrases() {
    if (!window.phrasesData) {
      console.warn('[Audio] Phrases data not available');
      return;
    }

    const categories = Object.keys(window.phrasesData);
    let totalPhrases = 0;

    // Count total phrases
    categories.forEach(category => {
      totalPhrases += window.phrasesData[category].length;
    });

    this.loadingStatus.total = totalPhrases;
    console.log(`[Audio] Preloading ${totalPhrases} audio files...`);

    // Preload each category
    for (const category of categories) {
      const phrases = window.phrasesData[category];
      for (let i = 0; i < phrases.length; i++) {
        await this.preloadAudio(category, i);
      }
    }

    console.log(`[Audio] Preloading complete: ${this.loadingStatus.loaded} loaded, ${this.loadingStatus.failed} failed`);
  }

  /**
   * Preload a single audio file
   */
  async preloadAudio(category, index) {
    const filename = this.getAudioFilename(category, index);
    const cacheKey = `${category}_${index}`;

    // Skip if already preloaded
    if (this.preloadedAudio.has(cacheKey)) {
      return true;
    }

    return new Promise((resolve) => {
      const audio = new Audio();
      const url = this.audioBaseUrl + filename;

      audio.addEventListener('canplaythrough', () => {
        this.audioCache.set(cacheKey, audio);
        this.preloadedAudio.add(cacheKey);
        this.loadingStatus.loaded++;
        resolve(true);
      }, { once: true });

      audio.addEventListener('error', (e) => {
        console.warn(`[Audio] Failed to load ${filename}:`, e);
        this.loadingStatus.failed++;
        resolve(false);
      }, { once: true });

      audio.preload = 'auto';
      audio.src = url;
    });
  }

  /**
   * Play audio for a phrase
   * @param {string} japaneseText - The Japanese text (used for TTS fallback)
   * @param {string} category - Phrase category
   * @param {number} index - Phrase index within category
   */
  async play(japaneseText, category, index) {
    // Stop any currently playing audio
    this.stop();

    const cacheKey = `${category}_${index}`;

    // Try to play from cache first
    if (this.audioCache.has(cacheKey)) {
      const audio = this.audioCache.get(cacheKey);
      this.currentAudio = audio;

      try {
        audio.currentTime = 0; // Reset to start
        await audio.play();
        console.log(`[Audio] Playing cached audio for ${cacheKey}`);
        return true;
      } catch (error) {
        console.error(`[Audio] Failed to play cached audio:`, error);
        // Fall through to TTS fallback
      }
    } else {
      // Try to load and play audio file
      const filename = this.getAudioFilename(category, index);
      const url = this.audioBaseUrl + filename;

      const audio = new Audio();
      this.currentAudio = audio;

      // Set up promise to handle load/error
      const playPromise = new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', async () => {
          try {
            await audio.play();
            // Cache for future use
            this.audioCache.set(cacheKey, audio);
            this.preloadedAudio.add(cacheKey);
            console.log(`[Audio] Playing loaded audio for ${cacheKey}`);
            resolve(true);
          } catch (error) {
            reject(error);
          }
        }, { once: true });

        audio.addEventListener('error', (e) => {
          console.warn(`[Audio] Could not load ${filename}`);
          reject(e);
        }, { once: true });

        audio.src = url;
      });

      try {
        await playPromise;
        return true;
      } catch (error) {
        console.log(`[Audio] Falling back to TTS for ${cacheKey}`);
        // Fall through to TTS fallback
      }
    }

    // TTS Fallback
    if (this.useTTSFallback) {
      return this.playTTS(japaneseText);
    }

    return false;
  }

  /**
   * Play using Text-to-Speech (fallback)
   */
  playTTS(text) {
    if (!window.speechSynthesis) {
      console.error('[Audio] Speech synthesis not supported');
      return false;
    }

    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85; // Slightly slower for clarity
      utterance.pitch = 1.0;

      window.speechSynthesis.speak(utterance);
      console.log('[Audio] Playing TTS fallback');
      return true;
    } catch (error) {
      console.error('[Audio] TTS error:', error);
      return false;
    }
  }

  /**
   * Stop currently playing audio
   */
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    // Also stop TTS
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Get loading progress (0-100)
   */
  getProgress() {
    if (this.loadingStatus.total === 0) return 0;
    return Math.round((this.loadingStatus.loaded / this.loadingStatus.total) * 100);
  }

  /**
   * Check if audio is available for a phrase
   */
  isAudioAvailable(category, index) {
    const cacheKey = `${category}_${index}`;
    return this.audioCache.has(cacheKey);
  }

  /**
   * Get total cache statistics
   */
  getStats() {
    return {
      cached: this.audioCache.size,
      preloaded: this.preloadedAudio.size,
      ...this.loadingStatus
    };
  }
}

// Create global instance
window.phraseAudioPlayer = new PhraseAudioPlayer();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PhraseAudioPlayer;
}
