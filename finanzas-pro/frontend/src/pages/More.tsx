import { useEffect, useState } from 'react';
import { api } from '../services/api';

const tabs = [
  { key: 'accounts', label: 'Cuentas' },
  { key: 'credit_cards', label: 'Tarjetas' },
  { key: 'loans', label: 'Préstamos' },
  { key: 'savings_goals', label: 'Metas' },
  { key: 'categories', label: 'Categorías' },
  { key: 'installment_plans', label: 'Planes MSI' },
  { key: 'budgets', label: 'Presupuestos' },
  { key: 'transactions', label: 'Transacciones' },
] as const;

type TabKey = typeof tabs[number]['key'];

export default function More() {
  const [tab, setTab] = useState<TabKey>('accounts');
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    api.table(tab).then(setRows).catch(() => setRows([]));
  }, [tab]);

  return (
    <div className="space-y-3">
      <h1 className="text-sm font-medium">Más</h1>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${tab === t.key ? 'bg-blue-600 text-white' : 'bg-zinc-200 dark:bg-zinc-800'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="text-[10px] text-zinc-500 px-3 py-1.5 border-b border-zinc-100 dark:border-zinc-800">
          {rows.length} registros
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-96 overflow-y-auto">
          {rows.map((r: any) => (
            <div key={r.id} className="px-3 py-2 text-sm">
              <div className="font-medium">{r.name || r.description || r.id.slice(0, 8)}</div>
              <div className="text-[10px] text-zinc-500 truncate">
                {Object.entries(r).filter(([k]) => k !== 'id' && k !== 'name').slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' · ')}
              </div>
            </div>
          ))}
          {rows.length === 0 && <div className="p-4 text-center text-zinc-500 text-sm">Vacío</div>}
        </div>
      </div>

      <div className="flex gap-2 text-xs">
        <button className="px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800">Importar</button>
        <button className="px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800">Exportar</button>
        <button className="px-3 py-1.5 rounded-lg bg-rose-600 text-white">Empezar de cero</button>
      </div>
    </div>
  );
}
