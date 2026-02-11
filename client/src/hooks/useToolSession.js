import { useState, useRef, useCallback, useEffect } from 'react';

const STATES = {
  idle: 'idle',
  configured: 'configured',
  running: 'running',
  paused: 'paused',
  resting: 'resting',
  complete: 'complete',
};

export { STATES as TOOL_SESSION_STATES };

export function useToolSession() {
  const [state, setState] = useState(STATES.idle);
  const [tool, setTool] = useState(null);
  const [config, setConfig] = useState({});
  const [elapsed, setElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [phase, setPhase] = useState('');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [set, setSet] = useState(1);
  const [totalSets, setTotalSets] = useState(1);
  const [stats, setStats] = useState({ attempts: 0, completed: 0, rounds: 0 });
  const [log, setLog] = useState([]);

  const intervalRef = useRef(null);
  const wakeLockRef = useRef(null);
  const startTimeRef = useRef(null);
  const audioCtxRef = useRef(null);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const playBeep = useCallback((freq = 800, duration = 150) => {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + duration / 1000);
    } catch (e) { /* audio not available */ }
  }, [getAudioCtx]);

  const vibrate = useCallback((pattern) => {
    if (navigator.vibrate) navigator.vibrate(pattern);
  }, []);

  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch (e) { /* not available */ }
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

  const loadTool = useCallback((toolDef, userConfig = {}) => {
    clearTimer();
    setTool(toolDef);
    const defaultCfg = toolDef.default_config ? JSON.parse(toolDef.default_config) : {};
    setConfig({ ...defaultCfg, ...userConfig });
    setElapsed(0);
    setTimeLeft(0);
    setPhase('');
    setPhaseIndex(0);
    setSet(1);
    setTotalSets(1);
    setStats({ attempts: 0, completed: 0, rounds: 0 });
    setLog([]);
    setState(STATES.configured);
  }, [clearTimer]);

  const startSession = useCallback(() => {
    if (state !== STATES.configured && state !== STATES.paused) return;
    setState(STATES.running);
    startTimeRef.current = Date.now() - (elapsed * 1000);
    requestWakeLock();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const totalElapsed = Math.floor((now - startTimeRef.current) / 1000);
      setElapsed(totalElapsed);

      setTimeLeft(prev => {
        if (prev <= 0) return 0;
        const next = prev - 1;
        if (next <= 3 && next > 0) playBeep(600, 100);
        if (next === 0) {
          playBeep(1200, 300);
          vibrate([200, 100, 200]);
        }
        return next;
      });
    }, 1000);
  }, [state, elapsed, requestWakeLock, playBeep, vibrate]);

  const pause = useCallback(() => {
    clearTimer();
    setState(STATES.paused);
  }, [clearTimer]);

  const startRest = useCallback((seconds) => {
    clearTimer();
    setTimeLeft(seconds);
    setPhase('Rest');
    setState(STATES.resting);

    startTimeRef.current = Date.now() - (elapsed * 1000);
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      setElapsed(Math.floor((now - startTimeRef.current) / 1000));

      setTimeLeft(prev => {
        if (prev <= 1) {
          clearTimer();
          playBeep(1200, 500);
          vibrate([200, 100, 200]);
          setState(STATES.running);
          return 0;
        }
        if (prev - 1 <= 3 && prev - 1 > 0) playBeep(600, 100);
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, elapsed, playBeep, vibrate]);

  const startCountdown = useCallback((seconds, phaseName = '') => {
    setTimeLeft(seconds);
    if (phaseName) setPhase(phaseName);
  }, []);

  const logAttempt = useCallback((result) => {
    setStats(prev => ({
      ...prev,
      attempts: prev.attempts + 1,
      completed: result.success ? prev.completed + 1 : prev.completed,
    }));
    setLog(prev => [...prev, { ...result, timestamp: Date.now() }]);
  }, []);

  const incrementRound = useCallback(() => {
    setStats(prev => ({ ...prev, rounds: prev.rounds + 1 }));
  }, []);

  const nextSet = useCallback(() => {
    setSet(prev => prev + 1);
    setPhaseIndex(0);
  }, []);

  const setPhaseInfo = useCallback((name, index) => {
    setPhase(name);
    if (index !== undefined) setPhaseIndex(index);
  }, []);

  const complete = useCallback(() => {
    clearTimer();
    releaseWakeLock();
    setState(STATES.complete);
    playBeep(1200, 500);
    vibrate([200, 100, 200, 100, 200]);
  }, [clearTimer, releaseWakeLock, playBeep, vibrate]);

  const stop = useCallback(() => {
    clearTimer();
    releaseWakeLock();
    setState(STATES.idle);
    setTool(null);
    setConfig({});
    setElapsed(0);
    setTimeLeft(0);
    setPhase('');
    setPhaseIndex(0);
    setSet(1);
    setStats({ attempts: 0, completed: 0, rounds: 0 });
    setLog([]);
  }, [clearTimer, releaseWakeLock]);

  useEffect(() => {
    return () => {
      clearTimer();
      releaseWakeLock();
    };
  }, [clearTimer, releaseWakeLock]);

  return {
    state,
    tool,
    config,
    elapsed,
    timeLeft,
    phase,
    phaseIndex,
    set,
    totalSets,
    stats,
    log,
    isRunning: state === STATES.running,
    isActive: state !== STATES.idle,
    isResting: state === STATES.resting,
    isComplete: state === STATES.complete,
    loadTool,
    startSession,
    pause,
    startRest,
    startCountdown,
    logAttempt,
    incrementRound,
    nextSet,
    setTotalSets,
    setPhaseInfo,
    complete,
    stop,
  };
}
