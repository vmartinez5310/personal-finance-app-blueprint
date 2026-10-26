import { useEffect, useState } from 'react';
import { api } from '../services/api';

function formatMoney(n: number | null | undefined) {
  if (n == null) return '$0.00';
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function Dashboard() {
  const [liquidity, setLiquidity] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.liquidity(), api.accounts(), api.summary()])
      .then(([liq, accs, sum]) => {
        setLiquidity(liq);
        setAccounts(accs);
        setSummary(sum);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-zinc-400">Cargando dashboard...</div>;

  const kpis = [
    { label: 'Liquidez gastable', value: liquidity?.immediate_liquidity, color: 'text-emerald-400' },
    { label: 'Vales de despensa', value: liquidity?.vouchers_liquidity, color: 'text-amber-400' },
    { label: 'Inversiones', value: liquidity?.investments_balance, color: 'text-indigo-400' },
    { label: 'Patrimonio neto', value: liquidity?.net_worth, color: liquidity?.net_worth >= 0 ? 'text-emerald-400' : 'text-rose-400' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
            <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">{k.label}</div>
            <div className={`text-lg font-bold mt-1 ${k.color}`}>{formatMoney(k.value)}</div>
          </div>
        ))}
      </div>

      {summary && (
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <h2 className="text-sm font-semibold mb-3">Resumen del mes ({summary.period})</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><span className="text-zinc-400">Ingresos</span><div className="font-mono text-emerald-400">{formatMoney(summary.income)}</div></div>
            <div><span className="text-zinc-400">Gastos</span><div className="font-mono text-rose-400">{formatMoney(summary.expenses)}</div></div>
            <div><span className="text-zinc-400">Neto</span><div className="font-mono">{formatMoney(summary.net)}</div></div>
          </div>
        </div>
      )}

      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <h2 className="text-sm font-semibold mb-3">Cuentas</h2>
        <div className="space-y-2">
          {accounts.map((acc) => (
            <div key={acc.id} className="flex items-center justify-between py-2 border-b border-zinc-800/60 last:border-0">
              <div>
                <div className="text-sm font-medium">{acc.name}</div>
                <div className="text-[10px] text-zinc-500 uppercase">{acc.type}</div>
              </div>
              <div className="font-mono text-sm">{formatMoney(acc.current_balance)}</div>
            </div>
          ))}
          {accounts.length === 0 && <div className="text-zinc-500 text-sm">Sin cuentas</div>}
        </div>
      </div>
    </div>
  );
}
