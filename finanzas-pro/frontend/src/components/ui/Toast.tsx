import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Check, AlertCircle } from 'lucide-react';

type Toast = { id: string; type: 'success' | 'error'; message: string };
interface Ctx { toast: (type: Toast['type'], message: string) => void }

const ToastCtx = createContext<Ctx>({ toast: () => {} });
export function useToast() { return useContext(ToastCtx); }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, type, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-20 md:bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white shadow-lg ${t.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
            {t.type === 'success' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
