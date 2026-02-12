import { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header.jsx';
import { Card, CardContent, CardHeader } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { TimerDisplay } from '../components/timer/TimerDisplay.jsx';
import { TimerControls } from '../components/timer/TimerControls.jsx';
import { useTimerContext } from '../components/timer/TimerContext.jsx';
import { useToast } from '../components/common/Toast.jsx';
import { timersApi } from '../api/timers.js';
import { Timer, Clock, Dumbbell, Zap } from 'lucide-react';

export default function TimerPage() {
  const timer = useTimerContext();
  const toast = useToast();
  const [presets, setPresets] = useState([]);
  const [customSeconds, setCustomSeconds] = useState(60);

  useEffect(() => {
    timersApi.list().then(setPresets).catch(() => toast.error('Failed to load timer presets'));
  }, []);

  const restPresets = presets.filter(p => p.mode === 'rest');
  const hangboardPresets = presets.filter(p => p.mode === 'hangboard');
  const intervalPresets = presets.filter(p => p.mode === 'interval');

  const handleLoadPreset = (preset) => {
    timer.loadPreset(preset);
  };

  const handleCustomStart = () => {
    timer.startSimple(Number(customSeconds), 'Custom Timer');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Header title="Timer" />

      {timer.isActive && (
        <Card className="p-8">
          <div className="text-center mb-2 text-sm font-medium text-gray-400">{timer.presetName}</div>
          <TimerDisplay
            timeLeft={timer.timeLeft}
            phase={timer.currentPhaseData}
            currentSet={timer.currentSet}
            totalSets={timer.totalSets}
          />
          <div className="mt-6">
            <TimerControls
              state={timer.state}
              onStart={timer.start}
              onPause={timer.pause}
              onReset={timer.reset}
              onStop={timer.stop}
            />
          </div>
          {timer.state === 'complete' && (
            <div className="mt-4 text-center text-emerald-400 font-medium">Complete!</div>
          )}
        </Card>
      )}

      {!timer.isActive && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Clock size={18} /> Quick Timer</h3>
          <div className="flex items-end gap-3">
            <Input label="Seconds" type="number" value={customSeconds}
              onChange={e => setCustomSeconds(e.target.value)} className="w-32" />
            <Button variant="timer" onClick={handleCustomStart}>Start</Button>
          </div>
        </Card>
      )}

      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Clock size={18} /> Rest Timers</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {restPresets.map(preset => (
            <Card key={preset.id} onClick={() => handleLoadPreset(preset)}
              className="p-4 cursor-pointer hover:border-red-500/30 transition-colors">
              <div className="font-medium text-sm">{preset.name}</div>
              <div className="text-2xl font-mono font-bold text-red-400 mt-1">
                {Math.floor(preset.phases[0]?.duration_seconds / 60)}:{String(preset.phases[0]?.duration_seconds % 60).padStart(2, '0')}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Dumbbell size={18} /> Hangboard Protocols</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {hangboardPresets.map(preset => (
            <Card key={preset.id} onClick={() => handleLoadPreset(preset)}
              className="p-4 cursor-pointer hover:border-red-500/30 transition-colors">
              <div className="font-medium">{preset.name}</div>
              <div className="text-sm text-gray-400 mt-1">
                {preset.total_sets} sets &middot; {preset.phases.map(p => `${p.label} ${p.duration_seconds}s`).join(' / ')}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Zap size={18} /> Interval Timers</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {intervalPresets.map(preset => (
            <Card key={preset.id} onClick={() => handleLoadPreset(preset)}
              className="p-4 cursor-pointer hover:border-red-500/30 transition-colors">
              <div className="font-medium">{preset.name}</div>
              <div className="text-sm text-gray-400 mt-1">
                {preset.total_sets} rounds &middot; {preset.phases.map(p => `${p.label} ${p.duration_seconds}s`).join(' / ')}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
