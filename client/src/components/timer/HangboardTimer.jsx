import { useTimerContext } from './TimerContext.jsx';
import { TimerDisplay } from './TimerDisplay.jsx';
import { TimerControls } from './TimerControls.jsx';

export function HangboardTimer({ preset }) {
  const timer = useTimerContext();

  const handleLoad = () => {
    timer.loadPreset(preset);
  };

  if (!timer.isActive || timer.presetName !== preset?.name) {
    return (
      <button
        onClick={handleLoad}
        className="w-full p-4 bg-[#0f1117] border border-[#2e3347] rounded-lg hover:border-red-500/50 transition-colors text-left"
      >
        <div className="font-medium">{preset?.name}</div>
        <div className="text-sm text-gray-500 mt-1">
          {preset?.total_sets} sets &middot; {preset?.phases?.map(p => `${p.label} ${p.duration_seconds}s`).join(' / ')}
        </div>
      </button>
    );
  }

  return (
    <div className="space-y-6">
      <TimerDisplay
        timeLeft={timer.timeLeft}
        phase={timer.currentPhaseData}
        currentSet={timer.currentSet}
        totalSets={timer.totalSets}
      />
      <TimerControls
        state={timer.state}
        onStart={timer.start}
        onPause={timer.pause}
        onReset={timer.reset}
        onStop={timer.stop}
      />
    </div>
  );
}
