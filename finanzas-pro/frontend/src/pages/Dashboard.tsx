import { useEffect, useState } from 'react';
import { api } from '../services/api';

function money(n: number | null | undefined) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);
}

interface Props { month: string }

export default function Dashboard({ month }: Props) {
  const [liq, setLiq] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    Promise.all([api.liquidity(), api.accounts(), api.creditCards(), api.summary(month)])
      .then(([l, a, c, s]) => { setLiq(l); setAccounts(a); setCards(c); setSummary(s); })
      .catch(console.error);
  }, [month]);

  const spent = summary?.expenses || 0;
  const budgeted = (summary?.by_category || []).reduce((s: number, c: any) => s + (c.budgeted || 0), 0);
  const ratio = budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <Kpi label="Liquidez" value={money(liq?.immediate_liquidity)} />
        <Kpi label="Vales" value={money(liq?.vouchers_liquidity)} />
        <Kpi label="Inversiones" value={money(liq?.investments_balance)} />
        <Kpi label="Patrimonio" value={money(liq?.net_worth)} />
      </div>

      {summary && (
        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="flex justify-between text-xs mb-1">
            <span>Gasto: {money(spent)}</span>
            <span>{ratio}%</span>
          </div>
          <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full">
            <div className={`h-full rounded-full ${ratio > 90 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, ratio)}%` }} />
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-3">
        <List title="Cuentas" items={accounts.map(a => ({ id: a.id, name: a.name, sub: a.type, value: money(a.current_balance) }))} />
        <List title="Tarjetas" items={cards.map(c => ({ id: c.id, name: c.name, sub: `Disponible ${money(c.invoice?.real_available_credit)}`, value: money(c.invoice?.net_balance_due) }))} />
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <div className="text-[10px] text-zinc-500 uppercase">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function List({ title, items }: { title: string; items: { id: string; name: string; sub: string; value: string }[] }) {
  return (
    <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <div className="text-xs font-medium mb-2">{title}</div>
      {items.map(i => (
        <div key={i.id} className="flex justify-between py-1.5 text-sm border-b border-zinc-100 dark:border-zinc-800 last:border-0">
          <div><div>{i.name}</div><div className="text-[10px] text-zinc-500">{i.sub}</div></div>
          <div className="font-mono text-xs">{i.value}</div>
        </div>
      ))}
    </div>
  );
}
