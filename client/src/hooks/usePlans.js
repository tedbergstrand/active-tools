import { useState, useEffect, useCallback } from 'react';
import { plansApi } from '../api/plans.js';

export function usePlans(params = {}) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const key = JSON.stringify(params);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      setPlans(await plansApi.list(params));
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => { fetch(); }, [fetch]);

  return { plans, loading, error, refetch: fetch };
}

export function usePlan(id) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      setPlan(await plansApi.get(id));
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { plan, loading, error, refetch: fetch };
}
