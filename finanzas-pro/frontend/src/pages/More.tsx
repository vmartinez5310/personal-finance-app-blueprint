import { useEffect, useState } from 'react';
import { api } from '../services/api';

const tabs = ['Cuentas', 'Tarjetas', 'Préstamos', 'Metas', 'Categorías'] as const;
type Tab = typeof tabs[number];

export default function More() {
  const [tab, setTab] = useState<Tab>('Cuentas');
  const [data, setData] = useState<Record<Tab, any[]>>({ Cuentas: [], Tarjetas: [], Préstamos: [], Metas: [], Categorías: [] });

  useEffect(() => {
    Promise.all([api.accounts(), api.creditCards(), api.loans(), api.savingsGoals(), api.categories()])
      .then(([a, c, l, g, cat]) => setData({ Cuentas: a, Tarjetas: c, Préstamos: l, Metas: g, Categorías: cat }))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-3">
      <h1 className="text-sm font-medium">Más</h1>
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 rounded-full text-xs ${tab === t ? 'bg-blue-600 text-white' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
        {data[tab].map((item: any) => (
          <div key={item.id} className="px-3 py-2 text-sm">
            <div>{item.name}</div>
            <div className="text-[10px] text-zinc-500">{item.type || item.status || ''}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 text-xs">
        <button className="px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800">Importar</button>
        <button className="px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800">Exportar</button>
        <button className="px-3 py-1.5 rounded-lg bg-rose-600 text-white">Empezar de cero</button>
      </div>
    </div>
  );
}
