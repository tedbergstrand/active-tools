import { useState, useEffect } from 'react';

export function CalloutDisplay({ text, subtitle }) {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (text) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 300);
      return () => clearTimeout(t);
    }
  }, [text]);

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div
        className={`text-4xl sm:text-5xl md:text-6xl font-bold text-center leading-tight px-4 transition-all duration-300
          ${flash ? 'scale-110 text-white' : 'scale-100 text-gray-100'}`}
      >
        {text || 'Ready'}
      </div>
      {subtitle && (
        <p className="text-sm text-gray-400 mt-3">{subtitle}</p>
      )}
    </div>
  );
}
