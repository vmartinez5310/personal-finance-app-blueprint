import { useEffect, useState } from 'react';
import { api } from '../services/api';

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);
}

export default function Planning() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.savingsGoals(), api.loans(), api.budgets()])
      .then(([g, l, b]) => {
        setGoals(g);
        setLoans(l);
        setBudgets(b);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-zinc-400">Cargando planificación...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Planificación</h1>

      <section>
        <h2 className="text-sm font-semibold text-zinc-300 mb-2">Metas de ahorro</h2>
        <div className="space-y-2">
          {goals.map((g) => (
            <div key={g.id} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex justify-between">
              <div>
                <div className="text-sm">{g.name}</div>
                <div className="text-[10px] text-zinc-500">{g.target_date || 'Sin fecha'}</div>
              </div>
              <div className="font-mono text-sm">{formatMoney(g.target_amount)}</div>
            </div>
          ))}
          {goals.length === 0 && <div className="text-zinc-500 text-sm">Sin metas</div>}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-zinc-300 mb-2">Préstamos</h2>
        <div className="space-y-2">
          {loans.map((l) => (
            <div key={l.id} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="flex justify-between">
                <div className="text-sm">{l.name}</div>
                <div className="font-mono text-sm">{formatMoney(l.monthly_amount)}/mes</div>
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">
                Principal: {formatMoney(l.principal_amount)} · {l.term_months} meses · {l.status}
              </div>
            </div>
          ))}
          {loans.length === 0 && <div className="text-zinc-500 text-sm">Sin préstamos</div>}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-zinc-300 mb-2">Presupuestos</h2>
        <div className="text-xs text-zinc-500">{budgets.length} presupuestos cargados</div>
      </section>
    </div>
  );
}
