import { useState, useEffect, useCallback } from 'react';
import { progressApi } from '../api/progress.js';

export function useProgressSummary(params = {}) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(params);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      setSummary(await progressApi.summary(params));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => { fetch(); }, [fetch]);
  return { summary, loading, refetch: fetch };
}

export function useGradeProgress(params = {}) {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(params);

  useEffect(() => {
    setLoading(true);
    progressApi.grades(params).then(setGrades).finally(() => setLoading(false));
  }, [key]);

  return { grades, loading };
}

export function useVolumeData(params = {}) {
  const [volume, setVolume] = useState([]);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(params);

  useEffect(() => {
    setLoading(true);
    progressApi.volume(params).then(setVolume).finally(() => setLoading(false));
  }, [key]);

  return { volume, loading };
}

export function useFrequencyData(params = {}) {
  const [frequency, setFrequency] = useState([]);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(params);

  useEffect(() => {
    setLoading(true);
    progressApi.frequency(params).then(setFrequency).finally(() => setLoading(false));
  }, [key]);

  return { frequency, loading };
}

export function usePersonalRecords(params = {}) {
  const [records, setRecords] = useState(null);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(params);

  useEffect(() => {
    setLoading(true);
    progressApi.personalRecords(params).then(setRecords).finally(() => setLoading(false));
  }, [key]);

  return { records, loading };
}
