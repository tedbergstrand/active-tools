import { Target, Dumbbell, Hand, Zap, Shield } from 'lucide-react';

const goals = [
  { value: 'project', label: 'Send a Project', desc: 'Push your max grade', icon: Target, color: 'text-blue-400', border: 'border-blue-500/40', bg: 'bg-blue-500/10' },
  { value: 'fitness', label: 'General Fitness', desc: 'Build overall climbing fitness', icon: Dumbbell, color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10' },
  { value: 'fingers', label: 'Finger Strength', desc: 'Stronger fingers for harder holds', icon: Hand, color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10' },
  { value: 'endurance', label: 'Endurance', desc: 'Climb longer without pumping out', icon: Zap, color: 'text-violet-400', border: 'border-violet-500/40', bg: 'bg-violet-500/10' },
  { value: 'injury_prevention', label: 'Injury Prevention', desc: 'Stay healthy and climb sustainably', icon: Shield, color: 'text-rose-400', border: 'border-rose-500/40', bg: 'bg-rose-500/10' },
];

export function GoalStep({ value, onChange }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Training Goal</h2>
        <p className="text-gray-400 mt-1">What do you want to focus on?</p>
      </div>
      <div className="space-y-3">
        {goals.map(g => (
          <button
            key={g.value}
            onClick={() => onChange(g.value)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-colors text-left
              ${value === g.value
                ? `${g.border} ${g.bg}`
                : 'border-[#2e3347] hover:bg-[#1f2333]'}`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${value === g.value ? g.bg : 'bg-[#0f1117]'}`}>
              <g.icon size={20} className={g.color} />
            </div>
            <div>
              <div className="font-semibold">{g.label}</div>
              <div className="text-sm text-gray-400">{g.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
