import { Card, CardHeader, CardContent } from '../common/Card.jsx';
import { usePersonalRecords } from '../../hooks/useProgress.js';
import { EmptyState } from '../common/EmptyState.jsx';
import { Trophy, TrendingUp, Weight, Timer, Repeat } from 'lucide-react';
import { formatDate } from '../../utils/dates.js';
import { formatWeight, formatSeconds } from '../../utils/formatters.js';

function RecordRow({ icon: Icon, label, value, date, color = 'text-yellow-400' }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-[#2e3347] last:border-0">
      <Icon size={16} className={color} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{label}</div>
        {date && <div className="text-xs text-gray-500">{formatDate(date)}</div>}
      </div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}

export function PersonalRecords({ category }) {
  const { records, loading } = usePersonalRecords(category ? { category } : {});

  if (loading) return null;

  if (!records || (
    records.highestGrades.length === 0 &&
    records.maxWeights.length === 0 &&
    records.maxReps.length === 0 &&
    records.maxDurations.length === 0
  )) {
    return (
      <Card>
        <CardHeader><h3 className="font-semibold flex items-center gap-2"><Trophy size={18} className="text-yellow-400" /> Personal Records</h3></CardHeader>
        <CardContent><EmptyState icon={Trophy} title="No records yet" description="Complete workouts to set personal records" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><h3 className="font-semibold flex items-center gap-2"><Trophy size={18} className="text-yellow-400" /> Personal Records</h3></CardHeader>
      <CardContent className="space-y-1">
        {records.highestGrades.slice(0, 5).map((r, i) => (
          <RecordRow key={i} icon={TrendingUp} label={r.exercise_name}
            value={`${r.grade} (${r.send_type})`} date={r.date} color="text-blue-400" />
        ))}
        {records.maxWeights.slice(0, 5).map((r, i) => (
          <RecordRow key={`w${i}`} icon={Weight} label={r.exercise_name}
            value={formatWeight(r.max_weight)} date={r.date} color="text-emerald-400" />
        ))}
        {records.maxReps.slice(0, 3).map((r, i) => (
          <RecordRow key={`r${i}`} icon={Repeat} label={r.exercise_name}
            value={`${r.max_reps} reps`} date={r.date} color="text-purple-400" />
        ))}
        {records.maxDurations.slice(0, 3).map((r, i) => (
          <RecordRow key={`d${i}`} icon={Timer} label={r.exercise_name}
            value={formatSeconds(r.max_duration)} date={r.date} color="text-red-400" />
        ))}
      </CardContent>
    </Card>
  );
}
