import { useState, useEffect } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '../../common/Button.jsx';
import { plansApi } from '../../../api/plans.js';

const PLAN_MAP = {
  project: { roped: 'Route Projecting', bouldering: 'Bouldering Power', both: 'Route Projecting' },
  fingers: { roped: 'Finger Strength', bouldering: 'Finger Strength', both: 'Finger Strength' },
  fitness: { roped: 'General Fitness', bouldering: 'General Fitness', both: 'General Fitness' },
  endurance: { roped: 'Power Endurance', bouldering: 'Power Endurance', both: 'Power Endurance' },
  injury_prevention: { roped: 'Injury Prevention', bouldering: 'Injury Prevention', both: 'Injury Prevention' },
};

export function PlanStep({ goal, discipline, onComplete }) {
  const [plans, setPlans] = useState([]);
  const [recommended, setRecommended] = useState(null);
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    plansApi.list().then(data => {
      setPlans(data);
      const planName = PLAN_MAP[goal]?.[discipline];
      if (planName) {
        const match = data.find(p => p.name === planName);
        if (match) setRecommended(match);
      }
    }).catch(() => {});
  }, [goal, discipline]);

  const handleActivate = async () => {
    if (!recommended || activating) return;
    setActivating(true);
    try {
      await plansApi.activate(recommended.id);
      await plansApi.generate(recommended.id).catch(() => {});
      setActivated(true);
    } catch {
      // still allow completing onboarding
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Recommended Plan</h2>
        <p className="text-gray-400 mt-1">Based on your goals, we suggest:</p>
      </div>

      {recommended ? (
        <div className="bg-[#0f1117] border border-blue-500/30 rounded-xl p-5 space-y-3">
          <div className="text-xl font-bold text-blue-400">{recommended.name}</div>
          <div className="flex gap-3 text-sm text-gray-400">
            <span>{recommended.duration_weeks} weeks</span>
            {recommended.difficulty && <span>{recommended.difficulty}</span>}
          </div>
          {recommended.description && (
            <p className="text-sm text-gray-400">{recommended.description}</p>
          )}
          {activated ? (
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <CheckCircle2 size={18} /> Plan activated!
            </div>
          ) : (
            <Button onClick={handleActivate} disabled={activating} className="w-full">
              {activating ? <><Loader2 size={16} className="animate-spin" /> Activating...</> : 'Start This Plan'}
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-[#0f1117] border border-[#2e3347] rounded-xl p-5 text-center text-gray-500">
          <p>No matching plan found. You can browse plans later.</p>
        </div>
      )}

      <Button variant="secondary" onClick={onComplete} className="w-full">
        {activated ? 'Continue to App' : 'Skip for Now'}
      </Button>
    </div>
  );
}
