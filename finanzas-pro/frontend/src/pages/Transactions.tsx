import { useEffect, useState } from 'react';
import { api } from '../services/api';

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);
}

export default function Transactions() {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.transactions('?limit=50')
      .then(setTxs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-zinc-400">Cargando transacciones...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Transacciones</h1>
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-800/50 text-zinc-400 text-xs">
            <tr>
              <th className="text-left px-4 py-2">Fecha</th>
              <th className="text-left px-4 py-2">Descripción</th>
              <th className="text-left px-4 py-2">Tipo</th>
              <th className="text-right px-4 py-2">Monto</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((tx) => (
              <tr key={tx.id} className="border-t border-zinc-800/60">
                <td className="px-4 py-2 font-mono text-xs">{String(tx.date).slice(0, 10)}</td>
                <td className="px-4 py-2">{tx.description || '—'}</td>
                <td className="px-4 py-2 text-xs uppercase text-zinc-400">{tx.type}</td>
                <td className={`px-4 py-2 text-right font-mono ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatMoney(tx.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {txs.length === 0 && <div className="p-6 text-center text-zinc-500">Sin transacciones</div>}
      </div>
    </div>
  );
}
