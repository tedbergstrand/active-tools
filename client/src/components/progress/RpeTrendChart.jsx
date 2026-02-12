import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardContent } from '../common/Card.jsx';
import { useRpeTrend } from '../../hooks/useProgress.js';
import { EmptyState } from '../common/EmptyState.jsx';
import { Gauge } from 'lucide-react';

export function RpeTrendChart({ days = 90 }) {
  const { rpeTrend, loading } = useRpeTrend({ days });

  if (loading) return null;
  if (rpeTrend.length === 0) {
    return (
      <Card>
        <CardHeader><h3 className="font-semibold">RPE Trend</h3></CardHeader>
        <CardContent><EmptyState icon={Gauge} title="No RPE data" description="Log RPE with workouts to see trends" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><h3 className="font-semibold">RPE Trend</h3></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={rpeTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e3347" />
            <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis domain={[1, 10]} tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid #2e3347', borderRadius: 8 }}
              labelStyle={{ color: '#9ca3af' }}
              formatter={(value) => [value, 'Avg RPE']}
            />
            <Line type="monotone" dataKey="avg_rpe" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
