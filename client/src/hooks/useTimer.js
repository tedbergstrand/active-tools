import { useState, useRef, useCallback, useEffect } from 'react';
import { getAudioContext } from '../utils/audioContext.js';

const STATES = { idle: 'idle', ready: 'ready', running: 'running', paused: 'paused', complete: 'complete' };

export function useTimer() {
  const [state, setState] = useState(STATES.idle);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [phases, setPhases] = useState([]);
  const [totalSets, setTotalSets] = useState(1);
  const [presetName, setPresetName] = useState('');
  const intervalRef = useRef(null);
  const wakeLockRef = useRef(null);

  // Use refs to avoid stale closures in setInterval and cross-callback calls
  const stateRef = useRef(state);
  const phasesRef = useRef(phases);
  const totalSetsRef = useRef(totalSets);
  const currentPhaseRef = useRef(currentPhase);
  const currentSetRef = useRef(currentSet);

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { phasesRef.current = phases; }, [phases]);
  useEffect(() => { totalSetsRef.current = totalSets; }, [totalSets]);
  useEffect(() => { currentPhaseRef.current = currentPhase; }, [currentPhase]);
  useEffect(() => { currentSetRef.current = currentSet; }, [currentSet]);

  const playBeep = useCallback((freq = 800, duration = 150) => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + duration / 1000);
    } catch (e) { /* audio not available */ }
  }, []);

  const vibrate = useCallback((pattern) => {
    if (navigator.vibrate) navigator.vibrate(pattern);
  }, []);

  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch (e) { /* wake lock not available */ }
  }, []);

  const releaseWakeLock = useCallback(() => {
    wakeLockRef.current?.release();
    wakeLockRef.current = null;
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const loadPreset = useCallback((preset) => {
    clearTimer();
    const p = preset.phases || [];
    setPhases(p);
    setTotalSets(preset.total_sets || 1);
    setPresetName(preset.name || '');
    setCurrentPhase(0);
    setCurrentSet(1);
    if (p.length > 0) {
      setTimeLeft(p[0].duration_seconds);
      setState(STATES.ready);
      stateRef.current = STATES.ready;
    }
  }, [clearTimer]);

  const startSimple = useCallback((seconds, label = 'Rest') => {
    clearTimer();
    const p = [{ label, duration_seconds: seconds, color: '#3b82f6' }];
    setPhases(p);
    setTotalSets(1);
    setPresetName(label);
    setCurrentPhase(0);
    setCurrentSet(1);
    setTimeLeft(seconds);
    setState(STATES.ready);
    stateRef.current = STATES.ready;
  }, [clearTimer]);

  const advance = useCallback(() => {
    const ph = phasesRef.current;
    const ts = totalSetsRef.current;
    const cp = currentPhaseRef.current;
    const cs = currentSetRef.current;

    if (!ph.length) {
      clearTimer();
      releaseWakeLock();
      setState(STATES.complete);
      return;
    }

    const nextPhase = cp + 1;
    if (nextPhase < ph.length) {
      setCurrentPhase(nextPhase);
      setTimeLeft(ph[nextPhase].duration_seconds);
      return;
    }

    // End of all phases in this set
    const nextSet = cs + 1;
    if (nextSet <= ts) {
      setCurrentSet(nextSet);
      setCurrentPhase(0);
      setTimeLeft(ph[0].duration_seconds);
      return;
    }

    // All sets complete
    clearTimer();
    releaseWakeLock();
    setState(STATES.complete);
    playBeep(1200, 500);
    vibrate([200, 100, 200]);
  }, [clearTimer, releaseWakeLock, playBeep, vibrate]);

  const start = useCallback(() => {
    if (stateRef.current !== STATES.ready && stateRef.current !== STATES.paused) return;
    setState(STATES.running);
    stateRef.current = STATES.running;
    requestWakeLock();
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          advance();
          return prev; // advance sets timeLeft
        }
        if (prev - 1 <= 3 && prev - 1 > 0) playBeep(600, 100);
        return prev - 1;
      });
    }, 1000);
  }, [advance, requestWakeLock, playBeep]);

  const pause = useCallback(() => {
    clearTimer();
    setState(STATES.paused);
    stateRef.current = STATES.paused;
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    releaseWakeLock();
    setCurrentPhase(0);
    setCurrentSet(1);
    if (phases.length > 0) {
      setTimeLeft(phases[0].duration_seconds);
      setState(STATES.ready);
      stateRef.current = STATES.ready;
    } else {
      setState(STATES.idle);
      stateRef.current = STATES.idle;
    }
  }, [clearTimer, releaseWakeLock, phases]);

  const stop = useCallback(() => {
    clearTimer();
    releaseWakeLock();
    setState(STATES.idle);
    stateRef.current = STATES.idle;
    setPhases([]);
    setTimeLeft(0);
    setCurrentPhase(0);
    setCurrentSet(1);
    setPresetName('');
  }, [clearTimer, releaseWakeLock]);

  useEffect(() => {
    return () => {
      clearTimer();
      releaseWakeLock();
    };
  }, [clearTimer, releaseWakeLock]);

  return {
    state,
    timeLeft,
    currentPhase,
    currentSet,
    totalSets,
    phases,
    presetName,
    isRunning: state === STATES.running,
    isActive: state !== STATES.idle,
    currentPhaseData: phases[currentPhase] || null,
    loadPreset,
    startSimple,
    start,
    pause,
    reset,
    stop,
  };
}
