import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Flame, ArrowRight, Zap } from 'lucide-react';
import { Button } from '../common/Button.jsx';
import { progressApi } from '../../api/progress.js';

export function WorkoutSaveOverlay({ workoutId, exerciseCount, setCount, onDismiss }) {
  const navigate = useNavigate();
  const [prs, setPrs] = useState([]);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      progressApi.checkPRs(workoutId).catch(() => ({ prs: [] })),
      progressApi.streak().catch(() => null),
    ]).then(([prData, streakData]) => {
      setPrs(prData.prs || []);
      setStreak(streakData);
      setLoading(false);

      // Auto-dismiss after 3s if PRs found
      if (prData.prs?.length > 0) {
        setTimeout(() => {}, 3000);
      }
    });
  }, [workoutId]);

  const hasPRs = prs.length > 0;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0f1117]/95 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Checking for PRs...</div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center px-4 ${hasPRs ? 'bg-[#0f1117]/95' : 'bg-[#0f1117]/90'}`}>
      <div className="max-w-sm w-full space-y-6 animate-slide-up">
        {/* Header */}
        <div className="text-center">
          {hasPRs ? (
            <>
              <Trophy size={56} className="text-amber-400 mx-auto mb-3 animate-pr-pulse" />
              <h2 className="text-2xl font-bold text-amber-400">New Personal Records!</h2>
            </>
          ) : (
            <>
              <Zap size={48} className="text-emerald-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold">Workout Saved!</h2>
            </>
          )}
        </div>

        {/* PR list */}
        {hasPRs && (
          <div className="space-y-2">
            {prs.map((pr, i) => (
              <div key={i} className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="font-medium text-amber-300">{pr.exercise_name}</div>
                <div className="text-sm text-gray-400">
                  {pr.type === 'grade' && `New max: ${pr.value} (was ${pr.previous})`}
                  {pr.type === 'weight' && `New max: ${pr.value}${pr.unit} (was ${pr.previous}${pr.unit})`}
                  {pr.type === 'reps' && `New max: ${pr.value} ${pr.unit} (was ${pr.previous})`}
                  {pr.type === 'duration' && `New max: ${pr.value}${pr.unit} (was ${pr.previous}${pr.unit})`}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        <div className="bg-[#1a1d27] border border-[#2e3347] rounded-xl p-4 text-center space-y-1">
          <div className="text-sm text-gray-400">
            {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''} &middot; {setCount} set{setCount !== 1 ? 's' : ''}
          </div>
          {streak && streak.current > 0 && (
            <div className="flex items-center justify-center gap-1.5 text-sm text-orange-400">
              <Flame size={14} /> {streak.current} day streak
            </div>
          )}
        </div>

        {/* Actions */}
        <Button onClick={() => navigate(`/workout/${workoutId}`)} className="w-full">
          View Workout <ArrowRight size={16} />
        </Button>
        <button onClick={onDismiss} className="w-full text-sm text-gray-500 hover:text-gray-300 py-2">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
