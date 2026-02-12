import { useExercisesWithData } from '../../hooks/useProgress.js';

export function ExerciseSelector({ value, onChange }) {
  const { exercises, loading } = useExercisesWithData();

  if (loading) return null;

  return (
    <select
      value={value || ''}
      onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
      className="bg-[#0f1117] border border-[#2e3347] rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500 w-full"
    >
      <option value="">Select an exercise...</option>
      {exercises.map(ex => (
        <option key={ex.id} value={ex.id}>{ex.name} ({ex.category})</option>
      ))}
    </select>
  );
}
