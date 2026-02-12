import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardContent } from '../common/Card.jsx';
import { useDistribution } from '../../hooks/useProgress.js';
import { CATEGORIES } from '../../utils/constants.js';
import { EmptyState } from '../common/EmptyState.jsx';
import { PieChart as PieIcon } from 'lucide-react';

const COLORS = { roped: '#3b82f6', bouldering: '#f59e0b', traditional: '#10b981' };

export function DistributionChart({ days = 90 }) {
  const { distribution, loading } = useDistribution({ days });

  if (loading) return null;
  if (distribution.length === 0) {
    return (
      <Card>
        <CardHeader><h3 className="font-semibold">Session Distribution</h3></CardHeader>
        <CardContent><EmptyState icon={PieIcon} title="No data yet" description="Log workouts to see distribution" /></CardContent>
      </Card>
    );
  }

  const data = distribution.map(d => ({
    name: CATEGORIES[d.category]?.label || d.category,
    value: d.sessions,
    minutes: d.total_minutes,
    color: COLORS[d.category] || '#6b7280',
  }));

  return (
    <Card>
      <CardHeader><h3 className="font-semibold">Session Distribution</h3></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid #2e3347', borderRadius: 8 }}
              formatter={(value, name, item) => [`${value} sessions (${item.payload.minutes} min)`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
