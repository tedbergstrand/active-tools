import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { plansApi } from '../../api/plans.js';
import { Zap } from 'lucide-react';

export function ActivePlanBanner({ plan: propPlan }) {
  const [fetchedPlan, setFetchedPlan] = useState(null);
  const navigate = useNavigate();

  // Only fetch if no plan prop was provided (standalone usage outside Dashboard)
  useEffect(() => {
    if (propPlan !== undefined) return;
    let cancelled = false;
    plansApi.list().then(plans => {
      if (!cancelled) setFetchedPlan(plans.find(p => p.is_active) || null);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [propPlan]);

  const plan = propPlan !== undefined ? propPlan : fetchedPlan;
  if (!plan) return null;

  return (
    <div
      onClick={() => navigate(`/plans/${plan.id}`)}
      className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg cursor-pointer hover:bg-emerald-500/15 transition-colors"
    >
      <Zap size={18} className="text-emerald-400" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-emerald-400">Active Plan</div>
        <div className="text-sm text-gray-300 truncate">{plan.name}</div>
      </div>
      <span className="text-xs text-gray-500">{plan.duration_weeks}wk</span>
    </div>
  );
}
