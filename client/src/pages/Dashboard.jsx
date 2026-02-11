import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header.jsx';
import { Button } from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import { StatCard } from '../components/progress/StatCard.jsx';
import { ActivePlanBanner } from '../components/plans/ActivePlanBanner.jsx';
import { WorkoutCard } from '../components/workout/WorkoutCard.jsx';
import { FrequencyChart } from '../components/progress/FrequencyChart.jsx';
import { useWorkouts } from '../hooks/useWorkouts.js';
import { useProgressSummary } from '../hooks/useProgress.js';
import { toolsApi } from '../api/tools.js';
import { Plus, Mountain, Gem, Dumbbell, Wrench, Activity, Clock, Gauge, Layers, Play, ChevronRight } from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const { workouts, loading } = useWorkouts({ limit: 5 });
  const { summary } = useProgressSummary({ days: 30 });
  const [toolHint, setToolHint] = useState(null); // { type: 'favorite'|'recent'|'discover', tool? }

  // Load a smart tool suggestion for the training card
  useEffect(() => {
    Promise.all([
      toolsApi.getFavorites().catch(() => []),
      toolsApi.recentTools().catch(() => []),
      toolsApi.list().catch(() => []),
    ]).then(([favIds, recentIds, allTools]) => {
      const findTool = (id) => allTools.find(t => t.id === id);
      if (favIds.length > 0) {
        const tool = findTool(favIds[0]);
        if (tool) return setToolHint({ type: 'favorite', tool });
      }
      if (recentIds.length > 0) {
        const tool = findTool(recentIds[0]);
        if (tool) return setToolHint({ type: 'recent', tool });
      }
      setToolHint({ type: 'discover' });
    });
  }, []);

  const quickActions = [
    { label: 'Log Roped', icon: Mountain, color: 'text-blue-500', bg: 'hover:bg-blue-500/10', to: '/log/roped' },
    { label: 'Log Boulder', icon: Gem, color: 'text-amber-500', bg: 'hover:bg-amber-500/10', to: '/log/bouldering' },
    { label: 'Log Training', icon: Dumbbell, color: 'text-emerald-500', bg: 'hover:bg-emerald-500/10', to: '/log/traditional' },
    { label: 'Tools', icon: Wrench, color: 'text-violet-500', bg: 'hover:bg-violet-500/10', to: '/tools' },
  ];

  return (
    <div className="space-y-6">
      <Header title="Dashboard">
        <Button onClick={() => navigate('/log')}><Plus size={18} /> Log Workout</Button>
      </Header>

      <ActivePlanBanner />

      {/* Training tools entry point — prominent on mobile */}
      {toolHint && (
        <button
          onClick={() => navigate(toolHint.tool ? `/tools/${toolHint.tool.slug}` : '/tools')}
          className="w-full bg-gradient-to-r from-violet-600/15 to-blue-600/15 border border-violet-500/25 rounded-xl p-4 flex items-center gap-4 hover:from-violet-600/20 hover:to-blue-600/20 active:from-violet-600/25 active:to-blue-600/25 transition-all text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
            {toolHint.tool ? <Play size={22} className="text-violet-400" /> : <Wrench size={22} className="text-violet-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-white">
              {toolHint.tool ? toolHint.tool.name : 'Training Tools'}
            </div>
            <div className="text-sm text-gray-400 truncate">
              {toolHint.type === 'favorite' ? 'Your favorite — tap to start'
                : toolHint.type === 'recent' ? 'Continue where you left off'
                : 'Audio-guided drills for the wall'}
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-500 shrink-0" />
        </button>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Workouts" value={summary?.totalWorkouts ?? '—'} sublabel="Last 30 days" />
        <StatCard icon={Clock} label="Total Time" value={summary?.totalDuration ? `${Math.round(summary.totalDuration / 60)}h` : '—'} sublabel="Last 30 days" color="text-emerald-400" />
        <StatCard icon={Gauge} label="Avg RPE" value={summary?.avgRpe ?? '—'} sublabel="Last 30 days" color="text-amber-400" />
        <StatCard icon={Layers} label="Total Sets" value={summary?.totalSets ?? '—'} sublabel="Last 30 days" color="text-purple-400" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions.map(action => (
          <Card key={action.to} onClick={() => navigate(action.to)}
            className={`p-4 flex flex-col items-center gap-2 ${action.bg} transition-colors cursor-pointer`}>
            <action.icon size={28} className={action.color} />
            <span className="text-sm font-medium">{action.label}</span>
          </Card>
        ))}
      </div>

      <FrequencyChart days={90} />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Workouts</h2>
          <button onClick={() => navigate('/progress')} className="text-sm text-blue-400 hover:text-blue-300">View All</button>
        </div>
        <div className="space-y-3">
          {workouts.map(w => <WorkoutCard key={w.id} workout={w} />)}
          {!loading && workouts.length === 0 && (
            <Card className="p-8 text-center text-gray-500">
              <p>No workouts yet. Start by logging your first session!</p>
              <Button className="mt-3" onClick={() => navigate('/log')}><Plus size={16} /> Log Workout</Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
