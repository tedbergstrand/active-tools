import { useParams } from 'react-router-dom';
import { PlanDetail } from '../components/plans/PlanDetail.jsx';
import { PageLoading } from '../components/common/LoadingSpinner.jsx';
import { usePlan } from '../hooks/usePlans.js';
import { plansApi } from '../api/plans.js';

export function PlanDetailPage() {
  const { id } = useParams();
  const { plan, loading, refetch } = usePlan(id);

  if (loading) return <PageLoading />;
  if (!plan) return <div className="text-center py-12 text-gray-500">Plan not found</div>;

  const handleActivate = async () => {
    await plansApi.activate(id);
    refetch();
  };

  const handleDeactivate = async () => {
    await plansApi.deactivate(id);
    refetch();
  };

  return <PlanDetail plan={plan} onActivate={handleActivate} onDeactivate={handleDeactivate} />;
}
