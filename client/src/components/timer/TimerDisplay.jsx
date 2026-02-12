export function TimerDisplay({ timeLeft, phase, currentSet, totalSets, size = 'lg' }) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const sizeClasses = size === 'lg' ? 'text-7xl' : size === 'md' ? 'text-5xl' : 'text-3xl';

  return (
    <div className="text-center">
      <div className={`font-mono font-bold ${sizeClasses} tabular-nums`}
        style={{ color: phase?.color || '#3b82f6' }}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      {phase && (
        <div className="mt-2 text-lg font-medium text-gray-300">{phase.label}</div>
      )}
      {totalSets > 1 && (
        <div className="mt-1 text-sm text-gray-500">Set {currentSet} of {totalSets}</div>
      )}
    </div>
  );
}
