import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header.jsx';
import { PlanCard } from '../components/plans/PlanCard.jsx';
import { Button } from '../components/common/Button.jsx';
import { Tabs } from '../components/common/Tabs.jsx';
import { PageLoading } from '../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { usePlans } from '../hooks/usePlans.js';
import { plansApi } from '../api/plans.js';
import { useToast } from '../components/common/Toast.jsx';
import { ClipboardList, Plus } from 'lucide-react';

const categoryTabs = [
  { value: '', label: 'All' },
  { value: 'roped', label: 'Roped' },
  { value: 'bouldering', label: 'Bouldering' },
  { value: 'traditional', label: 'Training' },
];

export default function Plans() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');
  const { plans, loading, refetch } = usePlans(filter ? { category: filter } : {});
  const toast = useToast();

  const handleActivate = async (id) => {
    try {
      await plansApi.activate(id);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to activate plan');
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await plansApi.deactivate(id);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to deactivate plan');
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <Header title="Training Plans">
        <Button onClick={() => navigate('/plans/new')}><Plus size={16} /> Create Plan</Button>
      </Header>
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
