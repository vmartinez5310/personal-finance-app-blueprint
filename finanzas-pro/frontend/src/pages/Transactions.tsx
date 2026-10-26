import { useEffect, useState } from 'react';
import { api } from '../services/api';

function money(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);
}

interface Props { month: string }

export default function Transactions({ month }: Props) {
  const [txs, setTxs] = useState<any[]>([]);

  useEffect(() => {
    api.transactions()
      .then(all => setTxs(all.filter(t => String(t.date).startsWith(month))))
      .catch(console.error);
  }, [month]);

  return (
    <div className="space-y-2">
      <h1 className="text-sm font-medium">Transacciones</h1>
      <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800">
        {txs.map(tx => (
          <div key={tx.id} className="flex justify-between px-3 py-2 text-sm">
            <div>
              <div>{tx.description || '—'}</div>
              <div className="text-[10px] text-zinc-500">{tx.date} · {tx.type}</div>
            </div>
            <div className={`font-mono text-xs ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
              {money(tx.amount)}
            </div>
          </div>
        ))}
        {txs.length === 0 && <div className="p-4 text-center text-zinc-500 text-sm">Sin movimientos</div>}
      </div>
    </div>
  );
}
