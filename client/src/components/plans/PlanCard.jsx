import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card.jsx';
import { Badge } from '../common/Badge.jsx';
import { CATEGORIES, DIFFICULTIES } from '../../utils/constants.js';
import { Calendar, Target, Zap } from 'lucide-react';

const categoryColors = { roped: 'blue', bouldering: 'amber', traditional: 'emerald', mixed: 'purple' };

export function PlanCard({ plan, onActivate, onDeactivate }) {
  const navigate = useNavigate();
  const cat = CATEGORIES[plan.category] || {};

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg cursor-pointer hover:text-blue-400"
            onClick={() => navigate(`/plans/${plan.id}`)}>
            {plan.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge color={categoryColors[plan.category] || 'gray'}>{cat.label || plan.category}</Badge>
            {plan.difficulty && (
              <Badge color="gray">{DIFFICULTIES.find(d => d.value === plan.difficulty)?.label || plan.difficulty}</Badge>
            )}
            {plan.is_active ? <Badge color="green">Active</Badge> : null}
          </div>
        </div>
      </div>

      {plan.description && (
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{plan.description}</p>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <span className="flex items-center gap-1"><Calendar size={14} /> {plan.duration_weeks} weeks</span>
        {plan.goal && <span className="flex items-center gap-1"><Target size={14} /> {plan.goal}</span>}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/plans/${plan.id}`)}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          View Details
        </button>
        {plan.is_active ? (
          <button onClick={() => onDeactivate?.(plan.id)} className="text-sm text-gray-400 hover:text-gray-300 ml-auto">
            Deactivate
          </button>
        ) : (
          <button onClick={() => onActivate?.(plan.id)} className="text-sm text-emerald-400 hover:text-emerald-300 ml-auto flex items-center gap-1">
            <Zap size={14} /> Activate
          </button>
        )}
      </div>
    </Card>
  );
}
