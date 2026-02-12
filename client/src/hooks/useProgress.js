import { useState, useEffect, useCallback } from 'react';
import { progressApi } from '../api/progress.js';

export function useProgressSummary(params = {}) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    progressApi.summary(params, { signal: controller.signal })
      .then(data => { if (!cancelled) setSummary(data); })
      .catch(e => { if (e.name !== 'AbortError') console.error(e); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [key, refreshKey]);

  const refetch = useCallback(() => setRefreshKey(k => k + 1), []);
  return { summary, loading, refetch };
}

export function useGradeProgress(params = {}) {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    progressApi.grades(params, { signal: controller.signal })
      .then(data => { if (!cancelled) setGrades(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [key]);

  return { grades, loading };
}

export function useVolumeData(params = {}) {
  const [volume, setVolume] = useState([]);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    progressApi.volume(params, { signal: controller.signal })
      .then(data => { if (!cancelled) setVolume(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [key]);

  return { volume, loading };
}

export function useFrequencyData(params = {}) {
  const [frequency, setFrequency] = useState([]);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    progressApi.frequency(params, { signal: controller.signal })
      .then(data => { if (!cancelled) setFrequency(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [key]);

  return { frequency, loading };
}

export function useStreak() {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    progressApi.streak({ signal: controller.signal })
      .then(data => { if (!cancelled) setStreak(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, []);

  return { streak, loading };
}

export function useTrends(params = {}) {
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    progressApi.trends(params, { signal: controller.signal })
      .then(data => { if (!cancelled) setTrends(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [key]);

  return { trends, loading };
}

export function useDistribution(params = {}) {
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    progressApi.distribution(params, { signal: controller.signal })
      .then(data => { if (!cancelled) setDistribution(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [key]);

  return { distribution, loading };
}

export function useRpeTrend(params = {}) {
  const [rpeTrend, setRpeTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    progressApi.rpeTrend(params, { signal: controller.signal })
      .then(data => { if (!cancelled) setRpeTrend(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [key]);

  return { rpeTrend, loading };
}

export function usePersonalRecords(params = {}) {
  const [records, setRecords] = useState(null);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    progressApi.personalRecords(params, { signal: controller.signal })
      .then(data => { if (!cancelled) setRecords(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [key]);

  return { records, loading };
}

export function useRecovery() {
  const [recovery, setRecovery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    progressApi.recovery({ signal: controller.signal })
      .then(data => { if (!cancelled) setRecovery(data); })
      .catch(e => { if (e.name !== 'AbortError') console.error(e); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [refreshKey]);

  const refetch = useCallback(() => setRefreshKey(k => k + 1), []);
  return { recovery, loading, refetch };
}

export function useExerciseHistory(exerciseId, params = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify({ exerciseId, ...params });

  useEffect(() => {
    if (!exerciseId) { setLoading(false); return; }
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    progressApi.exerciseHistory(exerciseId, params, { signal: controller.signal })
      .then(d => { if (!cancelled) setData(d); })
      .catch(e => { if (e.name !== 'AbortError') console.error(e); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [key]);

  return { data, loading };
}

export function useVolumeDetail(params = {}) {
  const [volumeDetail, setVolumeDetail] = useState([]);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    progressApi.volumeDetail(params, { signal: controller.signal })
      .then(d => { if (!cancelled) setVolumeDetail(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [key]);

  return { volumeDetail, loading };
}

export function useExercisesWithData() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    progressApi.exercisesWithData({ signal: controller.signal })
      .then(d => { if (!cancelled) setExercises(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, []);

  return { exercises, loading };
}
