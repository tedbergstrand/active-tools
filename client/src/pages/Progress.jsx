import { useState } from 'react';
import { Header } from '../components/layout/Header.jsx';
import { Tabs } from '../components/common/Tabs.jsx';
import { StatCard } from '../components/progress/StatCard.jsx';
import { GradeChart } from '../components/progress/GradeChart.jsx';
import { VolumeChart } from '../components/progress/VolumeChart.jsx';
import { FrequencyChart } from '../components/progress/FrequencyChart.jsx';
import { PersonalRecords } from '../components/progress/PersonalRecords.jsx';
import { useProgressSummary } from '../hooks/useProgress.js';
import { Activity, Clock, Gauge, Layers } from 'lucide-react';

const rangeTabs = [
  { value: '30', label: '30 Days' },
  { value: '90', label: '90 Days' },
  { value: '180', label: '6 Months' },
  { value: '365', label: '1 Year' },
];

const categoryTabs = [
  { value: '', label: 'All' },
  { value: 'roped', label: 'Roped' },
  { value: 'bouldering', label: 'Bouldering' },
  { value: 'traditional', label: 'Training' },
];

export function Progress() {
  const [days, setDays] = useState('90');
  const [category, setCategory] = useState('');
  const { summary } = useProgressSummary({ days, ...(category ? { category } : {}) });

  return (
    <div className="space-y-6">
      <Header title="Progress" />

      <div className="flex flex-wrap gap-4">
        <Tabs tabs={categoryTabs} active={category} onChange={setCategory} />
        <Tabs tabs={rangeTabs} active={days} onChange={setDays} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Workouts" value={summary?.totalWorkouts ?? '—'} />
        <StatCard icon={Clock} label="Total Time" value={summary?.totalDuration ? `${Math.round(summary.totalDuration / 60)}h` : '—'} color="text-emerald-400" />
        <StatCard icon={Gauge} label="Avg RPE" value={summary?.avgRpe ?? '—'} color="text-amber-400" />
        <StatCard icon={Layers} label="Total Sets" value={summary?.totalSets ?? '—'} color="text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GradeChart category={category || undefined} days={Number(days)} />
        <VolumeChart days={Number(days)} />
      </div>

      <FrequencyChart days={Number(days)} />

      <PersonalRecords category={category || undefined} />
    </div>
  );
}
