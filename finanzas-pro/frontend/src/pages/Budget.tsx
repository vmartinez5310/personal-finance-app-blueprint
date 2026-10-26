import { useEffect, useMemo, useState } from 'react';
import { api, ApiError } from '../services/api';
import type { BudgetRead, Category, TransactionRead } from '../types';
import { cents, decimal, monthlyTotals } from '../lib/monthlyBudget';
import { useToast } from '../components/ui/Toast';

const money = (value: string) => `$${value} MXN`;
export default function Budget({ month }: { month: string }) {
  const [budgets, setBudgets] = useState<BudgetRead[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<TransactionRead[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();
  const refresh = async () => {
    const [b, c, t] = await Promise.all([api.budgets(month), api.categories(), api.transactions()]);
    setBudgets(b.filter(item => item.period === month)); setCategories(c); setTransactions(t);
  };
  useEffect(() => { refresh().catch(error => toast('error', error instanceof Error ? error.message : 'Error al cargar presupuestos')); }, [month]);
  const totals = useMemo(() => monthlyTotals(month, budgets, transactions), [month, budgets, transactions]);
  const spentByCategory = useMemo(() => {
    const result: Record<string, bigint> = {};
    transactions.filter(t => t.date.slice(0, 7) === month && t.type === 'expense' && t.status !== 'void' && t.status !== 'cancelled')
      .forEach(t => { if (t.category_id) result[t.category_id] = (result[t.category_id] ?? 0n) + cents(t.amount); });
    return result;
  }, [month, transactions]);
  const save = async (category_id: string, existing: string) => {
    const value = draft[category_id] ?? existing;
    if (!/^\d+(?:\.\d{1,2})?$/.test(value)) { toast('error', 'Monto inválido: usa un decimal con máximo dos cifras'); return; }
    try {
      setSaving(category_id);
      await api.upsertBudget({ period: month, category_id, budgeted_amount: value });
      await refresh(); toast('success', 'Presupuesto guardado');
    } catch (error) { toast('error', error instanceof ApiError && error.status === 422 ? `Validación: ${error.detail}` : error instanceof Error ? error.message : 'Error al guardar'); }
    finally { setSaving(null); }
  };
  return <div className="h-full overflow-y-auto space-y-3">
    <div className="rounded-xl bg-zinc-900 p-3 text-sm">Mes: {month} · Asignado: {money(totals.budget)} · Gastado: {money(totals.spent)} · Disponible: {money(decimal(totals.budgetCents - totals.spentCents))}</div>
    {categories.filter(c => c.type === 'expense').map(c => {
      const budget = budgets.find(b => b.category_id === c.id);
      const amount = budget?.budgeted_amount ?? '0.00';
      return <div key={c.id} className="flex items-center gap-3 rounded-lg bg-zinc-900 p-3 text-xs">
        <span className="flex-1">{c.name}</span><span>Gastado: {money(decimal(spentByCategory[c.id] ?? 0n))}</span>
        <input aria-label={`Presupuesto de ${c.name}`} className="w-28 bg-zinc-800 rounded p-2" inputMode="decimal" value={draft[c.id] ?? amount} onChange={e => setDraft(d => ({ ...d, [c.id]: e.target.value }))} />
        <button disabled={saving !== null} className="bg-blue-600 rounded px-3 py-2 disabled:opacity-50" onClick={() => save(c.id, amount)}>Guardar</button>
      </div>;
    })}
  </div>;
}
