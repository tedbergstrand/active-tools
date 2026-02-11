import { useState, useCallback, useRef, useEffect } from 'react';
import { getAudioContext } from '../utils/audioContext.js';

export function useMetronome(initialBpm = 60) {
  const [bpm, setBpm] = useState(initialBpm);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beat, setBeat] = useState(0);
  const bpmRef = useRef(initialBpm);
  const playingRef = useRef(false);
  const timeoutRef = useRef(null);
  const nextTickTimeRef = useRef(0);

  const click = useCallback((accent = false) => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = accent ? 1000 : 800;
      gain.gain.value = accent ? 0.4 : 0.25;
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) { /* audio not available */ }
  }, []);

  // Self-correcting setTimeout scheduler — prevents drift
  const scheduleNextRef = useRef(null);
  scheduleNextRef.current = () => {
    if (!playingRef.current) return;
    const interval = 60000 / bpmRef.current;
    const now = performance.now();
    const drift = now - nextTickTimeRef.current;
    const delay = Math.max(1, interval - drift);
    nextTickTimeRef.current = now + delay;

    timeoutRef.current = setTimeout(() => {
      if (!playingRef.current) return;
      setBeat(prev => {
        const next = prev + 1;
        click(next % 4 === 0);
        return next;
      });
      scheduleNextRef.current?.();
    }, delay);
  };

  const start = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    playingRef.current = true;
    setIsPlaying(true);
    setBeat(0);
    click(true);
    nextTickTimeRef.current = performance.now() + 60000 / bpmRef.current;
    scheduleNextRef.current?.();
  }, [click]);

  const stop = useCallback(() => {
    playingRef.current = false;
    setIsPlaying(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const changeBpm = useCallback((newBpm) => {
    const clamped = Math.max(10, Math.min(200, newBpm));
    bpmRef.current = clamped;
    setBpm(clamped);
  }, []);

  useEffect(() => {
    return () => {
      playingRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { bpm, isPlaying, beat, start, stop, changeBpm };
}
