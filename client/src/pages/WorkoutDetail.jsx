import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkout } from '../hooks/useWorkouts.js';
import { Header } from '../components/layout/Header.jsx';
import { Card, CardContent } from '../components/common/Card.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { Button } from '../components/common/Button.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { PageLoading } from '../components/common/LoadingSpinner.jsx';
import { CATEGORIES, SEND_TYPES } from '../utils/constants.js';
import { formatDate } from '../utils/dates.js';
import { formatDuration, formatWeight, formatSeconds } from '../utils/formatters.js';
import { Clock, MapPin, Gauge, Trash2, Pencil, Copy } from 'lucide-react';
import { todayISO } from '../utils/dates.js';
import { workoutsApi } from '../api/workouts.js';
import { useSettings } from '../components/settings/SettingsContext.jsx';
import { useToast } from '../components/common/Toast.jsx';

const categoryColors = { roped: 'blue', bouldering: 'amber', traditional: 'emerald' };

export function WorkoutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { workout, loading } = useWorkout(id);
  const { settings } = useSettings();
  const toast = useToast();
  const units = settings.units || 'metric';
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (loading) return <PageLoading />;
  if (!workout) return <div className="text-center py-12 text-gray-500">Workout not found</div>;

  const handleUseAsTemplate = () => {
    const initialData = {
      category: workout.category,
      date: todayISO(),
      duration_minutes: '',
      location: workout.location || '',
      notes: '',
      rpe: '',
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
          completed: 1,
        })),
      })),
    };
    navigate('/log', { state: { initialData } });
  };

  const handleDelete = async () => {
    try {
      await workoutsApi.delete(id);
      toast.success('Workout deleted');
      navigate(-1);
    } catch (err) {
      toast.error('Failed to delete workout');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Header title="Workout Detail" showBack>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleUseAsTemplate} aria-label="Use as template">
            <Copy size={16} /> <span className="hidden sm:inline">Template</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/workout/${id}/edit`)} aria-label="Edit workout">
            <Pencil size={16} /> <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)} aria-label="Delete workout">
            <Trash2 size={16} /> <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </Header>

      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <Badge color={categoryColors[workout.category]}>{CATEGORIES[workout.category]?.label}</Badge>
          <span className="text-gray-400">{formatDate(workout.date)}</span>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-400 mb-4">
          {workout.duration_minutes && (
            <span className="flex items-center gap-1"><Clock size={14} /> {formatDuration(workout.duration_minutes)}</span>
          )}
          {workout.location && (
            <span className="flex items-center gap-1"><MapPin size={14} /> {workout.location}</span>
          )}
          {workout.rpe && (
            <span className="flex items-center gap-1"><Gauge size={14} /> RPE {workout.rpe}</span>
          )}
        </div>

        {workout.notes && <p className="text-gray-400 mb-4">{workout.notes}</p>}
      </Card>

      {workout.exercises?.map((ex) => (
        <Card key={ex.id}>
          <div className="px-5 py-3 border-b border-[#2e3347]">
            <h3 className="font-semibold">{ex.exercise_name}</h3>
            {ex.notes && <p className="text-sm text-gray-500">{ex.notes}</p>}
          </div>
          <CardContent>
            <div className="space-y-2">
              {ex.sets?.map((set, i) => (
                <div key={set.id} className="flex items-center gap-3 text-sm py-1 border-b border-[#2e3347]/50 last:border-0">
                  <span className="text-gray-500 w-6">{i + 1}</span>
                  {set.grade && <Badge color="blue">{set.grade}</Badge>}
                  {set.send_type && (
                    <span className={SEND_TYPES.find(t => t.value === set.send_type)?.color || ''}>
                      {SEND_TYPES.find(t => t.value === set.send_type)?.label || set.send_type}
                    </span>
                  )}
                  {set.route_name && <span className="text-gray-300">{set.route_name}</span>}
                  {set.reps && <span className="text-gray-300">{set.reps} reps</span>}
                  {set.weight_kg > 0 && <span className="text-gray-300">{formatWeight(set.weight_kg, units)}</span>}
                  {set.duration_seconds > 0 && <span className="text-gray-300">{formatSeconds(set.duration_seconds)}</span>}
                  {set.grip_type && <Badge color="gray">{set.grip_type}</Badge>}
                  {set.edge_size_mm > 0 && <span className="text-gray-500">{set.edge_size_mm}mm</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Workout"
        message="This will permanently delete this workout and all its data. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
