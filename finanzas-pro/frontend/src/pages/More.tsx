import { useEffect, useState } from 'react';
import { api } from '../services/api';

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);
}

const tabs = ['Cuentas', 'Tarjetas', 'Préstamos', 'Metas', 'Categorías'] as const;
type Tab = typeof tabs[number];

export default function More() {
  const [tab, setTab] = useState<Tab>('Cuentas');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.accounts(),
      api.creditCards(),
      api.loans(),
      api.savingsGoals(),
      api.categories(),
    ])
      .then(([a, c, l, g, cat]) => {
        setAccounts(a);
        setCards(c);
        setLoans(l);
        setGoals(g);
        setCategories(cat);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-zinc-400 text-sm">Cargando...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Más</h1>

      <div className="flex gap-1 overflow-x-auto pb-1" role="tablist">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              tab === t
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 min-h-[300px]">
        {tab === 'Cuentas' && (
          <div className="space-y-2">
            {accounts.map((a) => (
              <div key={a.id} className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <div>
                  <div className="text-sm">{a.name}</div>
                  <div className="text-[10px] text-zinc-400 uppercase">{a.type}</div>
                </div>
                <div className="font-mono text-sm">{formatMoney(a.current_balance)}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'Tarjetas' && (
          <div className="space-y-3">
            {cards.map((c) => {
              const inv = c.invoice || {};
              return (
                <div key={c.id} className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div className="flex justify-between">
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="font-mono text-sm text-emerald-600 dark:text-emerald-400">{formatMoney(inv.real_available_credit)}</div>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">
                    Límite {formatMoney(c.credit_limit)} · Deuda {formatMoney(inv.net_balance_due)} · Corte {inv.closing_date}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'Préstamos' && (
          <div className="space-y-2">
            {loans.map((l) => (
              <div key={l.id} className="py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <div className="text-sm">{l.name}</div>
                <div className="text-xs text-zinc-500">{formatMoney(l.monthly_amount)}/mes · {l.term_months} meses</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'Metas' && (
          <div className="space-y-2">
            {goals.map((g) => (
              <div key={g.id} className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <div className="text-sm">{g.name}</div>
                <div className="font-mono text-sm">{formatMoney(g.target_amount)}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'Categorías' && (
          <div className="grid grid-cols-2 gap-2">
            {categories.map((c) => (
              <div key={c.id} className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-sm">
                <div className="text-zinc-700 dark:text-zinc-300">{c.name}</div>
                <div className="text-[10px] text-zinc-400 uppercase">{c.type}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
