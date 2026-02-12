import { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header.jsx';
import { Card, CardContent, CardHeader } from '../components/common/Card.jsx';
import { Select } from '../components/common/Select.jsx';
import { Button } from '../components/common/Button.jsx';
import { settingsApi } from '../api/settings.js';
import { useSettings } from '../components/settings/SettingsContext.jsx';
import { useToast } from '../components/common/Toast.jsx';
import { Save, Download } from 'lucide-react';

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

export function Settings() {
  const { refresh: refreshGlobal } = useSettings();
  const toast = useToast();
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    settingsApi.get().then(setSettings);
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

  return (
    <div className="space-y-6 max-w-2xl">
      <Header title="Settings" />

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
        <Button onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
        </Button>
        {saved && <span className="text-sm text-emerald-400">Saved!</span>}
      </div>
    </div>
  );
}
