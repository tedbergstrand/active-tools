import { useState, useEffect } from 'react';
import { Play, Wrench } from 'lucide-react';
import { useToolSession } from './ToolSessionContext.jsx';
import { useTimerContext } from '../timer/TimerContext.jsx';
import { useLocation } from 'react-router-dom';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function ToolSessionFloatingWidget() {
  const { isActive, minimized, maximize, sessionStateRef, session } = useToolSession();
  const timer = useTimerContext();
  const location = useLocation();
  const [display, setDisplay] = useState({ elapsed: 0, stepLabel: '', stepTimeLeft: 0 });

  // Poll session state ref for display updates (only re-render when values change)
  useEffect(() => {
    if (!isActive || !minimized) return;
    const id = setInterval(() => {
      const s = sessionStateRef.current;
      setDisplay(prev => {
        if (prev.elapsed === s.elapsed && prev.stepLabel === s.stepLabel && prev.stepTimeLeft === s.stepTimeLeft) return prev;
        return { ...s };
      });
    }, 200);
    return () => clearInterval(id);
  }, [isActive, minimized, sessionStateRef]);

  // Don't show if not active or not minimized
  if (!isActive || !minimized) return null;
  // If user is on the tool's own page, don't show
  if (location.pathname.startsWith('/tools/') && session?.tool?.slug && location.pathname === `/tools/${session.tool.slug}`) {
    return null;
  }

  // If timer widget is also visible, shift this widget up to avoid overlap.
  const timerAlsoVisible = timer.isActive && location.pathname !== '/timer';

  return (
    <button
      onClick={maximize}
      className={`fixed left-3 right-3 z-40 bg-[#1a1d27] border border-violet-500/40 rounded-xl px-4 py-3 shadow-lg hover:bg-[#1f2333] active:bg-[#252838] transition-all flex items-center gap-3 ${
        timerAlsoVisible ? 'bottom-32 lg:bottom-16' : 'bottom-20 lg:bottom-6'
      }`}
    >
      <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
        <Wrench size={18} className="text-violet-400" />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="text-sm font-medium text-gray-100 truncate">
          {display.stepLabel || session?.tool?.name}
        </div>
        <div className="text-xs text-gray-400">
          {display.stepTimeLeft > 0 ? formatTime(display.stepTimeLeft) + ' remaining' : 'In progress'}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-mono text-base font-bold tabular-nums text-violet-300">
          {formatTime(display.elapsed)}
        </div>
        <div className="flex items-center gap-1 text-xs text-violet-400">
          <Play size={10} className="fill-current" /> Resume
        </div>
      </div>
    </button>
  );
}
