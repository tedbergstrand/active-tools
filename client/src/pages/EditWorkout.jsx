import { useParams } from 'react-router-dom';
import { useWorkout } from '../hooks/useWorkouts.js';
import { Header } from '../components/layout/Header.jsx';
import { WorkoutForm } from '../components/workout/WorkoutForm.jsx';
import { PageLoading } from '../components/common/LoadingSpinner.jsx';

function toFormShape(workout) {
  return {
    category: workout.category,
    date: workout.date,
    duration_minutes: workout.duration_minutes ?? '',
    location: workout.location || '',
    notes: workout.notes || '',
    rpe: workout.rpe ?? '',
    plan_workout_id: workout.plan_workout_id || null,
    tool_session_id: workout.tool_session_id || null,
    exercises: (workout.exercises || []).map(ex => ({
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
        completed: s.completed ?? 1,
      })),
    })),
  };
}

export function EditWorkout() {
  const { id } = useParams();
  const { workout, loading } = useWorkout(id);

  if (loading) return <PageLoading />;
  if (!workout) return <div className="text-center py-12 text-gray-500">Workout not found</div>;

  return (
    <div>
      <Header title="Edit Workout" showBack />
      <WorkoutForm initialData={toFormShape(workout)} workoutId={id} />
    </div>
  );
}
