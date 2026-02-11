import { Play, Pause, RotateCcw, Square } from 'lucide-react';
import { Button } from '../common/Button.jsx';

export function TimerControls({ state, onStart, onPause, onReset, onStop }) {
  return (
    <div className="flex items-center justify-center gap-3">
      {(state === 'ready' || state === 'paused') && (
        <Button variant="timer" size="lg" onClick={onStart}>
          <Play size={20} /> {state === 'paused' ? 'Resume' : 'Start'}
        </Button>
      )}
      {state === 'running' && (
        <Button variant="secondary" size="lg" onClick={onPause}>
          <Pause size={20} /> Pause
        </Button>
      )}
      {(state === 'running' || state === 'paused') && (
        <Button variant="secondary" size="lg" onClick={onReset}>
          <RotateCcw size={20} /> Reset
        </Button>
      )}
      {state !== 'idle' && (
        <Button variant="ghost" size="lg" onClick={onStop}>
          <Square size={20} /> Stop
        </Button>
      )}
    </div>
  );
}
