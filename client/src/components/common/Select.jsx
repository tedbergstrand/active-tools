import { useId } from 'react';

export function Select({ label, options = [], className = '', id: propId, ...props }) {
  const autoId = useId();
  const id = propId || autoId;
  return (
    <div className="space-y-1">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-400">{label}</label>}
      <select
        id={id}
        className={`w-full bg-[#0f1117] border border-[#2e3347] rounded-lg px-3 py-2 text-gray-100
          focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
