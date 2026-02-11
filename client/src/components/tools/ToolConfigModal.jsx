import { useState, useEffect, useMemo } from 'react';
import { Clock, Minus, Plus, RotateCcw } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { estimateSessionTime, formatSessionTime } from '../../utils/buildSteps.js';
import { warmUpSpeech } from '../../hooks/useSpeech.js';

// Registry of user-configurable fields with display metadata
const FIELD_DEFS = {
  // Durations (stored in seconds, displayed in minutes)
  duration: { label: 'Duration', unit: 'min', factor: 60, min: 1, max: 120, step: 1 },
  sessionDuration: { label: 'Session Duration', unit: 'min', factor: 60, min: 5, max: 120, step: 5 },
  attemptDuration: { label: 'Time per Attempt', unit: 'min', factor: 60, min: 1, max: 10, step: 1 },
  setDuration: { label: 'Time per Set', unit: 'min', factor: 60, min: 0.5, max: 15, step: 0.5 },
  lapDuration: { label: 'Time per Lap', unit: 'min', factor: 60, min: 1, max: 10, step: 1 },
  circuitDuration: { label: 'Time per Circuit', unit: 'min', factor: 60, min: 1, max: 15, step: 1 },
  roundDuration: { label: 'Time per Round', unit: 'min', factor: 60, min: 0.5, max: 10, step: 0.5 },
  durationPerProblem: { label: 'Time per Problem', unit: 'min', factor: 60, min: 1, max: 10, step: 1 },
  problemDuration: { label: 'Time per Problem', unit: 'min', factor: 60, min: 0.5, max: 10, step: 0.5 },
  timePerProblem: { label: 'Attempt Time', unit: 'min', factor: 60, min: 1, max: 10, step: 1 },
  observationTime: { label: 'Observation Time', unit: 'min', factor: 60, min: 0.5, max: 5, step: 0.5 },
  transitionTime: { label: 'Transition Time', unit: 'min', factor: 60, min: 0.5, max: 5, step: 0.5 },
  visualizationDuration: { label: 'Visualization Time', unit: 'sec', factor: 1, min: 30, max: 300, step: 10 },

  // Rest durations
  restBetweenAttempts: { label: 'Rest between Attempts', unit: 'min', factor: 60, min: 1, max: 10, step: 0.5 },
  restBetweenSets: { label: 'Rest between Sets', unit: 'min', factor: 60, min: 0.5, max: 10, step: 0.5 },
  restBetweenCircuits: { label: 'Rest between Circuits', unit: 'min', factor: 60, min: 1, max: 10, step: 0.5 },
  restBetweenRounds: { label: 'Rest between Rounds', unit: 'sec', factor: 1, min: 5, max: 300, step: 5 },
  restBetweenLaps: { label: 'Rest between Laps', unit: 'sec', factor: 1, min: 5, max: 300, step: 5 },
  restBetweenTiers: { label: 'Rest between Tiers', unit: 'min', factor: 60, min: 0.5, max: 10, step: 0.5 },
  restBetweenProblems: { label: 'Rest between Problems', unit: 'min', factor: 60, min: 0.5, max: 10, step: 0.5 },
  restBetweenExercises: { label: 'Rest between Exercises', unit: 'sec', factor: 1, min: 5, max: 120, step: 5 },

  // Counts
  attempts: { label: 'Attempts', min: 1, max: 20, step: 1 },
  sets: { label: 'Sets', min: 1, max: 10, step: 1 },
  laps: { label: 'Laps', min: 1, max: 20, step: 1 },
  circuits: { label: 'Circuits', min: 1, max: 10, step: 1 },
  rounds: { label: 'Rounds', min: 1, max: 20, step: 1 },
  problems: { label: 'Problems', min: 1, max: 20, step: 1 },
  tiers: { label: 'Tiers', min: 2, max: 8, step: 1 },

  // Tempo
  bpm: { label: 'Tempo', unit: 'BPM', min: 10, max: 200, step: 5 },
  slowBpm: { label: 'Slow Tempo', unit: 'BPM', min: 10, max: 80, step: 5 },
  fastBpm: { label: 'Fast Tempo', unit: 'BPM', min: 60, max: 200, step: 5 },
  startBpm: { label: 'Starting Tempo', unit: 'BPM', min: 30, max: 200, step: 5 },
  endBpm: { label: 'Ending Tempo', unit: 'BPM', min: 10, max: 100, step: 5 },

  // Callout
  interval: { label: 'Callout Every', unit: 'sec', min: 3, max: 60, step: 1 },

  // EMOM
  totalMinutes: { label: 'Total Duration', unit: 'min', min: 5, max: 30, step: 1 },
  intervalSeconds: { label: 'Interval', unit: 'sec', min: 30, max: 120, step: 10 },
};

