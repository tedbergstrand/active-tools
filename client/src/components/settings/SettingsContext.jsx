import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { settingsApi } from '../../api/settings.js';

const SettingsContext = createContext({});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    settingsApi.get().then(data => { setSettings(data); setLoaded(true); }).catch(() => { setLoadError(true); setLoaded(true); });
  }, []);

  const refresh = useCallback(() => settingsApi.get().then(setSettings).catch(() => {}), []);

  const value = useMemo(() => ({ settings, loaded, refresh, loadError }), [settings, loaded, refresh, loadError]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
