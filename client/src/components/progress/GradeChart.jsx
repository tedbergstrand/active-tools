import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardContent } from '../common/Card.jsx';
import { useGradeProgress } from '../../hooks/useProgress.js';
import { gradeToNumeric } from '../../utils/grades.js';
import { EmptyState } from '../common/EmptyState.jsx';
import { TrendingUp } from 'lucide-react';

export function GradeChart({ category, days = 90 }) {
  const { grades, loading } = useGradeProgress({ category, days });

  const { data, gradeMap } = useMemo(() => {
    const byDate = {};
    grades.forEach(g => {
      const numeric = gradeToNumeric(g.grade);
      if (!byDate[g.date] || numeric > byDate[g.date].numeric) {
        byDate[g.date] = { date: g.date, grade: g.grade, numeric };
      }
    });
    const sorted = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
    return { data: sorted, gradeMap: new Map(sorted.map(d => [d.numeric, d.grade])) };
  }, [grades]);

  if (loading) return null;

  if (grades.length === 0) {
    return (
      <Card>
        <CardHeader><h3 className="font-semibold">Grade Progression</h3></CardHeader>
        <CardContent><EmptyState icon={TrendingUp} title="No grade data yet" description="Log some climbs to see your progression" /></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><h3 className="font-semibold">Grade Progression</h3></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e3347" />
            <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis dataKey="numeric" tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(val) => gradeMap.get(val) || val} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1d27', border: '1px solid #2e3347', borderRadius: 8 }}
              labelStyle={{ color: '#9ca3af' }}
              formatter={(value, name, item) => [item.payload.grade, 'Max Grade']}
            />
            <Line type="monotone" dataKey="numeric" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
