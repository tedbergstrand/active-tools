import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Square, SkipForward, Minimize2 } from 'lucide-react';
import { Button } from '../common/Button.jsx';
import { CalloutDisplay } from './CalloutDisplay.jsx';
import { MetronomeVisual } from './MetronomeVisual.jsx';
import { SessionSummary } from './SessionSummary.jsx';
import { useCallout } from '../../hooks/useCallout.js';
import { useMetronome } from '../../hooks/useMetronome.js';
import { useSpeech, formatTimeAsSpeech } from '../../hooks/useSpeech.js';
import { toolsApi } from '../../api/tools.js';
import { buildSteps } from '../../utils/buildSteps.js';
import { getAudioContext } from '../../utils/audioContext.js';

function formatTime(seconds) {
  if (seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatElapsed(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ToolSessionRunner({ tool, initialConfig, onClose, onMinimize, sessionStateRef, onStartNext }) {
  const config = initialConfig || (tool?.default_config ? JSON.parse(tool.default_config) : {});
  const stepsRef = useRef((() => {
    try { return buildSteps(tool, config); }
    catch (e) { console.error('buildSteps failed:', e); return [{ type: 'countdown', duration: 5 }, { type: 'active', duration: 600, announce: tool?.name || 'Session' }]; }
  })());

  const s = useRef({
    stepIndex: 0,
    stepTimeLeft: 5,
    stepElapsed: 0,
    elapsed: 0,
    isPaused: false,
    isComplete: false,
    stepsCompleted: 0,
    announcedMilestones: new Set(),
    lastReminderAt: 0,
    lastEmomAt: 0,
    vmPhaseStartBeat: 0,
    vmCurrentBpm: 0,
    vmIsSlow: true,
  });

  const [, setTick] = useState(0);
  const render = useCallback(() => setTick(t => t + 1), []);

  // End session confirmation
  const [confirmEnd, setConfirmEnd] = useState(false);

  // Phase transition flash — briefly changes background color
  const [flash, setFlash] = useState(null);
  const flashTimeout = useRef(null);
  const triggerFlash = useCallback((type) => {
    if (flashTimeout.current) clearTimeout(flashTimeout.current);
    setFlash(type);
    flashTimeout.current = setTimeout(() => setFlash(null), 600);
  }, []);

  const intervalRef = useRef(null);
  const wakeLockRef = useRef(null);
  const { speak, stop: stopSpeech } = useSpeech();
  const callout = useCallout({
    pools: config.pools || {},
    interval: config.interval || 8,
    mode: 'timed',
    callouts: config.callouts || [],
  });
  const metronome = useMetronome(config.bpm || config.slowBpm || config.startBpm || 60);

  const playBeep = useCallback((freq = 800, dur = 150) => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + dur / 1000);
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
    } catch (e) { /* not available */ }
  }, []);

  const releaseWakeLock = useCallback(() => {
    wakeLockRef.current?.release();
    wakeLockRef.current = null;
  }, []);

  // Report state to context ref (for floating widget)
  const reportState = useCallback(() => {
    if (sessionStateRef) {
      const st = s.current;
      const step = stepsRef.current[st.stepIndex];
      sessionStateRef.current = {
        elapsed: st.elapsed,
        stepLabel: step?.label || tool.name,
        stepTimeLeft: st.stepTimeLeft,
      };
    }
  }, [sessionStateRef, tool.name]);

  const advanceStepRef = useRef(null);
  advanceStepRef.current = () => {
    const st = s.current;
    const steps = stepsRef.current;

    const currentStep = steps[st.stepIndex];
    if (currentStep && currentStep.type === 'active') {
      st.stepsCompleted++;
    }

    const nextIdx = st.stepIndex + 1;
    callout.stopAuto();
    metronome.stop();

    if (nextIdx >= steps.length) {
      st.isComplete = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      releaseWakeLock();
      playBeep(1200, 500);
      vibrate([200, 100, 200, 100, 200]);
      reportState();
      render();
      return;
    }

    st.stepIndex = nextIdx;
    const step = steps[nextIdx];
    st.stepTimeLeft = step.duration || 0;
    st.stepElapsed = 0;
    st.announcedMilestones = new Set();
    st.lastReminderAt = 0;
    st.lastEmomAt = 0;

    // Visual flash for phase transition — visible from the wall
    triggerFlash(step.type === 'rest' ? 'rest' : 'active');

    if (step.announce) speak(step.announce);

    if (step.type === 'callout') callout.startAuto();
    if (step.type === 'metronome') {
      metronome.changeBpm(step.bpm);
      metronome.start();
    }
    if (step.type === 'variable-metronome') {
      const startBpm = step.pattern === 'surge-cruise' ? step.slowBpm : step.startBpm;
      st.vmCurrentBpm = startBpm;
      st.vmPhaseStartBeat = 0;
      st.vmIsSlow = true;
      metronome.changeBpm(startBpm);
      metronome.start();
    }

    reportState();
    render();
  };

  const checkMilestones = (st, step) => {
    if (!step.duration) return;
    const dur = step.duration;
    const left = st.stepTimeLeft;
    const ms = st.announcedMilestones;

    if (dur >= 120 && left === Math.floor(dur / 2) && !ms.has('half')) {
      ms.add('half');
      speak(`Halfway! ${formatTimeAsSpeech(left)} remaining.`);
    }
    if (left === 300 && dur > 360 && !ms.has('5m')) { ms.add('5m'); speak('5 minutes remaining.'); }
    if (left === 120 && dur > 180 && !ms.has('2m')) { ms.add('2m'); speak('2 minutes remaining.'); }
    if (left === 60 && dur > 90 && !ms.has('1m')) { ms.add('1m'); speak('1 minute remaining.'); }
    if (left === 30 && dur > 45 && !ms.has('30s')) { ms.add('30s'); speak('30 seconds.'); }
  };

  const tickRef = useRef(null);
  tickRef.current = () => {
    const st = s.current;
    if (st.isPaused || st.isComplete) return;

    st.elapsed++;
    const step = stepsRef.current[st.stepIndex];
    if (!step) return;

    if (step.type === 'countdown') {
      st.stepTimeLeft--;
      if (st.stepTimeLeft > 0 && st.stepTimeLeft <= 3) {
        playBeep(800, 100);
        speak(String(st.stepTimeLeft));
      }
      if (st.stepTimeLeft <= 0) {
        playBeep(1200, 300);
        advanceStepRef.current();
        return;
      }
      reportState();
      render();
      return;
    }

    if (step.duration && st.stepTimeLeft > 0) {
      st.stepTimeLeft--;
      st.stepElapsed++;

      if (st.stepTimeLeft <= 10 && st.stepTimeLeft > 0) {
        playBeep(st.stepTimeLeft <= 3 ? 800 : 600, 100);
      }
      checkMilestones(st, step);

      if (step.reminder && st.stepElapsed > 0) {
        const { interval, text } = step.reminder;
        if (st.stepElapsed - st.lastReminderAt >= interval) {
          st.lastReminderAt = st.stepElapsed;
          if (text) speak(text);
        }
      }

      if (step.emomInterval && st.stepElapsed > 0) {
        if (st.stepElapsed % step.emomInterval === 0) {
          const minute = Math.floor(st.stepElapsed / step.emomInterval);
          playBeep(1000, 200);
          speak(`Minute ${minute + 1}. Go!`);
        }
      }

      if (st.stepTimeLeft <= 0) {
        advanceStepRef.current();
        return;
      }
    } else if (!step.duration) {
      st.stepElapsed++;
    }

    reportState();
    render();
  };

  useEffect(() => {
    requestWakeLock();
    speak('Get ready!');
    intervalRef.current = setInterval(() => tickRef.current?.(), 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (flashTimeout.current) clearTimeout(flashTimeout.current);
      releaseWakeLock();
      stopSpeech();
      callout.stopAuto();
      metronome.stop();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (callout.current && callout.isActive) speak(callout.current);
  }, [callout.current]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const st = s.current;
    const step = stepsRef.current[st.stepIndex];
    if (!step || step.type !== 'variable-metronome' || st.isPaused) return;

    const beatsInPhase = metronome.beat - st.vmPhaseStartBeat;

    if (step.pattern === 'surge-cruise') {
      if (st.vmIsSlow && beatsInPhase >= step.slowMoves) {
        st.vmIsSlow = false;
        st.vmPhaseStartBeat = metronome.beat;
        st.vmCurrentBpm = step.fastBpm;
        metronome.changeBpm(step.fastBpm);
        speak('Surge! Fast!');
        render();
      } else if (!st.vmIsSlow && beatsInPhase >= step.fastMoves) {
        st.vmIsSlow = true;
        st.vmPhaseStartBeat = metronome.beat;
        st.vmCurrentBpm = step.slowBpm;
        metronome.changeBpm(step.slowBpm);
        speak('Slow down. Cruise.');
        render();
      }
    } else if (step.pattern === 'deceleration') {
      if (beatsInPhase >= step.movesPerPhase && st.vmCurrentBpm > step.endBpm) {
        const newBpm = Math.max(step.endBpm, st.vmCurrentBpm - step.decrementPerPhase);
        st.vmPhaseStartBeat = metronome.beat;
        st.vmCurrentBpm = newBpm;
        metronome.changeBpm(newBpm);
        speak(`Slowing to ${newBpm} BPM.`);
        render();
      }
    }
  }, [metronome.beat]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePause = useCallback(() => {
    s.current.isPaused = true;
    callout.stopAuto();
    metronome.stop();
    render();
  }, [callout, metronome, render]);

  const handleResume = useCallback(() => {
    s.current.isPaused = false;
    const step = stepsRef.current[s.current.stepIndex];
    if (step?.type === 'callout') callout.startAuto();
    if (step?.type === 'metronome' || step?.type === 'variable-metronome') metronome.start();
    render();
  }, [callout, metronome, render]);

  const handleStop = useCallback(() => {
    stopSpeech();
    callout.stopAuto();
    metronome.stop();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    releaseWakeLock();
    if (s.current.elapsed > 10) {
      s.current.isComplete = true;
      render();
    } else {
      onClose();
    }
  }, [stopSpeech, callout, metronome, releaseWakeLock, render, onClose]);

  const handleSkipRest = useCallback(() => {
    const step = stepsRef.current[s.current.stepIndex];
    if (step?.type === 'rest') advanceStepRef.current();
  }, []);

  const handleSave = useCallback(async (data) => {
    try { await toolsApi.saveSession(data); } catch (e) { console.error('Failed to save:', e); }
    // Brief delay so user sees "Saved" confirmation
    setTimeout(onClose, 600);
  }, [onClose]);

  const handleDiscard = useCallback(() => { onClose(); }, [onClose]);

  const handleStartNext = useCallback((nextTool) => {
    if (onStartNext) onStartNext(nextTool);
  }, [onStartNext]);

  // --- Render ---
  const st = s.current;
  const step = stepsRef.current[st.stepIndex];

  if (st.isComplete) {
    return (
      <SessionSummary
        tool={tool} elapsed={st.elapsed}
        stats={{ rounds: st.stepsCompleted }}
        config={config} log={[]}
        onSave={handleSave} onDiscard={handleDiscard}
        onStartNext={onStartNext ? handleStartNext : undefined}
      />
    );
  }

  if (step?.type === 'countdown') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-lg text-gray-200 mb-4 font-medium">{tool.name}</p>
        <div className="text-8xl sm:text-9xl font-mono font-bold tabular-nums text-blue-400">
          {st.stepTimeLeft}
        </div>
        <p className="text-gray-400 mt-6 text-base">Get on the wall — starting soon</p>
        <Button variant="ghost" onClick={onClose} className="mt-4">Cancel</Button>
      </div>
    );
  }

  const isRunning = !st.isPaused && !st.isComplete;
  const showTimer = step?.type === 'active' || step?.type === 'rest';
  const showCallout = step?.type === 'callout';
  const showMetronome = step?.type === 'metronome' || step?.type === 'variable-metronome';
  const isRestStep = step?.type === 'rest';

  const totalSteps = stepsRef.current.length;
  const currentStepNum = st.stepIndex + 1;

  // Next step preview
  const nextStep = stepsRef.current[st.stepIndex + 1];
  const nextLabel = nextStep
    ? nextStep.type === 'rest'
      ? `Next: Rest ${nextStep.duration ? formatTime(nextStep.duration) : ''}`
      : `Next: ${nextStep.label || tool.name}`
    : 'Last step';

  // Phase color and label for large readable indicator
  const phaseColor = isRestStep ? 'text-emerald-400' : 'text-blue-400';
  const phaseBg = isRestStep ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-blue-500/10 border-blue-500/20';
  const phaseText = isRestStep ? 'REST' : (showCallout ? 'LISTEN' : showMetronome ? 'RHYTHM' : 'GO');

  // Flash overlay class
  const flashClass = flash === 'rest'
    ? 'ring-4 ring-emerald-400/40 bg-emerald-500/5'
    : flash === 'active'
    ? 'ring-4 ring-blue-400/40 bg-blue-500/5'
    : '';

  return (
    <div className={`flex flex-col items-center min-h-[60vh] rounded-2xl transition-all duration-500 ${flashClass}`}>
      {/* Status bar — large enough to read from a distance */}
      <div className="w-full space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-bold border ${phaseBg} ${phaseColor}`}>
            {phaseText}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300 tabular-nums whitespace-nowrap">
              {currentStepNum}/{totalSteps}
            </span>
            {onMinimize && (
              <button onClick={onMinimize} className="p-3 hover:bg-[#2e3347] active:bg-[#3e4357] rounded-lg" title="Minimize">
                <Minimize2 size={18} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>
        <div className="text-base font-medium text-gray-100 truncate">
          {step?.label || tool.name}
        </div>
      </div>

      {/* Main display */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        {showTimer && step.duration > 0 && (
          <div className="text-center mb-4">
            <div
              className={`text-7xl sm:text-8xl font-mono font-bold tabular-nums ${isRestStep ? 'text-emerald-400' : ''}`}
              style={step.color ? { color: step.color } : undefined}
            >
              {formatTime(st.stepTimeLeft)}
            </div>
          </div>
        )}

        {step?.type === 'active' && !step.duration && (
          <div className="text-center mb-4">
            <div className="text-5xl font-mono font-bold tabular-nums">
              {formatElapsed(st.stepElapsed)}
            </div>
          </div>
        )}

        {showCallout && (
          <CalloutDisplay text={callout.current} subtitle={`${callout.history.length} callouts`} />
        )}
        {showCallout && (
          <div className="text-base text-gray-300 tabular-nums mt-4">
            {step.duration ? formatTime(st.stepTimeLeft) : formatElapsed(st.stepElapsed)}
          </div>
        )}

        {showMetronome && (
          <MetronomeVisual
            bpm={step.type === 'variable-metronome' ? st.vmCurrentBpm : metronome.bpm}
            beat={metronome.beat}
            isPlaying={metronome.isPlaying}
            tempoPhase={step.type === 'variable-metronome'
              ? (step.pattern === 'surge-cruise'
                ? (st.vmIsSlow ? 'SLOW — Cruise' : 'FAST — Surge!')
                : `${st.vmCurrentBpm} BPM`)
              : null}
          />
        )}

        {/* Next step preview */}
        <div className="text-sm text-gray-500 mt-4 tabular-nums">
          {formatElapsed(st.elapsed)} total &middot; {nextLabel}
        </div>
      </div>

      {/* Controls — large touch targets */}
      <div className="w-full space-y-3 mt-6">
        {isRestStep && isRunning && (
          <button
            onClick={handleSkipRest}
            className="w-full py-4 rounded-xl bg-gray-700/60 hover:bg-gray-600 active:bg-gray-800 text-gray-300 font-medium text-base flex items-center justify-center gap-2 transition-colors min-h-[56px]"
          >
            <SkipForward size={20} /> Skip Rest
          </button>
        )}

        {confirmEnd ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-300 text-center">End this session?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmEnd(false)}
                className="flex-1 py-4 rounded-xl bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white font-medium text-base flex items-center justify-center transition-colors min-h-[56px]"
              >
                Keep Going
              </button>
              <button
                onClick={() => { setConfirmEnd(false); handleStop(); }}
                className="flex-1 py-4 rounded-xl bg-red-700 hover:bg-red-600 active:bg-red-800 text-white font-medium text-base flex items-center justify-center transition-colors min-h-[56px]"
              >
                End Session
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 justify-center">
            {isRunning && (
              <button
                onClick={handlePause}
                className="flex-1 py-4 rounded-xl bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white font-medium text-base flex items-center justify-center gap-2 transition-colors min-h-[56px]"
              >
                <Pause size={22} /> Pause
              </button>
            )}
            {st.isPaused && (
              <button
                onClick={handleResume}
                className="flex-1 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-base flex items-center justify-center gap-2 transition-colors min-h-[56px]"
              >
                <Play size={22} /> Resume
              </button>
            )}
            <button
              onClick={() => setConfirmEnd(true)}
              className="px-8 py-4 rounded-xl bg-red-700/60 hover:bg-red-600 active:bg-red-800 text-white font-medium text-base flex items-center justify-center gap-2 transition-colors min-h-[56px]"
            >
              <Square size={22} /> End
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
