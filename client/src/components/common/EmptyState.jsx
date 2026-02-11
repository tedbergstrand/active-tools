import { Inbox } from 'lucide-react';

export function EmptyState({ icon: Icon = Inbox, title, description, children }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon size={48} className="text-gray-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-300 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>}
      {children}
    </div>
  );
}
