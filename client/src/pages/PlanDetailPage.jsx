import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PlanDetail } from '../components/plans/PlanDetail.jsx';
import { PageLoading } from '../components/common/LoadingSpinner.jsx';
import { usePlan } from '../hooks/usePlans.js';
import { plansApi } from '../api/plans.js';
import { useToast } from '../components/common/Toast.jsx';

export function PlanDetailPage() {
  const { id } = useParams();
  const { plan, loading, refetch } = usePlan(id);
  const toast = useToast();
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (!id) return;
    plansApi.progress(id).then(setProgress).catch(() => toast.error('Failed to load plan progress'));
  }, [id]);

  if (loading) return <PageLoading />;
  if (!plan) return <div className="text-center py-12 text-gray-500">Plan not found</div>;

  const handleActivate = async () => {
    try {
      await plansApi.activate(id);
      toast.success('Plan activated');
      refetch();
    } catch (err) {
      toast.error('Failed to activate plan');
    }
  };

  const handleDeactivate = async () => {
    try {
      await plansApi.deactivate(id);
      toast.info('Plan deactivated');
      refetch();
    } catch (err) {
      toast.error('Failed to deactivate plan');
    }
  };

  return <PlanDetail plan={plan} onActivate={handleActivate} onDeactivate={handleDeactivate} onRefetch={refetch} progress={progress} />;
}
