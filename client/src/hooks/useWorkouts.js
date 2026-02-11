import { useState, useEffect, useCallback } from 'react';
import { workoutsApi } from '../api/workouts.js';

export function useWorkouts(params = {}) {
  const [data, setData] = useState({ workouts: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const key = JSON.stringify(params);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const result = await workoutsApi.list(params);
      setData(result);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...data, loading, error, refetch: fetch };
}

export function useWorkout(id) {
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    workoutsApi.get(id)
      .then(setWorkout)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { workout, loading, error };
}
