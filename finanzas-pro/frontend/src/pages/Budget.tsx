import { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import SearchInput from '../components/ui/SearchInput';
import { Copy } from 'lucide-react';

function money(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);
}

interface Props { month: string }

export default function Budget({ month }: Props) {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'over' | 'risk' | 'ok'>('all');

  useEffect(() => {
    Promise.all([api.budgets(month), api.categories(), api.summary(month)])
      .then(([b, c, s]) => { setBudgets(b); setCategories(c); setSummary(s); })
      .catch(console.error);
  }, [month]);

  const spentMap: Record<string, number> = {};
  (summary?.by_category || []).forEach((c: any) => { spentMap[c.category_id] = c.spent || 0; });

  const rows = useMemo(() => budgets.map(b => {
    const cat = categories.find(c => c.id === b.category_id);
    const spent = spentMap[b.category_id] || 0;
    const limit = b.budgeted_amount || 0;
    const available = limit - spent;
    const pct = limit > 0 ? (spent / limit) * 100 : 0;
    return { ...b, name: cat?.name || '—', spent, limit, available, pct };
  }).filter(r => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (status === 'over' && r.pct <= 100) return false;
    if (status === 'risk' && (r.pct < 80 || r.pct > 100)) return false;
    if (status === 'ok' && r.pct >= 80) return false;
    return true;
  }), [budgets, categories, spentMap, search, status]);

  const totalAssigned = budgets.reduce((s, b) => s + (b.budgeted_amount || 0), 0);
  const totalSpent = Object.values(spentMap).reduce((s, v) => s + v, 0);
  const income = summary?.income || 0;

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 shrink-0">
        <Kpi label="Asignado" value={money(totalAssigned)} />
        <Kpi label="Gasto real" value={money(totalSpent)} color="text-rose-400" />
        <Kpi label="Disponible" value={money(totalAssigned - totalSpent)} color="text-emerald-400" />
        <Kpi label="No asignado" value={money(Math.max(0, income - totalAssigned))} color="text-blue-400" />
      </div>

      <div className="shrink-0 flex gap-1.5 items-center">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Buscar categoría..." /></div>
        <button className="px-2 py-1.5 rounded-lg bg-zinc-800 text-xs flex items-center gap-1"><Copy className="w-3.5 h-3.5" /><span className="hidden sm:inline">Copiar</span></button>
      </div>

      <div className="shrink-0 flex gap-1">
        {(['all', 'over', 'risk', 'ok'] as const).map(s => (
          <button key={s} onClick={() => setStatus(s)} className={`px-2 py-1 rounded-full text-[10px] ${status === s ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
            {s === 'all' ? 'Todas' : s === 'over' ? 'Excedidas' : s === 'risk' ? 'En riesgo' : 'En orden'}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-zinc-500 self-center">{rows.length} de {budgets.length}</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-1">
        {rows.map(r => (
          <div key={r.id} className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="truncate">{r.name}</span>
              <span className="font-mono text-zinc-400">{money(r.spent)} / {money(r.limit)}</span>
            </div>
            <div className="h-1 bg-zinc-800 rounded-full">
              <div className={`h-full rounded-full ${r.pct > 100 ? 'bg-rose-500' : r.pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, r.pct)}%` }} />
            </div>
            <div className="flex justify-between text-[9px] text-zinc-500 mt-0.5">
              <span>Disponible: {money(r.available)}</span>
              <span>{Math.round(r.pct)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Kpi({ label, value, color = 'text-zinc-100' }: { label: string; value: string; color?: string }) {
  return (
    <div className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800">
      <div className="text-[10px] text-zinc-500">{label}</div>
      <div className={`text-sm font-semibold ${color}`}>{value}</div>
    </div>
  );
}
