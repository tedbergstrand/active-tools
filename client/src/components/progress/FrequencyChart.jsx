import { Card, CardHeader, CardContent } from '../common/Card.jsx';
import { useFrequencyData } from '../../hooks/useProgress.js';
import { EmptyState } from '../common/EmptyState.jsx';
import { CalendarDays } from 'lucide-react';

const CATEGORY_COLORS = { roped: '#3b82f6', bouldering: '#f59e0b', traditional: '#10b981', tools: '#8b5cf6' };

export function FrequencyChart({ days = 90 }) {
  const { frequency, loading } = useFrequencyData({ days });

  if (loading) return null;

  if (frequency.length === 0) {
    return (
      <Card>
        <CardHeader><h3 className="font-semibold">Session Frequency</h3></CardHeader>
        <CardContent><EmptyState icon={CalendarDays} title="No sessions yet" description="Log workouts to see your training frequency" /></CardContent>
      </Card>
    );
  }

  // Build a calendar-like grid for the last N days
  const today = new Date();
  const cells = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const sessions = frequency.filter(f => f.date === dateStr);
    cells.push({ date: dateStr, sessions });
  }

  return (
    <Card>
      <CardHeader><h3 className="font-semibold">Session Frequency</h3></CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1">
          {cells.map(cell => {
            const count = cell.sessions.reduce((s, f) => s + f.count, 0);
            const mainCategory = cell.sessions[0]?.category;
            const color = count > 0 ? (CATEGORY_COLORS[mainCategory] || '#3b82f6') : '#1a1d27';
            const opacity = count === 0 ? 0.3 : Math.min(0.4 + count * 0.3, 1);

            return (
              <div
                key={cell.date}
                title={`${cell.date}: ${count} session(s)`}
                className="w-3 h-3 rounded-sm border border-[#2e3347]/50"
                style={{ backgroundColor: color, opacity }}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500" /> Roped</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500" /> Bouldering</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500" /> Training</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-violet-500" /> Tools</span>
        </div>
      </CardContent>
    </Card>
  );
}
