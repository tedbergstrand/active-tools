import { Card } from '../common/Card.jsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function StatCard({ icon: Icon, label, value, sublabel, color = 'text-blue-400', trend }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        {Icon && <Icon size={20} className={color} />}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">{value}</div>
            {trend !== undefined && trend !== null && trend !== 0 && (
              <span className={`flex items-center gap-0.5 text-xs font-medium ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
          <div className="text-sm text-gray-400">{label}</div>
          {sublabel && <div className="text-xs text-gray-500">{sublabel}</div>}
        </div>
      </div>
    </Card>
  );
}
