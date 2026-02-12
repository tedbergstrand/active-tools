import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '../components/layout/Header.jsx';
import { WorkoutForm } from '../components/workout/WorkoutForm.jsx';
import { Button } from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import { workoutsApi } from '../api/workouts.js';
import { CATEGORIES } from '../utils/constants.js';
import { formatDate } from '../utils/dates.js';
import { todayISO } from '../utils/dates.js';
import { Copy, X } from 'lucide-react';

export function LogWorkout() {
  const location = useLocation();
  const [formKey, setFormKey] = useState(0);
  const [initialData, setInitialData] = useState(location.state?.initialData || null);
  const [showRecent, setShowRecent] = useState(false);
  const [recentWorkouts, setRecentWorkouts] = useState([]);

  useEffect(() => {
    if (showRecent) {
      workoutsApi.list({ limit: 10 }).then(res => setRecentWorkouts(res.workouts)).catch(() => {});
    }
  }, [showRecent]);

  const handleCopyRecent = async (workout) => {
    const full = await workoutsApi.get(workout.id);
    const data = {
      category: full.category,
      date: todayISO(),
      duration_minutes: '',
      location: full.location || '',
      notes: '',
      rpe: '',
      exercises: (full.exercises || []).map(ex => ({
        exercise_id: ex.exercise_id,
        exerciseData: { category: ex.exercise_category, subcategory: ex.subcategory },
        notes: ex.notes || '',
        sets: (ex.sets || []).map(s => ({
          grade: s.grade || '',
          send_type: s.send_type || '',
          wall_angle: s.wall_angle || '',
          route_name: s.route_name || '',
          reps: s.reps ?? '',
          weight_kg: s.weight_kg ?? '',
          duration_seconds: s.duration_seconds ?? '',
          grip_type: s.grip_type || '',
          edge_size_mm: s.edge_size_mm ?? '',
          rest_seconds: s.rest_seconds ?? '',
          completed: 1,
        })),
      })),
    };
    setInitialData(data);
    setFormKey(k => k + 1);
    setShowRecent(false);
  };

  return (
    <div>
      <Header title="Log Workout">
        <Button variant="secondary" size="sm" onClick={() => setShowRecent(!showRecent)}>
          {showRecent ? <><X size={16} /> Close</> : <><Copy size={16} /> Copy Recent</>}
        </Button>
      </Header>

      {showRecent && (
        <Card className="mb-6 p-4 space-y-2">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Select a workout to copy</h3>
          {recentWorkouts.map(w => (
            <button
              key={w.id}
              onClick={() => handleCopyRecent(w)}
              className="w-full text-left px-3 py-2 rounded-lg bg-[#0f1117] hover:bg-[#1a1d27] active:bg-[#252838] transition-colors flex items-center justify-between"
            >
              <span>{CATEGORIES[w.category]?.label} — {formatDate(w.date)}</span>
              <Copy size={14} className="text-gray-500" />
            </button>
          ))}
          {recentWorkouts.length === 0 && <p className="text-sm text-gray-500">No recent workouts</p>}
        </Card>
      )}

      <WorkoutForm key={formKey} initialData={initialData} />
    </div>
  );
}
