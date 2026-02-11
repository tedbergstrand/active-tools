import { useTimerContext } from './TimerContext.jsx';
import { Timer, X, Play, Pause } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export function TimerFloatingWidget() {
  const timer = useTimerContext();
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show on timer page
  if (!timer.isActive || location.pathname === '/timer') return null;

  const minutes = Math.floor(timer.timeLeft / 60);
  const seconds = timer.timeLeft % 60;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 z-40 flex items-center gap-2 bg-[#1a1d27] border border-[#2e3347] rounded-full px-4 py-2 shadow-lg">
      <button onClick={() => navigate('/timer')} className="flex items-center gap-2">
        <Timer size={16} className="text-red-500" />
        <span className="font-mono text-sm font-bold tabular-nums" style={{ color: timer.currentPhaseData?.color }}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
        {timer.currentPhaseData && (
          <span className="text-xs text-gray-400">{timer.currentPhaseData.label}</span>
        )}
      </button>
      {timer.isRunning ? (
        <button onClick={timer.pause} className="p-1 hover:bg-[#2e3347] rounded-full">
          <Pause size={14} />
        </button>
      ) : (
        <button onClick={timer.start} className="p-1 hover:bg-[#2e3347] rounded-full">
          <Play size={14} />
        </button>
      )}
      <button onClick={timer.stop} className="p-1 hover:bg-[#2e3347] rounded-full">
        <X size={14} />
      </button>
    </div>
  );
}
