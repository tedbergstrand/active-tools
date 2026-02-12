import { useState, useEffect } from 'react';
import { exercisesApi } from '../../api/exercises.js';
import { useToast } from '../common/Toast.jsx';
import { CATEGORIES } from '../../utils/constants.js';
import { Plus, X } from 'lucide-react';

export function ExercisePicker({ value, onChange, category, className = '' }) {
  const toast = useToast();
  const [exercises, setExercises] = useState([]);
  const [recentIds, setRecentIds] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState(category || 'traditional');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const params = category ? { category } : {};
    exercisesApi.list(params).then(setExercises);
  }, [category]);

  useEffect(() => {
    exercisesApi.recent().then(setRecentIds).catch(() => {});
  }, []);

  const grouped = exercises.reduce((acc, ex) => {
    const cat = ex.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ex);
    return acc;
  }, {});

  const recentExercises = recentIds
    .map(id => exercises.find(ex => ex.id === id))
    .filter(Boolean);

  const handleCreate = async () => {
    if (!newName.trim() || creating) return;
    setCreating(true);
    try {
      const created = await exercisesApi.create({ name: newName.trim(), category: newCategory });
      setExercises(prev => [...prev, created]);
      onChange(created.id, created);
      setShowCreate(false);
      setNewName('');
    } catch (e) {
      toast.error('Failed to create exercise');
    } finally {
      setCreating(false);
    }
  };

  if (showCreate) {
    return (
      <div className="space-y-2 p-3 bg-[#0f1117] border border-[#2e3347] rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-300">New Exercise</span>
          <button type="button" onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-gray-300">
            <X size={14} />
          </button>
        </div>
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Exercise name"
          autoFocus
          className="w-full bg-[#12141c] border border-[#2e3347] rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreate(); } }}
        />
        {!category && (
          <select
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            className="w-full bg-[#12141c] border border-[#2e3347] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-blue-500"
          >
            <option value="roped">Roped Climbing</option>
            <option value="bouldering">Bouldering</option>
            <option value="traditional">Training</option>
          </select>
        )}
        <button
          type="button"
          onClick={handleCreate}
          disabled={!newName.trim() || creating}
          className="w-full py-2 text-sm font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/15 rounded-lg disabled:opacity-50 transition-colors"
        >
          {creating ? 'Creating...' : 'Create Exercise'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <select
        value={value || ''}
        onChange={e => onChange(Number(e.target.value), exercises.find(ex => ex.id === Number(e.target.value)))}
        className={`flex-1 bg-[#0f1117] border border-[#2e3347] rounded-lg px-3 py-2 text-gray-100
          focus:outline-none focus:border-blue-500 ${className}`}
      >
        <option value="">Select exercise</option>
        {recentExercises.length > 0 && (
          <optgroup label="Recently Used">
            {recentExercises.map(ex => (
              <option key={`recent-${ex.id}`} value={ex.id}>{ex.name}</option>
            ))}
          </optgroup>
        )}
        {Object.entries(grouped).map(([cat, exs]) => (
          <optgroup key={cat} label={CATEGORIES[cat]?.label || cat}>
            {exs.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </optgroup>
        ))}
      </select>
      <button
        type="button"
        onClick={() => { setNewCategory(category || 'traditional'); setShowCreate(true); }}
        className="min-h-[44px] min-w-[44px] px-2.5 py-2 bg-[#0f1117] border border-[#2e3347] rounded-lg text-gray-400 hover:text-blue-400 hover:border-blue-500/50 transition-colors flex items-center justify-center"
        aria-label="Create new exercise"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
