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
      {workout.notes && (
        <p className="mt-2 text-sm text-gray-500 line-clamp-2">{workout.notes}</p>
      )}
    </Card>
  );
}
