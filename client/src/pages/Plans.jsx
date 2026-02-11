import { useState } from 'react';
import { Header } from '../components/layout/Header.jsx';
import { PlanCard } from '../components/plans/PlanCard.jsx';
import { Tabs } from '../components/common/Tabs.jsx';
import { PageLoading } from '../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { usePlans } from '../hooks/usePlans.js';
import { plansApi } from '../api/plans.js';
import { ClipboardList } from 'lucide-react';

const categoryTabs = [
  { value: '', label: 'All' },
  { value: 'roped', label: 'Roped' },
  { value: 'bouldering', label: 'Bouldering' },
  { value: 'traditional', label: 'Training' },
];

export function Plans() {
  const [filter, setFilter] = useState('');
  const { plans, loading, refetch } = usePlans(filter ? { category: filter } : {});

  const handleActivate = async (id) => {
    await plansApi.activate(id);
    refetch();
  };

  const handleDeactivate = async (id) => {
    await plansApi.deactivate(id);
    refetch();
  };

  if (loading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <Header title="Training Plans" />
      <Tabs tabs={categoryTabs} active={filter} onChange={setFilter} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map(plan => (
          <PlanCard key={plan.id} plan={plan} onActivate={handleActivate} onDeactivate={handleDeactivate} />
        ))}
      </div>

      {plans.length === 0 && (
        <EmptyState icon={ClipboardList} title="No plans found" description="No training plans match your filter" />
      )}
    </div>
  );
}
