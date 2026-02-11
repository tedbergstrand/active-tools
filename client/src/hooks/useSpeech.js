import { useCallback, useRef } from 'react';
import { getAudioContext } from '../utils/audioContext.js';

export function formatTimeAsSpeech(seconds) {
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return m > 0 ? `${h} hour${h > 1 ? 's' : ''} ${m} minute${m > 1 ? 's' : ''}` : `${h} hour${h > 1 ? 's' : ''}`;
  }
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m} minute${m > 1 ? 's' : ''} ${s} seconds` : `${m} minute${m > 1 ? 's' : ''}`;
  }
  return `${seconds} seconds`;
}

// Warm up speechSynthesis on a user gesture (required for iOS Safari).
// Call this from a click/tap handler before starting a session.
export function warmUpSpeech() {
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    speechSynthesis.speak(u);
  }
  // Also resume AudioContext if suspended
  getAudioContext();
}

export function useSpeech() {
  const utteranceRef = useRef(null);

  // Fallback: play attention beeps when TTS is unavailable or fails
  const beepFallback = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      // Two-tone attention beep
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.value = 880;
      gain1.gain.value = 0.2;
      osc1.start(now);
      osc1.stop(now + 0.12);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 1100;
      gain2.gain.value = 0.2;
      osc2.start(now + 0.18);
      osc2.stop(now + 0.3);
    } catch (e) { /* audio not available at all */ }
  }, []);

  const speak = useCallback((text, options = {}) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate || 1.2;
      utterance.volume = options.volume ?? 1;
      utterance.pitch = options.pitch || 1;
      // Fallback to beep if TTS errors
      utterance.onerror = () => beepFallback();
      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    } else {
      // No TTS available — beep as attention signal
      beepFallback();
    }
  }, [beepFallback]);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }, []);

  const supported = 'speechSynthesis' in window;

  return { speak, stop, supported };
}
