import { useState, useEffect } from 'react';
import { exercisesApi } from '../../api/exercises.js';
import { CATEGORIES } from '../../utils/constants.js';

export function ExercisePicker({ value, onChange, category, className = '' }) {
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    const params = category ? { category } : {};
    exercisesApi.list(params).then(setExercises);
  }, [category]);

  const grouped = exercises.reduce((acc, ex) => {
    const cat = ex.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ex);
    return acc;
  }, {});

  return (
    <select
      value={value || ''}
      onChange={e => onChange(Number(e.target.value), exercises.find(ex => ex.id === Number(e.target.value)))}
      className={`w-full bg-[#0f1117] border border-[#2e3347] rounded-lg px-3 py-2 text-gray-100
        focus:outline-none focus:border-blue-500 ${className}`}
    >
      <option value="">Select exercise</option>
      {Object.entries(grouped).map(([cat, exs]) => (
        <optgroup key={cat} label={CATEGORIES[cat]?.label || cat}>
          {exs.map(ex => (
            <option key={ex.id} value={ex.id}>{ex.name}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
