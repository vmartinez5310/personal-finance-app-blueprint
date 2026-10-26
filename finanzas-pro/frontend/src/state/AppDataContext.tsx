import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../services/api';
import type { AppData } from '../types';

interface AppDataState {
  data: AppData | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const Context = createContext<AppDataState | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setData(await api.getAppData()); }
    catch (reason) { setError(reason instanceof Error ? reason : new Error(String(reason))); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  return <Context.Provider value={{ data, loading, error, refresh }}>{children}</Context.Provider>;
}

export function useAppData(): AppDataState {
  const state = useContext(Context);
  if (!state) throw new Error('useAppData requires AppDataProvider');
  return state;
}
