import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardContent } from '../common/Card.jsx';
import { useVolumeData } from '../../hooks/useProgress.js';
import { EmptyState } from '../common/EmptyState.jsx';
import { BarChart3 } from 'lucide-react';

export function VolumeChart({ days = 90 }) {
  const { volume, loading } = useVolumeData({ days });

  const data = useMemo(() => {
    const weeks = {};
    volume.forEach(v => {
      if (!weeks[v.week]) weeks[v.week] = { week: v.week, roped: 0, bouldering: 0, traditional: 0 };
      weeks[v.week][v.category] = v.sessions;
    });
    return Object.values(weeks).sort((a, b) => a.week.localeCompare(b.week));
  }, [volume]);

  if (loading) return null;

  if (volume.length === 0) {
    return (
      <Card>
        <CardHeader><h3 className="font-semibold">Training Volume</h3></CardHeader>
        <CardContent><EmptyState icon={BarChart3} title="No volume data yet" description="Start logging workouts to track volume" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><h3 className="font-semibold">Weekly Training Volume</h3></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e3347" />
            <XAxis dataKey="week" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid #2e3347', borderRadius: 8 }} />
            <Legend />
            <Bar dataKey="roped" stackId="a" fill="#3b82f6" name="Roped" radius={[0, 0, 0, 0]} />
            <Bar dataKey="bouldering" stackId="a" fill="#f59e0b" name="Bouldering" />
            <Bar dataKey="traditional" stackId="a" fill="#10b981" name="Training" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
