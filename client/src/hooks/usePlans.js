import { useState, useEffect, useCallback } from 'react';
import { plansApi } from '../api/plans.js';

export function usePlans(params = {}) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    plansApi.list(params, { signal: controller.signal })
      .then(data => { if (!cancelled) { setPlans(data); setError(null); } })
      .catch(e => { if (!cancelled && e.name !== 'AbortError') setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [key, refreshKey]);

  const refetch = useCallback(() => setRefreshKey(k => k + 1), []);

  return { plans, loading, error, refetch };
}

export function usePlan(id) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    plansApi.get(id, { signal: controller.signal })
      .then(data => { if (!cancelled) { setPlan(data); setError(null); } })
      .catch(e => { if (!cancelled && e.name !== 'AbortError') setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [id, refreshKey]);

  const refetch = useCallback(() => setRefreshKey(k => k + 1), []);

  return { plan, loading, error, refetch };
}
