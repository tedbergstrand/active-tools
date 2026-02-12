import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardContent } from '../common/Card.jsx';
import { useExerciseHistory } from '../../hooks/useProgress.js';
import { EmptyState } from '../common/EmptyState.jsx';
import { TrendingUp } from 'lucide-react';

const METRIC_CONFIG = {
  grade: { key: 'grade_rank', label: 'Grade', color: '#3b82f6', formatLabel: (v, history) => {
    const point = history.find(h => h.grade_rank === v);
    return point?.grade || v;
  }},
  reps: { key: 'reps', label: 'Reps', color: '#10b981' },
  duration: { key: 'duration_seconds', label: 'Duration (s)', color: '#f59e0b' },
  weight: { key: 'weight_kg', label: 'Weight (kg)', color: '#8b5cf6' },
};

export function ExerciseProgressChart({ exerciseId, days = 365 }) {
  const { data, loading } = useExerciseHistory(exerciseId, { days });

  if (loading || !data) return null;

  const { exercise, history } = data;
  if (!history.length) {
    return (
      <Card>
        <CardHeader><h3 className="font-semibold">{exercise.name} Progress</h3></CardHeader>
        <CardContent><EmptyState icon={TrendingUp} title="No data yet" description="Log sets for this exercise to see progress" /></CardContent>
      </Card>
    );
  }

  const metric = METRIC_CONFIG[exercise.default_metric] || METRIC_CONFIG.reps;
  const chartData = history.filter(h => h[metric.key] != null);

  if (!chartData.length) return null;

  return (
    <Card>
      <CardHeader><h3 className="font-semibold">{exercise.name} Progress</h3></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e3347" />
            <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={exercise.default_metric === 'grade' ? (v) => {
                const point = history.find(h => h.grade_rank === v);
                return point?.grade || v;
              } : undefined}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid #2e3347', borderRadius: 8 }}
              formatter={(value) => {
                if (exercise.default_metric === 'grade') {
                  const point = history.find(h => h.grade_rank === value);
                  return [point?.grade || value, metric.label];
                }
                return [value, metric.label];
              }}
            />
            <Line type="monotone" dataKey={metric.key} stroke={metric.color} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
