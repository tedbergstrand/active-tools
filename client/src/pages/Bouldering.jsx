import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header.jsx';
import { Button } from '../components/common/Button.jsx';
import { WorkoutCard } from '../components/workout/WorkoutCard.jsx';
import { StatCard } from '../components/progress/StatCard.jsx';
import { GradeChart } from '../components/progress/GradeChart.jsx';
import { useWorkouts } from '../hooks/useWorkouts.js';
import { useProgressSummary } from '../hooks/useProgress.js';
import { Plus, Activity, Clock, TrendingUp, Gem } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState.jsx';

export default function Bouldering() {
  const navigate = useNavigate();
  const { workouts, loading } = useWorkouts({ category: 'bouldering', limit: 10 });
  const { summary } = useProgressSummary({ category: 'bouldering', days: 30 });

  return (
    <div className="space-y-6">
      <Header title="Bouldering">
        <Button variant="bouldering" onClick={() => navigate('/log/bouldering')}><Plus size={18} /> Log Session</Button>
      </Header>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Activity} label="Sessions" value={summary?.totalWorkouts ?? '—'} sublabel="Last 30 days" color="text-amber-400" />
        <StatCard icon={Clock} label="Total Time" value={summary?.totalDuration ? `${Math.round(summary.totalDuration / 60)}h` : '—'} color="text-amber-400" />
        <StatCard icon={TrendingUp} label="Avg RPE" value={summary?.avgRpe ?? '—'} color="text-amber-400" />
      </div>

      <GradeChart category="bouldering" days={90} />

      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Sessions</h2>
        <div className="space-y-3">
          {workouts.map(w => <WorkoutCard key={w.id} workout={w} />)}
          {!loading && workouts.length === 0 && (
            <EmptyState icon={Gem} title="No bouldering sessions yet" description="Log your first bouldering session">
              <Button variant="bouldering" onClick={() => navigate('/log/bouldering')}><Plus size={16} /> Log Session</Button>
            </EmptyState>
          )}
        </div>
      </div>
    </div>
  );
}
