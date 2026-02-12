import { useMemo } from 'react';
import { Timer, Volume2, Music, ListChecks, Gamepad2, Shuffle, Heart, Clock } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';
import { estimateSessionTime, formatSessionTime } from '../../utils/buildSteps.js';

const typeIcons = {
  timer: Timer,
  callout: Volume2,
  metronome: Music,
  session: ListChecks,
  game: Gamepad2,
  hybrid: Shuffle,
};

const categoryColors = {
  footwork: 'emerald',
  movement: 'blue',
  power: 'red',
  'power-endurance': 'orange',
  endurance: 'green',
  technique: 'purple',
  game: 'yellow',
  rhythm: 'amber',
  grip: 'red',
  position: 'blue',
  session: 'gray',
  warmup: 'green',
  cooldown: 'blue',
  competition: 'orange',
};

const difficultyColors = {
  beginner: 'green',
  intermediate: 'amber',
  advanced: 'red',
};

export function ToolCard({ tool, onClick, isFavorite }) {
  const TypeIcon = typeIcons[tool.tool_type] || Timer;
  const catColor = categoryColors[tool.category] || 'gray';
  const diffColor = difficultyColors[tool.difficulty] || 'gray';

  const estimated = useMemo(() => {
    try {
      const cfg = tool.default_config ? JSON.parse(tool.default_config) : {};
      return estimateSessionTime(tool, cfg);
    } catch { return 0; }
  }, [tool.id, tool.default_config]);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-[#1a1d27] border border-[#2e3347] rounded-xl p-4 hover:bg-[#1f2333] active:bg-[#252838] transition-colors min-h-[44px]"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <TypeIcon size={18} className="text-gray-400 shrink-0" />
          <h3 className="font-semibold text-sm text-gray-100 leading-snug">{tool.name}</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {estimated > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={12} />
              {formatSessionTime(estimated)}
            </span>
          )}
          {isFavorite && <Heart size={14} className="text-red-400 fill-red-400 mt-0.5" />}
        </div>
      </div>
      <p className="text-sm text-gray-400 mb-3 line-clamp-2 leading-relaxed">{tool.description}</p>
      <div className="flex flex-wrap gap-1.5">
        <Badge color={catColor}>{tool.category}</Badge>
        <Badge color={diffColor}>{tool.difficulty}</Badge>
      </div>
    </button>
  );
}
