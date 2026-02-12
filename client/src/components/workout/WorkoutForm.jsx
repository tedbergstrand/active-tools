import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { workoutsApi } from '../../api/workouts.js';
import { useSettings } from '../settings/SettingsContext.jsx';
import { Input, Textarea } from '../common/Input.jsx';
import { Select } from '../common/Select.jsx';
import { Button } from '../common/Button.jsx';
import { ExercisePicker } from './ExercisePicker.jsx';
import { SetList } from './SetList.jsx';
import { RestTimerQuick } from '../timer/RestTimerQuick.jsx';
import { useToast } from '../common/Toast.jsx';
import { todayISO } from '../../utils/dates.js';
import { WorkoutSaveOverlay } from './WorkoutSaveOverlay.jsx';
import { Plus, Trash2, GripVertical } from 'lucide-react';

const categoryOptions = [
  { value: 'roped', label: 'Roped Climbing' },
  { value: 'bouldering', label: 'Bouldering' },
  { value: 'traditional', label: 'Traditional Exercise' },
];

function getExerciseType(exercise) {
  if (!exercise) return 'general';
  const cat = exercise.category;
  if (cat === 'roped') return 'roped';
  if (cat === 'bouldering') return 'bouldering';
  if (exercise.subcategory === 'hangboard') return 'hangboard';
  return 'general';
}

export function WorkoutForm({ initialData, workoutId }) {
  const navigate = useNavigate();
  const { category: urlCategory } = useParams();
  const { settings } = useSettings();
  const [saving, setSaving] = useState(false);
  const [savedWorkoutId, setSavedWorkoutId] = useState(null);
  const toast = useToast();
  const isEditMode = Boolean(workoutId);

  const [form, setForm] = useState(() => initialData ? { ...initialData } : {
    category: urlCategory || 'roped',
    date: todayISO(),
    duration_minutes: '',
    location: '',
    notes: '',
    rpe: '',
    exercises: [],
  });

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const addExercise = () => {
    setForm(prev => ({
      ...prev,
      exercises: [...prev.exercises, { exercise_id: '', exerciseData: null, sets: [{}], notes: '' }],
    }));
  };

  const updateExercise = (index, updates) => {
    setForm(prev => {
      const exercises = [...prev.exercises];
      exercises[index] = { ...exercises[index], ...updates };
      return { ...prev, exercises };
    });
  };

  const removeExercise = (index) => {
    setForm(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        category: form.category,
        date: form.date,
        duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
        location: form.location,
        notes: form.notes,
        rpe: form.rpe ? Number(form.rpe) : null,
        plan_workout_id: form.plan_workout_id || null,
        tool_session_id: form.tool_session_id || null,
        exercises: form.exercises
          .filter(ex => ex.exercise_id)
          .map((ex, i) => ({
            exercise_id: ex.exercise_id,
            sort_order: i,
            notes: ex.notes,
            sets: ex.sets.filter(s => Object.values(s).some(v => v)),
          })),
      };
      if (isEditMode) {
        await workoutsApi.update(workoutId, payload);
        navigate(`/workout/${workoutId}`);
      } else {
        const result = await workoutsApi.create(payload);
        setSavedWorkoutId(result.id);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save workout');
    } finally {
      setSaving(false);
    }
  };

  const gradeSystem = form.category === 'bouldering'
    ? (settings.boulder_grade_system || 'v_scale')
    : (settings.grade_system || 'yds');

  if (savedWorkoutId) {
    const exerciseCount = form.exercises.filter(ex => ex.exercise_id).length;
    const setCount = form.exercises.reduce((sum, ex) => sum + (ex.sets?.filter(s => Object.values(s).some(v => v)).length || 0), 0);
    return (
      <WorkoutSaveOverlay
        workoutId={savedWorkoutId}
        exerciseCount={exerciseCount}
        setCount={setCount}
        onDismiss={() => navigate('/')}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Select label="Category" options={categoryOptions} value={form.category}
          onChange={e => updateForm('category', e.target.value)} />
        <Input label="Date" type="date" value={form.date}
          onChange={e => updateForm('date', e.target.value)} />
        <Input label="Duration (min)" type="number" min="0" max="1440" value={form.duration_minutes}
          onChange={e => updateForm('duration_minutes', e.target.value)} placeholder="60" />
        <Input label="RPE (1-10)" type="number" min="1" max="10" value={form.rpe}
          onChange={e => updateForm('rpe', e.target.value)} placeholder="7" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Location" value={form.location}
          onChange={e => updateForm('location', e.target.value)} placeholder="Gym name or crag" />
        <Textarea label="Notes" value={form.notes}
          onChange={e => updateForm('notes', e.target.value)} placeholder="How did it feel?" />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Exercises</h3>
        <RestTimerQuick />
      </div>

      <div className="space-y-4">
        {form.exercises.map((ex, i) => (
          <div key={i} className="bg-[#1a1d27] border border-[#2e3347] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <GripVertical size={16} className="text-gray-600" />
              <ExercisePicker
                value={ex.exercise_id}
                category={form.category}
                onChange={(id, data) => {
                  updateExercise(i, { exercise_id: id, exerciseData: data });
                }}
              />
              <button type="button" onClick={() => removeExercise(i)} className="p-2 text-gray-500 hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
            {ex.exercise_id && (
              <SetList
                sets={ex.sets}
                exerciseType={getExerciseType(ex.exerciseData)}
                gradeSystem={gradeSystem}
                onChange={sets => updateExercise(i, { sets })}
              />
            )}
          </div>
        ))}

        <Button type="button" variant="secondary" onClick={addExercise} className="w-full">
          <Plus size={18} /> Add Exercise
        </Button>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[#2e3347]">
        <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : isEditMode ? 'Update Workout' : 'Save Workout'}
        </Button>
      </div>
    </form>
  );
}
