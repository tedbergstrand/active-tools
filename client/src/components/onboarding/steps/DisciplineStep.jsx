import { Mountain, Gem, Layers } from 'lucide-react';

const disciplines = [
  { value: 'roped', label: 'Roped Climbing', desc: 'Sport, trad, or top rope', icon: Mountain, color: 'text-blue-400', border: 'border-blue-500/40', bg: 'bg-blue-500/10' },
  { value: 'bouldering', label: 'Bouldering', desc: 'Short powerful problems', icon: Gem, color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10' },
  { value: 'both', label: 'Both', desc: 'A mix of roped and bouldering', icon: Layers, color: 'text-violet-400', border: 'border-violet-500/40', bg: 'bg-violet-500/10' },
];

export function DisciplineStep({ value, onChange }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Primary Discipline</h2>
        <p className="text-gray-400 mt-1">What do you mostly climb?</p>
      </div>
      <div className="space-y-3">
        {disciplines.map(d => (
          <button
            key={d.value}
            onClick={() => onChange(d.value)}
            className={`w-full flex items-center gap-4 p-5 rounded-xl border transition-colors text-left
              ${value === d.value
                ? `${d.border} ${d.bg}`
                : 'border-[#2e3347] hover:bg-[#1f2333]'}`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${value === d.value ? d.bg : 'bg-[#0f1117]'}`}>
              <d.icon size={24} className={d.color} />
            </div>
            <div>
              <div className="font-semibold text-lg">{d.label}</div>
              <div className="text-sm text-gray-400">{d.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
