import { formatTimeAsSpeech } from '../hooks/useSpeech.js';

// Build a linear sequence of fully-automated, timed steps from tool config.
// Every step auto-advances — no user input required during a session.
// Step types: countdown, active, rest, callout, metronome, variable-metronome
export function buildSteps(tool, config) {
  const steps = [{ type: 'countdown', duration: 5 }];
  const tt = tool.tool_type;

  if (tt === 'timer') {
    if (config.exercises?.length) {
      const sets = config.sets ?? 1;
      for (let s = 0; s < sets; s++) {
        if (s > 0 && config.restBetweenSets) {
          steps.push({ type: 'rest', duration: config.restBetweenSets, announce: `Set ${s} complete. Rest.` });
        }
        config.exercises.forEach((ex, i) => {
          if (i > 0 && config.restBetweenExercises) {
            steps.push({ type: 'rest', duration: config.restBetweenExercises, announce: 'Short rest.' });
          }
          steps.push({ type: 'active', duration: ex.duration, label: ex.name, announce: ex.name });
        });
      }
    } else if (config.phases?.length) {
      const sets = config.sets ?? 1;
      for (let s = 0; s < sets; s++) {
        if (s > 0 && config.restBetween) {
          steps.push({ type: 'rest', duration: config.restBetween, announce: `Set ${s} complete. Rest.` });
        }
        config.phases.forEach(p => {
          steps.push({ type: 'active', duration: p.duration, label: p.label, announce: p.label, color: p.color });
        });
      }
    } else if (config.startWork != null && config.startRest != null) {
      let work = config.startWork, rest = config.startRest, round = 1;
      const minWork = config.minWork ?? 30;
      const workDecrement = config.workDecrement || 30; // must be >0 to avoid infinite loop
      const restDecrement = config.restDecrement ?? 20;
      while (work >= minWork) {
        steps.push({
          type: 'active', duration: work,
          label: `Round ${round} — Climb`,
          announce: `Round ${round}. Climb for ${formatTimeAsSpeech(work)}.`,
        });
        const nextWork = work - workDecrement;
        if (nextWork >= minWork) {
          steps.push({ type: 'rest', duration: rest, announce: 'Rest.' });
        }
        work = nextWork;
        rest = Math.max(0, rest - restDecrement);
        round++;
      }
    } else if (config.totalMinutes && config.intervalSeconds) {
      steps.push({
        type: 'active', duration: config.totalMinutes * 60,
        label: 'EMOM', announce: `Every minute on the minute for ${config.totalMinutes} minutes. Go!`,
        emomInterval: config.intervalSeconds,
      });
    } else if (config.visualizationDuration) {
      steps.push({
        type: 'active', duration: config.visualizationDuration,
        label: 'Visualize', announce: 'Close your eyes and visualize the climb.',
      });
    } else {
      const reminder = config.reminderInterval
        ? { interval: config.reminderInterval, text: config.reminderText }
        : config.pumpCheckInterval
        ? { interval: config.pumpCheckInterval, text: config.pumpCheckText }
        : null;
      steps.push({
        type: 'active', duration: config.duration ?? 600,
        label: 'Active', announce: 'Go!', reminder,
      });
    }
  } else if (tt === 'callout') {
    steps.push({
      type: 'callout', duration: config.duration || null,
      label: tool.name, announce: 'Go!',
    });
  } else if (tt === 'metronome') {
    if (config.slowBpm && config.fastBpm) {
      steps.push({
        type: 'variable-metronome', label: tool.name, announce: 'Go! Starting slow.',
        pattern: 'surge-cruise', slowBpm: config.slowBpm, fastBpm: config.fastBpm,
        slowMoves: config.slowMoves ?? 6, fastMoves: config.fastMoves ?? 4,
      });
    } else if (config.startBpm && config.endBpm) {
      steps.push({
        type: 'variable-metronome', label: tool.name, announce: `Go! Starting at ${config.startBpm} BPM.`,
        pattern: 'deceleration', startBpm: config.startBpm, endBpm: config.endBpm,
        decrementPerPhase: config.decrementPerPhase ?? 10, movesPerPhase: config.movesPerPhase ?? 5,
      });
    } else {
      steps.push({
        type: 'metronome', duration: config.duration ?? null,
        bpm: config.bpm ?? 60, label: tool.name, announce: 'Go!',
      });
    }
  } else if (tt === 'session') {
    if (config.timePerProblem) {
      const n = config.problems ?? 4;
      for (let p = 0; p < n; p++) {
        if (config.observationTime) {
          steps.push({
            type: 'active', duration: config.observationTime,
            label: `Problem ${p + 1} — Observe`,
            announce: `Problem ${p + 1}. Observation time. Study the holds and plan your sequence.`,
          });
        }
        steps.push({
          type: 'active', duration: config.timePerProblem,
          label: `Problem ${p + 1} — Climb`,
          announce: config.observationTime ? 'Climbing time. Go!' : `Problem ${p + 1}. Go!`,
        });
        if (p < n - 1 && config.transitionTime) {
          steps.push({ type: 'rest', duration: config.transitionTime, announce: 'Transition to next problem.' });
        }
      }
    } else if (config.attempts && config.attemptDuration) {
      for (let a = 0; a < config.attempts; a++) {
        steps.push({
          type: 'active', duration: config.attemptDuration,
          label: `Attempt ${a + 1} of ${config.attempts}`,
          announce: `Attempt ${a + 1}. Go!`,
        });
        if (a < config.attempts - 1 && config.restBetweenAttempts) {
          steps.push({
            type: 'rest', duration: config.restBetweenAttempts,
            announce: `Rest. ${formatTimeAsSpeech(config.restBetweenAttempts)}.`,
          });
        }
      }
    } else if (config.exercises?.length && config.setsPerExercise) {
      const exList = config.exercises;
      for (let e = 0; e < exList.length; e++) {
        if (e > 0 && config.restBetweenExercises) {
          steps.push({
            type: 'rest', duration: config.restBetweenExercises,
            announce: `${exList[e - 1]} complete. Rest before ${exList[e]}.`,
          });
        }
        for (let si = 0; si < config.setsPerExercise; si++) {
          if (si > 0 && config.restBetweenSets) {
            steps.push({ type: 'rest', duration: config.restBetweenSets, announce: 'Rest between sets.' });
          }
          steps.push({
            type: 'active', duration: config.setDuration ?? 30,
            label: `${exList[e]} — Set ${si + 1} of ${config.setsPerExercise}`,
            announce: si === 0 ? `${exList[e]}. Set 1. Go!` : `Set ${si + 1}. Go!`,
          });
        }
      }
    } else if (config.sets && config.setDuration) {
      for (let si = 0; si < config.sets; si++) {
        if (si > 0 && config.restBetweenSets) {
          steps.push({ type: 'rest', duration: config.restBetweenSets, announce: `Set ${si} complete. Rest.` });
        }
        steps.push({
          type: 'active', duration: config.setDuration,

          label: `Set ${si + 1} of ${config.sets}`,
          announce: `Set ${si + 1}. Go!`,
        });
      }
    } else if (config.laps && config.lapDuration) {
      for (let l = 0; l < config.laps; l++) {
        if (l > 0 && config.restBetweenLaps != null) {
          steps.push({ type: 'rest', duration: config.restBetweenLaps, announce: 'Shake out. Short rest.' });
        }
        steps.push({
          type: 'active', duration: config.lapDuration,
          label: `Lap ${l + 1} of ${config.laps}`,
          announce: `Lap ${l + 1}. Go!`,
        });
      }
    } else if (config.circuits && config.circuitDuration) {
      for (let c = 0; c < config.circuits; c++) {
        if (c > 0 && config.restBetweenCircuits) {
          steps.push({ type: 'rest', duration: config.restBetweenCircuits, announce: 'Rest between circuits.' });
        }
        steps.push({
          type: 'active', duration: config.circuitDuration,
          label: `Circuit ${c + 1} of ${config.circuits}`,
          announce: `Circuit ${c + 1}. Go!`,
        });
      }
    } else if (config.rounds && config.roundDuration) {
      for (let r = 0; r < config.rounds; r++) {
        if (r > 0 && config.restBetweenRounds) {
          const restAnn = config.restAnnounce
            ? config.restAnnounce.replace('{n}', r + 1).replace('{prev}', r).replace('{remaining}', config.rounds - r)
            : 'Rest.';
          const restLabel = config.restLabel
            ? config.restLabel.replace('{n}', r + 1).replace('{prev}', r).replace('{remaining}', config.rounds - r)
            : undefined;
          steps.push({ type: 'rest', duration: config.restBetweenRounds, announce: restAnn, label: restLabel });
        }
        const activeAnn = config.activeAnnounce
          ? config.activeAnnounce.replace('{n}', r + 1).replace('{total}', config.rounds).replace('{remaining}', config.rounds - r)
          : `Round ${r + 1}. Go!`;
        const activeLabel = config.activeLabel
          ? config.activeLabel.replace('{n}', r + 1).replace('{total}', config.rounds).replace('{remaining}', config.rounds - r)
          : `Round ${r + 1} of ${config.rounds}`;
        steps.push({
          type: 'active', duration: config.roundDuration,
          label: activeLabel, announce: activeAnn,
        });
      }
    } else if (config.tiers && config.problemsPerTier) {
      const perTier = config.problemsPerTier;
      for (let t = 0; t < Math.min(config.tiers, perTier.length); t++) {
        if (t > 0 && config.restBetweenTiers) {
          steps.push({ type: 'rest', duration: config.restBetweenTiers, announce: `Moving to tier ${t + 1}.` });
        }
        for (let p = 0; p < perTier[t]; p++) {
          if (p > 0 && config.restBetweenProblems) {
            steps.push({ type: 'rest', duration: config.restBetweenProblems, announce: 'Rest.' });
          }
          steps.push({
            type: 'active', duration: config.durationPerProblem ?? 240,
            label: `Tier ${t + 1} — Problem ${p + 1} of ${perTier[t]}`,
            announce: `Tier ${t + 1}, problem ${p + 1}. Go!`,
          });
        }
      }
    } else if (config.problems && config.problemDuration) {
      const circuits = config.circuits ?? 1;
      for (let c = 0; c < circuits; c++) {
        if (c > 0) {
          steps.push({ type: 'rest', duration: 30, announce: 'Circuit complete. Brief rest.' });
        }
        for (let p = 0; p < config.problems; p++) {
          if (p > 0 && config.restBetweenProblems) {
            steps.push({ type: 'rest', duration: config.restBetweenProblems, announce: 'Next problem.' });
          }
          steps.push({
            type: 'active', duration: config.problemDuration,
            label: `${circuits > 1 ? `Circuit ${c + 1} — ` : ''}Problem ${p + 1} of ${config.problems}`,
            announce: `Problem ${p + 1}. Go!`,
          });
        }
      }
    } else if (config.sessionDuration) {
      steps.push({
        type: 'active', duration: config.sessionDuration,
        label: tool.name, announce: 'Session started. Go!',
      });
    }
  }

  // Fallback: if we only have the countdown step, the config didn't match any pattern.
  // Create a generic timed session so the user doesn't see a 5-second session that ends.
  if (steps.length === 1) {
    const fallbackDuration = config.duration ?? config.sessionDuration ?? 600;
    console.warn(`[buildSteps] No step pattern matched for tool "${tool.name}" (type: ${tt}). Using ${fallbackDuration}s fallback.`);
    steps.push({
      type: 'active', duration: fallbackDuration,
      label: tool.name, announce: 'Go!',
    });
  }

  return steps;
}

// Calculate total session time in seconds from steps
export function estimateSessionTime(tool, config) {
  const steps = buildSteps(tool, config);
  return steps.reduce((sum, step) => sum + (step.duration || 0), 0);
}

// Format seconds as human-readable duration
export function formatSessionTime(seconds) {
  if (!seconds && seconds !== 0) return '--';
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

// Get step summary for preview (omit countdown)
export function getStepSummary(tool, config) {
  const steps = buildSteps(tool, config);
  return steps
    .filter(s => s.type !== 'countdown')
    .map(s => ({
      type: s.type,
      label: s.label || (s.type === 'rest' ? 'Rest' : tool.name),
      duration: s.duration,
    }));
}
