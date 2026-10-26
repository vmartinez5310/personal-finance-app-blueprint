import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Wallet, ShoppingBag, TrendingUp, Scale, AlertTriangle } from 'lucide-react';

function formatMoney(n: number | null | undefined) {
  if (n == null) return '$0.00';
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function Dashboard() {
  const [liquidity, setLiquidity] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.liquidity(), api.accounts(), api.creditCards(), api.summary()])
      .then(([liq, accs, cds, sum]) => {
        setLiquidity(liq);
        setAccounts(accs);
        setCards(cds);
        setSummary(sum);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-zinc-400 text-sm">Cargando dashboard...</div>;

  const spent = summary?.expenses || 0;
  const budgeted = (summary?.by_category || []).reduce((s: number, c: any) => s + (c.budgeted || 0), 0);
  const ratio = budgeted > 0 ? Math.min(100, (spent / budgeted) * 100) : 0;

  const overdueCard = cards.find((c) => {
    const inv = c.invoice || {};
    return inv.net_balance_due > 0 && inv.days_to_due != null && inv.days_to_due < 0;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <KpiCard icon={<Wallet className="w-4 h-4" />} label="Liquidez gastable" value={liquidity?.immediate_liquidity} color="text-emerald-400" />
        <KpiCard icon={<ShoppingBag className="w-4 h-4" />} label="Vales de despensa" value={liquidity?.vouchers_liquidity} color="text-amber-400" />
        <KpiCard icon={<TrendingUp className="w-4 h-4" />} label="Inversiones y reservas" value={liquidity?.investments_balance} color="text-blue-400" />
        <KpiCard icon={<Scale className="w-4 h-4" />} label="Patrimonio neto real" value={liquidity?.net_worth} color={(liquidity?.net_worth ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'} />
      </div>

      {overdueCard && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-950/40 border border-amber-800/40">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-amber-200">
              Atención: {overdueCard.name} — Factura vencida ({formatMoney(overdueCard.invoice?.net_balance_due)})
            </span>
          </div>
          <button className="text-xs px-3 py-1 rounded-lg bg-zinc-800 text-zinc-200">Ver extracto</button>
        </div>
      )}

      {summary && (
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-medium">Resumen del mes</h2>
              <p className="text-[10px] text-zinc-500">Control global de presupuesto y ritmo de gasto</p>
            </div>
            <span className="text-sm font-mono font-bold text-blue-500">{Math.round(ratio)}%</span>
          </div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span>Gasto acumulado: {formatMoney(spent)}</span>
            <span>Límite planificado: {formatMoney(budgeted)}</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${ratio > 90 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${ratio}%` }} />
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">
            Has consumido el {Math.round(ratio)}% de tu presupuesto. Te quedan {formatMoney(Math.max(0, budgeted - spent))} disponibles.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-xs font-bold mb-2">Cuentas y activos</h3>
          <div className="space-y-1.5">
            {accounts.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between py-1.5 border-b border-zinc-800/40 last:border-0">
                <div>
                  <div className="text-sm">{acc.name}</div>
                  <div className="text-[10px] text-zinc-500">{acc.type}</div>
                </div>
                <div className="font-mono text-sm">{formatMoney(acc.current_balance)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-xs font-bold mb-2">Tarjetas de crédito</h3>
          <div className="space-y-2">
            {cards.map((card) => {
              const inv = card.invoice || {};
              const used = inv.net_balance_due || 0;
              const limit = card.credit_limit || 1;
              const pct = Math.min(100, (used / limit) * 100);
              return (
                <div key={card.id} className="p-2.5 rounded-xl border border-zinc-800">
                  <div className="flex justify-between items-start">
                    <div className="text-sm font-medium">{card.name}</div>
                    <div className="text-right text-[10px] text-zinc-500">Pago: {inv.due_date || '—'}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 mt-1.5 text-[10px]">
                    <div><span className="text-zinc-500">Saldo al corte</span><div className="font-mono">{formatMoney(inv.closing_balance)}</div></div>
                    <div><span className="text-zinc-500">En curso</span><div className="font-mono">{formatMoney(inv.current_cycle_spend)}</div></div>
                    <div><span className="text-zinc-500">Disponible</span><div className="font-mono text-emerald-400">{formatMoney(inv.real_available_credit)}</div></div>
                  </div>
                  <div className="h-1 bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${100 - pct}%` }} />
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Límite: {formatMoney(limit)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
      <div>
        <div className="text-[10px] font-semibold text-zinc-400 uppercase">{label}</div>
        <div className={`text-base font-bold mt-0.5 ${color}`}>{formatMoney(value)}</div>
      </div>
      <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">{icon}</div>
    </div>
  );
}
