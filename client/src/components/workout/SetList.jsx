import { Plus } from 'lucide-react';
import { SetRow } from './SetRow.jsx';
import { Button } from '../common/Button.jsx';

export function SetList({ sets, exerciseType, gradeSystem, onChange }) {
  const updateSet = (index, newSet) => {
    const updated = [...sets];
    updated[index] = newSet;
    onChange(updated);
  };

  const removeSet = (index) => {
    onChange(sets.filter((_, i) => i !== index));
  };

  const addSet = () => {
    const lastSet = sets[sets.length - 1];
    onChange([...sets, lastSet ? { ...lastSet } : {}]);
  };

  return (
    <div className="space-y-2">
      {sets.map((set, i) => (
        <SetRow
          key={i}
          set={set}
          index={i}
          exerciseType={exerciseType}
          gradeSystem={gradeSystem}
          onChange={updateSet}
          onRemove={removeSet}
        />
      ))}
      <Button variant="ghost" size="sm" onClick={addSet}>
        <Plus size={16} /> Add Set
      </Button>
    </div>
  );
}
