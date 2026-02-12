import { Trash2 } from 'lucide-react';
import { GradePicker } from './GradePicker.jsx';
import { SEND_TYPES, WALL_ANGLES, GRIP_TYPES } from '../../utils/constants.js';
import { parseNumericInput } from '../../utils/formatters.js';

export function SetRow({ set, index, exerciseType, gradeSystem, onChange, onRemove }) {
  const update = (field, value) => onChange(index, { ...set, [field]: value });

  const isClimbing = exerciseType === 'roped' || exerciseType === 'bouldering';
  const isHangboard = exerciseType === 'hangboard';

  return (
    <div className="flex items-start gap-2 p-2 bg-[#0f1117] rounded-lg">
      <span className="text-xs text-gray-500 pt-2 w-6 text-center">{index + 1}</span>

      {isClimbing && (
        <>
          <GradePicker
            value={set.grade}
            onChange={v => update('grade', v)}
            system={gradeSystem}
            className="w-24 text-sm"
          />
          <select
            value={set.send_type || ''}
            onChange={e => update('send_type', e.target.value)}
            className="bg-[#0f1117] border border-[#2e3347] rounded-lg px-2 py-2 text-sm text-gray-100 w-28"
          >
            <option value="">Send type</option>
            {SEND_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input
            type="text"
            placeholder="Route name"
            value={set.route_name || ''}
            onChange={e => update('route_name', e.target.value)}
            className="bg-[#0f1117] border border-[#2e3347] rounded-lg px-2 py-2 text-sm text-gray-100 flex-1 min-w-0"
          />
        </>
      )}

      {isHangboard && (
        <>
          <input
            type="number"
            placeholder="Secs"
            value={set.duration_seconds || ''}
            onChange={e => update('duration_seconds', parseNumericInput(e.target.value))}
            className="bg-[#0f1117] border border-[#2e3347] rounded-lg px-2 py-2 text-sm text-gray-100 w-20"
          />
          <select
            value={set.grip_type || ''}
            onChange={e => update('grip_type', e.target.value)}
            className="bg-[#0f1117] border border-[#2e3347] rounded-lg px-2 py-2 text-sm text-gray-100 w-32"
          >
            <option value="">Grip type</option>
            {GRIP_TYPES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <input
            type="number"
            placeholder="Edge mm"
            value={set.edge_size_mm || ''}
            onChange={e => update('edge_size_mm', parseNumericInput(e.target.value))}
            className="bg-[#0f1117] border border-[#2e3347] rounded-lg px-2 py-2 text-sm text-gray-100 w-24"
          />
          <input
            type="number"
            placeholder="Weight kg"
            value={set.weight_kg || ''}
            onChange={e => update('weight_kg', parseNumericInput(e.target.value))}
            className="bg-[#0f1117] border border-[#2e3347] rounded-lg px-2 py-2 text-sm text-gray-100 w-24"
          />
        </>
      )}

      {!isClimbing && !isHangboard && (
        <>
          <input
            type="number"
            placeholder="Reps"
            value={set.reps || ''}
            onChange={e => update('reps', parseNumericInput(e.target.value))}
            className="bg-[#0f1117] border border-[#2e3347] rounded-lg px-2 py-2 text-sm text-gray-100 w-20"
          />
          <input
            type="number"
            placeholder="Weight kg"
            value={set.weight_kg || ''}
            onChange={e => update('weight_kg', parseNumericInput(e.target.value))}
            className="bg-[#0f1117] border border-[#2e3347] rounded-lg px-2 py-2 text-sm text-gray-100 w-24"
          />
          <input
            type="number"
            placeholder="Secs"
            value={set.duration_seconds || ''}
            onChange={e => update('duration_seconds', parseNumericInput(e.target.value))}
            className="bg-[#0f1117] border border-[#2e3347] rounded-lg px-2 py-2 text-sm text-gray-100 w-20"
          />
        </>
      )}

      <button onClick={() => onRemove(index)} className="p-3 text-gray-500 hover:text-red-400" aria-label="Remove set">
        <Trash2 size={16} />
      </button>
    </div>
  );
}
