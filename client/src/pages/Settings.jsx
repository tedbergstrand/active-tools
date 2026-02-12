import { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header.jsx';
import { Card, CardContent, CardHeader } from '../components/common/Card.jsx';
import { Select } from '../components/common/Select.jsx';
import { Button } from '../components/common/Button.jsx';
import { settingsApi } from '../api/settings.js';
import { useSettings } from '../components/settings/SettingsContext.jsx';
import { useToast } from '../components/common/Toast.jsx';
import { Save, Download, RotateCcw } from 'lucide-react';

const gradeSystemOptions = [
  { value: 'yds', label: 'Yosemite Decimal System (5.10a)' },
  { value: 'french', label: 'French (6a+)' },
];

const boulderGradeOptions = [
  { value: 'v_scale', label: 'V Scale (V5)' },
  { value: 'font', label: 'Fontainebleau (6a+)' },
];

const unitOptions = [
  { value: 'metric', label: 'Metric (kg, cm)' },
  { value: 'imperial', label: 'Imperial (lbs, in)' },
];

const boolOptions = [
  { value: 'true', label: 'Enabled' },
  { value: 'false', label: 'Disabled' },
];

const profileLabels = {
  experience_level: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', expert: 'Expert' },
  primary_discipline: { roped: 'Roped Climbing', bouldering: 'Bouldering', traditional: 'Traditional', mixed: 'Mixed' },
  training_goal: { strength: 'Strength', endurance: 'Endurance', technique: 'Technique', general: 'General Fitness', project: 'Project a Grade' },
};

function humanize(key, value) {
  if (!value || value === '') return '—';
  return profileLabels[key]?.[value] || value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ');
}

export function Settings() {
  const { refresh: refreshGlobal } = useSettings();
  const toast = useToast();
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [resettingOnboarding, setResettingOnboarding] = useState(false);

  useEffect(() => {
    settingsApi.get().then(setSettings).catch(() => {
      toast.error('Failed to load settings');
      setLoadError(true);
    });
  }, []);

  const update = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.update(settings);
      refreshGlobal();
      setSaved(true);
      toast.success('Settings saved');
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleRerunOnboarding = async () => {
    setResettingOnboarding(true);
    try {
      await settingsApi.update({ onboarding_completed: 'false' });
      refreshGlobal();
    } catch (err) {
      toast.error('Failed to reset onboarding');
    } finally {
      setResettingOnboarding(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Header title="Settings" />

      <Card>
        <CardHeader><h3 className="font-semibold">Climbing Profile</h3></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Experience Level</div>
              <div className="text-sm text-gray-200">{humanize('experience_level', settings.experience_level)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Primary Discipline</div>
              <div className="text-sm text-gray-200">{humanize('primary_discipline', settings.primary_discipline)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Max Roped Grade</div>
              <div className="text-sm text-gray-200">{settings.max_roped_grade || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Max Boulder Grade</div>
              <div className="text-sm text-gray-200">{settings.max_boulder_grade || '—'}</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Training Goal</div>
            <div className="text-sm text-gray-200">{humanize('training_goal', settings.training_goal)}</div>
          </div>
          <Button variant="secondary" size="sm" onClick={handleRerunOnboarding} disabled={resettingOnboarding}>
            <RotateCcw size={14} /> {resettingOnboarding ? 'Resetting...' : 'Re-run Setup Wizard'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h3 className="font-semibold">Grading System</h3></CardHeader>
        <CardContent className="space-y-4">
          <Select label="Route Grades" options={gradeSystemOptions}
            value={settings.grade_system || 'yds'}
            onChange={e => update('grade_system', e.target.value)} />
          <Select label="Boulder Grades" options={boulderGradeOptions}
            value={settings.boulder_grade_system || 'v_scale'}
            onChange={e => update('boulder_grade_system', e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h3 className="font-semibold">Units</h3></CardHeader>
        <CardContent>
          <Select label="Weight & Distance" options={unitOptions}
            value={settings.units || 'metric'}
            onChange={e => update('units', e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h3 className="font-semibold">Timer</h3></CardHeader>
        <CardContent className="space-y-4">
          <Select label="Sound Effects" options={boolOptions}
            value={settings.timer_sound || 'true'}
            onChange={e => update('timer_sound', e.target.value)} />
          <Select label="Vibration" options={boolOptions}
            value={settings.timer_vibration || 'true'}
            onChange={e => update('timer_vibration', e.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h3 className="font-semibold">Data</h3></CardHeader>
        <CardContent className="flex gap-3">
          <Button variant="secondary" onClick={() => window.open('/api/export?format=csv')}>
            <Download size={16} /> Export CSV
          </Button>
          <Button variant="secondary" onClick={() => window.open('/api/export?format=json')}>
            <Download size={16} /> Export JSON
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving || loadError}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
        </Button>
        {saved && <span className="text-sm text-emerald-400">Saved!</span>}
      </div>
    </div>
  );
}
