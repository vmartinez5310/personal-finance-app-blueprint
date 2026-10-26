import { useEffect, useState } from 'react';
import { api } from '../services/api';

function money(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);
}

interface Props { month: string }

export default function Budget({ month }: Props) {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    Promise.all([api.budgets(month), api.summary(month)])
      .then(([b, s]) => { setBudgets(b); setSummary(s); })
      .catch(console.error);
  }, [month]);

  const spentMap: Record<string, number> = {};
  (summary?.by_category || []).forEach((c: any) => { spentMap[c.category_id] = c.spent; });

  return (
    <div className="space-y-2">
      <h1 className="text-sm font-medium">Presupuestos</h1>
      {budgets.map(b => {
        const spent = spentMap[b.category_id] || 0;
        const pct = b.budgeted_amount > 0 ? Math.min(100, (spent / b.budgeted_amount) * 100) : 0;
        return (
          <div key={b.id} className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-between text-xs mb-1">
              <span>{b.category_id.slice(0, 8)}</span>
              <span className="font-mono">{money(spent)} / {money(b.budgeted_amount)}</span>
            </div>
            <div className="h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full">
              <div className={`h-full rounded-full ${pct > 90 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
