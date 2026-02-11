import { Timer } from 'lucide-react';
import { useTimerContext } from './TimerContext.jsx';

const quickTimes = [
  { label: '1m', seconds: 60 },
  { label: '2m', seconds: 120 },
  { label: '3m', seconds: 180 },
  { label: '5m', seconds: 300 },
];

export function RestTimerQuick() {
  const { startSimple, start, isActive } = useTimerContext();

  const handleStart = (seconds, label) => {
    startSimple(seconds, `${label} Rest`);
    // Auto-start on next tick
    setTimeout(() => start(), 0);
  };

  return (
    <div className="flex items-center gap-2">
      <Timer size={16} className="text-gray-500" />
      {quickTimes.map(t => (
        <button
          key={t.seconds}
          onClick={() => handleStart(t.seconds, t.label)}
          disabled={isActive}
          className="px-2.5 py-1 text-xs font-medium rounded-md bg-[#0f1117] border border-[#2e3347]
            hover:border-red-500/50 hover:text-red-400 transition-colors disabled:opacity-50"
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
