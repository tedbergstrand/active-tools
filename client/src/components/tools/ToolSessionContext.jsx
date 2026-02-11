import { createContext, useContext, useState, useRef, useCallback, useMemo, useEffect } from 'react';

const STORAGE_KEY = 'activeToolSession';
const ToolSessionContext = createContext(null);

function loadPersistedSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function ToolSessionProvider({ children }) {
  const [session, setSession] = useState(loadPersistedSession); // { tool, config }
  const [minimized, setMinimized] = useState(() => !!loadPersistedSession());
  // Ref updated by the runner each tick — read by floating widget
  const sessionStateRef = useRef({ elapsed: 0, stepLabel: '', stepTimeLeft: 0 });

  // Persist session to localStorage
  useEffect(() => {
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch { /* quota exceeded or private browsing */ }
  }, [session]);

  const startSession = useCallback((tool, config) => {
    setSession({ tool, config });
    setMinimized(false);
  }, []);

  const endSession = useCallback(() => {
    setSession(null);
    setMinimized(false);
    sessionStateRef.current = { elapsed: 0, stepLabel: '', stepTimeLeft: 0 };
  }, []);

  const minimize = useCallback(() => setMinimized(true), []);
  const maximize = useCallback(() => setMinimized(false), []);

  const value = useMemo(() => ({
    session,
    isActive: !!session,
    minimized,
    startSession,
    endSession,
    minimize,
    maximize,
    sessionStateRef,
  }), [session, minimized, startSession, endSession, minimize, maximize]);

  return (
    <ToolSessionContext.Provider value={value}>
      {children}
    </ToolSessionContext.Provider>
  );
}

export function useToolSession() {
  const ctx = useContext(ToolSessionContext);
  if (!ctx) throw new Error('useToolSession must be used within ToolSessionProvider');
  return ctx;
}
