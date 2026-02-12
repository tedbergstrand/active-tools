import { createContext, useContext, useState, useEffect } from 'react';
import { settingsApi } from '../../api/settings.js';

const SettingsContext = createContext({});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    settingsApi.get().then(data => { setSettings(data); setLoaded(true); }).catch(() => { setLoadError(true); setLoaded(true); });
  }, []);

  const refresh = () => settingsApi.get().then(setSettings).catch(() => {});

  return (
    <SettingsContext.Provider value={{ settings, loaded, refresh, loadError }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
