import { getGradesForSystem } from '../../utils/grades.js';

export function GradePicker({ value, onChange, system = 'yds', className = '' }) {
  const grades = getGradesForSystem(system);

  return (
    <select
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      className={`bg-[#0f1117] border border-[#2e3347] rounded-lg px-3 py-2 text-gray-100
        focus:outline-none focus:border-blue-500 ${className}`}
    >
      <option value="">Select grade</option>
      {grades.map(g => (
        <option key={g} value={g}>{g}</option>
      ))}
    </select>
  );
}
