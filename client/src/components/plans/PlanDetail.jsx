import { Badge } from '../common/Badge.jsx';
import { Card, CardContent } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { CATEGORIES, DAYS_OF_WEEK } from '../../utils/constants.js';
import { Calendar, Target, Zap, Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categoryColors = { roped: 'blue', bouldering: 'amber', traditional: 'emerald', mixed: 'purple' };

export function PlanDetail({ plan, onActivate, onDeactivate }) {
  const navigate = useNavigate();

  if (!plan) return null;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{plan.name}</h1>
          {plan.is_active && <Badge color="green">Active</Badge>}
        </div>
        <div className="flex items-center gap-3 mb-3">
          <Badge color={categoryColors[plan.category]}>{CATEGORIES[plan.category]?.label}</Badge>
          {plan.difficulty && <Badge color="gray">{plan.difficulty}</Badge>}
          <span className="flex items-center gap-1 text-sm text-gray-400">
            <Calendar size={14} /> {plan.duration_weeks} weeks
          </span>
          {plan.goal && (
            <span className="flex items-center gap-1 text-sm text-gray-400">
              <Target size={14} /> {plan.goal}
            </span>
          )}
        </div>
        {plan.description && <p className="text-gray-400">{plan.description}</p>}
      </div>

      <div className="flex gap-3">
        {plan.is_active ? (
          <Button variant="secondary" onClick={() => onDeactivate?.(plan.id)}>Deactivate</Button>
        ) : (
          <Button variant="primary" onClick={() => onActivate?.(plan.id)}><Zap size={16} /> Activate Plan</Button>
        )}
      </div>

      {plan.weeks?.map(week => (
        <Card key={week.id}>
          <div className="px-5 py-3 border-b border-[#2e3347] bg-[#0f1117]/50 rounded-t-xl">
            <h3 className="font-semibold">Week {week.week_number}{week.focus ? ` — ${week.focus}` : ''}</h3>
          </div>
          <CardContent className="space-y-4">
            {week.workouts?.map(workout => (
              <div key={workout.id} className="border border-[#2e3347] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium">{workout.title}</span>
                    <span className="text-sm text-gray-500 ml-2">{DAYS_OF_WEEK[workout.day_of_week]}</span>
                  </div>
                  {plan.is_active && (
                    <Button size="sm" variant="ghost"
                      onClick={() => navigate(`/log/${workout.category}`)}>
                      <Dumbbell size={14} /> Log This
                    </Button>
                  )}
                </div>
                {workout.exercises?.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {workout.exercises.map(ex => (
                      <div key={ex.id} className="text-sm text-gray-400 flex items-center gap-2">
                        <span className="text-gray-500">-</span>
                        <span>{ex.exercise_name}</span>
                        {ex.target_sets && <span className="text-gray-600">{ex.target_sets} sets</span>}
                        {ex.target_reps && <span className="text-gray-600">&times; {ex.target_reps}</span>}
                        {ex.target_duration && <span className="text-gray-600">{ex.target_duration}s</span>}
                        {ex.target_grade && <span className="text-gray-600">@ {ex.target_grade}</span>}
                        {ex.notes && <span className="text-gray-600 italic">{ex.notes}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
