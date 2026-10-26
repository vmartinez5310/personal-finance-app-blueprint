import { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import SearchInput from '../components/ui/SearchInput';
import { Copy, Home, ShoppingCart, Zap, Fuel, Heart, Utensils, Gamepad2, Shirt, CreditCard, PiggyBank, Landmark } from 'lucide-react';

const ICONS: Record<string, any> = {
  'vivienda': Home, 'supermercado': ShoppingCart, 'servicios': Zap, 'gasolina': Fuel,
  'salud': Heart, 'alimentos': Utensils, 'entretenimiento': Gamepad2, 'ropa': Shirt,
  'suscripciones': CreditCard, 'ahorro': PiggyBank, 'préstamo': Landmark,
};

function money(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);
}

function getIcon(name: string) {
  const key = Object.keys(ICONS).find(k => name.toLowerCase().includes(k));
  return key ? ICONS[key] : CreditCard;
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
    const pct = limit > 0 ? Math.min(120, (spent / limit) * 100) : 0;
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
    <div className="h-full flex flex-col gap-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 shrink-0">
        <Kpi label="Total asignado" value={money(totalAssigned)} />
        <Kpi label="Gasto real" value={money(totalSpent)} />
        <Kpi label="Disponible global" value={money(totalAssigned - totalSpent)} color="text-emerald-400" />
        <Kpi label="Ingreso no asignado" value={money(Math.max(0, income - totalAssigned))} color="text-blue-400" />
      </div>

      <div className="flex-1 min-h-0 flex flex-col rounded-xl bg-zinc-900 border border-zinc-800 p-3">
        <div className="flex items-center justify-between mb-2 shrink-0">
          <div>
            <div className="text-sm font-medium">Presupuesto por categoría</div>
            <div className="text-[10px] text-zinc-500">Toca cualquier categoría para consultar el historial o ajustar techo</div>
          </div>
          <button className="px-2 py-1 rounded-lg bg-zinc-800 text-[10px] flex items-center gap-1"><Copy className="w-3 h-3" /> Copiar mes anterior</button>
        </div>

        <div className="flex items-center gap-2 mb-2 shrink-0">
          <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Buscar categoría..." /></div>
          <div className="flex gap-1">
            {(['all', 'over', 'risk', 'ok'] as const).map(s => (
              <button key={s} onClick={() => setStatus(s)} className={`px-2 py-1 rounded-full text-[10px] ${status === s ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}>
                {s === 'all' ? 'Todas' : s === 'over' ? 'Excedidas' : s === 'risk' ? 'En riesgo' : 'En orden'}
              </button>
            ))}
          </div>
        </div>
        <div className="text-[10px] text-zinc-500 mb-2 shrink-0">{rows.length} de {budgets.length} categorías</div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {rows.map(r => {
            const Icon = getIcon(r.name);
            const over = r.available < 0;
            return (
              <div key={r.id} className="flex items-center gap-3 py-2 border-b border-zinc-800/50">
                <Icon className="w-4 h-4 text-zinc-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{r.name}</div>
                  <div className={`text-[10px] ${over ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {over ? `Excedido por ${money(-r.available)}` : `${money(r.available)} disponibles`}
                  </div>
                  <div className="h-0.5 bg-zinc-800 rounded-full mt-1">
                    <div className={`h-full rounded-full ${over ? 'bg-rose-500' : r.pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, r.pct)}%` }} />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[9px] text-zinc-500">Real · Límite</div>
                  <div className="text-xs font-mono">{money(r.spent)} · {money(r.limit)}</div>
                </div>
              </div>
            );
          })}
        </div>
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
