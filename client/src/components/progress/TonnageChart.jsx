import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardContent } from '../common/Card.jsx';
import { useVolumeDetail } from '../../hooks/useProgress.js';
import { EmptyState } from '../common/EmptyState.jsx';
import { Weight } from 'lucide-react';

export function TonnageChart({ days = 365 }) {
  const { volumeDetail, loading } = useVolumeDetail({ days });

  const data = useMemo(() => {
    const weeks = {};
    volumeDetail.forEach(v => {
      if (!weeks[v.week]) weeks[v.week] = { week: v.week, roped: 0, bouldering: 0, traditional: 0 };
      weeks[v.week][v.category] = Math.round(v.tonnage_kg);
    });
    return Object.values(weeks).sort((a, b) => a.week.localeCompare(b.week));
  }, [volumeDetail]);

  if (loading) return null;

  if (!volumeDetail.length) {
    return (
      <Card>
        <CardHeader><h3 className="font-semibold">Weekly Tonnage</h3></CardHeader>
        <CardContent><EmptyState icon={Weight} title="No tonnage data yet" description="Log weighted exercises to track tonnage" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><h3 className="font-semibold">Weekly Tonnage (kg)</h3></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e3347" />
            <XAxis dataKey="week" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid #2e3347', borderRadius: 8 }} />
            <Legend />
            <Bar dataKey="roped" stackId="a" fill="#3b82f6" name="Roped" />
            <Bar dataKey="bouldering" stackId="a" fill="#f59e0b" name="Bouldering" />
            <Bar dataKey="traditional" stackId="a" fill="#10b981" name="Training" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
