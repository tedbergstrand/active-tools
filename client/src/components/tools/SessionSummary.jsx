import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Clock, Hash, Sparkles, Check, Loader2, Dumbbell, Timer } from 'lucide-react';
import { Button } from '../common/Button.jsx';
import { useSpeech, formatTimeAsSpeech } from '../../hooks/useSpeech.js';
import { useTimerContext } from '../timer/TimerContext.jsx';
import { toolsApi } from '../../api/tools.js';
import { formatSessionTime } from '../../utils/buildSteps.js';
import { todayISO } from '../../utils/dates.js';

// Suggested follow-up tools by category
const FOLLOW_UPS = {
  warmup: { next: 'session', label: 'Start a Main Session' },
  session: { next: 'cooldown', label: 'Cool Down' },
  power: { next: 'cooldown', label: 'Cool Down' },
  'power-endurance': { next: 'cooldown', label: 'Cool Down' },
  endurance: { next: 'cooldown', label: 'Cool Down' },
  footwork: { next: null, label: null },
  movement: { next: null, label: null },
  technique: { next: null, label: null },
  game: { next: 'cooldown', label: 'Cool Down' },
  grip: { next: 'cooldown', label: 'Cool Down' },
  rhythm: { next: null, label: null },
  position: { next: null, label: null },
  competition: { next: 'cooldown', label: 'Cool Down' },
  cooldown: { next: null, label: null },
};

const REST_OPTIONS = [
  { label: '1 min', seconds: 60 },
  { label: '2 min', seconds: 120 },
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
];

export function SessionSummary({ tool, elapsed, stats, config, log, onSave, onDiscard, onStartNext }) {
  const navigate = useNavigate();
  const timer = useTimerContext();
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedSessionId, setSavedSessionId] = useState(null);
  const [chaining, setChaining] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const { speak } = useSpeech();

  useEffect(() => {
    speak(`Session complete! Total time: ${formatTimeAsSpeech(elapsed)}.`);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load follow-up suggestions
  useEffect(() => {
    const followUp = FOLLOW_UPS[tool?.category];
    if (!followUp?.next || !onStartNext) return;
    toolsApi.list({ category: followUp.next }).then(tools => {
      if (tools.length > 0) {
        const shuffled = tools.sort(() => Math.random() - 0.5);
        setSuggestions(shuffled.slice(0, 3));
      }
    }).catch(() => {});
  }, [tool?.category, onStartNext]);

  const handleSave = async () => {
    if (saving || saved) return;
    setSaving(true);
    const result = await onSave({
      tool_id: tool.id,
      duration_seconds: elapsed,
      config,
      results: { ...stats, log },
      notes: notes || null,
    });
    setSaved(true);
    if (result?.id) setSavedSessionId(result.id);
  };

  const handleLogAsWorkout = () => {
    navigate('/log', {
      state: {
        initialData: {
          category: 'traditional',
          date: todayISO(),
          duration_minutes: Math.round(elapsed / 60) || '',
          location: '',
          notes: `Tool: ${tool?.name || 'Training Tool'}${notes ? '\n' + notes : ''}`,
          rpe: '',
          tool_session_id: savedSessionId,
          exercises: [],
        },
      },
    });
  };

  const handleStartRest = (seconds) => {
    timer.startSimple(seconds, 'Rest');
    timer.start();
  };

  const followUp = FOLLOW_UPS[tool?.category];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Trophy size={48} className="text-amber-400 mx-auto mb-3" />
        <h2 className="text-2xl font-bold">Session Complete</h2>
        <p className="text-gray-400 mt-1">{tool?.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#0f1117] rounded-xl p-4 text-center">
          <Clock size={20} className="text-blue-400 mx-auto mb-1" />
          <div className="text-xl font-bold">{formatSessionTime(elapsed)}</div>
          <div className="text-sm text-gray-400">Duration</div>
        </div>
        {stats.rounds > 0 && (
          <div className="bg-[#0f1117] rounded-xl p-4 text-center">
            <Hash size={20} className="text-amber-400 mx-auto mb-1" />
            <div className="text-xl font-bold">{stats.rounds}</div>
            <div className="text-sm text-gray-400">Steps</div>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-300">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="How did it go? Any observations..."
          className="w-full bg-[#0f1117] border border-[#2e3347] rounded-xl px-4 py-3 text-base text-gray-100 placeholder-gray-500 h-24 resize-none"
        />
      </div>

      {!saved ? (
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : 'Save Session'}
          </Button>
          <Button variant="secondary" onClick={onDiscard}>Discard</Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium justify-center">
            <Check size={16} /> Session saved
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleLogAsWorkout} className="flex-1">
              <Dumbbell size={18} /> Log as Workout
            </Button>
            <Button variant="secondary" onClick={onDiscard}>Done</Button>
          </div>

          {/* Rest timer shortcuts */}
          <div className="space-y-2">
            <h3 className="flex items-center gap-1.5 text-sm font-medium text-gray-400">
              <Timer size={14} className="text-red-400" /> Start a rest timer
            </h3>
            <div className="flex gap-2">
              {REST_OPTIONS.map(opt => (
                <button
                  key={opt.seconds}
                  onClick={() => { handleStartRest(opt.seconds); onDiscard(); }}
                  className="flex-1 py-2.5 text-sm font-medium rounded-xl bg-[#0f1117] border border-[#2e3347] text-gray-300 hover:border-red-500/30 hover:text-red-400 transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Session chaining suggestions */}
      {onStartNext && suggestions.length > 0 && followUp?.label && (
        <div className="space-y-3 pt-3 border-t border-[#2e3347]">
          <h3 className="flex items-center gap-1.5 text-sm font-medium text-gray-400">
            <Sparkles size={14} className="text-violet-400" /> {followUp.label}
          </h3>
          <div className="space-y-2">
            {suggestions.map(t => (
              <button
                key={t.id}
                onClick={async () => {
                  setChaining(true);
                  await handleSave();
                  onStartNext(t);
                }}
                className="w-full bg-[#0f1117] border border-[#2e3347] rounded-xl px-4 py-3 text-left hover:bg-[#1a1d27] active:bg-[#252838] transition-colors min-h-[44px]"
              >
                <div className="text-sm font-medium text-gray-200">{t.name}</div>
                <div className="text-sm text-gray-400 mt-0.5 line-clamp-1">{t.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
