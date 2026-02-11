import { Card } from '../common/Card.jsx';

export function StatCard({ icon: Icon, label, value, sublabel, color = 'text-blue-400' }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        {Icon && <Icon size={20} className={color} />}
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-gray-400">{label}</div>
          {sublabel && <div className="text-xs text-gray-500">{sublabel}</div>}
        </div>
      </div>
    </Card>
  );
}