// Keys that are internal and should not be user-configurable
const HIDDEN_KEYS = new Set([
  'mode', 'pools', 'callouts', 'exercises', 'phases', 'emomInterval',
  'reminderInterval', 'reminderText', 'pumpCheckInterval', 'pumpCheckText',
  'countdownBeeps', 'problemsPerTier', 'postClimbPrompt',
  'startWork', 'startRest', 'workDecrement', 'restDecrement', 'minWork',
  'slowMoves', 'fastMoves', 'movesPerPhase', 'decrementPerPhase',
  'beatsPerMove', 'trackGrades', 'upAndDown', 'setsPerExercise',
  'repsPerSet', 'setDuration', 'trackSections', 'maxAttempts',
  'eliminationMode', 'maxMoves', 'trackCompletion', 'hoverDuration',
  'holdDuration', 'activeAnnounce', 'activeLabel', 'restAnnounce', 'restLabel',
]);

function StepperField({ configKey, value, def, onChange }) {
  const factor = def.factor || 1;
  const displayValue = factor > 1 ? value / factor : value;
  const step = def.step || 1;

  const decrement = () => {
    const newDisplay = Math.max(def.min, displayValue - step);
    onChange(configKey, Math.round(newDisplay * factor * 100) / 100);
  };
  const increment = () => {
    const newDisplay = Math.min(def.max, displayValue + step);
    onChange(configKey, Math.round(newDisplay * factor * 100) / 100);
  };

  // Format display: drop decimals if whole number
  const formatted = Number.isInteger(displayValue) ? displayValue : displayValue.toFixed(1);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-200">{def.label}</span>
        {def.unit && <span className="text-sm text-gray-400">{def.unit}</span>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={decrement}
          disabled={displayValue <= def.min}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#0f1117] border border-[#2e3347] text-gray-200 hover:bg-[#1a1d27] active:bg-[#252838] disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <Minus size={20} />
        </button>
        <div className="flex-1 text-center">
          <span className="text-2xl font-bold tabular-nums">{formatted}</span>
        </div>
        <button
          type="button"
          onClick={increment}
          disabled={displayValue >= def.max}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#0f1117] border border-[#2e3347] text-gray-200 hover:bg-[#1a1d27] active:bg-[#252838] disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
}

export function ToolConfigModal({ open, onClose, tool, onStart }) {
  const defaultConfig = tool?.default_config ? JSON.parse(tool.default_config) : {};
  const [config, setConfig] = useState(defaultConfig);

  useEffect(() => {
    if (tool?.default_config) {
      setConfig(JSON.parse(tool.default_config));
    } else {
      setConfig({});
    }
  }, [tool?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!tool) return null;

  const handleStart = () => {
    warmUpSpeech();
    onStart(config);
    onClose();
  };

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const resetConfig = () => {
    setConfig(tool?.default_config ? JSON.parse(tool.default_config) : {});
  };

  const isModified = JSON.stringify(config) !== JSON.stringify(defaultConfig);

  // Build list of configurable fields from current config
  const fields = Object.entries(config)
    .filter(([key]) => !HIDDEN_KEYS.has(key) && FIELD_DEFS[key])
    .map(([key, value]) => ({
      key,
      value,
      def: FIELD_DEFS[key],
    }));

  // Estimate total session time
  const estimated = useMemo(() => {
    try {
      return estimateSessionTime(tool, config);
    } catch {
      return 0;
    }
  }, [tool, config]);

  return (
    <Modal open={open} onClose={onClose} title={tool.name} preventBackdropClose>
      <div className="space-y-5">
        {fields.length > 0 && (
          <div className="space-y-4">
            {fields.map(f => (
              <StepperField
                key={f.key}
                configKey={f.key}
                value={f.value}
                def={f.def}
                onChange={updateConfig}
              />
            ))}
            {isModified && (
              <button
                onClick={resetConfig}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200 active:text-white transition-colors py-1"
              >
                <RotateCcw size={14} /> Reset to defaults
              </button>
            )}
          </div>
        )}

        {/* Estimated time */}
        {estimated > 0 && (
          <div className="flex items-center gap-2 bg-[#0f1117] rounded-xl px-4 py-3">
            <Clock size={18} className="text-blue-400 shrink-0" />
            <span className="text-sm text-gray-300">
              Estimated: <strong className="text-white text-base">{formatSessionTime(estimated)}</strong>
            </span>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button onClick={handleStart} size="lg" className="flex-1">Start Session</Button>
          <Button variant="secondary" size="lg" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
}
