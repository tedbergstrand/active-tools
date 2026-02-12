import { useState } from 'react';
import { Badge } from '../common/Badge.jsx';
import { Card, CardContent } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { ExercisePicker } from '../workout/ExercisePicker.jsx';
import { useToast } from '../common/Toast.jsx';
import { CATEGORIES, DAYS_OF_WEEK } from '../../utils/constants.js';
import { todayISO } from '../../utils/dates.js';
import { plansApi } from '../../api/plans.js';
import { Calendar, Target, Zap, Dumbbell, CheckCircle2, Circle, Plus, Trash2, Pencil, Save, X, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categoryColors = { roped: 'blue', bouldering: 'amber', traditional: 'emerald', mixed: 'purple' };
const workoutCategoryOptions = [
  { value: 'roped', label: 'Roped' },
  { value: 'bouldering', label: 'Bouldering' },
  { value: 'traditional', label: 'Training' },
];

function buildInitialDataFromPlanWorkout(workout) {
  return {
    category: workout.category,
    date: todayISO(),
    duration_minutes: '',
    location: '',
    notes: `Plan: ${workout.title}`,
    rpe: '',
    plan_workout_id: workout.id,
    exercises: (workout.exercises || []).map(ex => ({
      exercise_id: ex.exercise_id,
      exerciseData: { category: workout.category },
      notes: ex.notes || '',
      sets: Array.from({ length: ex.target_sets || 1 }, () => ({
        grade: ex.target_grade || '',
        reps: ex.target_reps ?? '',
        weight_kg: ex.target_weight ?? '',
        duration_seconds: ex.target_duration ?? '',
        send_type: '',
        wall_angle: '',
        route_name: '',
        grip_type: '',
        edge_size_mm: '',
        rest_seconds: '',
        completed: 1,
      })),
    })),
  };
}

function AddWorkoutForm({ weekId, onAdded, onCancel }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('traditional');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const result = await plansApi.addWorkout(weekId, { title: title.trim(), category, day_of_week: dayOfWeek });
      onAdded(result);
    } catch (err) {
      toast.error('Failed to add workout');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-dashed border-[#2e3347] rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">New Workout</span>
        <button type="button" onClick={onCancel} className="text-gray-500 hover:text-gray-300"><X size={14} /></button>
      </div>
      <input
        type="text" value={title} onChange={e => setTitle(e.target.value)}
        placeholder="Workout title (e.g. Upper Body Power)" autoFocus
        className="w-full bg-[#0f1117] border border-[#2e3347] rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
      />
      <div className="flex gap-3">
        <select value={dayOfWeek} onChange={e => setDayOfWeek(Number(e.target.value))}
          className="bg-[#0f1117] border border-[#2e3347] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500">
          {DAYS_OF_WEEK.map((d, i) => <option key={i} value={i}>{d}</option>)}
        </select>
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="bg-[#0f1117] border border-[#2e3347] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500">
          {workoutCategoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <Button type="submit" size="sm" disabled={!title.trim() || saving}>{saving ? 'Adding...' : 'Add Workout'}</Button>
    </form>
  );
}

function WorkoutExerciseEditor({ workout, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [exercises, setExercises] = useState(
    (workout.exercises || []).map(ex => ({
      exercise_id: ex.exercise_id,
      exercise_name: ex.exercise_name,
      target_sets: ex.target_sets || '',
      target_reps: ex.target_reps || '',
      target_grade: ex.target_grade || '',
      target_duration: ex.target_duration || '',
      notes: ex.notes || '',
    }))
  );
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const addExercise = () => {
    setExercises(prev => [...prev, { exercise_id: '', exercise_name: '', target_sets: '', target_reps: '', target_grade: '', target_duration: '', notes: '' }]);
  };

  const updateEx = (i, field, value) => {
    setExercises(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const removeEx = (i) => setExercises(prev => prev.filter((_, j) => j !== i));

  const handleSave = async () => {
    setSaving(true);
    try {
      await plansApi.updateWorkout(workout.id, {
        exercises: exercises.filter(ex => ex.exercise_id).map(ex => ({
          exercise_id: ex.exercise_id,
          target_sets: ex.target_sets ? Number(ex.target_sets) : null,
          target_reps: ex.target_reps ? Number(ex.target_reps) : null,
          target_grade: ex.target_grade || null,
          target_duration: ex.target_duration ? Number(ex.target_duration) : null,
          notes: ex.notes || null,
        })),
      });
      toast.success('Exercises updated');
      onUpdate();
      setEditing(false);
    } catch (err) {
      toast.error('Failed to update exercises');
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <button type="button" onClick={() => setEditing(true)}
        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1">
        <Pencil size={12} /> Edit Exercises
      </button>
    );
  }

  return (
    <div className="mt-3 space-y-2 border-t border-[#2e3347] pt-3">
      {exercises.map((ex, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1 space-y-2">
            <ExercisePicker value={ex.exercise_id} onChange={(id, data) => {
              updateEx(i, 'exercise_id', id);
              if (data) updateEx(i, 'exercise_name', data.name);
            }} />
            <div className="flex gap-2">
              <input type="number" value={ex.target_sets} onChange={e => updateEx(i, 'target_sets', e.target.value)}
                placeholder="Sets" min="1" max="20"
                className="w-20 bg-[#0f1117] border border-[#2e3347] rounded-lg px-2 py-1 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500" />
              <input type="number" value={ex.target_reps} onChange={e => updateEx(i, 'target_reps', e.target.value)}
                placeholder="Reps" min="1" max="100"
                className="w-20 bg-[#0f1117] border border-[#2e3347] rounded-lg px-2 py-1 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500" />
              <input type="text" value={ex.target_grade} onChange={e => updateEx(i, 'target_grade', e.target.value)}
                placeholder="Grade"
                className="w-20 bg-[#0f1117] border border-[#2e3347] rounded-lg px-2 py-1 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <button type="button" onClick={() => removeEx(i)} className="p-1 text-gray-500 hover:text-red-400 mt-2">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button type="button" onClick={addExercise}
        className="text-sm text-gray-400 hover:text-blue-400 flex items-center gap-1">
        <Plus size={14} /> Add Exercise
      </button>
      <div className="flex gap-2 pt-1">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          <Save size={12} /> {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
      </div>
    </div>
  );
}

export function PlanDetail({ plan, onActivate, onDeactivate, onRefetch, progress }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [addingWeek, setAddingWeek] = useState(false);
  const [addingWorkoutWeekId, setAddingWorkoutWeekId] = useState(null);
  const [generating, setGenerating] = useState(false);

  if (!plan) return null;

  const handleAddWeek = async () => {
    setAddingWeek(true);
    try {
      await plansApi.addWeek(plan.id);
      toast.success('Week added');
      onRefetch?.();
    } catch (err) {
      toast.error('Failed to add week');
    } finally {
      setAddingWeek(false);
    }
  };

  const handleDeleteWeek = async (weekId) => {
    if (!confirm('Delete this week and all its workouts?')) return;
    try {
      await plansApi.deleteWeek(weekId);
      toast.success('Week deleted');
      onRefetch?.();
    } catch (err) {
      toast.error('Failed to delete week');
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    if (!confirm('Delete this workout?')) return;
    try {
      await plansApi.deleteWorkout(workoutId);
      toast.success('Workout deleted');
      onRefetch?.();
    } catch (err) {
      toast.error('Failed to delete workout');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{plan.name}</h1>
          {plan.is_active && <Badge color="green">Active</Badge>}
        </div>
        <div className="flex items-center gap-3 mb-3">
          <Badge color={categoryColors[plan.category]}>{CATEGORIES[plan.category]?.label}</Badge>
          {plan.difficulty && <Badge color="gray">{plan.difficulty}</Badge>}
          <span className="flex items-center gap-1 text-sm text-gray-400">
            <Calendar size={14} /> {plan.duration_weeks} weeks
          </span>
          {plan.goal && (
            <span className="flex items-center gap-1 text-sm text-gray-400">
              <Target size={14} /> {plan.goal}
            </span>
          )}
        </div>
        {plan.description && <p className="text-gray-400">{plan.description}</p>}
      </div>

      <div className="flex gap-3">
        {plan.is_active ? (
          <Button variant="secondary" onClick={() => onDeactivate?.(plan.id)}>Deactivate</Button>
        ) : (
          <Button variant="primary" onClick={() => onActivate?.(plan.id)}><Zap size={16} /> Activate Plan</Button>
        )}
        <Button variant="secondary" onClick={handleAddWeek} disabled={addingWeek}>
          <Plus size={16} /> {addingWeek ? 'Adding...' : 'Add Week'}
        </Button>
      </div>

      {plan.weeks?.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No weeks yet</p>
          <p className="text-sm mb-4">Click "Add Week" to start building your plan, or auto-populate with progressive overload.</p>
          <Button onClick={async () => {
            setGenerating(true);
            try {
              await plansApi.generate(plan.id);
              toast.success('Plan populated with progressive overload');
              onRefetch?.();
            } catch {
              toast.error('Failed to generate plan');
            } finally {
              setGenerating(false);
            }
          }} disabled={generating} variant="secondary">
            <Wand2 size={16} /> {generating ? 'Generating...' : 'Auto-populate Plan'}
          </Button>
        </div>
      )}

      {plan.weeks?.map(week => (
        <Card key={week.id}>
          <div className="px-5 py-3 border-b border-[#2e3347] bg-[#0f1117]/50 rounded-t-xl flex items-center justify-between">
            <h3 className="font-semibold">Week {week.week_number}{week.focus ? ` — ${week.focus}` : ''}</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setAddingWorkoutWeekId(addingWorkoutWeekId === week.id ? null : week.id)}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <Plus size={14} /> Add Workout
              </button>
              <button onClick={() => handleDeleteWeek(week.id)}
                className="text-sm text-gray-500 hover:text-red-400 flex items-center gap-1">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <CardContent className="space-y-4">
            {week.workouts?.length === 0 && !addingWorkoutWeekId && (
              <p className="text-sm text-gray-500 text-center py-4">No workouts scheduled this week</p>
            )}
            {week.workouts?.map(workout => {
              const completionCount = progress?.completions?.[workout.id] || 0;
              return (
              <div key={workout.id} className="border border-[#2e3347] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {progress && (
                      completionCount > 0
                        ? <CheckCircle2 size={16} className="text-emerald-400" />
                        : <Circle size={16} className="text-gray-600" />
                    )}
                    <span className="font-medium">{workout.title}</span>
                    <span className="text-sm text-gray-500 ml-1">{DAYS_OF_WEEK[workout.day_of_week]}</span>
                    {completionCount > 1 && <span className="text-xs text-gray-500">&times;{completionCount}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {plan.is_active && (
                      <Button size="sm" variant="ghost"
                        onClick={() => navigate('/log', { state: { initialData: buildInitialDataFromPlanWorkout(workout) } })}>
                        <Dumbbell size={14} /> Log
                      </Button>
                    )}
                    <button onClick={() => handleDeleteWorkout(workout.id)}
                      className="p-1 text-gray-500 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {workout.exercises?.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {workout.exercises.map(ex => (
                      <div key={ex.id} className="text-sm text-gray-400 flex items-center gap-2">
                        <span className="text-gray-500">-</span>
                        <span>{ex.exercise_name}</span>
                        {ex.target_sets && <span className="text-gray-600">{ex.target_sets} sets</span>}
                        {ex.target_reps && <span className="text-gray-600">&times; {ex.target_reps}</span>}
                        {ex.target_duration && <span className="text-gray-600">{ex.target_duration}s</span>}
                        {ex.target_grade && <span className="text-gray-600">@ {ex.target_grade}</span>}
                        {ex.notes && <span className="text-gray-600 italic">{ex.notes}</span>}
                      </div>
                    ))}
                  </div>
                )}
                <WorkoutExerciseEditor workout={workout} onUpdate={() => onRefetch?.()} />
              </div>
              );
            })}
            {addingWorkoutWeekId === week.id && (
              <AddWorkoutForm
                weekId={week.id}
                onAdded={() => { setAddingWorkoutWeekId(null); onRefetch?.(); }}
                onCancel={() => setAddingWorkoutWeekId(null)}
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
