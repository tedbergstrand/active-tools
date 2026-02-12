import { useState } from 'react';
import { AlertTriangle, Info, Heart, Calendar } from 'lucide-react';
import { Button } from '../common/Button.jsx';
import { workoutsApi } from '../../api/workouts.js';

const STATUS_CONFIG = {
  needs_rest: { icon: AlertTriangle, border: 'border-orange-500/30', bg: 'bg-orange-500/10', iconColor: 'text-orange-400', showRestButton: true },
  moderate: { icon: Info, border: 'border-amber-500/30', bg: 'bg-amber-500/10', iconColor: 'text-amber-400', showRestButton: false },
  welcome_back: { icon: Heart, border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', iconColor: 'text-emerald-400', showRestButton: false },
  suggest_deload: { icon: Calendar, border: 'border-blue-500/30', bg: 'bg-blue-500/10', iconColor: 'text-blue-400', showRestButton: false },
};

export function RecoveryNudge({ recovery }) {
  const [logging, setLogging] = useState(false);

  if (!recovery || recovery.status === 'good') return null;

  const config = STATUS_CONFIG[recovery.status];
  if (!config) return null;

  const Icon = config.icon;

  const handleLogRestDay = async () => {
    setLogging(true);
    try {
      await workoutsApi.logRestDay();
    } catch {
      // silent fail
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className={`flex items-start gap-3 ${config.bg} border ${config.border} rounded-xl p-4`}>
      <Icon size={20} className={`${config.iconColor} shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-200">{recovery.nudge}</p>
        {config.showRestButton && (
          <Button size="sm" variant="secondary" className="mt-2" onClick={handleLogRestDay} disabled={logging}>
            {logging ? 'Logging...' : 'Log Rest Day'}
          </Button>
        )}
      </div>
    </div>
  );
}
