import { useState, useEffect, useCallback } from 'react';
import { progressApi } from '../api/progress.js';

export function useProgressSummary(params = {}) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    progressApi.summary(params, { signal: controller.signal })
      .then(data => { if (!cancelled) { setSummary(data); setError(null); } })
      .catch(e => { if (!cancelled && e.name !== 'AbortError') setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [key, refreshKey]);

  const refetch = useCallback(() => setRefreshKey(k => k + 1), []);
  return { summary, loading, error, refetch };
}

export function useGradeProgress(params = {}) {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    progressApi.grades(params, { signal: controller.signal })
      .then(data => { if (!cancelled) { setGrades(data); setError(null); } })
      .catch(e => { if (!cancelled && e.name !== 'AbortError') setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [key, refreshKey]);

  const refetch = useCallback(() => setRefreshKey(k => k + 1), []);
  return { grades, loading, error, refetch };
}

export function useVolumeData(params = {}) {
  const [volume, setVolume] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    progressApi.volume(params, { signal: controller.signal })
      .then(data => { if (!cancelled) { setVolume(data); setError(null); } })
      .catch(e => { if (!cancelled && e.name !== 'AbortError') setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [key, refreshKey]);

  const refetch = useCallback(() => setRefreshKey(k => k + 1), []);
  return { volume, loading, error, refetch };
}

export function useFrequencyData(params = {}) {
  const [frequency, setFrequency] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    progressApi.frequency(params, { signal: controller.signal })
      .then(data => { if (!cancelled) { setFrequency(data); setError(null); } })
      .catch(e => { if (!cancelled && e.name !== 'AbortError') setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [key, refreshKey]);

  const refetch = useCallback(() => setRefreshKey(k => k + 1), []);
  return { frequency, loading, error, refetch };
}

export function useStreak() {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    progressApi.streak({ signal: controller.signal })
      .then(data => { if (!cancelled) { setStreak(data); setError(null); } })
      .catch(e => { if (!cancelled && e.name !== 'AbortError') setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [refreshKey]);

  const refetch = useCallback(() => setRefreshKey(k => k + 1), []);
  return { streak, loading, error, refetch };
}

export function useTrends(params = {}) {
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    progressApi.trends(params, { signal: controller.signal })
      .then(data => { if (!cancelled) { setTrends(data); setError(null); } })
      .catch(e => { if (!cancelled && e.name !== 'AbortError') setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [key, refreshKey]);

  const refetch = useCallback(() => setRefreshKey(k => k + 1), []);
  return { trends, loading, error, refetch };
}

export function useDistribution(params = {}) {
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    progressApi.distribution(params, { signal: controller.signal })
      .then(data => { if (!cancelled) { setDistribution(data); setError(null); } })
      .catch(e => { if (!cancelled && e.name !== 'AbortError') setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [key, refreshKey]);

  const refetch = useCallback(() => setRefreshKey(k => k + 1), []);
  return { distribution, loading, error, refetch };
}

export function useRpeTrend(params = {}) {
  const [rpeTrend, setRpeTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    progressApi.rpeTrend(params, { signal: controller.signal })
      .then(data => { if (!cancelled) { setRpeTrend(data); setError(null); } })
      .catch(e => { if (!cancelled && e.name !== 'AbortError') setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [key, refreshKey]);

  const refetch = useCallback(() => setRefreshKey(k => k + 1), []);
  return { rpeTrend, loading, error, refetch };
}

export function usePersonalRecords(params = {}) {
  const [records, setRecords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    progressApi.personalRecords(params, { signal: controller.signal })
      .then(data => { if (!cancelled) { setRecords(data); setError(null); } })
      .catch(e => { if (!cancelled && e.name !== 'AbortError') setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [key, refreshKey]);

  const refetch = useCallback(() => setRefreshKey(k => k + 1), []);
  return { records, loading, error, refetch };
}

export function useRecovery() {
  const [recovery, setRecovery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    progressApi.recovery({ signal: controller.signal })
      .then(data => { if (!cancelled) { setRecovery(data); setError(null); } })
      .catch(e => { if (!cancelled && e.name !== 'AbortError') setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [refreshKey]);

  const refetch = useCallback(() => setRefreshKey(k => k + 1), []);
  return { recovery, loading, error, refetch };
}

export function useExerciseHistory(exerciseId, params = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const key = JSON.stringify({ exerciseId, ...params });

  useEffect(() => {
    if (!exerciseId) { setLoading(false); return; }
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    progressApi.exerciseHistory(exerciseId, params, { signal: controller.signal })
      .then(d => { if (!cancelled) { setData(d); setError(null); } })
      .catch(e => { if (!cancelled && e.name !== 'AbortError') setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [key, refreshKey]);

  const refetch = useCallback(() => setRefreshKey(k => k + 1), []);
  return { data, loading, error, refetch };
}

export function useVolumeDetail(params = {}) {
  const [volumeDetail, setVolumeDetail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    progressApi.volumeDetail(params, { signal: controller.signal })
      .then(d => { if (!cancelled) { setVolumeDetail(d); setError(null); } })
      .catch(e => { if (!cancelled && e.name !== 'AbortError') setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [key, refreshKey]);

  const refetch = useCallback(() => setRefreshKey(k => k + 1), []);
  return { volumeDetail, loading, error, refetch };
}

export function useExercisesWithData() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    progressApi.exercisesWithData({ signal: controller.signal })
      .then(d => { if (!cancelled) { setExercises(d); setError(null); } })
      .catch(e => { if (!cancelled && e.name !== 'AbortError') setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [refreshKey]);

  const refetch = useCallback(() => setRefreshKey(k => k + 1), []);
  return { exercises, loading, error, refetch };
}
