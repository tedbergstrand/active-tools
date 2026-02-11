export function MetronomeVisual({ bpm, beat, isPlaying, tempoPhase }) {
  const beatInMeasure = beat % 4;

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      {tempoPhase && (
        <div className="text-lg font-bold text-blue-400 tracking-wide uppercase">
          {tempoPhase}
        </div>
      )}
      <div className="text-5xl sm:text-6xl font-mono font-bold tabular-nums">
        {bpm} <span className="text-2xl text-gray-500">BPM</span>
      </div>
      <div className="flex gap-3">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`w-5 h-5 rounded-full transition-all duration-100
              ${isPlaying && beatInMeasure === i
                ? i === 0 ? 'bg-blue-400 scale-125' : 'bg-white scale-110'
                : 'bg-[#2e3347]'
              }`}
          />
        ))}
      </div>
      {isPlaying && (
        <p className="text-sm text-gray-400">Beat {beat + 1}</p>
      )}
    </div>
  );
}
