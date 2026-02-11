export function Tabs({ tabs, active, onChange, className = '' }) {
  return (
    <div className={`flex gap-1 bg-[#0f1117] p-1 rounded-lg ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${active === tab.value
              ? 'bg-[#1a1d27] text-white'
              : 'text-gray-400 hover:text-gray-200'}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
