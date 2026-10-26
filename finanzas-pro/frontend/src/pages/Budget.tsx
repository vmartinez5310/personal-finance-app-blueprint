import { useEffect, useState } from 'react';
import { api } from '../services/api';

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);
}

export default function Budget() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const period = '2026-10';

  useEffect(() => {
    Promise.all([api.budgets(period), api.summary(period)])
      .then(([b, s]) => {
        setBudgets(b);
        setSummary(s);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-zinc-400 text-sm">Cargando presupuesto...</div>;

  const spentMap: Record<string, number> = {};
  (summary?.by_category || []).forEach((c: any) => {
    spentMap[c.category_id] = c.spent;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Presupuesto — {period}</h1>
      <div className="space-y-2">
        {budgets.map((b) => {
          const spent = spentMap[b.category_id] || 0;
          const pct = b.budgeted_amount > 0 ? Math.min(100, (spent / b.budgeted_amount) * 100) : 0;
          return (
            <div key={b.id} className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-700 dark:text-zinc-300">Categoría</span>
                <span className="font-mono text-xs">{formatMoney(spent)} / {formatMoney(b.budgeted_amount)}</span>
              </div>
              <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${pct > 90 ? 'bg-rose-500' : 'bg-blue-600'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
        {budgets.length === 0 && <div className="text-zinc-500 text-sm">Sin presupuestos para este periodo</div>}
      </div>
    </div>
  );
}
