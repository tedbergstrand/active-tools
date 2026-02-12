import { Sprout, TrendingUp, Award } from 'lucide-react';

const levels = [
  { value: 'beginner', label: 'Beginner', desc: 'Less than 1 year climbing', icon: Sprout, color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10' },
  { value: 'intermediate', label: 'Intermediate', desc: '1-3 years climbing', icon: TrendingUp, color: 'text-blue-400', border: 'border-blue-500/40', bg: 'bg-blue-500/10' },
  { value: 'advanced', label: 'Advanced', desc: '3+ years climbing', icon: Award, color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10' },
];

export function ExperienceStep({ value, onChange }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Your Experience</h2>
        <p className="text-gray-400 mt-1">How long have you been climbing?</p>
      </div>
      <div className="space-y-3">
        {levels.map(level => (
          <button
            key={level.value}
            onClick={() => onChange(level.value)}
            className={`w-full flex items-center gap-4 p-5 rounded-xl border transition-colors text-left
              ${value === level.value
                ? `${level.border} ${level.bg}`
                : 'border-[#2e3347] hover:bg-[#1f2333]'}`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${value === level.value ? level.bg : 'bg-[#0f1117]'}`}>
              <level.icon size={24} className={level.color} />
            </div>
            <div>
              <div className="font-semibold text-lg">{level.label}</div>
              <div className="text-sm text-gray-400">{level.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
