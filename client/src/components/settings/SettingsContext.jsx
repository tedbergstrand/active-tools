import { createContext, useContext, useState, useEffect } from 'react';
import { settingsApi } from '../../api/settings.js';

const SettingsContext = createContext({});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    settingsApi.get().then(setSettings).catch(() => setLoadError(true));
  }, []);

  const refresh = () => settingsApi.get().then(setSettings).catch(() => {});

  return (
    <SettingsContext.Provider value={{ settings, refresh, loadError }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
