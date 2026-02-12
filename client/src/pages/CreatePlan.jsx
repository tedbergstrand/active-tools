import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header.jsx';
import { Card, CardContent } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { Input } from '../components/common/Input.jsx';
import { Select } from '../components/common/Select.jsx';
import { plansApi } from '../api/plans.js';
import { DIFFICULTIES } from '../utils/constants.js';
import { Save } from 'lucide-react';

const categoryOptions = [
  { value: 'roped', label: 'Roped Climbing' },
  { value: 'bouldering', label: 'Bouldering' },
  { value: 'traditional', label: 'Training' },
  { value: 'mixed', label: 'Mixed' },
];

const difficultyOptions = [
  { value: '', label: 'Select difficulty' },
  ...DIFFICULTIES,
];

export function CreatePlan() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: 'mixed',
    duration_weeks: 4,
    difficulty: '',
    goal: '',
    description: '',
  });

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const result = await plansApi.create({
        ...form,
        difficulty: form.difficulty || null,
      });
      navigate(`/plans/${result.id}`);
    } catch (err) {
      console.error('Failed to create plan:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Header title="Create Plan" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="space-y-4">
            <Input label="Plan Name" value={form.name} onChange={e => update('name', e.target.value)}
              placeholder="e.g. 8-Week Boulder Power" required />
            <Select label="Category" options={categoryOptions} value={form.category}
              onChange={e => update('category', e.target.value)} />
            <Input label="Duration (weeks)" type="number" min={1} max={52}
              value={form.duration_weeks} onChange={e => update('duration_weeks', Number(e.target.value))} />
            <Select label="Difficulty" options={difficultyOptions} value={form.difficulty}
              onChange={e => update('difficulty', e.target.value)} />
            <Input label="Goal" value={form.goal} onChange={e => update('goal', e.target.value)}
              placeholder="e.g. Send V8 by end of cycle" />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => update('description', e.target.value)}
                rows={3}
                placeholder="What this plan focuses on..."
                className="w-full bg-[#0f1117] border border-[#2e3347] rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving || !form.name.trim()}>
          <Save size={16} /> {saving ? 'Creating...' : 'Create Plan'}
        </Button>
      </form>
    </div>
  );
}
