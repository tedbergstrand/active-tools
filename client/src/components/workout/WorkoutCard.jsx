import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card.jsx';
import { Badge } from '../common/Badge.jsx';
import { CATEGORIES } from '../../utils/constants.js';
import { formatDate, formatRelative } from '../../utils/dates.js';
import { formatDuration } from '../../utils/formatters.js';
import { Clock, MapPin, Gauge } from 'lucide-react';

const categoryColors = { roped: 'blue', bouldering: 'amber', traditional: 'emerald' };

export function WorkoutCard({ workout }) {
  const navigate = useNavigate();
  const cat = CATEGORIES[workout.category] || {};
  const exercises = workout.exercise_summary || [];

  return (
    <Card onClick={() => navigate(`/workout/${workout.id}`)} className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge color={categoryColors[workout.category] || 'gray'}>{cat.label || workout.category}</Badge>
            <span className="text-xs text-gray-500">{formatRelative(workout.date)}</span>
          </div>
          <div className="text-sm text-gray-400">{formatDate(workout.date)}</div>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
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
      {exercises.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {exercises.slice(0, 4).map((ex, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-[#0f1117] text-gray-400 border border-[#2e3347]/50">
              {ex.name}{ex.set_count > 0 ? ` ×${ex.set_count}` : ''}
              {ex.top_grade ? ` (${ex.top_grade})` : ''}
            </span>
          ))}
          {exercises.length > 4 && (
            <span className="text-xs px-2 py-0.5 text-gray-500">+{exercises.length - 4} more</span>
          )}
        </div>
      )}
      {workout.notes && (
        <p className="mt-2 text-sm text-gray-500 line-clamp-1">{workout.notes}</p>
      )}
    </Card>
  );
}
