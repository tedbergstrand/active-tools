import { useState, useEffect, useCallback } from 'react';
import { workoutsApi } from '../api/workouts.js';

export function useWorkouts(params = {}) {
  const [data, setData] = useState({ workouts: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    workoutsApi.list(params, { signal: controller.signal })
      .then(result => { if (!cancelled) { setData(result); setError(null); } })
      .catch(e => { if (!cancelled && e.name !== 'AbortError') setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [key, refreshKey]);

  const refetch = useCallback(() => setRefreshKey(k => k + 1), []);

  return { ...data, loading, error, refetch };
}

export function useWorkout(id) {
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    workoutsApi.get(id, { signal: controller.signal })
      .then(data => { if (!cancelled) { setWorkout(data); setError(null); } })
      .catch(e => { if (!cancelled && e.name !== 'AbortError') setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [id]);

  return { workout, loading, error };
}
