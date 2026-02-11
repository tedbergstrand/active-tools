import { useState, useCallback, useRef, useEffect } from 'react';

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCallout(pools) {
  if (!pools || Object.keys(pools).length === 0) return '';
  const parts = Object.values(pools).map(pool => pickRandom(pool));
  return parts.join(' ');
}

export function useCallout({ pools = {}, interval = 8, mode = 'timed', callouts = [] }) {
  const [current, setCurrent] = useState('');
  const [history, setHistory] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef(null);

  const generate = useCallback(() => {
    let text;
    if (callouts.length > 0) {
      text = pickRandom(callouts);
    } else {
      text = generateCallout(pools);
    }
    setCurrent(text);
    setHistory(prev => [text, ...prev].slice(0, 20));
    return text;
  }, [pools, callouts]);

  const next = useCallback(() => {
    return generate();
  }, [generate]);

  const startAuto = useCallback(() => {
    setIsActive(true);
    generate();
    intervalRef.current = setInterval(() => {
      generate();
    }, interval * 1000);
  }, [generate, interval]);

  const stopAuto = useCallback(() => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    current,
    history,
    isActive,
    next,
    startAuto,
    stopAuto,
  };
}
